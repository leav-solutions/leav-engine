// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IActionsListFunctionResult} from '_types/actionsList';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import formatDateRangeAction from './formatDateRangeAction';

describe('formatDateRangeAction', () => {
    const action = formatDateRangeAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.DATE_RANGE, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};

    test('formatDateRange', async () => {
        const formattedDateResult = action(
            [{value: {from: '2119477320', to: '2119477380'}}],
            {auto: false, format: 'D/M/YY HH:mm'},
            ctx
        ) as IActionsListFunctionResult;
        const formattedDate = formattedDateResult.values[0].value as {
            from: string;
            to: string;
        };
        expect(formattedDate.from).toBeTruthy();
        expect(formattedDate.to).toBeTruthy();

        const formattedDateNoFormatResult = action(
            [{value: {from: '2119477320', to: '2119477380'}}],
            {auto: false, format: 'D/M/YY HH:mm'},
            ctx
        ) as IActionsListFunctionResult;
        const formattedDateNoFormat = formattedDateNoFormatResult.values[0].value as {
            from: string;
            to: string;
        };
        expect(formattedDateNoFormat.from).toBeTruthy();
        expect(formattedDateNoFormat.to).toBeTruthy();
        expect((await action([{value: 'aaaa'}], {auto: false, format: null}, ctx)).values[0].value).toBe(null);
        expect((await action([{value: {from: '2119477320'}}], {auto: false, format: null}, ctx)).values[0].value).toBe(
            null
        );
        expect((await action([{value: {to: '2119477320'}}], {auto: false, format: null}, ctx)).values[0].value).toBe(
            null
        );
        expect((await action([{value: null}], {auto: false, format: null}, ctx)).values[0].value).toBe(null);
    });

    test('auto', async () => {
        expect(
            (await action([{value: {from: '2119477320', to: '2119477380'}}], {auto: 'true'}, {...ctx, lang: 'ko-KR'}))
                .values[0].value
        ).toEqual({from: '2037. 2. 28. 오후 11:42:00', to: '2037. 2. 28. 오후 11:43:00'});
        expect(
            (await action([{value: {from: '2119477320', to: '2119477380'}}], {auto: 'true'}, {...ctx, lang: 'fr-FR'}))
                .values[0].value
        ).toEqual({from: '28/02/2037 23:42:00', to: '28/02/2037 23:43:00'});
        expect(
            (await action([{value: {from: '2119477320', to: '2119477380'}}], {auto: 'true'}, {...ctx, lang: 'ar-EG'}))
                .values[0].value
        ).toEqual({from: '٢٨‏/٢‏/٢٠٣٧، ١١:٤٢:٠٠ م', to: '٢٨‏/٢‏/٢٠٣٧، ١١:٤٣:٠٠ م'});
    });

    test('auto override formatDate', async () => {
        expect(
            (
                await action(
                    [{value: {from: '2119477320', to: '2119477380'}}],
                    {format: 'D/M/YY', auto: 'true'},
                    {...ctx, lang: 'fr-FR'}
                )
            ).values[0].value
        ).toEqual({from: '28/02/2037 23:42:00', to: '28/02/2037 23:43:00'});
    });
});
