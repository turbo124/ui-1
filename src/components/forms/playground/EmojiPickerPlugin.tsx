import React, { useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, $createTextNode, $insertNodes } from 'lexical';
import { ToolbarButton } from './ToolbarButton';

export function EmojiPickerPlugin() {
    const [editor] = useLexicalComposerContext();
    const [isOpen, setIsOpen] = useState(false);

    const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😰', '😥', '😓'];

    const insertEmoji = (emoji: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const textNode = $createTextNode(emoji);
                $insertNodes([textNode]);
            }
        });
        setIsOpen(false);
    };

    return (
        <div className="emoji-picker-container">
            <ToolbarButton
                onClick={() => setIsOpen(!isOpen)}
                title="Insert Emoji"
            >
                <EmojiIcon />
            </ToolbarButton>
            {isOpen && (
                <div className="emoji-picker">
                    <div className="emoji-grid">
                        {emojis.map((emoji, index) => (
                            <button
                                key={index}
                                onClick={() => insertEmoji(emoji)}
                                className="emoji-button"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const EmojiIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2c.83 0 1.5-.67 1.5-1.5S7.33 15 6.5 15 5 15.67 5 16.5s.67 1.5 1.5 1.5zm11 0c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM9 11H7.5v-.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V11H9zm5 0h-1.5v-.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V11H14z"/>
    </svg>
);