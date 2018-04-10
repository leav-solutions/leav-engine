import {getGraphQLUrl} from '../e2eUtils';
import axios from 'axios';

describe('graphql', () => {
    const testLibName = 'values_library_test';
    const attrSimpleName = 'values_attribute_test_simple';
    const attrSimpleLinkName = 'values_attribute_test_simple_link';
    const attrAdvancedName = 'values_attribute_test_adv';
    const attrAdvancedLinkName = 'values_attribute_test_adv_link';

    let recordId;
    let recordIdLinked;
    let advValueId;

    beforeAll(async () => {
        const url = await getGraphQLUrl();

        // Create attributes
        await axios.post(url, {
            query: `mutation {
                saveAttribute(
                    attribute: {
                        id: "${attrSimpleName}",
                        type: simple,
                        format: text,
                        label: {fr: "Test attr simple"}
                    }
                ) {
                    id
                }
            }`
        });

        await axios.post(url, {
            query: `mutation {
                saveAttribute(
                    attribute: {
                        id: "${attrAdvancedName}",
                        type: advanced,
                        format: text,
                        label: {fr: "Test attr advanced"}
                    }
                ) { id }
            }`
        });

        await axios.post(url, {
            query: `mutation {
                saveAttribute(
                    attribute: {
                        id: "${attrSimpleLinkName}",
                        type: simple_link,
                        format: text,
                        label: {fr: "Test attr simple link"}
                    }
                ) { id }
            }`
        });

        await axios.post(url, {
            query: `mutation {
                saveAttribute(
                    attribute: {
                        id: "${attrAdvancedLinkName}",
                        type: advanced_link,
                        format: text,
                        label: {fr: "Test attr advanced link"}
                    }
                ) { id }
            }`
        });

        await axios.post(url, {
            query: `mutation { refreshSchema }`
        });

        // Create library
        await axios.post(url, {
            query: `mutation {
                saveLibrary(library: {
                    id: "${testLibName}",
                    label: {fr: "Test lib"},
                    attributes: [
                        "${attrSimpleName}",
                        "${attrAdvancedName}",
                        "${attrSimpleLinkName}",
                        "${attrAdvancedLinkName}"
                    ]
                }) { id }
            }`
        });

        await axios.post(url, {
            query: `mutation { refreshSchema }`
        });

        // Create record
        const resRecord = await axios.post(url, {
            query: `mutation { createRecord(library: "${testLibName}") { id } }`
        });

        recordId = resRecord.data.data.createRecord.id;

        const resRecordLinked = await axios.post(url, {
            query: `mutation { createRecord(library: "${testLibName}") { id } }`
        });

        recordIdLinked = resRecordLinked.data.data.createRecord.id;
    });

    test('Save value simple', async () => {
        const url = await getGraphQLUrl();

        const res = await axios.post(url, {
            query: `mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrSimpleName}",
                    value: {value: "TEST VAL"}) { id value }
              }`
        });

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue.id).toBeNull();
        expect(res.data.data.saveValue.value).toBe('TEST VAL');
    });

    test('Save value simple link', async () => {
        const url = await getGraphQLUrl();

        const res = await axios.post(url, {
            query: `mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrSimpleLinkName}",
                    value: {value: "${recordIdLinked}"}) { id value }
              }`
        });

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue.id).toBeNull();
        expect(res.data.data.saveValue.value).toBe(recordIdLinked);
    });

    test('Save value advanced', async () => {
        const url = await getGraphQLUrl();

        const res = await axios.post(url, {
            query: `mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrAdvancedName}",
                    value: {value: "TEST VAL ADV"}) { id value }
              }`
        });

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue.id).toBeTruthy();
        expect(res.data.data.saveValue.value).toBe('TEST VAL ADV');

        advValueId = res.data.data.saveValue.id;
    });

    test('Save value advanced link', async () => {
        const url = await getGraphQLUrl();

        const res = await axios.post(url, {
            query: `mutation {
                saveValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrAdvancedLinkName}",
                    value: {value: "${recordIdLinked}"}) { id value }
              }`
        });

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveValue.id).toBeTruthy();
        expect(res.data.data.saveValue.value).toBe(recordIdLinked);
    });

    test('Delete value advanced', async () => {
        const url = await getGraphQLUrl();

        const res = await axios.post(url, {
            query: `mutation {
                deleteValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrAdvancedName}",
                    value: {id: "${advValueId}"}) { id value }
              }`
        });

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.deleteValue.id).toBeTruthy();
    });

    test('Delete value simple', async () => {
        const url = await getGraphQLUrl();

        const res = await axios.post(url, {
            query: `mutation {
                deleteValue(
                    library: "${testLibName}",
                    recordId: "${recordId}",
                    attribute: "${attrSimpleName}",
                    value: {value: "TEST VAL"}) { id value }
              }`
        });

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
    });
});
