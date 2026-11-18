/** Joins class names, dropping the falsy ones. */
export const cx = (...parts: Array<string | false | null | undefined>): string => parts.filter(Boolean).join(" ");
