// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FORM_ROOT_CONTAINER_ID} from '@leav/utils';
import {AttributeTypes} from '../../../../_types/attribute';
import {LibraryBehavior} from '../../../../_types/library';
import {gqlCreateRecord, makeGraphQlCall} from '../e2eUtils';
import {AttributeCondition} from '../../../../_types/record';

describe('JoinLibraries', () => {
    const libThematic = 'lib_thematic';
    const libCampaign = 'lib_campaigns';
    const libStructureItem = 'lib_structure_items';
    const attrStructureItemThematic = 'attribute_structure_items_thematic'; // simple link
    const attrCampaignStructureItems = 'attribute_campaign_structure_items'; // advanced link multi

    beforeAll(async () => {
        await makeGraphQlCall(`mutation {
            saveAttribute(
                attribute: {
                    id: "${attrStructureItemThematic}",
                    type: ${AttributeTypes.SIMPLE_LINK},
                    format: text,
                    linked_library: "${libThematic}",
                    label: {en: "Thematic"},
                    multiple_values: false
                }
            ) { id }
        }`);

        await makeGraphQlCall(`mutation {
            saveAttribute(
                attribute: {
                    id: "${attrCampaignStructureItems}",
                    type: ${AttributeTypes.ADVANCED_LINK},
                    format: text,
                    linked_library: "${libStructureItem}",
                    label: {en: "Thematic"},
                    multiple_values: true
                }
            ) { id }
        }`);

        // make libraries
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {
                id: "${libThematic}", 
                label: {en: "Thematics"},
                behavior: ${LibraryBehavior.STANDARD}
            }) { id }
        }`);

        await makeGraphQlCall(`mutation {
            saveLibrary(library: {
                id: "${libStructureItem}", 
                label: {en: "Structure Items"}, 
                behavior: ${LibraryBehavior.JOIN},
                attributes: [
                    "id",
                    "${attrStructureItemThematic}",
                ],
                mandatoryAttribute: "${attrStructureItemThematic}"
            }) { id }
        }`);

        await makeGraphQlCall(`mutation {
            saveLibrary(library: {
                id: "${libCampaign}", 
                label: {en: "Campaigns"}, 
                behavior: ${LibraryBehavior.STANDARD},
                attributes: [
                    "id",
                    "${attrCampaignStructureItems}",
                ]
            }) { id }
        }`);
    });

    test('should add joinLibraryContext in campaign form structure item element', async () => {
        const formName = 'form_campaigns';
        const elementId = '123456';
        const res = await makeGraphQlCall(`mutation {
            saveForm(
                form: {
                    id: "${formName}"
                    library: "${libCampaign}"
                    label: { en: "Formulaire édition" }
                    elements: [
                        {
                            elements: [
                                {
                                    id: "some_container"
                                    containerId: "${FORM_ROOT_CONTAINER_ID}"
                                    order: 0
                                    type: layout
                                    uiElementType: "fields_container"
                                    settings: []
                                },
                                {
                                    id: "${elementId}"
                                    containerId: "some_container"
                                    order: 0
                                    uiElementType: "input"
                                    type: field
                                    settings: [
                                        {
                                            key: "attribute"
                                            value: "${attrCampaignStructureItems}"
                                        }
                                    ]
                                },
                            ]
                        }
                    ]
                }
            ) {
                id
                label
                library {
                    id
                }
                elements {
                    elements {
                        id
                        joinLibraryContext { 
                            multipleValues
                            linkedLibrary
                            mandatoryAttribute
                        }
                        attribute {
                            id
                            type
                        }
                    }
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.saveForm.id).toBe(formName);
        expect(res.data.data.saveForm.library.id).toBe(libCampaign);
        expect(res.data.data.saveForm.elements[0].elements).toHaveLength(2);

        const joinLibraryElement = res.data.data.saveForm.elements[0].elements.find(e => e.id === elementId);
        expect(joinLibraryElement).toBeDefined();
        expect(joinLibraryElement.attribute.id).toBe(attrCampaignStructureItems);
        expect(joinLibraryElement.joinLibraryContext.linkedLibrary).toBe(libThematic);
        expect(joinLibraryElement.joinLibraryContext.mandatoryAttribute).toBe(attrStructureItemThematic);
        expect(joinLibraryElement.joinLibraryContext.multipleValues).toBe(true);
    });

    describe('Empty campaign, some thematics exists, no structure items', () => {
        let thematic1: string;
        let thematic2: string;
        let thematic3: string;
        let campaign: string;

        beforeAll(async () => {
            thematic1 = await gqlCreateRecord(libThematic);
            thematic2 = await gqlCreateRecord(libThematic);
            thematic3 = await gqlCreateRecord(libThematic);
        });

        beforeEach(async () => {
            campaign = await gqlCreateRecord(libCampaign);
        });

        async function getStructureItemsRecords(structureItemId: string) {
            const res = await makeGraphQlCall(`query {
                records(
                    library: "${libStructureItem}",
                    filters: [ { field: "id", condition: ${AttributeCondition.EQUAL}, value: "${structureItemId}" }]
                ) {
                    list {
                        id
                        whoAmI {
                            library {
                                id
                            }
                        }
                        property (attribute: "${attrStructureItemThematic}") {
                            id_value
                            ... on LinkValue {
                                linkPayload: payload {
                                    id
                                }
                            }
                        }
                    }
                }
            }`);
            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();

            return res.data.data.records.list;
        }

        async function getCampaignRecordWithStructureItems(campaignId: string) {
            const res = await makeGraphQlCall(`query {
                records(
                    library: "${libCampaign}",
                    filters: [ { field: "id", condition: ${AttributeCondition.EQUAL}, value: "${campaignId}" }]
                ) {
                    list {
                        id
                        whoAmI {
                            library {
                                id
                            }
                        }
                        property (attribute: "${attrCampaignStructureItems}") {
                            id_value
                            ... on LinkValue {
                                linkPayload: payload {
                                    id
                                }
                            }
                        }
                    }
                }
            }`);

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();

            return res.data.data.records.list;
        }

        it('saveValue campaign_structure_items with thematic should create join structure_item records bound to that thematic', async () => {
            const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${libCampaign}",
                    recordId: "${campaign}",
                    attribute: "${attrCampaignStructureItems}",
                    value: {
                        payload: "${thematic1}"
                    }
                ) {
                    id_value
                    ... on LinkValue {
                        payload {
                            id
                        }
                    }
                }
            }`);

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data.saveValue[0].id_value).toBeTruthy();
            expect(res.data.data.saveValue[0].payload.id).toBeTruthy();

            const structureItemsRecords = await getStructureItemsRecords(res.data.data.saveValue[0].payload.id);
            expect(structureItemsRecords[0].id).toBe(res.data.data.saveValue[0].payload.id);
            expect(structureItemsRecords[0].whoAmI.library.id).toBe(libStructureItem);
            expect(structureItemsRecords[0].property[0].linkPayload.id).toBe(thematic1);
            expect(structureItemsRecords[0].property[0].id_value).toBeNull(); // simple link, no id_value

            const campaignRecords = await getCampaignRecordWithStructureItems(campaign);
            expect(campaignRecords[0].property[0].linkPayload.id).toBe(res.data.data.saveValue[0].payload.id);
            expect(campaignRecords[0].property[0].id_value).toBe(res.data.data.saveValue[0].id_value);
        });

        it('saveValueBatch campaign_structure_items with thematic should create join structure_item records bound to that thematic', async () => {
            const res = await makeGraphQlCall(`mutation {
                saveValueBatch(
                    library: "${libCampaign}",
                    recordId: "${campaign}",
                    values: [
                        {
                            attribute: "${attrCampaignStructureItems}",
                            payload: "${thematic1}"
                        },
                        {
                            attribute: "${attrCampaignStructureItems}",
                            payload: "${thematic2}"
                        }
                    ]
                ) {
                    values {
                        id_value
                        ... on LinkValue {
                            payload {
                                id
                            }
                        }
                   }
                }
            }`);

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data.saveValueBatch.values).toHaveLength(2);
            expect(res.data.data.saveValueBatch.values[0].id_value).toBeTruthy();
            expect(res.data.data.saveValueBatch.values[0].payload.id).toBeTruthy();
            expect(res.data.data.saveValueBatch.values[1].id_value).toBeTruthy();
            expect(res.data.data.saveValueBatch.values[1].payload.id).toBeTruthy();

            const structureItems1 = await getStructureItemsRecords(res.data.data.saveValueBatch.values[0].payload.id);
            expect(structureItems1[0].id).toBe(res.data.data.saveValueBatch.values[0].payload.id);
            expect(structureItems1[0].property[0].linkPayload.id).toBe(thematic1);

            const structureItems2 = await getStructureItemsRecords(res.data.data.saveValueBatch.values[1].payload.id);
            expect(structureItems2[0].id).toBe(res.data.data.saveValueBatch.values[1].payload.id);
            expect(structureItems2[0].property[0].linkPayload.id).toBe(thematic2);

            const campaignRecords = await getCampaignRecordWithStructureItems(campaign);
            expect(campaignRecords[0].id).toBe(campaign);
            expect(campaignRecords[0].property).toHaveLength(2);
            expect(campaignRecords[0].property.map(p => p.linkPayload.id)).toEqual(
                expect.arrayContaining(res.data.data.saveValueBatch.values.map(v => v.payload.id))
            );
            expect(campaignRecords[0].property[0].id_value).toBeTruthy();
            expect(campaignRecords[0].property[1].id_value).toBeTruthy();
        });

        describe('Campaign with 3 structure items', () => {
            let campaignStructureItems: Array<{id: string; id_value: string}>;

            beforeEach(async () => {
                const res = await makeGraphQlCall(`mutation {
                    saveValueBatch(
                        library: "${libCampaign}",
                        recordId: "${campaign}",
                        values: [
                            {
                                attribute: "${attrCampaignStructureItems}",
                                payload: "${thematic1}"
                            },
                            {
                                attribute: "${attrCampaignStructureItems}",
                                payload: "${thematic2}"
                            },
                            {
                                attribute: "${attrCampaignStructureItems}",
                                payload: "${thematic3}"
                            }
                        ]
                    ) {
                        values {
                            id_value
                            ... on LinkValue {
                                payload {
                                    id
                                }
                            }
                       }
                    }
                }`);

                expect(res.status).toBe(200);
                expect(res.data.errors).toBeUndefined();

                const campaignRecords = await getCampaignRecordWithStructureItems(campaign);
                expect(campaignRecords[0].property).toHaveLength(3);

                campaignStructureItems = res.data.data.saveValueBatch.values.map(v => ({
                    id: v.payload.id,
                    id_value: v.id_value
                }));
            });

            it('deleteValue campaign_structure_items should delete join structure_item records', async () => {
                const res = await makeGraphQlCall(`mutation {
                    deleteValue(
                        library: "${libCampaign}",
                        recordId: "${campaign}",
                        attribute: "${attrCampaignStructureItems}",
                        value: {
                            id_value: "${campaignStructureItems[0].id_value}",
                        }
                    ) {
                        id_value
                        ... on LinkValue {
                            payload {
                                id
                            }
                        }
                    }
                }`);

                expect(res.status).toBe(200);
                expect(res.data.errors).toBeUndefined();
                expect(res.data.data.deleteValue).toHaveLength(1);
                expect(res.data.data.deleteValue[0].id_value).toBe(campaignStructureItems[0].id_value);
                expect(res.data.data.deleteValue[0].payload.id).toBe(campaignStructureItems[0].id);

                const structureItems0 = await getStructureItemsRecords(campaignStructureItems[0].id);
                expect(structureItems0).toHaveLength(0); // should be deleted

                const campaignRecords = await getCampaignRecordWithStructureItems(campaign);
                expect(campaignRecords[0].property.map(p => p.linkPayload.id)).toEqual(
                    expect.arrayContaining([campaignStructureItems[1].id, campaignStructureItems[2].id])
                );
            });

            it('saveValueBatch deleteEmpty campaign_structure_items should delete join structure_item records', async () => {
                const res = await makeGraphQlCall(`mutation {
                    saveValueBatch(
                        library: "${libCampaign}",
                        recordId: "${campaign}",
                        deleteEmpty: true,
                        values: [
                            {
                                attribute: "${attrCampaignStructureItems}",
                                id_value: "${campaignStructureItems[0].id_value}",
                                value: null
                            },
                            {
                                attribute: "${attrCampaignStructureItems}",
                                id_value: "${campaignStructureItems[2].id_value}",
                                value: null
                            }
                        ]
                    ) {
                        values {
                            id_value
                            ... on LinkValue {
                                payload {
                                    id
                                }
                            }
                        }
                    }
                }`);

                expect(res.status).toBe(200);
                expect(res.data.errors).toBeUndefined();
                expect(res.data.data.saveValueBatch.values).toHaveLength(2);
                expect(res.data.data.saveValueBatch.values[0].id_value).toBe(campaignStructureItems[0].id_value);
                expect(res.data.data.saveValueBatch.values[0].payload.id).toBe(campaignStructureItems[0].id);
                expect(res.data.data.saveValueBatch.values[1].id_value).toBe(campaignStructureItems[2].id_value);
                expect(res.data.data.saveValueBatch.values[1].payload.id).toBe(campaignStructureItems[2].id);

                const structureItems0 = await getStructureItemsRecords(campaignStructureItems[0].id);
                expect(structureItems0).toHaveLength(0); // should be deleted

                const structureItems2 = await getStructureItemsRecords(campaignStructureItems[2].id);
                expect(structureItems2).toHaveLength(0); // should be deleted

                const campaignRecords = await getCampaignRecordWithStructureItems(campaign);
                expect(campaignRecords[0].property).toHaveLength(1);
                expect(campaignRecords[0].property.map(p => p.linkPayload.id)).toEqual(
                    expect.arrayContaining([campaignStructureItems[1].id])
                );
            });
        });
    });
});
