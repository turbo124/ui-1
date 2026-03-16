import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";

export default function MarkdownPlugin(): JSX.Element {
    return <MarkdownShortcutPlugin transformers={TRANSFORMERS} />;
}
