import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {gqlCreateRecord, gqlSaveAttribute, gqlSaveLibrary, makeGraphQlCall} from '../e2eUtils';

describe('Values Metadata', () => {
    const metadataLibId = 'metadata_test_lib';
    const metadataLibGqlId = 'metadataTestLib';
    const metaAttrId = 'metadata_simple_attribute';
    const attrWithMetaId = 'metadata_attribute';
    let recordId;

    beforeAll(async () => {
        await gqlSaveAttribute(metaAttrId, AttributeTypes.SIMPLE, 'Simple attribute', AttributeFormats.TEXT);
        await gqlSaveAttribute(
            attrWithMetaId,
            AttributeTypes.ADVANCED,
            'Adv attribute with metadta',
            AttributeFormats.TEXT,
            null,
            [metaAttrId]
        );
        await gqlSaveLibrary(metadataLibId, 'Test Metadata', [attrWithMetaId]);
        recordId = await gqlCreateRecord(metadataLibId);
    });

    test('Save a value with metadata on it', async () => {
        const query = `mutation {
                saveValue(
                    library: "${metadataLibId}",
                    recordId: "${recordId}",
                    attribute: "${attrWithMetaId}",
                    value: {
                        value: "Toto",
                        metadata: [{name: "${metaAttrId}", value: "Metadata value"}]
                    }
                ) {
                    id_value
                    metadata
                }
            }`;
        const resSaveValue = await makeGraphQlCall(query);

        expect(resSaveValue.status).toBe(200);
        expect(resSaveValue.data.errors).toBeUndefined();
        expect(resSaveValue.data.data.saveValue.id_value).toBeDefined();
        expect(resSaveValue.data.data.saveValue.metadata[metaAttrId]).toBeDefined();

        // Read value
        const queryGetVal = `{
            r: ${metadataLibGqlId} {
                list {
                    ${attrWithMetaId} {
                        id_value
                        metadata
                    }
                }
            }
        }`;
        const resGetVal = await makeGraphQlCall(queryGetVal);

        expect(resGetVal.status).toBe(200);
        expect(resGetVal.data.errors).toBeUndefined();
        expect(resGetVal.data.data.r.list[0][attrWithMetaId].metadata[metaAttrId]).toBeDefined();
    });
});
