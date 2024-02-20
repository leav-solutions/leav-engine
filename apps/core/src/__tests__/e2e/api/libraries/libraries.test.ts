// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {makeGraphQlCall} from '../e2eUtils';

describe('Libraries', () => {
    test('Get libraries list', async () => {
        const res = await makeGraphQlCall('{ libraries { list { id } } }');

        expect(res.status).toBe(200);
        expect(res.data.data.libraries.list.length).toBeGreaterThanOrEqual(1);
        expect(res.data.errors).toBeUndefined();
    });

    test('Create library', async () => {
        const res = await makeGraphQlCall(`mutation {
                saveLibrary(library: {id: "libraries_test", label: {en: "Test lib"}}) {
                    id
                    attributes {id type}
                    fullTextAttributes { id }
                    permissions {
                        access_library
                    }
                }
            }`);

        expect(res.status).toBe(200);
        expect(res.data.data.saveLibrary.id).toBe('libraries_test');
        expect(res.data.data.saveLibrary.attributes.length).toBeGreaterThanOrEqual(1);
        expect(res.data.data.saveLibrary.attributes[0].type).toBeDefined();
        expect(res.data.data.saveLibrary.fullTextAttributes.length).toBe(0);
        expect(res.data.data.saveLibrary.permissions.access_library).toBeDefined();
        expect(res.data.errors).toBeUndefined();

        // Check if new lib is in libraries list
        const libsRes = await makeGraphQlCall('{ libraries { list { id permissions {access_library}} } }');

        expect(libsRes.status).toBe(200);
        expect(libsRes.data.data.libraries.list.filter(lib => lib.id === 'libraries_test').length).toBe(1);
        expect(libsRes.data.data.libraries.list[0].permissions.access_library).toBeDefined();
    });

    test('Create files library', async () => {
        const res = await makeGraphQlCall(`mutation {
                saveLibrary(library: {id: "libraries_files_test", label: {en: "Test lib"}, behavior: files}) {
                    id
                    attributes {
                        id
                    }
                    previewsSettings {
                        label
                        system
                    }
                }
            }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveLibrary.id).toBe('libraries_files_test');
        expect(res.data.data.saveLibrary.previewsSettings).toHaveLength(1);
        expect(res.data.data.saveLibrary.previewsSettings[0].system).toBe(true);
        expect(
            res.data.data.saveLibrary.attributes.find(attr => attr.id === 'libraries_files_test_previews')
        ).toBeTruthy();
        expect(
            res.data.data.saveLibrary.attributes.find(attr => attr.id === 'libraries_files_test_previews_status')
        ).toBeTruthy();

        // Check if directories library has been created
        const directoriesLibRes = await makeGraphQlCall(
            '{ libraries(filters: {id: ["libraries_files_test_directories"]}) { list { id } } }'
        );

        expect(directoriesLibRes.status).toBe(200);
        expect(directoriesLibRes.data.data.libraries.list.length).toBe(1);

        // Check if tree has been created
        const libTreeRes = await makeGraphQlCall(
            '{ trees(filters: {id: ["libraries_files_test_tree"]}) { list { id } } }'
        );

        expect(libTreeRes.status).toBe(200);
        expect(libTreeRes.data.data.trees.list.length).toBe(1);
    });

    test('Schema regeneration after library creation', async () => {
        const res = await makeGraphQlCall('{ __type(name: "Query") { name fields { name } } }');

        expect(res.status).toBe(200);
        expect(res.data.data.__type).toBeDefined();
        const isPresent = res.data.data.__type.fields.filter(field => field.name === 'libraries_test').length > 0;
    });

    test('Get library by ID', async () => {
        const res = await makeGraphQlCall('{libraries(filters: {id: ["users"]}) { list { id } }}');

        expect(res.status).toBe(200);
        expect(res.data.data.libraries.list.length).toBe(1);
        expect(res.data.errors).toBeUndefined();
    });

    test('Get libraries by multiple IDs', async () => {
        const res = await makeGraphQlCall('{libraries(filters: {id: ["users", "files"]}) { list { id } }}');

        expect(res.status).toBe(200);
        expect(res.data.data.libraries.list.length).toBe(2);
        expect(res.data.errors).toBeUndefined();
    });

    test('Return only request language on label', async () => {
        const res = await makeGraphQlCall('{libraries(filters: {id: ["users"]}) { list {id label(lang: [fr])} }}');

        expect(res.status).toBe(200);
        expect(res.data.data.libraries.list.length).toBe(1);
        expect(res.data.data.libraries.list[0].label.fr).toBeTruthy();
        expect(res.data.data.libraries.list[0].label.en).toBeUndefined();
        expect(res.data.errors).toBeUndefined();
    });

    test('Get error if deleting system library', async () => {
        const res = await makeGraphQlCall('mutation {deleteLibrary(id: "users") { id }}');

        expect(res.status).toBe(200);
        expect(res.data.data).toBeNull();
        expect(res.data.errors).toBeDefined();
        expect(res.data.errors[0].message).toBeDefined();
        expect(res.data.errors[0].extensions.fields).toBeDefined();
    });

    test('Delete a library', async () => {
        const res = await makeGraphQlCall('mutation {deleteLibrary(id: "libraries_test") { id }}');

        expect(res.status).toBe(200);
        expect(res.data.data.deleteLibrary).toBeDefined();
        expect(res.data.data.deleteLibrary.id).toBe('libraries_test');
        expect(res.data.errors).toBeUndefined();
    });
});
