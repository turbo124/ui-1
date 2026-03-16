import {
    DecoratorNode,
    LexicalNode,
    NodeKey,
    EditorConfig,
    SerializedLexicalNode,
    Spread,
} from "lexical";

export type SerializedImageNode = Spread<
    {
        src: string;
        altText: string;
        width: "inherit" | number;
        height: "inherit" | number;
        maxWidth: number;
    },
    SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
    __src: string;
    __altText: string;
    __width: "inherit" | number;
    __height: "inherit" | number;
    __maxWidth: number;

    static getType(): string {
        return "image";
    }

    static clone(node: ImageNode): ImageNode {
        return new ImageNode(
            node.__src,
            node.__altText,
            node.__maxWidth,
            node.__width,
            node.__height,
            node.__key
        );
    }

    static importJSON(serializedNode: SerializedImageNode): ImageNode {
        const { src, altText, width, height, maxWidth } = serializedNode;
        const node = $createImageNode(src, altText, maxWidth);
        node.setWidthAndHeight(width, height);
        return node;
    }

    exportJSON(): SerializedImageNode {
        return {
            ...super.exportJSON(),
            src: this.__src,
            altText: this.__altText,
            width: this.__width,
            height: this.__height,
            maxWidth: this.__maxWidth,
            type: "image",
            version: 1,
        };
    }

    constructor(
        src: string,
        altText: string,
        maxWidth: number,
        width?: "inherit" | number,
        height?: "inherit" | number,
        key?: NodeKey
    ) {
        super(key);
        this.__src = src;
        this.__altText = altText;
        this.__maxWidth = maxWidth;
        this.__width = width || "inherit";
        this.__height = height || "inherit";
    }

    setWidthAndHeight(
        width: "inherit" | number,
        height: "inherit" | number
    ): void {
        const writable = this.getWritable();
        writable.__width = width;
        writable.__height = height;
    }

    // View
    createDOM(config: EditorConfig): HTMLElement {
        const span = document.createElement("span");
        const theme = config.theme;
        const className = theme.image;
        if (className !== undefined) {
            span.className = className;
        }
        return span;
    }

    updateDOM(): false {
        return false;
    }

    getSrc(): string {
        return this.__src;
    }

    getAltText(): string {
        return this.__altText;
    }

    decorate(): JSX.Element {
        return (
            <img
                src={this.__src}
                alt={this.__altText}
                style={{
                    maxWidth: this.__maxWidth,
                    width: this.__width,
                    height: this.__height,
                }}
                className="editor-image"
            />
        );
    }
}

export function $createImageNode(
    src: string,
    altText: string,
    maxWidth: number = 500
): ImageNode {
    return new ImageNode(src, altText, maxWidth);
}

export function $isImageNode(
    node: LexicalNode | null | undefined
): node is ImageNode {
    return node instanceof ImageNode;
}
