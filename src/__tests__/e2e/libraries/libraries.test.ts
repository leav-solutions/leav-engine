import {makeGraphQlCall} from '../e2eUtils';

describe('Libraries', () => {
    test('Get libraries list', async () => {
        const res = await makeGraphQlCall('{ libraries { id } }');

        expect(res.status).toBe(200);
        expect(res.data.data.libraries.length).toBeGreaterThanOrEqual(1);
        expect(res.data.errors).toBeUndefined();
    });

    test('Create library', async () => {
        const res = await makeGraphQlCall(`mutation {
                saveLibrary(library: {id: "libraries_test", label: {fr: "Test lib"}}) { id attributes {id type}}
            }`);

        expect(res.status).toBe(200);
        expect(res.data.data.saveLibrary.id).toBe('libraries_test');
        expect(res.data.data.saveLibrary.attributes.length).toBeGreaterThanOrEqual(1);
        expect(res.data.data.saveLibrary.attributes[0].type).toBeDefined();
        expect(res.data.errors).toBeUndefined();

        // Check if new lib is in libraries list
        const libsRes = await makeGraphQlCall(`{ libraries { id } }`);

        expect(libsRes.status).toBe(200);
        expect(libsRes.data.data.libraries.filter(lib => lib.id === 'libraries_test').length).toBe(1);
    });

    test('Schema regeneration after library creation', async () => {
        const res = await makeGraphQlCall('{ __type(name: "Query") { name fields { name } } }');

        expect(res.status).toBe(200);
        expect(res.data.data.__type).toBeDefined();
        const isPresent = res.data.data.__type.fields.filter(field => field.name === 'libraries_test').length > 0;
    });

    test('Get library by ID', async () => {
        const res = await makeGraphQlCall(`{libraries(id: "users") { id }}`);

        expect(res.status).toBe(200);
        expect(res.data.data.libraries.length).toBe(1);
        expect(res.data.errors).toBeUndefined();
    });

    test('Return only request language on label', async () => {
        const res = await makeGraphQlCall(`{libraries(id: "users") { id label(lang: [fr]) }}`);

        expect(res.status).toBe(200);
        expect(res.data.data.libraries.length).toBe(1);
        expect(res.data.data.libraries[0].label.fr).toBeTruthy();
        expect(res.data.data.libraries[0].label.en).toBeUndefined();
        expect(res.data.errors).toBeUndefined();
    });

    test('Get error if deleting system library', async () => {
        const res = await makeGraphQlCall(`mutation {deleteLibrary(id: "users") { id }}`);

        expect(res.status).toBe(200);
        expect(res.data.data).toBeNull();
        expect(res.data.errors).toBeDefined();
        expect(res.data.errors[0].message).toBeDefined();
        expect(res.data.errors[0].extensions.fields).toBeDefined();
    });

    test('Delete a library', async () => {
        const res = await makeGraphQlCall(`mutation {deleteLibrary(id: "libraries_test") { id }}`);

        expect(res.status).toBe(200);
        expect(res.data.data.deleteLibrary).toBeDefined();
        expect(res.data.data.deleteLibrary.id).toBe('libraries_test');
        expect(res.data.errors).toBeUndefined();
    });
});
