/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { JSX } from 'react';

import './index.css';

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { CAN_USE_DOM } from '@lexical/utils';
import * as React from 'react';
import { useEffect, useState } from 'react';

import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import CodeActionMenuPlugin from './plugins/CodeActionMenuPlugin';
import CollapsiblePlugin from './plugins/CollapsiblePlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import EmojisPlugin from './plugins/EmojisPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin';
import KeywordsPlugin from './plugins/KeywordsPlugin';
import { LayoutPlugin } from './plugins/LayoutPlugin/LayoutPlugin';
import LinkPlugin from './plugins/LinkPlugin';
import PageBreakPlugin from './plugins/PageBreakPlugin';
import ShortcutsPlugin from './plugins/ShortcutsPlugin';
import TabFocusPlugin from './plugins/TabFocusPlugin';
import MarkdownShortcutPlugin from './plugins/MarkdownShortcutPlugin';
import ContentEditable from './ui/ContentEditable';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { useColorScheme } from '$app/common/colors';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useSharedHistoryContext } from './context/SharedHistoryContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $insertNodes } from 'lexical';
import classNames from 'classnames';
import { useReactSettings } from '$app/common/hooks/useReactSettings';

/**
 * Strips unwanted inline styles that Lexical injects during HTML export
 * These styles come from CSS theme classes and should not be part of the HTML output
 */
function stripLexicalInjections(html: string): string {
  // Create a DOM parser to manipulate the HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // 1. Remove ALL theme classes from all elements
  const allElements = doc.querySelectorAll('*');
  allElements.forEach((element) => {
    const htmlElement = element as HTMLElement;
    
    // Remove all PlaygroundEditorTheme classes
    if (htmlElement.className) {
      const classes = htmlElement.className.split(' ').filter(
        cls => !cls.startsWith('PlaygroundEditorTheme__')
      );
      
      if (classes.length > 0) {
        htmlElement.className = classes.join(' ');
      } else {
        htmlElement.removeAttribute('class');
      }
    }
    
    // Remove Lexical-injected inline styles
    const styleAttr = htmlElement.getAttribute('style');
    if (styleAttr) {
      const styles: Record<string, string> = {};
      styleAttr.split(';').forEach(style => {
        const [property, value] = style.split(':').map(s => s.trim());
        if (property && value) {
          styles[property] = value;
        }
      });
      
      // Remove Lexical-specific injected styles
      delete styles['white-space'];  // Remove "white-space: pre-wrap"
      
      // For table cells, remove Lexical defaults
      if (htmlElement.tagName === 'TD' || htmlElement.tagName === 'TH') {
        delete styles['border'];           // Remove "border: 1px solid black"
        delete styles['text-align'];       // Remove "text-align: start"
        
        // Remove default width: 75px but keep custom widths
        if (styles['width'] === '75px') {
          delete styles['width'];
        }
        
        // Remove default vertical-align: top but keep custom values
        if (styles['vertical-align'] === 'top') {
          delete styles['vertical-align'];
        }
      }
      
      // Rebuild style attribute with only preserved styles
      const preservedStyles = Object.entries(styles)
        .map(([prop, val]) => `${prop}: ${val}`)
        .join('; ');
      
      if (preservedStyles) {
        htmlElement.setAttribute('style', preservedStyles);
      } else {
        htmlElement.removeAttribute('style');
      }
    }
  });
  
  // 2. Remove <colgroup> elements from tables
  const colgroups = doc.querySelectorAll('colgroup');
  colgroups.forEach(colgroup => {
    colgroup.remove();
  });
  
  return doc.body.innerHTML;
}

interface Props {
  value: string | undefined;
  disabled: boolean;
  onChange: (value: string) => void;
}

export function Editor({ value, disabled, onChange }: Props): JSX.Element {
  const isFirstRender = React.useRef(true);
  const isManualChange = React.useRef(false);

  const colors = useColorScheme();
  const reactSettings = useReactSettings();

  const isEditable = useLexicalEditable();
  const { historyState } = useSharedHistoryContext();

  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] =
    useState<boolean>(false);
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport =
        CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches;

      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport);
      }
    };
    updateViewPortWidth();
    window.addEventListener('resize', updateViewPortWidth);

    return () => {
      window.removeEventListener('resize', updateViewPortWidth);
    };
  }, [isSmallWidthViewport]);

  useEffect(() => {
    if (isFirstRender.current && !isManualChange.current && value) {
      isFirstRender.current = false;

      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(value, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        $insertNodes(nodes);
      });
    }
  }, [isFirstRender, value, editor]);

  useEffect(() => {
    if (disabled) {
      editor.setEditable(false);
    } else {
      editor.setEditable(true);
    }
  }, [disabled]);

  return (
    <div className="border rounded-md" style={{ borderColor: colors.$24 }}>
      <ToolbarPlugin
        editor={editor}
        activeEditor={activeEditor}
        setActiveEditor={setActiveEditor}
        setIsLinkEditMode={setIsLinkEditMode}
      />
      <ShortcutsPlugin
        editor={activeEditor}
        setIsLinkEditMode={setIsLinkEditMode}
      />
      <div className="editor-container">
        <AutoFocusPlugin />
        <ClearEditorPlugin />
        <EmojisPlugin />
        <MarkdownShortcutPlugin />
        <HashtagPlugin />
        <KeywordsPlugin />
        <AutoLinkPlugin />
        <OnChangePlugin
          onChange={(editorState) => {
            isManualChange.current = true;

            editorState.read(() => {
              const htmlString = $generateHtmlFromNodes(editor, null);
              // Strip Lexical-injected table styles before saving
              const cleanedHtml = stripLexicalInjections(htmlString);
              onChange(cleanedHtml);
            });
          }}
        />

        <HistoryPlugin externalHistoryState={historyState} />

        <RichTextPlugin
          contentEditable={
            <div className="editor-scroller">
              <div
                className={classNames('editor', {
                  'editor-dark': reactSettings.dark_mode,
                  'editor-light': !reactSettings.dark_mode,
                })}
                ref={onRef}
              >
                <ContentEditable />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ListPlugin hasStrictIndent={false} />
        <CheckListPlugin />
        <LinkPlugin hasLinkAttributes={false} />
        <ClickableLinkPlugin disabled={isEditable} />
        <HorizontalRulePlugin />
        <TabFocusPlugin />
        <TabIndentationPlugin maxIndent={7} />
        <CollapsiblePlugin />
        <PageBreakPlugin />
        <LayoutPlugin />
        {floatingAnchorElem && (
          <>
            <FloatingLinkEditorPlugin
              anchorElem={floatingAnchorElem}
              isLinkEditMode={isLinkEditMode}
              setIsLinkEditMode={setIsLinkEditMode}
            />
          </>
        )}
        {floatingAnchorElem && !isSmallWidthViewport && (
          <>
            <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
            <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
            <FloatingTextFormatToolbarPlugin
              anchorElem={floatingAnchorElem}
              setIsLinkEditMode={setIsLinkEditMode}
            />
          </>
        )}
      </div>
    </div>
  );
}
