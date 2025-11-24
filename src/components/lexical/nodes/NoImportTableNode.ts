/**
 * Wrapper around @lexical/table TableNode that disables HTML import
 * to prevent duplication with RawHtmlNode
 */

import {
  DOMConversionMap,
} from 'lexical';
import { TableNode as LexicalTableNode } from '@lexical/table';

export class NoImportTableNode extends LexicalTableNode {
  static importDOM(): DOMConversionMap | null {
    // Disable HTML import - RawHtmlNode handles tables
    return null;
  }
}
