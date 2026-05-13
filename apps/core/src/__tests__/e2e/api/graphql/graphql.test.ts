import {makeGraphQlCall} from '../e2eUtils';

describe('GraphQL', () => {
    test('Should return schema', async () => {
        const res = await makeGraphQlCall('{ __schema { queryType { name } } }');

        expect(res.status).toBe(200);
        expect(res.data.data.__schema).toBeDefined();
    });
});
