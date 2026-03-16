import { useEffect, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import CodeHighlightPlugin from "./CodeHighlightPlugin";
import ImagePlugin from "./ImagePlugin";
import EmojiPlugin from "./EmojiPlugin";
import MarkdownPlugin from "./MarkdownPlugin";
import HorizontalRulePlugin from "./HorizontalRulePlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import LexicalErrorBoundary from "./LexicalErrorBoundary";
import { ToolbarPlugin } from "./ToolbarPlugin";
import { Placeholder } from "./Placeholder";
import { editorConfig } from "./editorConfig";

interface EditorProps {
    placeholder?: string;
    onChange?: (editorState: string) => void;
    value?: string;
}

export default function Editor({
    placeholder = "Enter some rich text...",
    onChange,
    value
}: EditorProps) {
    console.log("Editor component initialized");
    return (
        <LexicalComposer initialConfig={editorConfig}>
            <div className="editor-container">
                <ToolbarPlugin />
                <div className="editor-inner">
                    <RichTextPlugin
                        contentEditable={<ContentEditable className="editor-input" />}
                        placeholder={<Placeholder>{placeholder}</Placeholder>}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <HistoryPlugin />
                    <OnChangePlugin onChange={(editorState) => {
                        if (onChange) {
                            onChange(JSON.stringify(editorState.toJSON()));
                        }
                    }} />
                    <ListPlugin />
                    <LinkPlugin />
                    <TablePlugin />
                    <ImagePlugin />
                    <EmojiPlugin />
                    <MarkdownPlugin />
                    <HorizontalRulePlugin />
                    <CodeHighlightPlugin />
                    <AutoFocusPlugin />
                </div>
            </div>
        </LexicalComposer>
    );
}
