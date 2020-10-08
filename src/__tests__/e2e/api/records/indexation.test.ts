import {Client} from '@elastic/elasticsearch';
import {makeGraphQlCall} from '../e2eUtils';
import {getConfig} from '../../../../config';

describe('Search', () => {
    const testLibName = 'indexation_library_test';
    const testLibNameType = 'indexationLibraryTest';
    let record1;
    let record2;

    beforeAll(async () => {
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {id: "${testLibName}", label: {fr: "Test lib"}}) { id }
        }`);

        await makeGraphQlCall('mutation { refreshSchema }');

        const res = await makeGraphQlCall(`mutation {
            c1: createRecord(library: "${testLibName}") { id },
            c2: createRecord(library: "${testLibName}") { id }
        }`);

        record1 = res.data.data.c1.id;
        record2 = res.data.data.c2.id;
    });

    test('index all libraries', async () => {
        const res = await makeGraphQlCall(`mutation { indexRecords(libraryId: "${testLibName}") }`);
        expect(res.status).toBe(200);
    });

    test('index some records', async () => {
        const res = await makeGraphQlCall(
            `mutation { indexRecords(libraryId: "${testLibName}", 
            records: ["${record1}", "${record2}"]) }`
        );
        expect(res.status).toBe(200);
    });
});
