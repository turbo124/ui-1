/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { LexicalComposer } from '@lexical/react/LexicalComposer';

import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';
import PlaygroundNodes from './nodes/PlaygroundNodes';
import { $isTextNode, DOMConversionMap, DOMExportOutput, LexicalEditor, LexicalNode, Klass, TextNode } from 'lexical';
import { TableNode, TableRowNode } from '@lexical/table';
import { CleanTableCellNode } from './nodes/CleanTableCellNode';
import { parseAllowedColor } from './ui/ColorPicker';
import { parseAllowedFontSize } from './plugins/ToolbarPlugin/fontSize';
import { SharedHistoryContext } from './context/SharedHistoryContext';
import { ToolbarContext } from './context/ToolbarContext';
import { ReactNode } from 'react';
import { ParagraphNode } from 'lexical';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { LinkNode } from '@lexical/link';
import { ListNode, ListItemNode } from '@lexical/list';

function getExtraStyles(element: HTMLElement): string {
  // Parse styles from pasted input, but only if they match exactly the
  // sort of styles that would be produced by exportDOM
  let extraStyles = '';
  const fontSize = parseAllowedFontSize(element.style.fontSize);
  const backgroundColor = parseAllowedColor(element.style.backgroundColor);
  const color = parseAllowedColor(element.style.color);
  if (fontSize !== '' && fontSize !== '15px') {
    extraStyles += `font-size: ${fontSize};`;
  }
  if (backgroundColor !== '' && backgroundColor !== 'rgb(255, 255, 255)') {
    extraStyles += `background-color: ${backgroundColor};`;
  }
  if (color !== '' && color !== 'rgb(0, 0, 0)') {
    extraStyles += `color: ${color};`;
  }
  return extraStyles;
}

function buildImportMap(): DOMConversionMap {
  const importMap: DOMConversionMap = {};

  // Get default table cell importers and wrap them to preserve all styles
  const tableCellImporters = CleanTableCellNode.importDOM?.() || {};
  
  for (const [tag, importerFn] of Object.entries(tableCellImporters)) {
    importMap[tag] = (node: Node) => {
      const result = importerFn?.(node as HTMLElement);
      
      if (!result) {
        return null;
      }

      const originalConversion = result.conversion;

      return {
        ...result,
        conversion: (domNode: HTMLElement) => {
          const output = originalConversion(domNode);

          if (!output || !output.node) {
            return output;
          }

          const lexicalNode = output.node;

          // Preserve all table cell styles to prevent UI disruption
          if (lexicalNode instanceof CleanTableCellNode) {
            const styleAttr = domNode.getAttribute('style') || '';

            // Preserve background-color
            const bgMatch = styleAttr.match(/background-color\s*:\s*([^;]+)/);
            if (bgMatch?.[1]) {
              lexicalNode.setBackgroundColor(bgMatch[1].trim());
            }

            // Preserve width
            const widthMatch = styleAttr.match(/width\s*:\s*(\d+)/);
            if (widthMatch?.[1]) {
              lexicalNode.setWidth(parseInt(widthMatch[1]));
            }

            // Preserve vertical-align
            const vAlignMatch = styleAttr.match(/vertical-align\s*:\s*([^;]+)/);
            if (vAlignMatch?.[1]) {
              lexicalNode.setVerticalAlign(vAlignMatch[1].trim());
            }

            // Preserve colspan and rowspan attributes
            const colspanAttr = domNode.getAttribute('colspan');
            if (colspanAttr) {
              lexicalNode.setColSpan(parseInt(colspanAttr));
            }

            const rowspanAttr = domNode.getAttribute('rowspan');
            if (rowspanAttr) {
              lexicalNode.setRowSpan(parseInt(rowspanAttr));
            }
          }

          return output;
        },
      };
    };
  }

  // Add other table importers (TableNode, TableRowNode) without modification
  // These don't have styling properties that need preservation
  const tableNodeImporters = TableNode.importDOM?.() || {};
  const tableRowImporters = TableRowNode.importDOM?.() || {};
  Object.assign(importMap, tableNodeImporters, tableRowImporters);

  // Wrap all TextNode importers with a function that also imports
  // the custom styles implemented by the playground
  for (const [tag, fn] of Object.entries(TextNode.importDOM() || {})) {
    // Don't override table cell importers we just added
    if (importMap[tag]) {
      continue;
    }
    
    importMap[tag] = (importNode) => {
      const importer = fn(importNode);
      if (!importer) {
        return null;
      }
      return {
        ...importer,
        conversion: (element) => {
          const output = importer.conversion(element);
          if (
            output === null ||
            output.forChild === undefined ||
            output.after !== undefined ||
            output.node !== null
          ) {
            return output;
          }
          const extraStyles = getExtraStyles(element);
          if (extraStyles) {
            const { forChild } = output;
            return {
              ...output,
              forChild: (child, parent) => {
                const textNode = forChild(child, parent);
                if ($isTextNode(textNode)) {
                  textNode.setStyle(textNode.getStyle() + extraStyles);
                }
                return textNode;
              },
            };
          }
          return output;
        },
      };
    };
  }

  return importMap;
}

/**
 * Build export map to control HTML generation at the node level
 * This is the proper way to prevent Lexical from adding theme classes and unwanted styles
 */
