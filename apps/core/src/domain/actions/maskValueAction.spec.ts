// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MASKED_VALUE} from '../../_constants/values';
import {type IActionsListFunctionResult} from '_types/actionsList';
import maskValueAction from './maskValueAction';

describe('maskValue', () => {
    const action = maskValueAction().action;
    const ctx = {userId: 'test'};

    test('maskValue', async () => {
        expect(((await action([{payload: 'coucou'}], {}, ctx)) as IActionsListFunctionResult).values[0]).toEqual(
            expect.objectContaining({
                payload: MASKED_VALUE,
                raw_payload: MASKED_VALUE,
            }),
        );
        expect(((await action([{payload: 13456}], {}, ctx)) as IActionsListFunctionResult).values[0]).toEqual(
            expect.objectContaining({
                payload: MASKED_VALUE,
                raw_payload: MASKED_VALUE,
            }),
        );
        expect(((await action([{payload: {toto: 'tata'}}], {}, ctx)) as IActionsListFunctionResult).values[0]).toEqual(
            expect.objectContaining({
                payload: MASKED_VALUE,
                raw_payload: MASKED_VALUE,
            }),
        );

        expect(((await action([{payload: ''}], {}, ctx)) as IActionsListFunctionResult).values[0]).toEqual(
            expect.objectContaining({
                payload: '',
                raw_payload: '',
            }),
        );
        expect(((await action([{payload: null}], {}, ctx)) as IActionsListFunctionResult).values[0]).toEqual(
            expect.objectContaining({
                payload: '',
                raw_payload: '',
            }),
        );
        expect(((await action([{payload: {}}], {}, ctx)) as IActionsListFunctionResult).values[0]).toEqual(
            expect.objectContaining({
                payload: '',
                raw_payload: '',
            }),
        );
    });
});
