import React, { useCallback, useEffect, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { 
    $getRoot, 
    $createParagraphNode, 
    $createTextNode, 
    $getSelection, 
    FORMAT_TEXT_COMMAND, 
    $isRangeSelection,
    $isRootOrShadowRoot,
    CAN_UNDO_COMMAND,
    CAN_REDO_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
    FORMAT_ELEMENT_COMMAND,
    INDENT_CONTENT_COMMAND,
    OUTDENT_CONTENT_COMMAND,
    SELECTION_CHANGE_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
    $isTextNode,
    $insertNodes,
} from "lexical";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";

import { 
    HeadingNode, 
    QuoteNode, 
    $createHeadingNode, 
    $createQuoteNode, 
    $isHeadingNode 
} from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { 
    ListItemNode, 
    ListNode, 
    $isListNode, 
    INSERT_ORDERED_LIST_COMMAND, 
    INSERT_UNORDERED_LIST_COMMAND, 
    REMOVE_LIST_COMMAND 
} from "@lexical/list";
import { CodeHighlightNode, CodeNode, $createCodeNode, $isCodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode, $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { TRANSFORMERS } from "@lexical/markdown";
import { mergeRegister, $findMatchingParent } from "@lexical/utils";
import { $setBlocksType, $getSelectionStyleValueForProperty } from "@lexical/selection";
import { useColorScheme } from '$app/common/colors';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { InputLabel } from '$app/components/forms/InputLabel';

// Add proper TypeScript declarations for Speech Recognition API
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onstart: (() => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

declare global {
    interface Window {
        SpeechRecognition: {
            new (): SpeechRecognition;
        };
        webkitSpeechRecognition: {
            new (): SpeechRecognition;
        };
    }
}

interface Props {
    value?: string | undefined;
    onChange?: (editorState: string) => void;
    label?: string;
    disabled?: boolean;
    handleChangeOnlyOnUserInput?: boolean;
    theme?: 'light' | 'dark';
}

// Icon components matching Lexical playground
const BoldIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
    </svg>
);

const ItalicIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"/>
    </svg>
);

const UnderlineIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>
    </svg>
);

const StrikethroughIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/>
    </svg>
);

const CodeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
    </svg>
);

const UndoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
    </svg>
);

const RedoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 15h9V6l-3.6 4.6z"/>
    </svg>
);

const AlignLeftIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/>
    </svg>
);

const AlignCenterIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/>
    </svg>
);

const AlignRightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/>
    </svg>
);

const AlignJustifyIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z"/>
    </svg>
);

const BulletListIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 6h2v2H4V6zm0 5h2v2H4v-2zm0 5h2v2H4v-2zm16-8V6H8v2h12zm0 5v-2H8v2h12zm0 5v-2H8v2h12z"/>
    </svg>
);

const NumberedListIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
    </svg>
);

const LinkIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
    </svg>
);

const QuoteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z"/>
    </svg>
);

const HeadingIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 4v3h5.5v12h3V7H19V4H5z"/>
    </svg>
);

const IndentIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z"/>
    </svg>
);

const OutdentIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z"/>
    </svg>
);

// Add microphone icon
const MicrophoneIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
    </svg>
);

