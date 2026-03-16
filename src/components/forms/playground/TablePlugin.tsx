import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    $createTableNodeWithDimensions,
    INSERT_TABLE_COMMAND,
    TableCellNode,
    TableNode,
    TableRowNode,
} from "@lexical/table";
import { $insertNodes, $isRootOrShadowRoot, COMMAND_PRIORITY_EDITOR } from "lexical";

export default function TablePlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([TableNode, TableRowNode, TableCellNode])) {
            throw new Error(
                "TablePlugin: TableNode, TableRowNode, or TableCellNode not registered on editor",
            );
        }

        return editor.registerCommand(
            INSERT_TABLE_COMMAND,
            ({ columns, rows, includeHeaders }) => {
                const tableNode = $createTableNodeWithDimensions(
                    Number(rows),
                    Number(columns),
                    includeHeaders,
                );
                $insertNodes([tableNode]);
                return true;
            },
            COMMAND_PRIORITY_EDITOR,
        );
    }, [editor]);

    return null;
}