function buildExportMap(): Map<Klass<LexicalNode>, (editor: LexicalEditor, target: LexicalNode) => DOMExportOutput> {
  const exportMap = new Map<Klass<LexicalNode>, (editor: LexicalEditor, target: LexicalNode) => DOMExportOutput>();
  
  // Utility: Remove theme classes from element
  const stripThemeClasses = (element: HTMLElement | Text | DocumentFragment | null): typeof element => {
    if (!element || !(element instanceof HTMLElement)) return element;
    
    if (element.className) {
      const classes = element.className.split(' ').filter(
        cls => !cls.startsWith('PlaygroundEditorTheme__')
      );
      
      if (classes.length > 0) {
        element.className = classes.join(' ');
      } else {
        element.removeAttribute('class');
      }
    }
    
    return element;
  };
  
  // Utility: Remove white-space: pre-wrap from inline styles
  const stripWhiteSpaceStyle = (element: HTMLElement | Text | DocumentFragment | null): typeof element => {
    if (!element || !(element instanceof HTMLElement)) return element;
    
    const styleAttr = element.getAttribute('style');
    if (styleAttr) {
      const cleanedStyle = styleAttr
        .replace(/white-space\s*:\s*pre-wrap\s*;?/gi, '')
        .replace(/;\s*;/g, ';')
        .trim()
        .replace(/^;+|;+$/g, '');
      
      if (cleanedStyle) {
        element.setAttribute('style', cleanedStyle);
      } else {
        element.removeAttribute('style');
      }
    }
    
    return element;
  };
  
  // Utility: Clean both theme classes and white-space style
  const cleanElement = (element: HTMLElement | Text | DocumentFragment | null): typeof element => {
    element = stripThemeClasses(element);
    element = stripWhiteSpaceStyle(element);
    return element;
  };
  
  // Override ParagraphNode export
  exportMap.set(ParagraphNode, (editor: LexicalEditor, node: LexicalNode) => {
    const output = node.exportDOM(editor);
    return {
      ...output,
      element: cleanElement(output.element)
    };
  });
  
  // Override TextNode export
  exportMap.set(TextNode, (editor: LexicalEditor, node: LexicalNode) => {
    const output = node.exportDOM(editor);
    return {
      ...output,
      element: cleanElement(output.element)
    };
  });
  
  // Override HeadingNode export
  exportMap.set(HeadingNode, (editor: LexicalEditor, node: LexicalNode) => {
    const output = node.exportDOM(editor);
    return {
      ...output,
      element: cleanElement(output.element)
    };
  });
  
  // Override QuoteNode export
  exportMap.set(QuoteNode, (editor: LexicalEditor, node: LexicalNode) => {
    const output = node.exportDOM(editor);
    return {
      ...output,
      element: cleanElement(output.element)
    };
  });
  
  // Override LinkNode export
  exportMap.set(LinkNode, (editor: LexicalEditor, node: LexicalNode) => {
    const output = node.exportDOM(editor);
    return {
      ...output,
      element: cleanElement(output.element)
    };
  });
  
  // Override ListNode export
  exportMap.set(ListNode, (editor: LexicalEditor, node: LexicalNode) => {
    const output = node.exportDOM(editor);
    return {
      ...output,
      element: stripThemeClasses(output.element)
    };
  });
  
  // Override ListItemNode export
  exportMap.set(ListItemNode, (editor: LexicalEditor, node: LexicalNode) => {
    const output = node.exportDOM(editor);
    return {
      ...output,
      element: stripThemeClasses(output.element)
    };
  });
  
  // Override TableNode export to remove colgroup
  exportMap.set(TableNode, (editor: LexicalEditor, node: LexicalNode) => {
    const output = node.exportDOM(editor);
    
    return {
      ...output,
      element: stripThemeClasses(output.element),
      after: (element) => {
        // Call original after if exists
        let processed = output.after ? output.after(element) : element;
        
        // Remove colgroup elements
        if (processed && processed instanceof HTMLElement) {
          const colgroups = processed.querySelectorAll('colgroup');
          colgroups.forEach(cg => cg.remove());
        }
        
        return processed;
      }
    };
  });
  
  // CleanTableCellNode already has clean exportDOM, just remove theme classes
  exportMap.set(CleanTableCellNode, (editor: LexicalEditor, node: LexicalNode) => {
    const output = node.exportDOM(editor);
    return {
      ...output,
      element: stripThemeClasses(output.element)
    };
  });
  
  // TableRowNode
  exportMap.set(TableRowNode, (editor: LexicalEditor, node: LexicalNode) => {
    const output = node.exportDOM(editor);
    return {
      ...output,
      element: stripThemeClasses(output.element)
    };
  });
  
  return exportMap;
}

const EditorProvider = ({ children }: { children: ReactNode }) => {
  return (
    <LexicalComposer
      initialConfig={{
        editorState: null,
        html: { 
          import: buildImportMap(),
          export: buildExportMap()
        },
        namespace: 'Invoice Ninja',
        nodes: [...PlaygroundNodes],
        onError: (error: Error) => {
          throw error;
        },
        theme: PlaygroundEditorTheme,
      }}
    >
      <SharedHistoryContext>
        <ToolbarContext>{children}</ToolbarContext>
      </SharedHistoryContext>
    </LexicalComposer>
  );
};

export default EditorProvider;
