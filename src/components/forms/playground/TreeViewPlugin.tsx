import { useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TreeView } from "@lexical/react/LexicalTreeView";

export default function TreeViewPlugin(): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const [showTreeView, setShowTreeView] = useState(false);

    return (
        <div className="tree-view-plugin">
            <button
                onClick={() => setShowTreeView(!showTreeView)}
                className="tree-view-toggle"
            >
                {showTreeView ? "Hide" : "Show"} Tree View
            </button>
            {showTreeView && <TreeView editor={editor} />}
        </div>
    );
}
