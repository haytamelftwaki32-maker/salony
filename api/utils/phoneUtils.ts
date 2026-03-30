/**
 * Normalizes Moroccan phone numbers into a standard numeric string.
 * Example inputs -> Output:
 * "+212 0612345678" -> "212612345678"
 * "0612345678"      -> "212612345678"
 * "612345678"       -> "212612345678"
 */
export const normalizePhone = (phone: string): string => {
    // 1. Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    // 2. If it starts with 212, handle the next digit
    if (cleaned.startsWith('212')) {
        const afterPrefix = cleaned.substring(3);
        // If the number after 212 starts with a zero (e.g. 212 06...), remove that zero
        if (afterPrefix.startsWith('0')) {
            cleaned = '212' + afterPrefix.substring(1);
        }
    } else {
        // 3. It doesn't start with 212. If it starts with 0, remove it and add 212
        if (cleaned.startsWith('0')) {
            cleaned = '212' + cleaned.substring(1);
        } else {
            // It's just the number (e.g. 612345678), add 212
            cleaned = '212' + cleaned;
        }
    }

    return cleaned;
};
