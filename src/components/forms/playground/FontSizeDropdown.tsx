import React from 'react';

interface FontSizeDropdownProps {
    value: string;
    onChange: (value: string) => void;
    theme?: 'light' | 'dark';
}

export function FontSizeDropdown({ value, onChange, theme = 'light' }: FontSizeDropdownProps) {
    const isDark = theme === 'dark';

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`toolbar-select ${isDark ? 'dark' : 'light'}`}
        >
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="15px">15px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
            <option value="32px">32px</option>
            <option value="48px">48px</option>
            <option value="64px">64px</option>
        </select>
    );
}