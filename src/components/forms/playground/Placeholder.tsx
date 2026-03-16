import React from 'react';

interface PlaceholderProps {
    children?: React.ReactNode;
    theme?: 'light' | 'dark';
}

export function Placeholder({ children, theme = 'light' }: PlaceholderProps) {
    return (
        <div className={`editor-placeholder ${theme === 'dark' ? 'dark' : 'light'}`}>
            {children || "Enter some text..."}
        </div>
    );
}