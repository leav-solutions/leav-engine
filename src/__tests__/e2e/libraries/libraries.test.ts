import {getGraphQLUrl} from '../e2eUtils';
import axios from 'axios';

describe('graphql', () => {
    test('Get libraries list', async () => {
        const url = await getGraphQLUrl();

        const res = await axios.post(url, {
            query: '{ libraries { id } }'
        });

        expect(res.status).toBe(200);
        expect(res.data.data.libraries.length).toBeGreaterThanOrEqual(1);
        expect(res.data.errors).toBeUndefined();
    });

    test('Create library', async () => {
        const url = await getGraphQLUrl();

        const res = await axios.post(url, {
            query: `mutation {
                saveLibrary(library: {id: "libraries_test", label: {fr: "Test lib"}}) { id }
            }`
        });

        expect(res.status).toBe(200);
        expect(res.data.data.saveLibrary.id).toBe('libraries_test');
        expect(res.data.errors).toBeUndefined();

        // Check if new lib is in libraries list
        const libsRes = await axios.post(url, {
            query: `{ libraries { id } }`
        });

        expect(libsRes.status).toBe(200);
        expect(libsRes.data.data.libraries.filter(lib => lib.id === 'libraries_test').length).toBe(1);
    });

    test('Schema regeneration after library creation', async () => {
        const url = await getGraphQLUrl();

        const res = await axios.post(url, {
            query: '{ __type(name: "Query") { name fields { name } } }'
        });

        expect(res.status).toBe(200);
        expect(res.data.data.__type).toBeDefined();
        const isPresent = res.data.data.__type.fields.filter(field => field.name === 'libraries_test').length > 0;
    });

    test('Get library by ID', async () => {
        const url = await getGraphQLUrl();

        const res = await axios.post(url, {
            query: `{libraries(id: "users") { id }}`
        });

        expect(res.status).toBe(200);
        expect(res.data.data.libraries.length).toBe(1);
        expect(res.data.errors).toBeUndefined();
    });

    test('Get error if deleting system library', async () => {
        const url = await getGraphQLUrl();

        const res = await axios.post(url, {
            query: `mutation {deleteLibrary(id: "users") { id }}`
        });

        expect(res.status).toBe(200);
        expect(res.data.data.deleteLibrary).toBeNull();
        expect(res.data.errors).toBeDefined();
        expect(res.data.errors[0].message).toBeDefined();
        expect(res.data.errors[0].fields).toBeDefined();
    });

    test('Delete a library', async () => {
        const url = await getGraphQLUrl();

        try {
            const res = await axios.post(url, {
                query: `mutation {deleteLibrary(id: "libraries_test") { id }}`
            });

            expect(res.status).toBe(200);
            expect(res.data.data.deleteLibrary).toBeDefined();
            expect(res.data.data.deleteLibrary.id).toBe('libraries_test');
            expect(res.data.errors).toBeUndefined();
        } catch (e) {
            console.log(e);
        }
    });
});
