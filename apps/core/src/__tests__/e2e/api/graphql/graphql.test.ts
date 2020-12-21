// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {makeGraphQlCall} from '../e2eUtils';

describe('GraphQL', () => {
    test('Should return schema', async () => {
        const res = await makeGraphQlCall('{ __schema { queryType { name } } }');

        expect(res.status).toBe(200);
        expect(res.data.data.__schema).toBeDefined();
    });
});
