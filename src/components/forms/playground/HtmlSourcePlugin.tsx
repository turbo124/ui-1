import React, { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot } from 'lexical';

interface HtmlSourcePluginProps {
    isSourceMode: boolean;
    onToggle: () => void;
}

export function HtmlSourcePlugin({ isSourceMode, onToggle }: HtmlSourcePluginProps) {
    const [editor] = useLexicalComposerContext();
    const [htmlSource, setHtmlSource] = useState('');

    useEffect(() => {
        if (isSourceMode) {
            editor.getEditorState().read(() => {
                const htmlString = $generateHtmlFromNodes(editor, null);
                setHtmlSource(htmlString);
            });
        }
    }, [editor, isSourceMode]);

    const handleSourceChange = (newSource: string) => {
        setHtmlSource(newSource);
        editor.update(() => {
            const root = $getRoot();
            root.clear();
            try {
                const parser = new DOMParser();
                const dom = parser.parseFromString(newSource, 'text/html');
                const nodes = $generateNodesFromDOM(editor, dom);
                root.append(...nodes);
            } catch (error) {
                console.warn("Failed to parse HTML:", error);
            }
        });
    };

    if (!isSourceMode) return null;

    return (
        <div className="html-source-editor">
            <textarea
                value={htmlSource}
                onChange={(e) => handleSourceChange(e.target.value)}
                className="html-textarea"
                placeholder="Enter HTML source code..."
            />
        </div>
    );
} 