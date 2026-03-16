import { useCallback, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { 
    $createParagraphNode, 
    $getNodeByKey,
    $getSelection, 
    $isRangeSelection,
    $isRootOrShadowRoot,
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
    FORMAT_ELEMENT_COMMAND,
    FORMAT_TEXT_COMMAND,
    LexicalEditor,
    NodeKey,
    REDO_COMMAND,
    SELECTION_CHANGE_COMMAND,
    UNDO_COMMAND,
} from "lexical";
import {
    $createHeadingNode,
    $createQuoteNode,
    $isHeadingNode,
    HeadingTagType,
} from "@lexical/rich-text";
import {
    $getSelectionStyleValueForProperty,
    $patchStyleText,
    $setBlocksType,
} from "@lexical/selection";
import {
    $isListNode,
    INSERT_CHECK_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND, 
    INSERT_UNORDERED_LIST_COMMAND, 
    ListNode,
    REMOVE_LIST_COMMAND,
} from "@lexical/list";
import {
    $createCodeNode,
    $isCodeNode,
    CODE_LANGUAGE_FRIENDLY_NAME_MAP,
    CODE_LANGUAGE_MAP,
    getLanguageFriendlyName,
} from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { INSERT_IMAGE_COMMAND } from "./ImagePlugin";
import { INSERT_EMOJI_COMMAND } from "./EmojiPlugin";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { SpeechToTextPlugin } from "./SpeechToTextPlugin";
import { MarkdownModePlugin } from "./MarkdownModePlugin";
import {
    $findMatchingParent,
    $getNearestNodeOfType,
    mergeRegister,
} from "@lexical/utils";
import DropDown, { DropDownItem } from "../DropDown";
import { getSelectedNode } from "../getSelectedNode";
import { sanitizeUrl } from "../url";

const blockTypeToBlockName = {
    bullet: "Bulleted List",
    check: "Check List",
    code: "Code Block",
    h1: "Heading 1",
    h2: "Heading 2",
    h3: "Heading 3",
    h4: "Heading 4",
    h5: "Heading 5",
    h6: "Heading 6",
    number: "Numbered List",
    paragraph: "Normal",
    quote: "Quote",
};

function getCodeLanguageOptions(): [string, string][] {
    const options: [string, string][] = [];

    for (const [lang, friendlyName] of Object.entries(
        CODE_LANGUAGE_FRIENDLY_NAME_MAP
    )) {
        options.push([lang, friendlyName]);
    }

    return options;
}

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

const FONT_FAMILY_OPTIONS: [string, string][] = [
    ["Arial", "Arial"],
    ["Courier New", "Courier New"],
    ["Georgia", "Georgia"],
    ["Times New Roman", "Times New Roman"],
    ["Trebuchet MS", "Trebuchet MS"],
    ["Verdana", "Verdana"],
];

const FONT_SIZE_OPTIONS: [string, string][] = [
    ["10px", "10px"],
    ["11px", "11px"],
    ["12px", "12px"],
    ["13px", "13px"],
    ["14px", "14px"],
    ["15px", "15px"],
    ["16px", "16px"],
    ["17px", "17px"],
    ["18px", "18px"],
    ["19px", "19px"],
    ["20px", "20px"],
];

function dropDownActiveClass(active: boolean) {
    if (active) return "active dropdown-item-active";
    else return "";
}

function BlockFormatDropDown({
    editor,
    blockType,
    disabled = false,
}: {
    blockType: keyof typeof blockTypeToBlockName;
    editor: LexicalEditor;
    disabled?: boolean;
}): JSX.Element {
    const formatParagraph = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createParagraphNode());
            }
        });
    };

    const formatHeading = (headingSize: HeadingTagType) => {
        if (blockType !== headingSize) {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createHeadingNode(headingSize));
                }
            });
        }
    };

    const formatBulletList = () => {
        if (blockType !== "bullet") {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        } else {
            editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        }
    };

    const formatCheckList = () => {
        if (blockType !== "check") {
            editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
        } else {
            editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        }
    };

    const formatNumberedList = () => {
        if (blockType !== "number") {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        } else {
            editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        }
    };

    const formatQuote = () => {
        if (blockType !== "quote") {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createQuoteNode());
                }
            });
        }
    };

    const formatCode = () => {
        if (blockType !== "code") {
            editor.update(() => {
                let selection = $getSelection();

                if ($isRangeSelection(selection)) {
                    if (selection.isCollapsed()) {
                        $setBlocksType(selection, () => $createCodeNode());
                    } else {
                        const textContent = selection.getTextContent();
                        const codeNode = $createCodeNode();
                        selection.insertNodes([codeNode]);
                        selection = $getSelection();
                        if ($isRangeSelection(selection))
                            selection.insertRawText(textContent);
                    }
                }
            });
        }
    };

    return (
        <DropDown
            disabled={disabled}
            buttonClassName="toolbar-item block-controls"
            buttonIconClassName={"icon block-type " + blockType}
            buttonLabel={blockTypeToBlockName[blockType]}
            buttonAriaLabel="Formatting options for text style"
        >
            <DropDownItem
                className={"item " + dropDownActiveClass(blockType === "paragraph")}
                onClick={formatParagraph}
            >
                <i className="icon paragraph" />
                <span className="text">Normal</span>
            </DropDownItem>
            <DropDownItem
                className={"item " + dropDownActiveClass(blockType === "h1")}
                onClick={() => formatHeading("h1")}
            >
                <i className="icon h1" />
                <span className="text">Heading 1</span>
            </DropDownItem>
            <DropDownItem
                className={"item " + dropDownActiveClass(blockType === "h2")}
                onClick={() => formatHeading("h2")}
            >
                <i className="icon h2" />
                <span className="text">Heading 2</span>
            </DropDownItem>
            <DropDownItem
                className={"item " + dropDownActiveClass(blockType === "h3")}
                onClick={() => formatHeading("h3")}
            >
                <i className="icon h3" />
                <span className="text">Heading 3</span>
            </DropDownItem>
            <DropDownItem
                className={"item " + dropDownActiveClass(blockType === "bullet")}
                onClick={formatBulletList}
            >
                <i className="icon bullet-list" />
                <span className="text">Bullet List</span>
            </DropDownItem>
            <DropDownItem
                className={"item " + dropDownActiveClass(blockType === "number")}
                onClick={formatNumberedList}
            >
                <i className="icon numbered-list" />
                <span className="text">Numbered List</span>
            </DropDownItem>
            <DropDownItem
                className={"item " + dropDownActiveClass(blockType === "check")}
                onClick={formatCheckList}
            >
                <i className="icon check-list" />
                <span className="text">Check List</span>
            </DropDownItem>
            <DropDownItem
                className={"item " + dropDownActiveClass(blockType === "quote")}
                onClick={formatQuote}
            >
                <i className="icon quote" />
                <span className="text">Quote</span>
            </DropDownItem>
            <DropDownItem
                className={"item " + dropDownActiveClass(blockType === "code")}
                onClick={formatCode}
            >
                <i className="icon code" />
                <span className="text">Code Block</span>
            </DropDownItem>
        </DropDown>
    );
}

