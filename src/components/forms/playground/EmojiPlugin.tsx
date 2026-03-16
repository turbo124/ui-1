import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    $createTextNode,
    $getSelection,
    COMMAND_PRIORITY_LOW,
    createCommand,
    LexicalCommand,
} from "lexical";

export const INSERT_EMOJI_COMMAND: LexicalCommand<{
    emoji: string;
}> = createCommand();

export default function EmojiPlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerCommand(
            INSERT_EMOJI_COMMAND,
            (payload) => {
                editor.update(() => {
                    const selection = $getSelection();
                    if (selection) {
                        selection.insertText(payload.emoji);
                    }
                });
                return true;
            },
            COMMAND_PRIORITY_LOW
        );
    }, [editor]);

    return null;
}
