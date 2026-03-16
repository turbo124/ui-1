import React, { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';

interface InitialContentPluginProps {
    value?: string;
}

export function InitialContentPlugin({ value }: InitialContentPluginProps) {
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