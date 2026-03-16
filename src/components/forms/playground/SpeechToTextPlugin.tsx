import { useCallback, useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, $createTextNode } from "lexical";

interface SpeechToTextPluginProps {
    theme?: 'light' | 'dark';
}

// Extend the Window interface for Speech Recognition
declare global {
    interface Window {
        SpeechRecognition?: typeof SpeechRecognition;
        webkitSpeechRecognition?: typeof SpeechRecognition;
    }
}

export function SpeechToTextPlugin({ theme = 'light' }: SpeechToTextPluginProps) {
    const [editor] = useLexicalComposerContext();
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const startListening = useCallback(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition not supported in this browser');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    const textNode = $createTextNode(transcript + ' ');
                    selection.insertNodes([textNode]);
                }
            });
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [editor]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    return (
        <button
            onClick={isListening ? stopListening : startListening}
            className={`speech-to-text-button ${theme} ${isListening ? 'listening' : ''}`}
            title={isListening ? 'Stop listening' : 'Start speech to text'}
        >
            {isListening ? '⏹️' : '🎤'}
        </button>
    );
}