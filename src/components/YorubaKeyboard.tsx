import React, { useState } from "react";
import { Info, Keyboard } from "lucide-react";

const ALL_YORUBA_CHARS = ["à", "á", "è", "é", "ẹ", "ẹ̀", "ẹ́", "ì", "í", "ò", "ó", "ọ", "ọ̀", "ọ́", "ù", "ú", "ṣ"];
const BASE_YORUBA_CHARS = ["ẹ", "ọ", "ṣ"];

interface YorubaKeyboardProps {
	onCharClick: (char: string) => void;
	baseMode?: boolean;
}

export const YorubaKeyboard: React.FC<YorubaKeyboardProps> = ({ onCharClick, baseMode = false }) => {
	const [isOpen, setIsOpen] = useState(false);
	const charsToShow = baseMode ? BASE_YORUBA_CHARS : ALL_YORUBA_CHARS;

	return (
		<div className="mt-2 text-left">
            <button 
                type="button" 
                onClick={() => setIsOpen(!isOpen)} 
                className="text-xs font-bold uppercase tracking-widest text-brand-orange hover:text-brand-orange/80 transition-colors flex items-center space-x-1"
            >
                <Keyboard size={14} />
                <span>{isOpen ? "Hide Yorùbá Keyboard" : "Show Yorùbá Keyboard"}</span>
            </button>
            {isOpen && (
                <div className="bg-brand-orange/5 p-3 rounded-xl border border-brand-orange/10 mt-3">
                    <div className="flex items-center space-x-2 mb-2">
                        <Info size={14} className="text-brand-orange/60" />
                        <span className="text-xs font-medium text-brand-orange/80">Click a character to insert</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {charsToShow.map((char) => (
                            <button
                                key={char}
                                type="button"
                                onClick={() => onCharClick(char)}
                                className="w-10 h-10 flex items-center justify-center bg-white border border-brand-ink/10 rounded-lg shadow-sm hover:bg-brand-orange/10 hover:border-brand-orange/30 hover:text-brand-orange transition-all text-lg font-serif"
                            >
                                {char}
                            </button>
                        ))}
                    </div>
                </div>
            )}
		</div>
	);
};
