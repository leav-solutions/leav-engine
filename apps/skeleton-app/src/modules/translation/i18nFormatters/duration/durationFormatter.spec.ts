import { durationFormatter } from './durationFormatter';

describe('durationFormatter ', () => {
    it.each`
        startDate        | endDate          | style              | formattedDuration
        ${1719500000000} | ${1719500001000} | ${undefined}       | ${'1s'}
        ${1719500000000} | ${1719500090000} | ${undefined}       | ${'1m'}
        ${1719500000000} | ${1719509000000} | ${undefined}       | ${'2h 30m'}
        ${1719500000000} | ${1719507200000} | ${undefined}       | ${'2h'}
        ${1719500000000} | ${1719932000000} | ${undefined}       | ${'5d'}
        ${1719500000000} | ${1719900000000} | ${undefined}       | ${'4d 15h 6m'}
        ${1719500000000} | ${1719931500000} | ${undefined}       | ${'4d 23h 51m'}
        ${1719500000000} | ${1719931500000} | ${'narrow'}        | ${'4d 23h 51m'}
        ${1719500000000} | ${1719931500000} | ${'short'}         | ${'4 days, 23 hr, 51 min'}
        ${1719500000000} | ${1719931500000} | ${'long'}          | ${'4 days, 23 hours, 51 minutes'}
        ${1719500000000} | ${1719931500000} | ${'invalid style'} | ${'4d 23h 51m'}
    `(
        'Should display formatted duration',
        ({
            startDate,
            endDate,
            style,
            formattedDuration
        }: {
            startDate: number;
            endDate: number;
            style: string;
            formattedDuration: string;
        }) => {
            expect(durationFormatter(null, 'en', { startDate, endDate, style })).toBe(formattedDuration);
        }
    );
});
