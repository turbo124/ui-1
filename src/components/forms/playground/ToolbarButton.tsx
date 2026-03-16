import React from 'react';

interface ToolbarButtonProps {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
    className?: string;
}

export function ToolbarButton({ 
    onClick, 
    active, 
    disabled, 
    children, 
    title,
    className = ""
}: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`toolbar-button ${active ? 'active' : ''} ${disabled ? 'disabled' : ''} ${className}`}
        >
            {children}
        </button>
    );
}