function Divider(): JSX.Element {
    return <div className="divider" />;
}

function FontDropDown({
    editor,
    value,
    style,
    disabled = false,
}: {
    editor: LexicalEditor;
    value: string;
    style: string;
    disabled?: boolean;
}): JSX.Element {
    const handleClick = useCallback(
        (option: string) => {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $patchStyleText(selection, {
                        [style]: option,
                    });
                }
            });
        },
        [editor, style]
    );

    return (
        <DropDown
            disabled={disabled}
            buttonClassName="toolbar-item font-family"
            buttonLabel={value}
            buttonAriaLabel="Formatting options for font family"
        >
            {FONT_FAMILY_OPTIONS.map(([option, text]) => (
                <DropDownItem
                    className={`item ${dropDownActiveClass(value === option)} ${
                        style === "font-family" ? "font-family-item" : ""
                    }`}
                    onClick={() => handleClick(option)}
                    key={option}
                >
                    <span className="text">{text}</span>
                </DropDownItem>
            ))}
        </DropDown>
    );
}

function FontSizeDropDown({
    editor,
    value,
    disabled = false,
}: {
    editor: LexicalEditor;
    value: string;
    disabled?: boolean;
}): JSX.Element {
    const handleClick = useCallback(
        (option: string) => {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $patchStyleText(selection, {
                        "font-size": option,
                    });
                }
            });
        },
        [editor]
    );

    return (
        <DropDown
            disabled={disabled}
            buttonClassName="toolbar-item font-size"
            buttonLabel={value}
            buttonAriaLabel="Formatting options for font size"
        >
            {FONT_SIZE_OPTIONS.map(([option, text]) => (
                <DropDownItem
                    className={`item ${dropDownActiveClass(value === option)}`}
                    onClick={() => handleClick(option)}
                    key={option}
                >
                    <span className="text">{text}</span>
                </DropDownItem>
            ))}
        </DropDown>
    );
}

