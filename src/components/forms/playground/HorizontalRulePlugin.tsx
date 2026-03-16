import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    $createHorizontalRuleNode,
    $isHorizontalRuleNode,
    HorizontalRuleNode,
    INSERT_HORIZONTAL_RULE_COMMAND,
} from "@lexical/react/LexicalHorizontalRuleNode";
import { COMMAND_PRIORITY_EDITOR, $insertNodes } from "lexical";

export default function HorizontalRulePlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([HorizontalRuleNode])) {
            throw new Error(
                "HorizontalRulePlugin: HorizontalRuleNode not registered on editor"
            );
        }

        return editor.registerCommand(
            INSERT_HORIZONTAL_RULE_COMMAND,
            () => {
                const horizontalRuleNode = $createHorizontalRuleNode();
                $insertNodes([horizontalRuleNode]);
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );
    }, [editor]);

    return null;
}

