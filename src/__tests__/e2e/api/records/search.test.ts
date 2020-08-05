import {Client} from '@elastic/elasticsearch';
import {makeGraphQlCall} from '../e2eUtils';
import {getConfig} from '../../../../config';

describe('Search', () => {
    const testLibName = 'search_library_test';

    beforeAll(async () => {
        const conf = await getConfig();
        const esClient = new Client({node: conf.elasticsearch.url});

        await makeGraphQlCall(`mutation {
            saveLibrary(library: {id: "${testLibName}", label: {fr: "Test lib"}}) { id }
        }`);

        await makeGraphQlCall('mutation { refreshSchema }');

        await esClient.index({
            index: testLibName,
            id: '1',
            body: {
                message: 'foobar'
            }
        });

        await esClient.index({
            index: testLibName,
            id: '2',
            body: {
                message: 'foobarok'
            }
        });
    });

    test('Search records with not exactly identical terms (fuzziness)', async () => {
        const res = await makeGraphQlCall(
            `{ search(library: "${testLibName}", query: "foobaro") { totalCount list {id} } }`
        );

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data.search.list.length).toBe(2);
        expect(res.data.data.search.list[0].id).toBe('2');
        expect(res.data.data.search.list[1].id).toBe('1');
    });

    test('Search records with from / size params', async () => {
        const res = await makeGraphQlCall(
            `{ search(library: "${testLibName}", query: "foobaro", from: 0, size: 1) { totalCount list {id} } }`
        );

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data.search.list.length).toBe(1);
        expect(res.data.data.search.list[0].id).toBe('2');
    });
});
