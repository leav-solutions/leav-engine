// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {gqlCreateRecord, gqlSaveAttribute, gqlSaveLibrary, makeGraphQlCall} from '../e2eUtils';

describe('Values Metadata', () => {
    const metadataLibId = 'metadata_test_lib';
    const metaAttrId = 'metadata_simple_attribute';
    const attrWithMetaId = 'metadata_attribute';
    let recordId;

    beforeAll(async () => {
        await gqlSaveAttribute({
            id: metaAttrId,
            type: AttributeTypes.SIMPLE,
            label: 'Simple attribute',
            format: AttributeFormats.TEXT
        });
        await gqlSaveAttribute({
            id: attrWithMetaId,
            type: AttributeTypes.ADVANCED,
            label: 'Adv attribute with metadta',
            format: AttributeFormats.TEXT,
            metadataFields: [metaAttrId]
        });
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
                        payload: "Toto",
                        metadata: [{name: "${metaAttrId}", value: "Metadata value"}]
                    }
                ) {
                    id_value
                    metadata {
                        name
                        value {
                            payload
                            raw_payload
                        }
                    }
                }
            }`;
        const resSaveValue = await makeGraphQlCall(query);

        expect(resSaveValue.status).toBe(200);
        expect(resSaveValue.data.errors).toBeUndefined();
        expect(resSaveValue.data.data.saveValue[0].id_value).toBeDefined();
        expect(resSaveValue.data.data.saveValue[0].metadata.find(({name}) => name === metaAttrId)).toBeDefined();

        // Read value
        const queryGetVal = `{
            r: records(library: "${metadataLibId}") {
                list {
                    property(attribute: "${attrWithMetaId}") {
                        id_value
                        metadata {
                            name
                            value {
                                payload
                                raw_payload
                            }
                        }
                    }
                }
            }
        }`;
        const resGetVal = await makeGraphQlCall(queryGetVal);

        expect(resGetVal.status).toBe(200);
        expect(resGetVal.data.errors).toBeUndefined();
        expect(resGetVal.data.data.r.list[0].property[0].metadata.find(({name}) => name === metaAttrId)).toBeDefined();
    });
});