// Toolbar component matching Lexical playground
function ToolbarPlugin({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
    const [editor] = useLexicalComposerContext();
    const [activeEditor, setActiveEditor] = useState(editor);
    const [blockType, setBlockType] = useState("paragraph");
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isCode, setIsCode] = useState(false);
    const [isLink, setIsLink] = useState(false);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [fontSize, setFontSize] = useState("15px");
    const [fontColor, setFontColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#ffffff");

    const updateToolbar = useCallback(() => {
        editor.read(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                // Update text format
                setIsBold(selection.hasFormat("bold"));
                setIsItalic(selection.hasFormat("italic"));
                setIsUnderline(selection.hasFormat("underline"));
                setIsStrikethrough(selection.hasFormat("strikethrough"));
                setIsCode(selection.hasFormat("code"));

                // Update block type
                const anchorNode = selection.anchor.getNode();
                let element = anchorNode.getKey() === "root"
                    ? anchorNode
                    : $findMatchingParent(anchorNode, (e) => {
                        const parent = e.getParent();
                        return parent !== null && $isRootOrShadowRoot(parent);
                    });

                if (element === null) {
                    element = anchorNode.getTopLevelElementOrThrow();
                }

                if ($isHeadingNode(element)) {
                    setBlockType(element.getTag());
                } else if ($isListNode(element)) {
                    setBlockType(element.getListType());
                } else if ($isCodeNode(element)) {
                    setBlockType("code");
                } else {
                    setBlockType(element.getType());
                }

                // Update link
                const node = selection.anchor.getNode();
                const parent = node.getParent();
                if ($isLinkNode(parent) || $isLinkNode(node)) {
                    setIsLink(true);
                } else {
                    setIsLink(false);
                }

                // Update styles
                setFontSize($getSelectionStyleValueForProperty(selection, "font-size", "15px"));
                setFontColor($getSelectionStyleValueForProperty(selection, "color", "#000000"));
                setBgColor($getSelectionStyleValueForProperty(selection, "background-color", "#ffffff"));
            }
        });
    }, [editor]);

    useEffect(() => {
        return editor.registerCommand(
            SELECTION_CHANGE_COMMAND,
            (_payload, newEditor) => {
                updateToolbar();
                setActiveEditor(newEditor);
                return false;
            },
            COMMAND_PRIORITY_CRITICAL
        );
    }, [editor, updateToolbar]);

    useEffect(() => {
        return mergeRegister(
            activeEditor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    updateToolbar();
                });
            }),
            activeEditor.registerCommand<boolean>(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL
            ),
            activeEditor.registerCommand<boolean>(
                CAN_REDO_COMMAND,
                (payload) => {
                    setCanRedo(payload);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL
            )
        );
    }, [activeEditor, updateToolbar]);

    const formatText = (format: "bold" | "italic" | "underline" | "strikethrough" | "code") => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    };

    const formatBlock = (blockType: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                if (blockType === "paragraph") {
                    $setBlocksType(selection, () => $createParagraphNode());
                } else if (blockType.startsWith("h")) {
                    $setBlocksType(selection, () => $createHeadingNode(blockType as any));
                } else if (blockType === "quote") {
                    $setBlocksType(selection, () => $createQuoteNode());
                } else if (blockType === "code") {
                    $setBlocksType(selection, () => $createCodeNode());
                }
            }
        });
    };

    const formatList = (listType: "bullet" | "number") => {
        if (blockType !== listType) {
            if (listType === "bullet") {
                editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
            } else {
                editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
            }
        } else {
            editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        }
    };

    const formatAlign = (alignment: "left" | "center" | "right" | "justify") => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
    };

    const insertLink = () => {
        if (!isLink) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
        } else {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        }
    };

    // Fix the formatStyle function
    const formatStyle = (style: string, value: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                // Use the correct method for setting styles
                selection.getNodes().forEach(node => {
                    if ($isTextNode(node)) {
                        const currentStyle = node.getStyle();
                        // Parse the current style string into an object
                        const styleObj: Record<string, string> = {};
                        if (currentStyle) {
                            currentStyle.split(';').forEach(rule => {
                                const [property, value] = rule.split(':');
                                if (property && value) {
                                    styleObj[property.trim()] = value.trim();
                                }
                            });
                        }
                        // Update the specific style property
                        styleObj[style] = value;
                        // Convert back to style string
                        const newStyle = Object.entries(styleObj)
                            .map(([prop, val]) => `${prop}: ${val}`)
                            .join('; ');
                        node.setStyle(newStyle);
                    }
                });
            }
        });
    };

    const isDark = theme === 'dark';
    const toolbarStyles = {
        backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
        borderColor: isDark ? '#333333' : '#e1e5e9',
        textColor: isDark ? '#ffffff' : '#000000',
        buttonHover: isDark ? '#333333' : '#f5f5f5',
        buttonActive: isDark ? '#0066cc' : '#007bff',
        divider: isDark ? '#333333' : '#e1e5e9'
    };

    const ToolbarButton = ({ 
        onClick, 
        active, 
        disabled, 
        children, 
        title 
    }: { 
        onClick: () => void; 
        active?: boolean; 
        disabled?: boolean; 
        children: React.ReactNode; 
        title: string;
    }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            style={{
                padding: '8px',
                border: 'none',
                backgroundColor: active ? toolbarStyles.buttonActive : 'transparent',
                color: active ? '#ffffff' : toolbarStyles.textColor,
                cursor: disabled ? 'not-allowed' : 'pointer',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '32px',
                height: '32px',
                opacity: disabled ? 0.5 : 1,
                transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
                if (!disabled && !active) {
                    e.currentTarget.style.backgroundColor = toolbarStyles.buttonHover;
                }
            }}
            onMouseLeave={(e) => {
                if (!disabled && !active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                }
            }}
        >
            {children}
        </button>
    );

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            borderBottom: `1px solid ${toolbarStyles.borderColor}`,
            backgroundColor: toolbarStyles.backgroundColor,
            color: toolbarStyles.textColor,
            flexWrap: 'wrap',
            gap: '4px'
        }}>
            {/* History */}
            <div style={{ display: 'flex', gap: '2px', marginRight: '8px' }}>
                <ToolbarButton
                    onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
                    disabled={!canUndo}
                    title="Undo (Ctrl+Z)"
                >
                    <UndoIcon />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
                    disabled={!canRedo}
                    title="Redo (Ctrl+Y)"
                >
                    <RedoIcon />
                </ToolbarButton>
            </div>

            <div style={{ width: '1px', height: '24px', backgroundColor: toolbarStyles.divider, margin: '0 8px' }} />

            {/* Text Formatting */}
            <div style={{ display: 'flex', gap: '2px', marginRight: '8px' }}>
                <ToolbarButton
                    onClick={() => formatText("bold")}
                    active={isBold}
                    title="Bold (Ctrl+B)"
                >
                    <BoldIcon />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => formatText("italic")}
                    active={isItalic}
                    title="Italic (Ctrl+I)"
                >
                    <ItalicIcon />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => formatText("underline")}
                    active={isUnderline}
                    title="Underline (Ctrl+U)"
                >
                    <UnderlineIcon />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => formatText("strikethrough")}
                    active={isStrikethrough}
                    title="Strikethrough"
                >
                    <StrikethroughIcon />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => formatText("code")}
                    active={isCode}
                    title="Code"
                >
                    <CodeIcon />
                </ToolbarButton>
            </div>

            <div style={{ width: '1px', height: '24px', backgroundColor: toolbarStyles.divider, margin: '0 8px' }} />

            {/* Block Formatting */}
            <div style={{ display: 'flex', gap: '2px', marginRight: '8px' }}>
                <select
                    value={blockType}
                    onChange={(e) => formatBlock(e.target.value)}
                    style={{
                        padding: '6px 8px',
                        border: `1px solid ${toolbarStyles.borderColor}`,
                        borderRadius: '4px',
                        backgroundColor: toolbarStyles.backgroundColor,
                        color: toolbarStyles.textColor,
                        fontSize: '13px',
                        minWidth: '120px',
                        outline: 'none'
                    }}
                >
                    <option value="paragraph">Normal</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                    <option value="h4">Heading 4</option>
                    <option value="h5">Heading 5</option>
                    <option value="h6">Heading 6</option>
                    <option value="quote">Quote</option>
                    <option value="code">Code Block</option>
                </select>
            </div>

            <div style={{ width: '1px', height: '24px', backgroundColor: toolbarStyles.divider, margin: '0 8px' }} />

            {/* Lists */}
            <div style={{ display: 'flex', gap: '2px', marginRight: '8px' }}>
                <ToolbarButton
                    onClick={() => formatList("bullet")}
                    active={blockType === "bullet"}
                    title="Bullet List"
                >
                    <BulletListIcon />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => formatList("number")}
                    active={blockType === "number"}
                    title="Numbered List"
                >
                    <NumberedListIcon />
                </ToolbarButton>
            </div>

            <div style={{ width: '1px', height: '24px', backgroundColor: toolbarStyles.divider, margin: '0 8px' }} />

            {/* Alignment */}
            <div style={{ display: 'flex', gap: '2px', marginRight: '8px' }}>
                <ToolbarButton
                    onClick={() => formatAlign("left")}
                    title="Align Left"
                >
                    <AlignLeftIcon />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => formatAlign("center")}
                    title="Align Center"
                >
                    <AlignCenterIcon />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => formatAlign("right")}
                    title="Align Right"
                >
                    <AlignRightIcon />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => formatAlign("justify")}
                    title="Justify"
                >
                    <AlignJustifyIcon />
                </ToolbarButton>
            </div>

            <div style={{ width: '1px', height: '24px', backgroundColor: toolbarStyles.divider, margin: '0 8px' }} />

            {/* Indentation */}
            <div style={{ display: 'flex', gap: '2px', marginRight: '8px' }}>
                <ToolbarButton
                    onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)}
                    title="Decrease Indent"
                >
                    <OutdentIcon />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)}
                    title="Increase Indent"
                >
                    <IndentIcon />
                </ToolbarButton>
            </div>

            <div style={{ width: '1px', height: '24px', backgroundColor: toolbarStyles.divider, margin: '0 8px' }} />

            {/* Links */}
            <div style={{ display: 'flex', gap: '2px', marginRight: '8px' }}>
                <ToolbarButton
                    onClick={insertLink}
                    active={isLink}
                    title="Insert Link"
                >
                    <LinkIcon />
                </ToolbarButton>
            </div>

            <div style={{ width: '1px', height: '24px', backgroundColor: toolbarStyles.divider, margin: '0 8px' }} />

            {/* Speech to Text */}
            <div style={{ display: 'flex', gap: '2px', marginRight: '8px' }}>
                <SpeechToTextPlugin theme={theme} />
            </div>

            <div style={{ width: '1px', height: '24px', backgroundColor: toolbarStyles.divider, margin: '0 8px' }} />

            {/* Font Size */}
            <div style={{ display: 'flex', gap: '2px', marginRight: '8px' }}>
                <select
                    value={fontSize}
                    onChange={(e) => formatStyle("font-size", e.target.value)}
                    style={{
                        padding: '6px 8px',
                        border: `1px solid ${toolbarStyles.borderColor}`,
                        borderRadius: '4px',
                        backgroundColor: toolbarStyles.backgroundColor,
                        color: toolbarStyles.textColor,
                        fontSize: '13px',
                        minWidth: '80px',
                        outline: 'none'
                    }}
                >
                    <option value="12px">12px</option>
                    <option value="14px">14px</option>
                    <option value="15px">15px</option>
                    <option value="16px">16px</option>
                    <option value="18px">18px</option>
                    <option value="20px">20px</option>
                    <option value="24px">24px</option>
                    <option value="32px">32px</option>
                </select>
            </div>

            {/* Font Color */}
            <div style={{ display: 'flex', gap: '2px', marginRight: '8px' }}>
                <input
                    type="color"
                    value={fontColor}
                    onChange={(e) => formatStyle("color", e.target.value)}
                    style={{
                        width: '32px',
                        height: '32px',
                        border: `1px solid ${toolbarStyles.borderColor}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        outline: 'none'
                    }}
                    title="Text Color"
                />
            </div>

            {/* Background Color */}
            <div style={{ display: 'flex', gap: '2px' }}>
                <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => formatStyle("background-color", e.target.value)}
                    style={{
                        width: '32px',
                        height: '32px',
                        border: `1px solid ${toolbarStyles.borderColor}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        outline: 'none'
                    }}
                    title="Background Color"
                />
            </div>
        </div>
    );
}

