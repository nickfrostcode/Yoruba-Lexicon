/** @format */

import { YORUBA_ALPHABET } from "@/src/lib/constants";

const TONE_MAP: Record<string, string> = {
    'à': 'a', 'á': 'a', 'â': 'a', 'ǎ': 'a',
    'è': 'e', 'é': 'e', 'ê': 'e', 'ě': 'e',
    'ẹ̀': 'ẹ', 'ẹ́': 'ẹ', 'ệ': 'ẹ', 'ẹ̌': 'ẹ',
    'ì': 'i', 'í': 'i', 'î': 'i', 'ǐ': 'i',
    'ò': 'o', 'ó': 'o', 'ô': 'o', 'ǒ': 'o',
    'ọ̀': 'ọ', 'ọ́': 'ọ', 'ộ': 'ọ', 'ọ̌': 'ọ',
    'ù': 'u', 'ú': 'u', 'û': 'u', 'ǔ': 'u',
    'ǹ': 'n', 'ń': 'n',
    'm̀': 'm', 'ḿ': 'm',
};

export function normalizeWord(word: string): string {
    let lower = word.toLowerCase().trim();
    // Replace composed characters based on map
    for (const [mark, plain] of Object.entries(TONE_MAP)) {
        lower = lower.split(mark).join(plain);
    }
    
    // Also remove generic combining tone marks (grave, acute, etc.)
    // Be careful NOT to remove the dot below (\u0323) which is used for ẹ, ọ, ṣ!
    lower = lower.normalize('NFD');
    lower = lower.replace(/[\u0300-\u0322\u0324-\u036f]/g, '');
    
    // Normalize back to NFC for valid composed chars like ẹ, ọ, ṣ
    return lower.normalize('NFC');
}

export function compareBaseAndVariant(base: string, variant: string): boolean {
    return normalizeWord(base) === normalizeWord(variant);
}

export function getAlphabetChar(word: string): string {
    const w = word.normalize("NFC").toUpperCase();
    if (w.startsWith("GB")) return "GB";
    
    // Get first character, ensuring we capture the dot below if present
    let firstChar = w.charAt(0);
    if (w.length > 1 && w.charCodeAt(1) === 0x0323) {
        firstChar += w.charAt(1);
    }
    
    // Normalize it back to verify against YORUBA_ALPHABET
    let normalizedChar = firstChar.normalize("NFC");
    
    // if the character has a tone (e.g. Á -> A, Ẹ́ -> Ẹ), strip tone but keep dot
    normalizedChar = normalizedChar.normalize("NFD").replace(/[\u0300-\u0322\u0324-\u036f]/g, "").normalize("NFC");
    
    if (YORUBA_ALPHABET.includes(normalizedChar)) {
        return normalizedChar;
    }
    
    return firstChar.charAt(0); // Fallback
}
