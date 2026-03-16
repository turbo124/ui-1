import React, { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $convertToMarkdownString, $convertFromMarkdownString, TRANSFORMERS } from '@lexical/markdown';

interface MarkdownEditorPluginProps {
    isMarkdownMode: boolean;
    onToggle: () => void;
}

export function MarkdownEditorPlugin({ isMarkdownMode, onToggle }: MarkdownEditorPluginProps) {
    const [editor] = useLexicalComposerContext();
    const [markdownSource, setMarkdownSource] = useState('');

    useEffect(() => {
        if (isMarkdownMode) {
            editor.update(() => {
                const markdownString = $convertToMarkdownString(TRANSFORMERS);
                setMarkdownSource(markdownString);
            });
        }
    }, [editor, isMarkdownMode]);

    const handleMarkdownChange = (newMarkdown: string) => {
        setMarkdownSource(newMarkdown);
        editor.update(() => {
            $convertFromMarkdownString(newMarkdown, TRANSFORMERS);
        });
    };

    if (!isMarkdownMode) return null;

    return (
        <div className="markdown-editor">
            <textarea
                value={markdownSource}
                onChange={(e) => handleMarkdownChange(e.target.value)}
                className="markdown-textarea"
                placeholder="Enter Markdown..."
            />
        </div>
    );
} 