// Update the SpeechToTextPlugin to accept theme and use dynamic styling
function SpeechToTextPlugin({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
    const [editor] = useLexicalComposerContext();
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            
            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = 'en-US';

            recognitionInstance.onstart = () => {
                setIsListening(true);
            };

            recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                if (finalTranscript) {
                    editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                            const textNode = $createTextNode(finalTranscript);
                            $insertNodes([textNode]);
                        }
                    });
                }
            };

            recognitionInstance.onend = () => {
                setIsListening(false);
            };

            recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            setRecognition(recognitionInstance);
        }
    }, [editor]);

    const startListening = () => {
        if (recognition && !isListening) {
            recognition.start();
        }
    };

    const stopListening = () => {
        if (recognition && isListening) {
            recognition.stop();
        }
    };

    const isDark = theme === 'dark';
    const buttonStyles = {
        padding: '8px',
        border: 'none',
        backgroundColor: isListening ? (isDark ? '#0066cc' : '#007bff') : 'transparent',
        color: isListening ? '#ffffff' : (isDark ? '#ffffff' : '#000000'),
        cursor: 'pointer',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '32px',
        height: '32px',
        transition: 'all 0.2s ease',
        border: isListening ? 'none' : `1px solid ${isDark ? '#333333' : '#e1e5e9'}`
    };

    return (
        <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            title={isListening ? "Stop Speech to Text" : "Start Speech to Text"}
            style={buttonStyles}
            onMouseEnter={(e) => {
                if (!isListening) {
                    e.currentTarget.style.backgroundColor = isDark ? '#333333' : '#f5f5f5';
                }
            }}
            onMouseLeave={(e) => {
                if (!isListening) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                }
            }}
        >
            <MicrophoneIcon />
        </button>
    );
}

