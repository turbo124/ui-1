/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Typography } from '@tiptap/extension-typography';
import { debounce } from 'lodash';
import { useColorScheme } from '$app/common/colors';
import './TiptapEditor.css';

// SVG Icons Library
const Icons = {
  Bold: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  ),
  Italic: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  ),
  Underline: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4" />
      <line x1="4" y1="21" x2="20" y2="21" />
    </svg>
  ),
  Strike: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.3 13.2c.7-.3 1.3-.5 1.7-1 1-1 1-3 0-4s-2-1-3-1" />
      <path d="M3 12h18" />
      <path d="M11 13c-1.5 1-3.5 1.5-4.5 2s-1.5 2.5 0 3.5 2.5 1 4 1" />
    </svg>
  ),
  Link: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  LinkOff: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
      <path d="M11 8v.01" />
      <path d="M8 11h.01" />
      <path d="M14 11h.01" />
      <path d="M11 14h.01" />
    </svg>
  ),
  Image: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  AlignLeft: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="17" y1="10" x2="3" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="17" y1="18" x2="3" y2="18" />
    </svg>
  ),
  AlignCenter: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="10" x2="5" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="19" y1="18" x2="5" y2="18" />
    </svg>
  ),
  AlignRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="21" y1="10" x2="7" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="21" y1="18" x2="7" y2="18" />
    </svg>
  ),
  AlignJustify: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="21" y1="10" x2="3" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="21" y1="18" x2="3" y2="18" />
    </svg>
  ),
  List: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  ListOrdered: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="10" y1="6" x2="21" y2="6" />
      <line x1="10" y1="12" x2="21" y2="12" />
      <line x1="10" y1="18" x2="21" y2="18" />
      <path d="M4 6h1v4" />
      <path d="M4 10h2" />
      <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </svg>
  ),
  Indent: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="12 3 20 9 12 15" />
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  ),
  Outdent: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="12 3 4 9 12 15" />
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  ),
  Table: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
    </svg>
  ),
  TableDelete: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="3" y1="3" x2="21" y2="21" />
    </svg>
  ),
  Code: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Quote: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-4.716-5-7-5" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-4.716-5-7-5" />
    </svg>
  ),
  HorizontalRule: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Undo: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
    </svg>
  ),
  Redo: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
    </svg>
  ),
  ClearFormat: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6v12" />
      <path d="M16 6v12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Palette: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="16" cy="8" r="2" />
    </svg>
  ),
  FileCode: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
};

interface Props {
  value?: string | undefined;
  onChange: (value: string) => unknown;
  label?: string;
  disabled?: boolean;
  handleChangeOnlyOnUserInput?: boolean;
}

