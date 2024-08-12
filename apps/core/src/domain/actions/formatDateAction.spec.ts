// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import formatDateAction from './formatDateAction';

describe('formatDateAction', () => {
    const action = formatDateAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.DATE, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};

    const testingDate = 2119477320;

    describe('Localized format', () => {
        test('with options', async () => {
            const localized = `{
                "year": "2-digit",
                "month": "long",
                "day": "2-digit",
                "hour": "2-digit"
            }`;

            expect(
                (
                    await action(
                        [{value: testingDate}],
                        {localized},
                        {
                            ...ctx,
                            lang: 'en-GB'
                        }
                    )
                ).values[0].value
            ).toBe('28 February 37 at 23');
            expect(
                (
                    await action(
                        [{value: testingDate}],
                        {localized},
                        {
                            ...ctx,
                            lang: 'fr-FR'
                        }
                    )
                ).values[0].value
            ).toBe('28 février 37 à 23 h');
            expect(
                (
                    await action(
                        [{value: testingDate}],
                        {localized},
                        {
                            ...ctx,
                            lang: 'ko-KR'
                        }
                    )
                ).values[0].value
            ).toBe('37년 2월 28일 오후 11시');
        });

        // TODO: rise error to inform user without break app
        test.skip.each(['{', '{withoutDoubleQuote: true}', '', '{"params1": "long", "param2": "too many coma",}'])(
            'auto should print default on invalid json format: `%s`',
            async localized => {
                const result = await action(
                    [{value: testingDate}],
                    {localized},
                    {
                        ...ctx,
                        lang: 'en-EN'
                    }
                );
                expect(result.values[0].value).toBe('2/28/2037, 11:42:00 PM');
                expect(result.errors[0]).toEqual({
                    attributeValue: {value: localized},
                    errorType: 'FORMAT_ERROR',
                    message: 'Params "localized" of FormatDateAction are invalid JSON. Use `{}` empty option instead.'
                });
            }
        );
    });

    test('Universal format', async () => {
        expect(
            (
                await action(
                    [{value: testingDate}],
                    {
                        universal: 'D/MMMM-YY HH:mm'
                    },
                    ctx
                )
            ).values[0].value
        ).toBe('28/February-37 23:42');
    });

    describe('edge cases', () => {
        test('should fallback to empty localized param when neither params provided', async () => {
            const resultWithoutParams = await action([{value: testingDate}], {}, ctx);
            const resultWithEmptyLocalizedParam = await action([{value: testingDate}], {localized: '{}'}, ctx);
            expect(resultWithoutParams).toEqual(resultWithEmptyLocalizedParam);
        });
        test('should return empty string on non numerical value in DB', async () => {
            expect((await action([{value: 'aaaa'}], {}, ctx)).values[0].value).toBe('');
        });
        test('should return null on null value in DB', async () => {
            expect((await action([{value: null}], {}, ctx)).values[0].value).toBe(null);
        });
    });

    test('localized override universal format', async () => {
        expect(
            (
                await action(
                    [{value: testingDate}],
                    {
                        universal: 'D/MMMM/YY',
                        localized: `{
                            "weekday": "long",
                            "era": "short",
                            "month": "narrow",
                            "day": "numeric"
                        }`
                    },
                    {...ctx, lang: 'fr-FR'}
                )
            ).values[0].value
        ).toBe('ap. J.-C. samedi 28 F');
    });
});