function ColorPicker({
    color,
    onChange,
    popupType = "color",
}: {
    color: string;
    onChange: (color: string) => void;
    popupType?: "color" | "background";
}): JSX.Element {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="color-picker-wrapper">
            <button
                className="color-picker-button"
                style={{ backgroundColor: color }}
                onClick={() => setIsOpen(!isOpen)}
            />
            {isOpen && (
                <div className="color-picker-popup">
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
            )}
        </div>
    );
}

interface ToolbarPluginProps {
    theme?: 'light' | 'dark';
}

export function ToolbarPlugin({ theme = 'light' }: ToolbarPluginProps) {
    const [editor] = useLexicalComposerContext();
    const activeEditor = editor; // Use the current editor directly
    console.log("ToolbarPlugin initialized", { editor, activeEditor });
    const [blockType, setBlockType] = useState<keyof typeof blockTypeToBlockName>("paragraph");
    const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(null);
    const [fontSize, setFontSize] = useState<string>("15px");
    const [fontColor, setFontColor] = useState<string>("#000");
    const [bgColor, setBgColor] = useState<string>("#fff");
    const [fontFamily, setFontFamily] = useState<string>("Arial");
    const [isLink, setIsLink] = useState(false);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isCode, setIsCode] = useState(false);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [isRTL, setIsRTL] = useState(false);
    const [codeLanguage, setCodeLanguage] = useState<string>("");

    const updateToolbar = useCallback(() => {
        const editor = activeEditor;
        editor.read(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                // Update text format
                setIsBold(selection.hasFormat("bold"));
                setIsItalic(selection.hasFormat("italic"));
                setIsUnderline(selection.hasFormat("underline"));
                setIsStrikethrough(selection.hasFormat("strikethrough"));
                setIsCode(selection.hasFormat("code"));
                // Note: RTL format is not available in basic Lexical

                // Update links
                const node = getSelectedNode(selection);
                const parent = node.getParent();
                if ($isLinkNode(parent) || $isLinkNode(node)) {
                    setIsLink(true);
                } else {
                    setIsLink(false);
                }

                const element = $isRootOrShadowRoot(node)
                    ? node
                    : node.getTopLevelElementOrThrow();

                const elementKey = element.getKey();
                const elementDOM = editor.getElementByKey(elementKey);

                if (elementDOM !== null) {
                    setSelectedElementKey(elementKey);
                    if ($isListNode(element)) {
                        const parentList = parent ? $getNearestNodeOfType<ListNode>(
                            parent,
                            ListNode
                        ) : null;
                        const type = parentList
                            ? parentList.getListType()
                            : element.getListType();
                        setBlockType(type);
                    } else {
                        const type = $isHeadingNode(element)
                            ? element.getTag()
                            : element.getType();
                        if (type in blockTypeToBlockName) {
                            setBlockType(type as keyof typeof blockTypeToBlockName);
                        }
                        if ($isCodeNode(element)) {
                            const language = element.getLanguage() || "";
                            setCodeLanguage(language);
                            return;
                        }
                    }
                }
                // Handle buttons
                setFontSize(
                    $getSelectionStyleValueForProperty(selection, "font-size", "15px")
                );
                setFontColor(
                    $getSelectionStyleValueForProperty(selection, "color", "#000")
                );
                setBgColor(
                    $getSelectionStyleValueForProperty(selection, "background-color", "#fff")
                );
                setFontFamily(
                    $getSelectionStyleValueForProperty(selection, "font-family", "Arial")
                );
            }
        });
    }, [activeEditor]);

    useEffect(() => {
        return mergeRegister(
            activeEditor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    updateToolbar();
                });
            }),
            activeEditor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (_payload, newEditor) => {
                    updateToolbar();
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL
            ),
            activeEditor.registerCommand(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL
            ),
            activeEditor.registerCommand(
                CAN_REDO_COMMAND,
                (payload) => {
                    setCanRedo(payload);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL
            )
        );
    }, [activeEditor, updateToolbar]);

    const insertLink = useCallback(() => {
        activeEditor.focus();
        if (!isLink) {
            activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
        } else {
            activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        }
    }, [activeEditor, isLink]);

    return (
        <div className="toolbar">
            <button
                disabled={!canUndo}
                onClick={() => {
                    activeEditor.focus();
                    activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
                }}
                className="toolbar-item spaced"
                aria-label="Undo"
            >
                <i className="format undo" />
            </button>
            <button
                disabled={!canRedo}
                onClick={() => {
                    activeEditor.focus();
                    activeEditor.dispatchCommand(REDO_COMMAND, undefined);
                }}
                className="toolbar-item spaced"
                aria-label="Redo"
            >
                <i className="format redo" />
            </button>
            <Divider />
            <button
                onClick={() => {
                    console.log("Bold button clicked");
                    try {
                        activeEditor.focus();
                        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
                        console.log("Bold command dispatched");
                    } catch (error) {
                        console.error("Error dispatching bold command:", error);
                    }
                }}
                className={"toolbar-item spaced " + (isBold ? "active" : "")}
                aria-label="Format Bold"
            >
                <i className="format bold" />
            </button>
            <button
                onClick={() => {
                    activeEditor.focus();
                    activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
                }}
                className={"toolbar-item spaced " + (isItalic ? "active" : "")}
                aria-label="Format Italics"
            >
                <i className="format italic" />
            </button>
            <button
                onClick={() => {
                    activeEditor.focus();
                    activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
                }}
                className={"toolbar-item spaced " + (isUnderline ? "active" : "")}
                aria-label="Format Underline"
            >
                <i className="format underline" />
            </button>
            <button
                onClick={() => {
                    activeEditor.focus();
                    activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
                }}
                className={"toolbar-item spaced " + (isStrikethrough ? "active" : "")}
                aria-label="Format Strikethrough"
            >
                <i className="format strikethrough" />
            </button>
            <button
                onClick={() => {
                    activeEditor.focus();
                    activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
                }}
                className={"toolbar-item spaced " + (isCode ? "active" : "")}
                aria-label="Insert Code"
            >
                <i className="format code" />
            </button>
            <button
                onClick={insertLink}
                className={"toolbar-item spaced " + (isLink ? "active" : "")}
                aria-label="Insert Link"
            >
                <i className="format link" />
            </button>
            <button
                onClick={() => {
                    const url = prompt("Enter image URL:");
                    if (url) {
                        activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                            src: url,
                            altText: "Image",
                        });
                    }
                }}
                className="toolbar-item spaced"
                aria-label="Insert Image"
            >
                <i className="format image" />
            </button>
            <button
                onClick={() => {
                    const emoji = prompt("Enter emoji:");
                    if (emoji) {
                        activeEditor.dispatchCommand(INSERT_EMOJI_COMMAND, {
                            emoji: emoji,
                        });
                    }
                }}
                className="toolbar-item spaced"
                aria-label="Insert Emoji"
            >
                <i className="format emoji" />
            </button>
            <button
                onClick={() => {
                    activeEditor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
                }}
                className="toolbar-item spaced"
                aria-label="Insert Horizontal Rule"
            >
                <i className="format hr" />
            </button>
            <Divider />
            <BlockFormatDropDown
                disabled={false}
                blockType={blockType}
                editor={activeEditor}
            />
            <Divider />
            <FontDropDown
                disabled={false}
                style={"font-family"}
                value={fontFamily}
                editor={activeEditor}
            />
            <FontSizeDropDown
                disabled={false}
                value={fontSize}
                editor={activeEditor}
            />
            <Divider />
            <button
                onClick={() => {
                    activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
                }}
                className="toolbar-item spaced"
                aria-label="Left Align"
            >
                <i className="format left-align" />
            </button>
            <button
                onClick={() => {
                    activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
                }}
                className="toolbar-item spaced"
                aria-label="Center Align"
            >
                <i className="format center-align" />
            </button>
            <button
                onClick={() => {
                    activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
                }}
                className="toolbar-item spaced"
                aria-label="Right Align"
            >
                <i className="format right-align" />
            </button>
            <button
                onClick={() => {
                    activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
                }}
                className="toolbar-item spaced"
                aria-label="Justify Align"
            >
                <i className="format justify-align" />
            </button>
            <Divider />
            <SpeechToTextPlugin theme={theme === 'light' ? 'light' : 'dark'} />
            <MarkdownModePlugin theme={theme === 'light' ? 'light' : 'dark'} />
            <Divider />
            <ColorPicker
                color={fontColor}
                onChange={(color) => {
                    activeEditor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                            $patchStyleText(selection, {
                                color: color,
                            });
                        }
                    });
                }}
                popupType="color"
            />
            <ColorPicker
                color={bgColor}
                onChange={(color) => {
                    activeEditor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                            $patchStyleText(selection, {
                                "background-color": color,
                            });
                        }
                    });
                }}
                popupType="background"
            />
        </div>
    );
}