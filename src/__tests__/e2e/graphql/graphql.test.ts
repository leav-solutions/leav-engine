import {getGraphQLUrl} from '../e2eUtils';
import axios from 'axios';

describe('graphql', () => {
    test('Should return schema', async () => {
        const url = await getGraphQLUrl();

        const res = await axios.post(url, {
            query: '{ __schema { queryType { name } } }'
        });

        expect(res.status).toBe(200);
        expect(res.data.data.__schema).toBeDefined();
    });
});
