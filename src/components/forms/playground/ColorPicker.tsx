import React from 'react';

interface ColorPickerProps {
    value: string;
    onChange: (value: string) => void;
    title: string;
    theme?: 'light' | 'dark';
}

export function ColorPicker({ value, onChange, title, theme = 'light' }: ColorPickerProps) {
    const isDark = theme === 'dark';

    return (
        <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`toolbar-color-picker ${isDark ? 'dark' : 'light'}`}
            title={title}
        />
    );
}