// Plugin to handle initial HTML content loading
function InitialContentPlugin({ value }: { value?: string }) {
    const [editor] = useLexicalComposerContext();
    const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(() => {
        if (value && value.trim() && !hasInitialized) {
            editor.update(() => {
                const root = $getRoot();
                root.clear();
                
                try {
                    const parser = new DOMParser();
                    const dom = parser.parseFromString(value, 'text/html');
                    const nodes = $generateNodesFromDOM(editor, dom);
                    root.append(...nodes);
                } catch (error) {
                    console.warn("Failed to parse HTML, using as plain text:", error);
                    root.append($createParagraphNode().append($createTextNode(value)));
                }
            });
            setHasInitialized(true);
        }
    }, [editor, value, hasInitialized]);

    return null;
}

// Plugin to handle HTML output
function HtmlOutputPlugin({ onChange }: { onChange?: (html: string) => void }) {
    const [editor] = useLexicalComposerContext();

    const handleChange = useCallback(
        (editorState: any) => {
            editorState.read(() => {
                const htmlString = $generateHtmlFromNodes(editor, null);
                onChange?.(htmlString);
            });
        },
        [editor, onChange]
    );

    return <OnChangePlugin onChange={handleChange} />;
}

function Placeholder({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
    return (
        <div style={{
            color: theme === 'dark' ? '#666666' : '#999999',
            position: 'absolute',
            top: '15px',
            left: '10px',
            userSelect: 'none',
            pointerEvents: 'none'
        }}>
            Enter some text...
        </div>
    );
}

const editorConfig = {
    namespace: "MarkdownEditor2",
    theme: {
        paragraph: "editor-paragraph",
        heading: {
            h1: "editor-heading-h1",
            h2: "editor-heading-h2",
            h3: "editor-heading-h3",
            h4: "editor-heading-h4",
            h5: "editor-heading-h5",
            h6: "editor-heading-h6"
        },
        quote: "editor-quote",
        list: {
            ol: "editor-list-ol",
            ul: "editor-list-ul",
            listitem: "editor-listitem"
        },
        text: {
            bold: "editor-text-bold",
            italic: "editor-text-italic",
            underline: "editor-text-underline",
            strikethrough: "editor-text-strikethrough",
            code: "editor-text-code"
        },
        code: "editor-code",
        link: "editor-link"
    },
    onError(error: any) {
        console.error("Lexical Error:", error);
    },
    nodes: [
        HeadingNode,
        ListNode,
        ListItemNode,
        QuoteNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableCellNode,
        TableRowNode,
        AutoLinkNode,
        LinkNode,
    ],
};

const MarkdownEditor2 = (props: Props) => {
    const { value, onChange, label } = props;
    const colors = useColorScheme();
    const reactSettings = useReactSettings();
    
    // Use the same color scheme detection as the original MarkdownEditor
    const isDark = colors.$0 === 'dark';

    // Dynamic theme styles based on color scheme
    const themeStyles = {
        container: {
            border: `1px solid ${isDark ? '#333333' : '#e1e5e9'}`,
            borderRadius: '8px',
            height: '300px', // Fixed height instead of minHeight
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column' as const
        },
        toolbar: {
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            borderColor: isDark ? '#333333' : '#e1e5e9',
            textColor: isDark ? '#ffffff' : '#000000',
            buttonHover: isDark ? '#333333' : '#f5f5f5',
            buttonActive: isDark ? '#0066cc' : '#007bff',
            divider: isDark ? '#333333' : '#e1e5e9'
        },
        editor: {
            color: isDark ? '#ffffff' : '#000000',
            backgroundColor: 'transparent',
            height: '100%', // Take remaining height after toolbar
            padding: '12px',
            outline: 'none',
            fontSize: '14px',
            lineHeight: '1.5',
            direction: 'ltr' as const,
            textAlign: 'left' as const,
            overflow: 'auto', // Enable scrolling
            flex: 1 // Take remaining space
        },
        placeholder: {
            color: isDark ? '#666666' : '#999999'
        }
    };

    return (
        <div className="space-y-4" style={{ zIndex: 0 }}>
            {label && <InputLabel>{label}</InputLabel>}
            
            <div style={themeStyles.container}>
                <LexicalComposer initialConfig={editorConfig}>
                    <ToolbarPlugin theme={isDark ? 'dark' : 'light'} />
                    <div style={{ 
                        position: 'relative', 
                        flex: 1, 
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <RichTextPlugin
                            contentEditable={
                                <ContentEditable
                                    className="editor-input"
                                    style={themeStyles.editor}
                                />
                            }
                            placeholder={
                                <div style={{
                                    ...themeStyles.placeholder,
                                    position: 'absolute',
                                    top: '15px',
                                    left: '10px',
                                    userSelect: 'none',
                                    pointerEvents: 'none'
                                }}>
                                    Enter some text...
                                </div>
                            }
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        <HistoryPlugin />
                        <AutoFocusPlugin />
                        <ListPlugin />
                        <LinkPlugin />
                        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                        <HtmlOutputPlugin onChange={onChange} />
                        <InitialContentPlugin value={value} />
                    </div>
                </LexicalComposer>
            </div>
        </div>
    );
};

export default MarkdownEditor2;