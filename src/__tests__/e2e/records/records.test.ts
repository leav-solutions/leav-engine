import {getGraphQLUrl} from '../e2eUtils';
import axios from 'axios';

describe('graphql', () => {
    const testLibName = 'record_library_test';
    const testLibNameType = 'recordLibraryTest';
    let recordId;

    beforeAll(async () => {
        const url = await getGraphQLUrl();
        const res = await axios.post(url, {
            query: `mutation {
                saveLibrary(library: {id: "${testLibName}", label: {fr: "Test lib"}}) { id }
            }`
        });

        await axios.post(url, {
            query: `mutation { refreshSchema }`
        });
    });

    test('Create record', async () => {
        const url = await getGraphQLUrl();

        const res = await axios.post(url, {
            query: `mutation { createRecord(library: "${testLibName}") { id } }`
        });

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.createRecord.id).toBeTruthy();

        recordId = res.data.data.createRecord.id;
    });

    test('Get records filtered by ID', async () => {
        const url = await getGraphQLUrl();

        const res = await axios.post(url, {
            query: `{ ${testLibNameType}(filters: [{field: id, value: "${recordId}"}]) { id } }`
        });

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[testLibNameType].length).toBe(1);
        expect(res.data.data[testLibNameType][0].id).toBe(recordId);
    });

    test('Delete a record', async () => {
        const url = await getGraphQLUrl();

        const res = await axios.post(url, {
            query: `mutation {deleteRecord(library: "${testLibName}", id: "${recordId}") { id }}`
        });

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.deleteRecord).toBeDefined();
        expect(res.data.data.deleteRecord.id).toBe(recordId);
    });
});
