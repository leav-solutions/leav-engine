// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import reducer, {endMutation, initialState, startMutation} from './mutationsWatcher';

describe('messages store', () => {
    test('Count pending mutations', async () => {
        const newState = reducer(reducer(reducer(initialState, startMutation), startMutation), startMutation);

        expect(newState.mutationsCount).toBe(3);
        expect(newState.hasPendingMutations).toBe(true);

        const newState2 = reducer(reducer(reducer(newState, endMutation), endMutation), endMutation);

        expect(newState2.mutationsCount).toBe(0);
        expect(newState2.hasPendingMutations).toBe(false);
    });
});
