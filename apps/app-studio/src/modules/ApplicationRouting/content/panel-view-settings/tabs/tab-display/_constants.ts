export const IDENTITY_COLUMN_ID = '__identity__';

/** Accent- and case-insensitive normalization, mirroring `useAttributeDetailsData` in libs/ui. */
export const sanitize = (str: string): string =>
    str
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase();
