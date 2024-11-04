// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IStandardValue} from '_types/value';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import formatDateRangeAction from './formatDateRangeAction';

describe('formatDateRangeAction', () => {
    const action = formatDateRangeAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.DATE_RANGE, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText, userId: 'test_user'};

    const testingRangeDate = {from: '2119477320', to: '2119477380'};
    const testValue: IStandardValue = {payload: testingRangeDate, raw_payload: testingRangeDate};

    describe('Localized format', () => {
        test('with options', async () => {
            const localized = `{
                "year": "2-digit",
                "month": "long",
                "day": "2-digit",
                "hour": "2-digit",
                "minute": "2-digit"
            }`;

            const resEnGb = await action(
                [testValue],
                {localized},
                {
                    ...ctx,
                    lang: 'en-GB'
                }
            );
            expect(resEnGb.errors).toEqual([]);
            expect(resEnGb.values[0].payload).toEqual({from: '28 February 37 at 23:42', to: '28 February 37 at 23:43'});

            const resKoKr = await action(
                [testValue],
                {localized},
                {
                    ...ctx,
                    lang: 'ko-KR'
                }
            );
            expect(resKoKr.errors).toEqual([]);
            expect(resKoKr.values[0].payload).toEqual({
                from: '37년 2월 28일 오후 11:42',
                to: '37년 2월 28일 오후 11:43'
            });
        });

        test.skip.each(['{', '{withoutDoubleQuote: true}', '', '{"params1": "long", "param2": "too many coma",}'])(
            'auto should print default on invalid json format: `%s`',
            async localized => {
                const result = await action(
                    [testValue],
                    {localized},
                    {
                        ...ctx,
                        lang: 'en-EN'
                    }
                );
                expect(result.values[0].payload).toEqual({
                    from: '2/28/2037, 11:42:00 PM',
                    to: '2/28/2037, 11:43:00 PM'
                });
                expect(result.errors[0]).toEqual({
                    attributeValue: {value: localized},
                    errorType: 'FORMAT_ERROR',
                    message: 'Params "localized" of FormatDateAction are invalid JSON. Use `{}` empty option instead.'
                });
            }
        );
    });

    test('Universal format', async () => {
        const result = await action([testValue], {universal: 'D/MMMM-YY HH:mm'}, ctx);
        const formattedRangeDate = result.values[0].payload as {
            from: string;
            to: string;
        };
        expect(formattedRangeDate.from).toBe('28/February-37 23:42');
        expect(formattedRangeDate.to).toBe('28/February-37 23:43');
    });

    describe('edge cases', () => {
        test('should return null value if properties are omitted', async () => {
            expect((await action([{payload: 'aaaa', raw_payload: 'aaa'}], {}, ctx)).values[0].payload).toBe(null);
            expect((await action([{payload: {}, raw_payload: {}}], {}, ctx)).values[0].payload).toBe(null);
            expect(
                (await action([{payload: {unknownProperty: null}, raw_payload: {unknownProperty: null}}], {}, ctx))
                    .values[0].payload
            ).toBe(null);
            expect(
                (await action([{payload: {from: '2119477320'}, raw_payload: {from: '2119477320'}}], {}, ctx)).values[0]
                    .payload
            ).toBe(null);
            expect(
                (await action([{payload: {to: '2119477320'}, raw_payload: {to: '2119477320'}}], {}, ctx)).values[0]
                    .payload
            ).toBe(null);
            expect((await action([{payload: null, raw_payload: null}], {}, ctx)).values[0].payload).toBe(null);
        });
        test('should return empty string couple on non numerical value in DB', async () => {
            expect(
                (
                    await action(
                        [{payload: {from: 'aaaa', to: '2119477320'}, raw_payload: {from: 'aaaa', to: '2119477320'}}],
                        {},
                        ctx
                    )
                ).values[0].payload
            ).toEqual(['', '']);
            expect(
                (
                    await action(
                        [{payload: {from: '2119477320', to: 'aaaa'}, raw_payload: {from: '2119477320', to: 'aaaa'}}],
                        {},
                        ctx
                    )
                ).values[0].payload
            ).toEqual(['', '']);
        });
    });

    test('localized override universal format', async () => {
        expect(
            (
                await action(
                    [
                        {
                            payload: {from: '2119477320', to: '2119477380'},
                            raw_payload: {from: '2119477320', to: '2119477380'}
                        }
                    ],
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
            ).values[0].payload
        ).toEqual({from: 'ap. J.-C. samedi 28 F 42', to: 'ap. J.-C. samedi 28 F 43'});
    });
});
