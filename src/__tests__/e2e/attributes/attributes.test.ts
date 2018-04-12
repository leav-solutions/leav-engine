import {makeGraphQlCall} from '../e2eUtils';

describe('graphql', () => {
    const testAttrName = 'test_attribute';
    test('Get attributes list', async () => {
        const res = await makeGraphQlCall('{ attributes { id } }');

        expect(res.status).toBe(200);
        expect(res.data.data.attributes.length).toBeGreaterThanOrEqual(1);
        expect(res.data.errors).toBeUndefined();
    });

    test('Create Attribute', async () => {
        const res = await makeGraphQlCall(`mutation {
            saveAttribute(
                attribute: {id: "${testAttrName}", type: simple, format: text, label: {fr: "Test attr"}}
            ) {
                id
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.saveAttribute.id).toBe(testAttrName);
        expect(res.data.errors).toBeUndefined();

        // Check if new attribute is in attributes list
        const libsRes = await makeGraphQlCall(`{ attributes { id } }`);

        expect(libsRes.status).toBe(200);
        expect(libsRes.data.data.attributes.filter(lib => lib.id === testAttrName).length).toBe(1);
    });

    // test('Get Attribute by ID', async () => {

    //     const res = await makeGraohQlCall( `{attributes(id: modified_at) { id }}`
    //     });

    //     expect(res.status).toBe(200);
    //     expect(res.data.data.attributes.length).toBe(1);
    //     expect(res.data.errors).toBeUndefined();
    // });

    test('Get error if deleting system attribute', async () => {
        const res = await makeGraphQlCall(`mutation {deleteAttribute(id: "modified_by") { id }}`);

        expect(res.status).toBe(200);
        expect(res.data.data.deleteAttribute).toBeNull();
        expect(res.data.errors).toBeDefined();
        expect(res.data.errors[0].message).toBeDefined();
        expect(res.data.errors[0].fields).toBeDefined();
    });

    test('Delete an attribute', async () => {
        try {
            const res = await makeGraphQlCall(`mutation {deleteAttribute(id: "${testAttrName}") { id }}`);

            expect(res.status).toBe(200);
            expect(res.data.data.deleteAttribute).toBeDefined();
            expect(res.data.data.deleteAttribute.id).toBe(testAttrName);
            expect(res.data.errors).toBeUndefined();
        } catch (e) {
            console.log(e);
        }
    });
});
