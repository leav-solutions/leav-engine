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
            {format: 'D/M/YY HH:mm'},
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
            {format: 'D/M/YY HH:mm'},
            ctx
        ) as IActionsListFunctionResult;
        const formattedDateNoFormat = formattedDateNoFormatResult.values[0].value as {
            from: string;
            to: string;
        };
        expect(formattedDateNoFormat.from).toBeTruthy();
        expect(formattedDateNoFormat.to).toBeTruthy();
        expect((action([{value: 'aaaa'}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe(null);
        expect((action([{value: {from: '2119477320'}}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe(
            null
        );
        expect((action([{value: {to: '2119477320'}}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe(
            null
        );
        expect((action([{value: null}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe(null);
    });
});
