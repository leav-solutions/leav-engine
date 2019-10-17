import {makeGraphQlCall} from '../e2eUtils';

describe('Attributes', () => {
    const testAttrName = 'test_attribute';
    test('Get attributes list', async () => {
        const res = await makeGraphQlCall('{ attributes { list {id} } }');

        expect(res.status).toBe(200);

        expect(res.data.data.attributes.list.length).toBeGreaterThanOrEqual(1);
        expect(res.data.errors).toBeUndefined();
    });

    test('Should paginate attributes list', async () => {
        const res = await makeGraphQlCall('{ attributes(pagination: {limit: 2, offset: 0}) { totalCount list {id} } }');

        expect(res.status).toBe(200);

        expect(res.data.data.attributes.totalCount).toBeGreaterThan(2);
        expect(res.data.data.attributes.list.length).toBe(2);
        expect(res.data.errors).toBeUndefined();
    });

    test('Create Attribute', async () => {
        const res = await makeGraphQlCall(`mutation {
            saveAttribute(
                attribute: {
                    id: "${testAttrName}",
                    type: simple,
                    format: text,
                    label: {fr: "Test attr", en: "Test attr en"}
                }
            ) {
                id
                actions_list {
                    saveValue {
                      name
                    }
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.saveAttribute.id).toBe(testAttrName);
        expect(res.data.data.saveAttribute.actions_list.saveValue).toBeTruthy();
        expect(res.data.errors).toBeUndefined();

        // Check if new attribute is in attributes list
        const libsRes = await makeGraphQlCall(`{ attributes { list {id} } }`);

        expect(libsRes.status).toBe(200);
        expect(libsRes.data.data.attributes.list.filter(lib => lib.id === testAttrName).length).toBe(1);
    });

    test('Get Attribute by ID', async () => {
        const res = await makeGraphQlCall(`{attributes(filters: {id: "modified_at"}) { list {id} }}`);

        expect(res.status).toBe(200);
        expect(res.data.data.attributes.list.length).toBe(1);
        expect(res.data.errors).toBeUndefined();
    });

    test('Return only request language on label', async () => {
        const res = await makeGraphQlCall(`{attributes(filters: {id: "modified_at"}) { list {id label(lang: [fr])}}}`);

        expect(res.status).toBe(200);
        expect(res.data.data.attributes.list.length).toBe(1);
        expect(res.data.data.attributes.list[0].label.fr).toBeTruthy();
        expect(res.data.data.attributes.list[0].label.en).toBeUndefined();
        expect(res.data.errors).toBeUndefined();
    });

    test('Get error if deleting system attribute', async () => {
        const res = await makeGraphQlCall(`mutation {deleteAttribute(id: "modified_by") { id }}`);

        expect(res.status).toBe(200);
        expect(res.data.data).toBeNull();
        expect(res.data.errors).toBeDefined();
        expect(res.data.errors[0].message).toBeDefined();
        expect(res.data.errors[0].extensions.fields).toBeDefined();
    });

    test('Delete an attribute', async () => {
        const res = await makeGraphQlCall(`mutation {deleteAttribute(id: "${testAttrName}") { id }}`);

        expect(res.status).toBe(200);
        expect(res.data.data.deleteAttribute).toBeDefined();
        expect(res.data.data.deleteAttribute.id).toBe(testAttrName);
        expect(res.data.errors).toBeUndefined();
    });
});
