import { useState } from "react";

interface MarkdownModePluginProps {
    theme?: 'light' | 'dark';
}

export function MarkdownModePlugin({ theme = 'light' }: MarkdownModePluginProps) {
    const [isMarkdownMode, setIsMarkdownMode] = useState(false);

    const toggleMode = () => {
        setIsMarkdownMode(!isMarkdownMode);
        console.log(`Switched to ${!isMarkdownMode ? 'Markdown' : 'HTML'} mode`);
        // Here you would implement the actual mode switching logic
        // This would typically involve changing the editor configuration
        // and switching between different editor instances or plugins
    };

    return (
        <button
            onClick={toggleMode}
            className={`markdown-mode-button ${theme} ${isMarkdownMode ? 'active' : ''}`}
            title={`Switch to ${isMarkdownMode ? 'HTML' : 'Markdown'} mode`}
        >
            <span className="md-button">{isMarkdownMode ? 'HTML' : 'MD'}</span>
        </button>
    );
}

