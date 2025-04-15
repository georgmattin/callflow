"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, Upload, X, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ImageUploaderProps {
  onImageSelect: (imageData: string, alt: string) => void
  onClose: () => void
  isOpen: boolean
}

export default function ImageUploader({ onImageSelect, onClose, isOpen }: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [altText, setAltText] = useState("")
  const [imageWidth, setImageWidth] = useState(200)
  const [alignment, setAlignment] = useState<"left" | "center" | "right">("center")
  const [error, setError] = useState<string | null>(null)
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 })
  const [aspectRatio, setAspectRatio] = useState(4 / 3)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG, PNG, GIF)")
      return
    }

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image size should be less than 2MB")
      return
    }

    setError(null)
    setSelectedFile(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result as string)

      // Load image to get natural dimensions
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        setNaturalDimensions({ width: img.width, height: img.height })
        setAspectRatio(img.width / img.height)

        // Set a reasonable default width based on natural dimensions
        const defaultWidth = Math.min(img.width, 400)
        setImageWidth(defaultWidth)
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)

    // Set default alt text from filename
    setAltText(file.name.split(".")[0])
  }

  const handleInsertImage = () => {
    if (!previewUrl) return

    // Calculate height based on aspect ratio
    const height = Math.round(imageWidth / aspectRatio)

    // Create image HTML with proper styling and attributes for email compatibility
    const imageStyle = `max-width: 100%; width: ${imageWidth}px; display: block; margin: ${
      alignment === "center" ? "0 auto" : alignment === "right" ? "0 0 0 auto" : "0 auto 0 0"
    };`

    // Pass the image data and alt text to the parent component
    onImageSelect(
      `<img src="${previewUrl}" alt="${altText}" width="${imageWidth}" height="${height}" style="${imageStyle}" data-aspect-ratio="${aspectRatio}" data-alignment="${alignment}" />`,
      altText,
    )

    // Reset state
    resetState()
  }

  const resetState = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setAltText("")
    setImageWidth(200)
    setAlignment("center")
    setError(null)
    setNaturalDimensions({ width: 0, height: 0 })
    setAspectRatio(4 / 3)
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]

      // Check if it's an image
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file (JPEG, PNG, GIF)")
        return
      }

      // Check file size
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should be less than 2MB")
        return
      }

      // Process the file as if it was selected via the file input
      setSelectedFile(file)
      setError(null)

      const reader = new FileReader()
      reader.onload = () => {
        setPreviewUrl(reader.result as string)

        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          setNaturalDimensions({ width: img.width, height: img.height })
          setAspectRatio(img.width / img.height)
          const defaultWidth = Math.min(img.width, 400)
          setImageWidth(defaultWidth)
        }
        img.src = reader.result as string
      }
      reader.readAsDataURL(file)

      // Set default alt text from filename
      setAltText(file.name.split(".")[0])
    }
  }

  // Calculate height based on width and aspect ratio
  const calculatedHeight = Math.round(imageWidth / aspectRatio)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          {!previewUrl ? (
            <div
              className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors image-upload-area"
              onClick={() => document.getElementById("image-upload")?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">PNG, JPG or GIF (max. 2MB)</p>
              <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          ) : (
            <div className="relative">
              <div className="flex justify-center">
                <div
                  className="relative border rounded-md p-2 dark:border-gray-600"
                  style={{
                    width: `${imageWidth + 20}px`,
                    margin: alignment === "center" ? "0 auto" : alignment === "right" ? "0 0 0 auto" : "0 auto 0 0",
                  }}
                >
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt={altText}
                    className="max-w-full"
                    style={{ width: `${imageWidth}px`, height: `${calculatedHeight}px`, objectFit: "contain" }}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => {
                      setSelectedFile(null)
                      setPreviewUrl(null)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="alt-text">Alt Text</Label>
                  <Input
                    id="alt-text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe the image"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Width ({imageWidth}px)</Label>
                    {naturalDimensions.width > 0 && (
                      <span className="text-xs text-muted-foreground">
                        Original: {naturalDimensions.width}x{naturalDimensions.height}px
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[imageWidth]}
                      min={50}
                      max={Math.max(600, naturalDimensions.width)}
                      step={10}
                      onValueChange={(value) => setImageWidth(value[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={imageWidth}
                      onChange={(e) => setImageWidth(Number.parseInt(e.target.value) || 100)}
                      className="w-20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alignment">Alignment</Label>
                  <Select value={alignment} onValueChange={(value: "left" | "center" | "right") => setAlignment(value)}>
                    <SelectTrigger id="alignment">
                      <SelectValue placeholder="Select alignment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleInsertImage} disabled={!previewUrl} className="flex items-center">
            <ImageIcon className="h-4 w-4 mr-2" />
            Insert Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
