/**
 * Normalizes Moroccan phone numbers into a standard numeric string with +212 prefix.
 * Example inputs -> Output:
 * "0612345678"      -> "+212612345678"
 * "612345678"       -> "+212612345678"
 * "+212 612345678"  -> "+212612345678"
 * "212 0612345678"  -> "+212612345678"
 */
export const normalizePhone = (phone: string): string => {
    // 1. Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    if (!cleaned) return '';

    // 2. Extract digits after prefix (handle 212, 0, or just the number)
    let digits = cleaned;
    if (cleaned.startsWith('212')) {
        digits = cleaned.substring(3);
    }
    
    // 3. Remove leading zero if it exists
    if (digits.startsWith('0')) {
        digits = digits.substring(1);
    }

    // 4. Return in standard format
    return `+212${digits}`;
};
