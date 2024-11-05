// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {makeGraphQlCall} from '../e2eUtils';

describe('ActionList', () => {
    test('Get available actions', async () => {
        const res = await makeGraphQlCall(`{
            availableActions {
                name
                description
                input_types
                output_types
                params {
                    name
                    type
                    description
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.availableActions.length).toBeGreaterThanOrEqual(1);
        expect(res.data.errors).toBeUndefined();
    });
});
