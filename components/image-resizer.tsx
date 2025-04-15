"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, AlignLeft, AlignCenter, AlignRight } from "lucide-react"
import { useTheme } from "next-themes"

export function ImageResizer(props: NodeViewProps) {
  const [size, setSize] = useState({
    width: props.node.attrs.width || 200,
    height: props.node.attrs.height || 150,
  })
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 })
  const [aspectRatio, setAspectRatio] = useState(props.node.attrs["data-aspect-ratio"] || 4 / 3)
  const [isResizing, setIsResizing] = useState(false)
  const [alignment, setAlignment] = useState<"left" | "center" | "right">(props.node.attrs.alignment || "center")
  const [showSettings, setShowSettings] = useState(false)
  const [settingsPosition, setSettingsPosition] = useState({ top: 0, right: 0 })
  const { theme } = useTheme()

  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const startPositionRef = useRef({ x: 0, y: 0 })
  const startSizeRef = useRef({ width: 0, height: 0 })
  const resizeHandleRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)
  const settingsButtonRef = useRef<HTMLButtonElement>(null)

  // Load the original image dimensions when the component mounts
  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      const img = imageRef.current
      const naturalWidth = img.naturalWidth
      const naturalHeight = img.naturalHeight

      if (naturalWidth && naturalHeight) {
        setOriginalSize({ width: naturalWidth, height: naturalHeight })

        // If no width/height is set, use the natural dimensions
        if (!props.node.attrs.width && !props.node.attrs.height) {
          const newWidth = Math.min(naturalWidth, 500) // Limit initial size
          const newHeight = Math.round(newWidth * (naturalHeight / naturalWidth))

          setSize({ width: newWidth, height: newHeight })
          updateAttributes({ width: newWidth, height: newHeight })
          setAspectRatio(naturalWidth / naturalHeight)
          updateAttributes({ "data-aspect-ratio": naturalWidth / naturalHeight })
        } else {
          // Use the existing aspect ratio or calculate from natural dimensions
          const ratio = props.node.attrs["data-aspect-ratio"] || naturalWidth / naturalHeight
          setAspectRatio(ratio)
        }
      }
    }
  }, [props.node.attrs.src])

  // Calculate settings panel position
  useEffect(() => {
    if (showSettings && settingsButtonRef.current && containerRef.current) {
      const buttonRect = settingsButtonRef.current.getBoundingClientRect()
      const containerRect = containerRef.current.getBoundingClientRect()

      // Get the editor container
      const editorContainer = document.querySelector(".ProseMirror")
      const editorRect = editorContainer?.getBoundingClientRect() || {
        right: window.innerWidth,
        bottom: window.innerHeight,
      }

      // Calculate available space
      const spaceRight = editorRect.right - buttonRect.right
      const spaceBottom = editorRect.bottom - buttonRect.bottom

      // Default position (right-aligned)
      let position = {
        top: buttonRect.height + 5,
        right: 0,
        left: "auto",
      }

      // If not enough space on the right, position to the left
      if (spaceRight < 300) {
        position = {
          top: buttonRect.height + 5,
          right: "auto",
          left: 0,
        }
      }

      // Update the settings position
      setSettingsPosition(position as any)
    }
  }, [showSettings])

  // Handle image load event to get natural dimensions
  const handleImageLoad = () => {
    if (imageRef.current) {
      const img = imageRef.current
      const naturalWidth = img.naturalWidth
      const naturalHeight = img.naturalHeight

      setOriginalSize({ width: naturalWidth, height: naturalHeight })

      // Only set initial size if not already set
      if (!size.width || !size.height) {
        const newWidth = Math.min(naturalWidth, 500) // Limit initial size
        const newHeight = Math.round(newWidth * (naturalHeight / naturalWidth))

        setSize({ width: newWidth, height: newHeight })
        updateAttributes({ width: newWidth, height: newHeight })
      }

      // Set aspect ratio if not already set
      if (!props.node.attrs["data-aspect-ratio"]) {
        const ratio = naturalWidth / naturalHeight
        setAspectRatio(ratio)
        updateAttributes({ "data-aspect-ratio": ratio })
      }
    }
  }

  // Update the node attributes in the editor
  const updateAttributes = (attrs: Record<string, any>) => {
    props.updateAttributes(attrs)
  }

  // Handle width change with aspect ratio preservation
  const handleWidthChange = (newWidth: number) => {
    const width = Math.max(50, Math.min(1000, newWidth)) // Limit size range
    const height = Math.round(width / aspectRatio)

    setSize({ width, height })
    updateAttributes({ width, height })
  }

  // Handle height change with aspect ratio preservation
  const handleHeightChange = (newHeight: number) => {
    const height = Math.max(50, Math.min(800, newHeight)) // Limit size range
    const width = Math.round(height * aspectRatio)

    setSize({ width, height })
    updateAttributes({ width, height })
  }

  // Handle alignment change
  const handleAlignmentChange = (value: "left" | "center" | "right") => {
    setAlignment(value)
    updateAttributes({ alignment: value })
    setShowSettings(false) // Close settings after changing alignment
  }

  // Reset to original size
  const handleResetSize = () => {
    if (originalSize.width && originalSize.height) {
      const maxWidth = 500 // Maximum width for reset
      let newWidth = originalSize.width
      let newHeight = originalSize.height

      // Scale down if original is too large
      if (newWidth > maxWidth) {
        const scale = maxWidth / newWidth
        newWidth = maxWidth
        newHeight = Math.round(newHeight * scale)
      }

      setSize({ width: newWidth, height: newHeight })
      updateAttributes({ width: newWidth, height: newHeight })
      setShowSettings(false) // Close settings after resetting
    }
  }

  // Handle mouse down for corner resize
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsResizing(true)
    startPositionRef.current = { x: e.clientX, y: e.clientY }
    startSizeRef.current = { ...size }

    // Add event listeners for resize
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  // Handle mouse move during resize
  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return

    const deltaX = e.clientX - startPositionRef.current.x

    // Calculate new width based on the drag distance
    const newWidth = Math.max(50, startSizeRef.current.width + deltaX)
    const newHeight = Math.round(newWidth / aspectRatio)

    setSize({ width: newWidth, height: newHeight })
    updateAttributes({ width: newWidth, height: newHeight })
  }

  // Handle mouse up to end resizing
  const handleMouseUp = () => {
    setIsResizing(false)
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)
  }

  // Toggle settings panel
  const handleToggleSettings = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowSettings(!showSettings)
  }

  // Handle click outside to close settings
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSettings &&
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node) &&
        settingsButtonRef.current &&
        !settingsButtonRef.current.contains(event.target as Node)
      ) {
        setShowSettings(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showSettings])

  // Clean up event listeners when component unmounts
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  // Calculate alignment styles
  const getAlignmentStyle = () => {
    switch (alignment) {
      case "left":
        return { margin: "0 auto 0 0" }
      case "right":
        return { margin: "0 0 0 auto" }
      case "center":
      default:
        return { margin: "0 auto" }
    }
  }

  return (
    <NodeViewWrapper className="relative my-4">
      <div
        ref={containerRef}
        className="relative inline-block group"
        style={{
          width: `${size.width}px`,
          ...getAlignmentStyle(),
        }}
      >
        <img
          ref={imageRef}
          src={props.node.attrs.src || "/placeholder.svg"}
          alt={props.node.attrs.alt || ""}
          title={props.node.attrs.title}
          width={size.width}
          height={size.height}
          onLoad={handleImageLoad}
          className="max-w-full"
          style={{ display: "block", width: "100%", height: "auto" }}
          draggable={false}
        />

        {/* Resize handle */}
        <div
          ref={resizeHandleRef}
          className="absolute bottom-0 right-0 w-4 h-4 bg-primary cursor-se-resize opacity-0 group-hover:opacity-100 hover:opacity-100"
          onMouseDown={handleMouseDown}
          style={{ opacity: isResizing ? 1 : undefined }}
        />

        {/* Settings button */}
        <Button
          ref={settingsButtonRef}
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 hover:opacity-100 bg-background/80 hover:bg-background shadow-md"
          onClick={handleToggleSettings}
        >
          <Settings className="h-4 w-4" />
        </Button>

        {/* Image settings panel */}
        {showSettings && (
          <div
            ref={settingsRef}
            className="absolute z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 dark:border-gray-700"
            style={{
              top: settingsPosition.top,
              right: settingsPosition.right === "auto" ? "auto" : settingsPosition.right,
              left: settingsPosition.left === "auto" ? "auto" : settingsPosition.left,
            }}
          >
            <div className="space-y-4">
              <h4 className="font-medium">Image Settings</h4>

              <div className="space-y-2">
                <Label>Width ({size.width}px)</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    value={[size.width]}
                    min={50}
                    max={1000}
                    step={10}
                    onValueChange={(value) => handleWidthChange(value[0])}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={size.width}
                    onChange={(e) => handleWidthChange(Number.parseInt(e.target.value) || 100)}
                    className="w-20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Height ({size.height}px)</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    value={[size.height]}
                    min={50}
                    max={800}
                    step={10}
                    onValueChange={(value) => handleHeightChange(value[0])}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={size.height}
                    onChange={(e) => handleHeightChange(Number.parseInt(e.target.value) || 100)}
                    className="w-20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Alignment</Label>
                <div className="flex space-x-2">
                  <Button
                    variant={alignment === "left" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAlignmentChange("left")}
                    className="flex-1"
                  >
                    <AlignLeft className="h-4 w-4 mr-2" />
                    Left
                  </Button>
                  <Button
                    variant={alignment === "center" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAlignmentChange("center")}
                    className="flex-1"
                  >
                    <AlignCenter className="h-4 w-4 mr-2" />
                    Center
                  </Button>
                  <Button
                    variant={alignment === "right" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAlignmentChange("right")}
                    className="flex-1"
                  >
                    <AlignRight className="h-4 w-4 mr-2" />
                    Right
                  </Button>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={handleResetSize}>
                  Reset Size
                </Button>
                <Button variant="outline" size="sm" onClick={() => props.deleteNode()}>
                  Remove Image
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}
