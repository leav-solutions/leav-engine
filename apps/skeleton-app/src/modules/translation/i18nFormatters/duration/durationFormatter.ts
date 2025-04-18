import '@formatjs/intl-durationformat/polyfill';
import { type FormatterOptions, isValidDurationStyle } from './_types';
import { defaultLanguage } from '../../translationConstants';

const _getDurationBetweenTwoTimestamps = (timestamp1: number, timestamp2: number) => {
    const differenceInMilliseconds = Math.abs(timestamp2 - timestamp1);

    const differenceInSeconds = Math.floor(differenceInMilliseconds / 1_000);
    const differenceInMinutes = Math.floor(differenceInSeconds / 60);
    const minutes = differenceInMinutes % 60;
    const differenceInHours = Math.floor(differenceInMinutes / 60);
    const hours = differenceInHours % 24;
    const days = Math.floor(differenceInHours / 24);
    const seconds = differenceInSeconds % 60;

    return { days, hours, minutes, seconds };
};

const _getFormattedDuration = (params: {
    startDate: number;
    endDate: number;
    locale: string;
    style?: 'long' | 'short' | 'narrow';
}) => {
    const { startDate, endDate, locale, style = 'narrow' } = params;
    const { days, hours, minutes, seconds } = _getDurationBetweenTwoTimestamps(Number(startDate), Number(endDate));

    // @ts-expect-error TS doesn't know about the polyfill
    const duration = new Intl.DurationFormat(locale, { style }).format({
        days,
        hours,
        minutes,
        seconds: minutes >= 1 ? 0 : seconds
    });

    return duration;
};

export const durationFormatter = (
    _value: unknown,
    lng: string | undefined,
    { startDate, endDate, style }: FormatterOptions
) =>
    _getFormattedDuration({
        startDate: Number(startDate ?? 0),
        endDate: Number(endDate ?? 0),
        locale: lng ?? defaultLanguage.language,
        style: isValidDurationStyle(style) ? style : undefined
    });
