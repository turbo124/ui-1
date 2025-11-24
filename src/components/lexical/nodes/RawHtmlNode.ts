/**
 * Custom node for preserving raw HTML (like tables) without mutation
 */

import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from 'lexical';

import { ElementNode } from 'lexical';

export type SerializedRawHtmlNode = Spread<
  {
    type: 'raw-html';
    version: 1;
    html: string;
  },
  SerializedElementNode
>;

function $convertRawHtmlElement(
  domNode: HTMLElement
): DOMConversionOutput | null {
  const html = domNode.outerHTML;
  console.log('[RawHtmlNode] Converting table with priority 4');
  const node = $createRawHtmlNode(html);
  return { node };
}

export class RawHtmlNode extends ElementNode {
  __html: string;

  constructor(html: string, key?: NodeKey) {
    super(key);
    this.__html = html;
  }

  static getType(): string {
    return 'raw-html';
  }

  static clone(node: RawHtmlNode): RawHtmlNode {
    return new RawHtmlNode(node.__html, node.__key);
  }

  static importDOM(): DOMConversionMap | null {
    return {
      table: () => ({
        conversion: $convertRawHtmlElement,
        priority: 4,
      }),
    };
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-lexical-raw-html', 'true');
    wrapper.setAttribute('contenteditable', 'false');

    // Use innerHTML to render the HTML directly without re-parsing
    wrapper.innerHTML = this.__html;

    return wrapper;
  }

  updateDOM(prevNode: this, dom: HTMLElement): boolean {
    if (prevNode.__html !== this.__html) {
      dom.innerHTML = this.__html;
      return true;
    }
    return false;
  }

  exportDOM(): DOMExportOutput {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.__html;
    return { element: wrapper.firstChild as HTMLElement || wrapper };
  }

  exportJSON(): SerializedRawHtmlNode {
    return {
      ...super.exportJSON(),
      html: this.__html,
      type: 'raw-html',
      version: 1,
    } as SerializedRawHtmlNode;
  }

  static importJSON(serializedNode: SerializedRawHtmlNode): RawHtmlNode {
    return $createRawHtmlNode(serializedNode.html);
  }

  updateFromJSON(serializedNode: SerializedRawHtmlNode): this {
    this.__html = serializedNode.html;
    return this;
  }

  getTextContent(): string {
    return '';
  }

  isInline(): boolean {
    return false;
  }

  canBeEmpty(): boolean {
    return false;
  }

  canIndent(): boolean {
    return false;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }
}

export function $createRawHtmlNode(html: string): RawHtmlNode {
  return new RawHtmlNode(html);
}

export function $isRawHtmlNode(
  node: LexicalNode | null | undefined
): node is RawHtmlNode {
  return node instanceof RawHtmlNode;
}
