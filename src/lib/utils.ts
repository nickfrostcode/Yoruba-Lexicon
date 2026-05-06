/** @format */

import { YORUBA_ALPHABET } from "./constants";

export function normalizeWord(word: string): string {
    // Normalizes a string by converting to lowercase and stripping tone marks (acute \u0301, grave \u0300, macron, etc.)
    // We EXCLUDE \u0323 (dot below), to keep ẹ, ọ, ṣ intact
    let nfd = word.normalize("NFD");
    nfd = nfd.replace(/[\u0300-\u0322\u0324-\u036f]/g, "");
    return nfd.normalize("NFC").toLowerCase();
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
