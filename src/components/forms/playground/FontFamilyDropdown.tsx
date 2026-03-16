import React from 'react';

interface FontFamilyDropdownProps {
    value: string;
    onChange: (value: string) => void;
    theme?: 'light' | 'dark';
}

export function FontFamilyDropdown({ value, onChange, theme = 'light' }: FontFamilyDropdownProps) {
    const isDark = theme === 'dark';

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`toolbar-select ${isDark ? 'dark' : 'light'}`}
        >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
            <option value="Courier New">Courier New</option>
            <option value="Trebuchet MS">Trebuchet MS</option>
        </select>
    );
} 