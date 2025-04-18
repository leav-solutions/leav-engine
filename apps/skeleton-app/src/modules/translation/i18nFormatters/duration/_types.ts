export type DurationStyle = 'long' | 'short' | 'narrow';
export interface FormatterOptions {
    startDate?: number | string;
    endDate?: number | string;
    style?: string;
    [key: string]: unknown;
}

export const isValidDurationStyle = (style?: string): style is DurationStyle =>
    ['long', 'short', 'narrow'].includes(style ?? '');
