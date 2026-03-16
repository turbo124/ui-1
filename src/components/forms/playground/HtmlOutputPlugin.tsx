import { useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";

interface HtmlOutputPluginProps {
    onChange?: (value: string) => void;
}

export default function HtmlOutputPlugin({ onChange }: HtmlOutputPluginProps): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const [html, setHtml] = useState<string>("");

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const root = $getRoot();
                const htmlString = root.getTextContent();
                setHtml(htmlString);
                if (onChange) {
                    onChange(htmlString);
                }
            });
        });
    }, [editor, onChange]);

    return (
        <div className="html-output">
            <h3>HTML Output</h3>
            <pre className="html-content">{html}</pre>
        </div>
    );
}