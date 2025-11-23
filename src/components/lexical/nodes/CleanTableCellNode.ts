/**
 * Custom TableCellNode that prevents Lexical from injecting unwanted styles
 * Overrides the exportDOM method to output clean HTML without theme defaults
 */

import {
  TableCellNode,
  SerializedTableCellNode,
  TableCellHeaderStates,
  $isTableCellNode,
} from '@lexical/table';
import {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalEditor,
  NodeKey,
  LexicalNode,
} from 'lexical';

export class CleanTableCellNode extends TableCellNode {
  static getType(): string {
    return 'clean-tablecell';
  }

  static clone(node: CleanTableCellNode): CleanTableCellNode {
    return new CleanTableCellNode(
      node.__headerState,
      node.__colSpan,
      node.__width,
      node.__key
    );
  }

  /**
   * Override exportDOM to prevent injecting unwanted styles
   */
  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement(this.getTag());

    // ONLY add user-defined properties, NOT theme defaults

    // Add colspan if > 1
    if (this.getColSpan() > 1) {
      element.colSpan = this.getColSpan();
    }

    // Add rowspan if > 1
    if (this.getRowSpan() > 1) {
      element.rowSpan = this.getRowSpan();
    }

    // Add width ONLY if user explicitly set it (and it's not the default 75px)
    const width = this.getWidth();
    if (width && width !== 75) {
      element.style.width = `${width}px`;
    }

    // Add background color ONLY if user set it
    const bgColor = this.getBackgroundColor();
    if (bgColor) {
      element.style.backgroundColor = bgColor;
    }

    // Add vertical-align ONLY if user set it (not 'top' default)
    const vAlign = this.getVerticalAlign();
    if (vAlign && vAlign !== 'top') {
      element.style.verticalAlign = vAlign;
    }

    // DO NOT ADD:
    // - border (was: "1px solid black")
    // - text-align (was: "start")
    // - default width: 75px
    // - default vertical-align: "top"

    return { element };
  }

  static importJSON(serializedNode: SerializedTableCellNode): CleanTableCellNode {
    const node = $createCleanTableCellNode(
      serializedNode.headerState,
      serializedNode.colSpan,
      serializedNode.width
    );
    node.setRowSpan(serializedNode.rowSpan || 1);
    node.setBackgroundColor(serializedNode.backgroundColor || null);
    node.setVerticalAlign(serializedNode.verticalAlign);
    return node;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      td: () => ({
        conversion: convertTableCellElement,
        priority: 1,
      }),
      th: () => ({
        conversion: convertTableCellElement,
        priority: 1,
      }),
    };
  }
}

function convertTableCellElement(domNode: Node): DOMConversionOutput {
  const element = domNode as HTMLTableCellElement;
  const nodeName = element.nodeName.toLowerCase();

  let width: number | undefined = undefined;
  const widthAttr = element.style.width;
  const widthMatch = widthAttr?.match(/^(\d+(?:\.\d+)?)px$/);
  if (widthMatch) {
    width = parseFloat(widthMatch[1]);
  }

  const tableCellNode = $createCleanTableCellNode(
    nodeName === 'th' ? TableCellHeaderStates.ROW : TableCellHeaderStates.NO_STATUS,
    element.colSpan || 1,
    width
  );

  tableCellNode.setRowSpan(element.rowSpan || 1);

  // Preserve background color
  const backgroundColor = element.style.backgroundColor;
  if (backgroundColor) {
    tableCellNode.setBackgroundColor(backgroundColor);
  }

  // Preserve vertical align
  const verticalAlign = element.style.verticalAlign;
  if (verticalAlign === 'middle' || verticalAlign === 'bottom') {
    tableCellNode.setVerticalAlign(verticalAlign);
  }

  return { node: tableCellNode };
}

export function $createCleanTableCellNode(
  headerState = TableCellHeaderStates.NO_STATUS,
  colSpan = 1,
  width?: number
): CleanTableCellNode {
  return new CleanTableCellNode(headerState, colSpan, width);
}

export function $isCleanTableCellNode(
  node: LexicalNode | null | undefined
): node is CleanTableCellNode {
  return node instanceof CleanTableCellNode;
}
