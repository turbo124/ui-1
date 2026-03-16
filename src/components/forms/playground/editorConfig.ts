import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ImageNode } from "./nodes/ImageNode";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";

export const editorConfig = {
    namespace: "LexicalEditor",
    theme: {
        text: {
            bold: "PlaygroundEditorTheme__textBold",
            italic: "PlaygroundEditorTheme__textItalic",
            underline: "PlaygroundEditorTheme__textUnderline",
            strikethrough: "PlaygroundEditorTheme__textStrikethrough",
            underlineStrikethrough: "PlaygroundEditorTheme__textUnderlineStrikethrough",
            code: "PlaygroundEditorTheme__textCode",
        },
        paragraph: "PlaygroundEditorTheme__paragraph",
        quote: "PlaygroundEditorTheme__quote",
        heading: {
            h1: "PlaygroundEditorTheme__h1",
            h2: "PlaygroundEditorTheme__h2",
            h3: "PlaygroundEditorTheme__h3",
            h4: "PlaygroundEditorTheme__h4",
            h5: "PlaygroundEditorTheme__h5",
            h6: "PlaygroundEditorTheme__h6",
        },
        list: {
            nested: {
                listitem: "PlaygroundEditorTheme__nestedListItem",
            },
            ol: "PlaygroundEditorTheme__ol",
            ul: "PlaygroundEditorTheme__ul",
            listitem: "PlaygroundEditorTheme__listItem",
        },
        code: "PlaygroundEditorTheme__code",
        codeHighlight: {
            atrule: "PlaygroundEditorTheme__tokenAttr",
            attr: "PlaygroundEditorTheme__tokenAttr",
            boolean: "PlaygroundEditorTheme__tokenProperty",
            builtin: "PlaygroundEditorTheme__tokenSelector",
            cdata: "PlaygroundEditorTheme__tokenComment",
            char: "PlaygroundEditorTheme__tokenSelector",
            class: "PlaygroundEditorTheme__tokenFunction",
            "class-name": "PlaygroundEditorTheme__tokenFunction",
            comment: "PlaygroundEditorTheme__tokenComment",
            constant: "PlaygroundEditorTheme__tokenProperty",
            deleted: "PlaygroundEditorTheme__tokenProperty",
            doctype: "PlaygroundEditorTheme__tokenComment",
            entity: "PlaygroundEditorTheme__tokenOperator",
            function: "PlaygroundEditorTheme__tokenFunction",
            important: "PlaygroundEditorTheme__tokenVariable",
            inserted: "PlaygroundEditorTheme__tokenSelector",
            keyword: "PlaygroundEditorTheme__tokenAttr",
            namespace: "PlaygroundEditorTheme__tokenVariable",
            number: "PlaygroundEditorTheme__tokenProperty",
            operator: "PlaygroundEditorTheme__tokenOperator",
            prolog: "PlaygroundEditorTheme__tokenComment",
            property: "PlaygroundEditorTheme__tokenProperty",
            punctuation: "PlaygroundEditorTheme__tokenPunctuation",
            regex: "PlaygroundEditorTheme__tokenVariable",
            selector: "PlaygroundEditorTheme__tokenSelector",
            string: "PlaygroundEditorTheme__tokenSelector",
            symbol: "PlaygroundEditorTheme__tokenProperty",
            tag: "PlaygroundEditorTheme__tokenProperty",
            url: "PlaygroundEditorTheme__tokenOperator",
            variable: "PlaygroundEditorTheme__tokenVariable",
        },
        link: "PlaygroundEditorTheme__link",
        image: "PlaygroundEditorTheme__image",
        hr: "PlaygroundEditorTheme__hr",
        table: "PlaygroundEditorTheme__table",
        tableCell: "PlaygroundEditorTheme__tableCell",
        tableCellHeader: "PlaygroundEditorTheme__tableCellHeader",
        tableRow: "PlaygroundEditorTheme__tableRow",
    },
    onError(error: Error) {
        throw error;
    },
    nodes: [
        HeadingNode,
        ListNode,
        ListItemNode,
        QuoteNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableCellNode,
        TableRowNode,
        AutoLinkNode,
        LinkNode,
        ImageNode,
        HorizontalRuleNode,
    ],
    editable: true,
};

export function prepopulatedRichText() {
    const root = $getRoot();
    if (root.getFirstChild() === null) {
        const paragraph = $createParagraphNode();
        paragraph.append(
            $createTextNode("Welcome to the playground")
        );
        root.append(paragraph);
    }
}
