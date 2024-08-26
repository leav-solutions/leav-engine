// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import formatDateRangeAction from './formatDateRangeAction';

describe('formatDateRangeAction', () => {
    const action = formatDateRangeAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.DATE_RANGE, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};

    const testingRangeDate = {from: '2119477320', to: '2119477380'};

    describe('Localized format', () => {
        test('with options', async () => {
            const localized = `{
                "year": "2-digit",
                "month": "long",
                "day": "2-digit",
                "hour": "2-digit",
                "minute": "2-digit"
            }`;

            expect(
                (
                    await action(
                        [{value: testingRangeDate}],
                        {localized},
                        {
                            ...ctx,
                            lang: 'en-GB'
                        }
                    )
                ).values[0].value
            ).toEqual({from: '28 February 37 at 23:42', to: '28 February 37 at 23:43'});
            expect(
                (
                    await action(
                        [{value: testingRangeDate}],
                        {localized},
                        {
                            ...ctx,
                            lang: 'ko-KR'
                        }
                    )
                ).values[0].value
            ).toEqual({from: '37년 2월 28일 오후 11:42', to: '37년 2월 28일 오후 11:43'});
        });

        test.skip.each(['{', '{withoutDoubleQuote: true}', '', '{"params1": "long", "param2": "too many coma",}'])(
            'auto should print default on invalid json format: `%s`',
            async localized => {
                const result = await action(
                    [{value: testingRangeDate}],
                    {localized},
                    {
                        ...ctx,
                        lang: 'en-EN'
                    }
                );
                expect(result.values[0].value).toEqual({from: '2/28/2037, 11:42:00 PM', to: '2/28/2037, 11:43:00 PM'});
                expect(result.errors[0]).toEqual({
                    attributeValue: {value: localized},
                    errorType: 'FORMAT_ERROR',
                    message: 'Params "localized" of FormatDateAction are invalid JSON. Use `{}` empty option instead.'
                });
            }
        );
    });

    test('Universal format', async () => {
        const result = await action([{value: testingRangeDate}], {universal: 'D/MMMM-YY HH:mm'}, ctx);
        const formattedRangeDate = result.values[0].value as {
            from: string;
            to: string;
        };
        expect(formattedRangeDate.from).toBe('28/February-37 23:42');
        expect(formattedRangeDate.to).toBe('28/February-37 23:43');
    });

    describe('edge cases', () => {
        test('should return null value if properties are omitted', async () => {
            expect((await action([{value: 'aaaa'}], {}, ctx)).values[0].value).toBe(null);
            expect((await action([{value: {}}], {}, ctx)).values[0].value).toBe(null);
            expect((await action([{value: {unknownProperty: null}}], {}, ctx)).values[0].value).toBe(null);
            expect((await action([{value: {from: '2119477320'}}], {}, ctx)).values[0].value).toBe(null);
            expect((await action([{value: {to: '2119477320'}}], {}, ctx)).values[0].value).toBe(null);
            expect((await action([{value: null}], {}, ctx)).values[0].value).toBe(null);
        });
        test('should return empty string couple on non numerical value in DB', async () => {
            expect((await action([{value: {from: 'aaaa', to: '2119477320'}}], {}, ctx)).values[0].value).toEqual([
                '',
                ''
            ]);
            expect((await action([{value: {from: '2119477320', to: 'aaaa'}}], {}, ctx)).values[0].value).toEqual([
                '',
                ''
            ]);
        });
    });

    test('localized override universal format', async () => {
        expect(
            (
                await action(
                    [{value: {from: '2119477320', to: '2119477380'}}],
                    {
                        universal: 'D/MMMM/YY',
                        localized: `{
                            "weekday": "long",
                            "era": "short",
                            "month": "narrow",
                            "day": "numeric",
                            "minute": "2-digit"
                        }`
                    },
                    {...ctx, lang: 'fr-FR'}
                )
            ).values[0].value
        ).toEqual({from: 'ap. J.-C. samedi 28 F 42', to: 'ap. J.-C. samedi 28 F 43'});
    });
});