export function TiptapEditor(props: Props) {
  const colors = useColorScheme();
  const [isCodeView, setIsCodeView] = useState(false);
  const [codeValue, setCodeValue] = useState(props.value || '');
  const isDarkMode = colors.$0 === 'dark';

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Typography,
    ],
    content: props.value || '',
    onUpdate: ({ editor }) => {
      const htmlContent = editor.getHTML();
      setCodeValue(htmlContent);
      if (props.handleChangeOnlyOnUserInput) {
        if (htmlContent !== props.value) {
          props.onChange(htmlContent);
        }
      } else {
        props.onChange(htmlContent);
      }
    },
  });

  const debouncedOnChange = useRef(
    debounce((value: string) => {
      props.onChange(value);
    }, 500)
  ).current;

  useEffect(() => {
    if (editor && props.value !== editor.getHTML()) {
      editor.commands.setContent(props.value || '');
      setCodeValue(props.value || '');
    }
  }, [props.value, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!props.disabled);
    }
  }, [props.disabled, editor]);

  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  if (!editor) {
    return null;
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCodeValue(newCode);
    debouncedOnChange(newCode);
    if (props.handleChangeOnlyOnUserInput) {
      if (newCode !== props.value) {
        props.onChange(newCode);
      }
    } else {
      props.onChange(newCode);
    }
  };

  const switchToCodeView = () => {
    setCodeValue(editor.getHTML());
    setIsCodeView(true);
  };

  const switchToEditorView = () => {
    try {
      editor.commands.setContent(codeValue);
      props.onChange(codeValue);
      setIsCodeView(false);
    } catch (error) {
      alert('Invalid HTML. Please fix the syntax errors.');
    }
  };

  return (
    <div className={`tiptap-wrapper ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="tiptap-container">
        {!isCodeView ? (
          <>
            <MenuBar editor={editor} isDarkMode={isDarkMode} onCodeClick={switchToCodeView} />
            <EditorContent
              editor={editor}
              className="tiptap-editor-content"
            />
          </>
        ) : (
          <div className="tiptap-code-view">
            <textarea
              value={codeValue}
              onChange={handleCodeChange}
              disabled={props.disabled}
              className="tiptap-code-textarea"
              placeholder="Enter HTML code here..."
            />
          </div>
        )}

        <div className="tiptap-footer">
          <button
            type="button"
            onClick={() => {
              if (isCodeView) {
                switchToEditorView();
              } else {
                switchToCodeView();
              }
            }}
            className="tiptap-code-toggle-btn"
            title={isCodeView ? 'Switch to Editor View' : 'Switch to Code View'}
          >
            {isCodeView ? (
              <>
                <Icons.Edit />
                <span>Editor</span>
              </>
            ) : (
              <>
                <Icons.FileCode />
                <span>Code</span>
              </>
            )}
          </button>
          {!isCodeView && (
            <div className="tiptap-word-count">
              Words: {editor?.storage?.characterCount?.words() || 0}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface MenuBarProps {
  editor: any;
  isDarkMode: boolean;
  onCodeClick: () => void;
}

function MenuBar({ editor, isDarkMode, onCodeClick }: MenuBarProps) {
  const insertTable = () => {
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    if (rows && cols) {
      editor
        .chain()
        .focus()
        .insertTable({ rows: parseInt(rows), cols: parseInt(cols), withHeaderRow: true })
        .run();
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertLink = () => {
    const url = prompt('Enter link URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const insertDateTime = () => {
    const now = new Date().toLocaleString();
    editor.chain().focus().insertContent(now).run();
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  return (
    <div className="tiptap-toolbar">
      {/* Format Group */}
      <div className="tiptap-toolbar-group">
        <select
          onChange={(e) => {
            if (e.target.value === 'p') {
              editor.chain().focus().setParagraph().run();
            } else if (e.target.value.startsWith('h')) {
              const level = parseInt(e.target.value[1]);
              editor.chain().focus().toggleHeading({ level }).run();
            }
            e.target.value = 'p';
          }}
          className="tiptap-select"
          title="Paragraph Format"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
        </select>
      </div>

      {/* Text Formatting Group */}
      <div className="tiptap-toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
          icon={Icons.Bold}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
          icon={Icons.Italic}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
          icon={Icons.Underline}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
          icon={Icons.Strike}
        />
      </div>

      {/* Color Group */}
      <div className="tiptap-toolbar-group">
        <div className="tiptap-color-group">
          <input
            type="color"
            onChange={(event) =>
              editor.chain().focus().setColor(event.target.value).run()
            }
            value={editor.getAttributes('textStyle').color || '#000000'}
            title="Text Color"
            className="tiptap-color-input"
          />
          <span className="tiptap-color-label">Text</span>
        </div>
        <div className="tiptap-color-group">
          <input
            type="color"
            onChange={(event) =>
              editor.chain().focus().toggleHighlight({ color: event.target.value }).run()
            }
            defaultValue={'#FFFF00'}
            title="Highlight Color"
            className="tiptap-color-input"
          />
          <span className="tiptap-color-label">Highlight</span>
        </div>
      </div>

      {/* Links & Media Group */}
      <div className="tiptap-toolbar-group">
        <ToolbarButton
          onClick={insertLink}
          isActive={editor.isActive('link')}
          title="Insert Link"
          icon={Icons.Link}
        />
        <ToolbarButton
          onClick={removeLink}
          disabled={!editor.isActive('link')}
          title="Remove Link"
          icon={Icons.LinkOff}
        />
        <ToolbarButton
          onClick={insertImage}
          title="Insert Image"
          icon={Icons.Image}
        />
      </div>

      {/* Alignment Group */}
      <div className="tiptap-toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
          icon={Icons.AlignLeft}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
          icon={Icons.AlignCenter}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
          icon={Icons.AlignRight}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          title="Justify"
          icon={Icons.AlignJustify}
        />
      </div>

      {/* Lists Group */}
      <div className="tiptap-toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
          icon={Icons.List}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
          icon={Icons.ListOrdered}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
          disabled={!editor.can().sinkListItem('listItem')}
          title="Increase Indent"
          icon={Icons.Indent}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().liftListItem('listItem').run()}
          disabled={!editor.can().liftListItem('listItem')}
          title="Decrease Indent"
          icon={Icons.Outdent}
        />
      </div>

      {/* Table Group */}
      <div className="tiptap-toolbar-group">
        <ToolbarButton
          onClick={insertTable}
          title="Insert Table"
          icon={Icons.Table}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().deleteTable().run()}
          disabled={!editor.isActive('table')}
          title="Delete Table"
          icon={Icons.TableDelete}
        />
      </div>

      {/* Block Elements Group */}
      <div className="tiptap-toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Code Block"
          icon={Icons.Code}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Block Quote"
          icon={Icons.Quote}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
          icon={Icons.HorizontalRule}
        />
      </div>

      {/* Utility Group */}
      <div className="tiptap-toolbar-group">
        <ToolbarButton
          onClick={insertDateTime}
          title="Insert Date/Time"
          icon={Icons.Calendar}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().clearNodes().run()}
          title="Clear Formatting"
          icon={Icons.ClearFormat}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
          icon={Icons.Undo}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
          icon={Icons.Redo}
        />
      </div>
    </div>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  icon: React.FC;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  title,
  icon: Icon,
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`tiptap-toolbar-btn ${isActive ? 'active' : ''}`}
      title={title}
    >
      <Icon />
    </button>
  );
}
