"use client"

import { useState, useEffect, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Color from "@tiptap/extension-color"
import TextStyle from "@tiptap/extension-text-style"
import Link from "@tiptap/extension-link"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  ImageIcon,
  Palette,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import PlaceholderMenu from "@/components/placeholder-menu"
import ImageUploader from "@/components/image-uploader"
import { ResizableImage } from "./tiptap-extensions/resizable-image"
import { useTheme } from "next-themes"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  className?: string
}

export default function RichTextEditor({ content, onChange, className = "" }: RichTextEditorProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const [customColor, setCustomColor] = useState("#")
  const { theme } = useTheme()

  // Saadaolevad värvid
  const colors = [
    { name: "Default", value: "inherit" },
    { name: "Black", value: "#000000" },
    { name: "Gray", value: "#666666" },
    { name: "Dark Gray", value: "#333333" },
    { name: "Light Gray", value: "#999999" },
    { name: "Red", value: "#ff0000" },
    { name: "Dark Red", value: "#cc0000" },
    { name: "Orange", value: "#ff9900" },
    { name: "Yellow", value: "#ffff00" },
    { name: "Green", value: "#00cc00" },
    { name: "Dark Green", value: "#006600" },
    { name: "Blue", value: "#0000ff" },
    { name: "Light Blue", value: "#0099ff" },
    { name: "Purple", value: "#9900ff" },
    { name: "Pink", value: "#ff00ff" },
  ]

  const colorPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setIsColorPickerOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        hardBreak: {
          keepMarks: true,
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      ResizableImage.configure({
        inline: false,
        allowBase64: true,
      }),
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px]",
      },
    },
  })

  if (!editor) {
    return null
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run()
      setLinkUrl("")
      setIsLinkDialogOpen(false)
    }
  }

  const insertPlaceholder = (placeholder: string) => {
    editor.chain().focus().insertContent(placeholder).run()
  }

  const handleImageInsert = (imageHtml: string, alt: string) => {
    // Extract the src from the HTML
    const match = imageHtml.match(/src="([^"]+)"/)
    if (match && match[1]) {
      const src = match[1]

      // Extract width from style if present
      let width = 200
      const widthMatch = imageHtml.match(/width:\s*(\d+)px/)
      if (widthMatch && widthMatch[1]) {
        width = Number.parseInt(widthMatch[1], 10)
      }

      // Extract alignment from style if present
      let alignment: "left" | "center" | "right" = "center"
      if (imageHtml.includes("margin: 0 auto 0 0")) {
        alignment = "left"
      } else if (imageHtml.includes("margin: 0 0 0 auto")) {
        alignment = "right"
      }

      // Calculate height based on aspect ratio if available
      const aspectRatioMatch = imageHtml.match(/data-aspect-ratio="([^"]+)"/)
      let height = undefined
      let aspectRatio = undefined

      if (aspectRatioMatch && aspectRatioMatch[1]) {
        aspectRatio = Number.parseFloat(aspectRatioMatch[1])
        height = Math.round(width / aspectRatio)
      }

      // Insert the image using our custom command
      editor
        .chain()
        .focus()
        .setResizableImage({
          src,
          alt,
          width,
          height,
          alignment,
        })
        .run()
    }

    setIsImageDialogOpen(false)
  }

  const setColor = (color: string) => {
    editor.chain().focus().setColor(color).run()
    setIsColorPickerOpen(false)
  }

  return (
    <div className={`border rounded-md flex flex-col ${className}`}>
      <div className="border-b bg-muted p-2 flex flex-wrap gap-1 rich-text-toolbar">
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("underline")}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          aria-label="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Toggle>
        <div className="w-px h-6 bg-border mx-1 divider" />
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 1 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          aria-label="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 2 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          aria-label="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 3 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          aria-label="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>
        <div className="w-px h-6 bg-border mx-1 divider" />
        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Bullet List"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <div className="w-px h-6 bg-border mx-1 divider" />
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: "left" })}
          onPressedChange={() => editor.chain().focus().setTextAlign("left").run()}
          aria-label="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: "center" })}
          onPressedChange={() => editor.chain().focus().setTextAlign("center").run()}
          aria-label="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: "right" })}
          onPressedChange={() => editor.chain().focus().setTextAlign("right").run()}
          aria-label="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Toggle>
        <div className="w-px h-6 bg-border mx-1 divider" />
        <Toggle
          size="sm"
          pressed={editor.isActive("link")}
          onPressedChange={() => {
            if (editor.isActive("link")) {
              editor.chain().focus().unsetLink().run();
            } else {
              setIsLinkDialogOpen(true);
            }
          }}
          aria-label="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Toggle>
        <Button variant="ghost" size="sm" onClick={() => setIsImageDialogOpen(true)} className="px-2 h-8">
          <ImageIcon className="h-4 w-4" />
        </Button>

        {/* Värvi valija */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="px-2 h-8"
            onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
          >
            <Palette className="h-4 w-4" />
          </Button>

          {isColorPickerOpen && (
            <div
              ref={colorPickerRef}
              className="absolute z-50 top-full left-0 mt-1 p-3 bg-popover rounded-md shadow-md border w-64 color-picker"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              <div className="grid grid-cols-5 gap-2 mb-3">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    className="w-8 h-8 rounded-md border hover:scale-110 transition-transform flex items-center justify-center color-picker-button"
                    style={{
                      backgroundColor: color.value === "inherit" ? "transparent" : color.value,
                      border: color.value === "inherit" ? "1px solid hsl(var(--border))" : "1px solid transparent",
                    }}
                    onClick={() => setColor(color.value)}
                    title={color.name}
                  >
                    {color.value === "inherit" && <span className="text-xs">ABC</span>}
                  </button>
                ))}
              </div>

              <div className="border-t pt-3">
                <label className="text-xs text-muted-foreground mb-1 block">Custom Color</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="#RRGGBB"
                    className="h-8 text-xs"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    maxLength={7}
                  />
                  <Button
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => {
                      if (/^#[0-9A-F]{6}$/i.test(customColor)) {
                        setColor(customColor)
                      }
                    }}
                    disabled={!/^#[0-9A-F]{6}$/i.test(customColor)}
                  >
                    Apply
                  </Button>
                </div>
                {customColor && /^#[0-9A-F]{6}$/i.test(customColor) && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md border" style={{ backgroundColor: customColor }} />
                    <span className="text-xs">{customColor}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-border mx-1 divider" />
        <PlaceholderMenu onInsert={insertPlaceholder} />
      </div>
      <EditorContent
        editor={editor}
        className="p-3 overflow-y-auto dark:bg-gray-900"
        style={{ minHeight: "400px", maxHeight: "500px" }}
      />

      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Lisa link</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input placeholder="https://www.example.com" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
              Tühista
            </Button>
            <Button onClick={addLink}>Lisa link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Uploader Dialog */}
      <ImageUploader
        isOpen={isImageDialogOpen}
        onClose={() => setIsImageDialogOpen(false)}
        onImageSelect={handleImageInsert}
      />
    </div>
  )
}
