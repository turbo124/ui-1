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
import { $isTextNode, DOMConversionMap, TextNode } from 'lexical';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { parseAllowedColor } from './ui/ColorPicker';
import { parseAllowedFontSize } from './plugins/ToolbarPlugin/fontSize';
import { SharedHistoryContext } from './context/SharedHistoryContext';
import { ToolbarContext } from './context/ToolbarContext';
import { ReactNode } from 'react';

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
  const tableCellImporters = TableCellNode.importDOM?.() || {};
  
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
          if (lexicalNode instanceof TableCellNode) {
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

const EditorProvider = ({ children }: { children: ReactNode }) => {
  return (
    <LexicalComposer
      initialConfig={{
        editorState: null,
        html: { import: buildImportMap() },
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
