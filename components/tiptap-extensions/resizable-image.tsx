import { mergeAttributes, Node } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { ImageResizer } from "../image-resizer"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    resizableImage: {
      /**
       * Add an image with custom width and height
       */
      setResizableImage: (options: {
        src: string
        alt?: string
        title?: string
        width?: number
        height?: number
        alignment?: "left" | "center" | "right"
      }) => ReturnType
    }
  }
}

export interface ResizableImageOptions {
  inline: boolean
  allowBase64: boolean
  HTMLAttributes: Record<string, any>
}

export const ResizableImage = Node.create<ResizableImageOptions>({
  name: "resizableImage",

  addOptions() {
    return {
      inline: false,
      allowBase64: true,
      HTMLAttributes: {},
    }
  },

  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? "inline" : "block"
  },

  draggable: true,

  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute("width") || element.style.width
          return width ? Number.parseInt(width, 10) : null
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const height = element.getAttribute("height") || element.style.height
          return height ? Number.parseInt(height, 10) : null
        },
      },
      alignment: {
        default: "center",
        parseHTML: (element) => {
          // Try to determine alignment from style
          const style = element.getAttribute("style") || ""
          if (style.includes("margin-left: auto") && style.includes("margin-right: 0")) {
            return "right"
          } else if (style.includes("margin-left: 0") && style.includes("margin-right: auto")) {
            return "left"
          }
          return element.getAttribute("data-alignment") || "center"
        },
      },
      "data-aspect-ratio": {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
        getAttrs: (dom) => {
          if (typeof dom === "string") return {}

          const element = dom as HTMLElement
          const width = element.getAttribute("width") || element.style.width
          const height = element.getAttribute("height") || element.style.height

          // Try to determine alignment from style
          let alignment = "center"
          const style = element.getAttribute("style") || ""
          if (style.includes("margin-left: auto") && style.includes("margin-right: 0")) {
            alignment = "right"
          } else if (style.includes("margin-left: 0") && style.includes("margin-right: auto")) {
            alignment = "left"
          }

          return {
            src: element.getAttribute("src"),
            alt: element.getAttribute("alt"),
            title: element.getAttribute("title"),
            width: width ? Number.parseInt(width, 10) : null,
            height: height ? Number.parseInt(height, 10) : null,
            alignment,
            "data-aspect-ratio": element.getAttribute("data-aspect-ratio"),
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { alignment, ...attrs } = HTMLAttributes

    // Calculate inline styles for email compatibility
    let style = `max-width: 100%;`
    if (attrs.width) {
      style += ` width: ${attrs.width}px;`
    }

    // Add alignment styles
    style += ` display: block; margin: ${
      alignment === "center" ? "0 auto" : alignment === "right" ? "0 0 0 auto" : "0 auto 0 0"
    };`

    return ["img", mergeAttributes(this.options.HTMLAttributes, attrs, { style, "data-alignment": alignment })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageResizer)
  },

  addCommands() {
    return {
      setResizableImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})
