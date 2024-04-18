// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IActionsListFunctionResult} from '_types/actionsList';
import maskValueAction from './maskValueAction';

describe('maskValue', () => {
    const action = maskValueAction().action;
    test('maskValue', async () => {
        expect((action([{value: 'coucou'}], null, null) as IActionsListFunctionResult).values[0].value).toBe('●●●●●●●');
        expect((action([{value: 13456}], null, null) as IActionsListFunctionResult).values[0].value).toBe('●●●●●●●');
        expect((action([{value: {toto: 'tata'}}], null, null) as IActionsListFunctionResult).values[0].value).toBe('●●●●●●●');

        expect((action([{value: ''}], null, null) as IActionsListFunctionResult).values[0].value).toBe('');
        expect((action([{value: null}], null, null) as IActionsListFunctionResult).values[0].value).toBe('');
        expect((action([{value: {}}], null, null) as IActionsListFunctionResult).values[0].value).toBe('');
    });
});
