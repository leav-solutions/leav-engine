// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FORM_ROOT_CONTAINER_ID} from '@leav/utils';
import {AttributeTypes} from '../../../../_types/attribute';
import {LibraryBehavior} from '../../../../_types/library';
import {gqlCreateRecord, makeGraphQlCall} from '../e2eUtils';
import {AttributeCondition} from '../../../../_types/record';

describe('JoinLibraries', () => {
    describe('Structure Items with simple link to Thematic', () => {
        const libThematic = 'lib_thematic';
        const libCampaign = 'lib_campaigns';
        const libStructureItem = 'lib_structure_items'; // join library
        const attrStructureItemThematic = 'attribute_structure_items_thematic'; // simple link
        const attrCampaignStructureItems = 'attribute_campaign_structure_items'; // advanced link multi
        const formCampaign = 'form_campaigns';
        let thematic1: string;
        let thematic2: string;
        let thematic3: string;

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

            thematic1 = await gqlCreateRecord(libThematic);
            thematic2 = await gqlCreateRecord(libThematic);
            thematic3 = await gqlCreateRecord(libThematic);
        });

        afterAll(async () => {
            await makeGraphQlCall(`mutation {
                d1: deleteRecord(library: "${libThematic}", id: "${thematic1}") { id }
                d2: deleteRecord(library: "${libThematic}", id: "${thematic2}") { id }
                d3: deleteRecord(library: "${libThematic}", id: "${thematic3}") { id }
                d10: deleteLibrary(id: "${libThematic}") { id }
                d11: deleteLibrary(id: "${libStructureItem}") { id }
            }`);
        });

        describe('Campaign with advanced link structure_items', () => {
            let campaign: string;

            beforeAll(async () => {
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

            afterAll(async () => {
                await makeGraphQlCall(`mutation {
                    d10: deleteForm(library: "${libCampaign}", id: "${formCampaign}") { id }
                    d20: deleteLibrary(id: "${libCampaign}") { id }
                    d30: deleteAttribute(id: "${attrCampaignStructureItems}") { id }
                }`);
            });

            beforeEach(async () => {
                campaign = await gqlCreateRecord(libCampaign);
            });

            afterEach(async () => {
                await makeGraphQlCall(`mutation {
                    deleteRecord(library: "${libCampaign}", id: "${campaign}") { id }
                }`);
            });

            it('should add joinLibraryContext in campaign form structure item element', async () => {
                const elementId = '123456';

                const res = await createCampaignFormWithStructureItem(elementId);
                expect(res.data.data.saveForm.id).toBe(formCampaign);
                expect(res.data.data.saveForm.library.id).toBe(libCampaign);
                expect(res.data.data.saveForm.elements[0].elements).toHaveLength(2);

                const joinLibraryElement = res.data.data.saveForm.elements[0].elements.find(e => e.id === elementId);
                expect(joinLibraryElement).toBeDefined();
                expect(joinLibraryElement.attribute.id).toBe(attrCampaignStructureItems);
                expect(joinLibraryElement.joinLibraryContext.mandatoryAttribute.linked_library.id).toBe(libThematic);
                expect(joinLibraryElement.joinLibraryContext.mandatoryAttribute.id).toBe(attrStructureItemThematic);
            });

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

                const structureItems1 = await getStructureItemsRecords(
                    res.data.data.saveValueBatch.values[0].payload.id,
                );
                expect(structureItems1[0].id).toBe(res.data.data.saveValueBatch.values[0].payload.id);
                expect(structureItems1[0].property[0].linkPayload.id).toBe(thematic1);

                const structureItems2 = await getStructureItemsRecords(
                    res.data.data.saveValueBatch.values[1].payload.id,
                );
                expect(structureItems2[0].id).toBe(res.data.data.saveValueBatch.values[1].payload.id);
                expect(structureItems2[0].property[0].linkPayload.id).toBe(thematic2);

                const campaignRecords = await getCampaignRecordWithStructureItems(campaign);
                expect(campaignRecords[0].id).toBe(campaign);
                expect(campaignRecords[0].property).toHaveLength(2);
                expect(campaignRecords[0].property.map(p => p.linkPayload.id)).toEqual(
                    expect.arrayContaining(res.data.data.saveValueBatch.values.map(v => v.payload.id)),
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
                        id_value: v.id_value,
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
                        expect.arrayContaining([campaignStructureItems[1].id, campaignStructureItems[2].id]),
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
                        expect.arrayContaining([campaignStructureItems[1].id]),
                    );
                });
            });

            describe('Existing structure item', () => {
                let structureItem: string;

                beforeAll(async () => {
                    structureItem = await gqlCreateRecord(libStructureItem);
                });

                it('saveValue campaign_structure_items with existing structure item should still be possible', async () => {
                    const res = await makeGraphQlCall(`mutation {
                        saveValue(
                            library: "${libCampaign}",
                            recordId: "${campaign}",
                            attribute: "${attrCampaignStructureItems}",
                            value: {
                                payload: "${structureItem}"
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
                    expect(res.data.data.saveValue[0].payload.id).toBe(structureItem);
                });

                afterAll(async () => {
                    await makeGraphQlCall(`mutation {
                        deleteRecord(library: "${libStructureItem}", id: "${structureItem}") { id }
                    }`);
                });
            });
        });

        describe('Campaign with simple link structure_items', () => {
            let campaign: string;

            beforeAll(async () => {
                await makeGraphQlCall(`mutation {
                    saveAttribute(
                        attribute: {
                            id: "${attrCampaignStructureItems}",
                            type: ${AttributeTypes.SIMPLE_LINK},
                            format: text,
                            linked_library: "${libStructureItem}",
                            label: {en: "Thematic"},
                        }
                    ) { id }
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

            afterAll(async () => {
                await makeGraphQlCall(`mutation {
                    d10: deleteForm(library: "${libCampaign}", id: "${formCampaign}") { id }
                    d20: deleteLibrary(id: "${libCampaign}") { id }
                    d30: deleteAttribute(id: "${attrCampaignStructureItems}") { id }
                }`);
            });

            beforeEach(async () => {
                campaign = await gqlCreateRecord(libCampaign);
            });

            afterEach(async () => {
                await makeGraphQlCall(`mutation {
                    deleteRecord(library: "${libCampaign}", id: "${campaign}") { id }
                }`);
            });

            it('should not add joinLibraryContext in campaign form structure item element', async () => {
                const elementId = '123456';
                const res = await createCampaignFormWithStructureItem(elementId);
                expect(res.data.data.saveForm.id).toBe(formCampaign);
                expect(res.data.data.saveForm.library.id).toBe(libCampaign);
                expect(res.data.data.saveForm.elements[0].elements).toHaveLength(2);

                const joinLibraryElement = res.data.data.saveForm.elements[0].elements.find(e => e.id === elementId);
                expect(joinLibraryElement).toBeDefined();
                expect(joinLibraryElement.attribute.id).toBe(attrCampaignStructureItems);
                expect(joinLibraryElement.joinLibraryContext).toBeNull();
            });

            it('saveValue campaign_structure_items with thematic should not create join structure_item records bound to that thematic', async () => {
                await expect(
                    makeGraphQlCall(`mutation {
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
                }`),
                ).rejects.toThrow(/Unknown record/);
            });
        });

        describe('Campaign with advanced reverse link of structure_items simple link', () => {
            let campaign: string;
            const attrStructureItemsCampaign = 'attribute_structure_items_campaign'; // simple link
            beforeAll(async () => {
                await makeGraphQlCall(`mutation {
                    saveAttribute(
                        attribute: {
                            id: "${attrStructureItemsCampaign}",
                            type: ${AttributeTypes.SIMPLE_LINK},
                            format: text,
                            linked_library: "${libCampaign}",
                            label: {en: "Campaign"},
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
                            reverse_link: "${attrStructureItemsCampaign}",
                            label: {en: "Thematic"},
                            multiple_values: true
                        }
                    ) { id }
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

                await makeGraphQlCall(`mutation {
                    saveLibrary(library: {
                        id: "${libStructureItem}", 
                        attributes: [
                            "id",
                            "${attrStructureItemThematic}",
                            "${attrStructureItemsCampaign}"
                        ],
                    }) { id }
                }`);
            });

            afterAll(async () => {
                await makeGraphQlCall(`mutation {
                    d1: saveLibrary(library: {
                        id: "${libStructureItem}", 
                        attributes: [
                            "id",
                            "${attrStructureItemThematic}",
                        ],
                    }) { id }
                    d10: deleteForm(library: "${libCampaign}", id: "${formCampaign}") { id }
                    d20: deleteLibrary(id: "${libCampaign}") { id }
                    d30: deleteAttribute(id: "${attrCampaignStructureItems}") { id }
                }`);
            });

            beforeEach(async () => {
                campaign = await gqlCreateRecord(libCampaign);
            });

            afterEach(async () => {
                await makeGraphQlCall(`mutation {
                    deleteRecord(library: "${libCampaign}", id: "${campaign}") { id }
                }`);
            });

            it('should add joinLibraryContext in campaign form structure item element', async () => {
                const elementId = '123456';

                const res = await createCampaignFormWithStructureItem(elementId);
                expect(res.data.data.saveForm.id).toBe(formCampaign);
                expect(res.data.data.saveForm.library.id).toBe(libCampaign);
                expect(res.data.data.saveForm.elements[0].elements).toHaveLength(2);

                const joinLibraryElement = res.data.data.saveForm.elements[0].elements.find(e => e.id === elementId);
                expect(joinLibraryElement).toBeDefined();
                expect(joinLibraryElement.attribute.id).toBe(attrCampaignStructureItems);
                expect(joinLibraryElement.joinLibraryContext.mandatoryAttribute.linked_library.id).toBe(libThematic);
                expect(joinLibraryElement.joinLibraryContext.mandatoryAttribute.id).toBe(attrStructureItemThematic);
            });

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
                expect(campaignRecords[0].property[0].id_value).toBe(campaignRecords[0].property[0].linkPayload.id); // because reverse linked or simple link

                const resStructureItem = await makeGraphQlCall(`query {
                    records(
                        library: "${libStructureItem}",
                        filters: [ { field: "id", condition: ${AttributeCondition.EQUAL}, value: "${res.data.data.saveValue[0].payload.id}" }]
                    ) {
                        list {
                            property (attribute: "${attrStructureItemsCampaign}") {
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
                expect(resStructureItem.status).toBe(200);
                expect(resStructureItem.data.errors).toBeUndefined();
                expect(resStructureItem.data.data.records.list[0].property[0].id_value).toBeFalsy(); // simple link
                expect(resStructureItem.data.data.records.list[0].property[0].linkPayload.id).toBe(campaign);
            });

            describe('Campaign with 2 structure items', () => {
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
                    expect(campaignRecords[0].property).toHaveLength(2);

                    campaignStructureItems = res.data.data.saveValueBatch.values.map(v => ({
                        id: v.payload.id,
                        id_value: v.id_value,
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
                        expect.arrayContaining([campaignStructureItems[1].id]),
                    );
                });
            });
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

        async function createCampaignFormWithStructureItem(elementId: string) {
            const res = await makeGraphQlCall(`mutation {
                saveForm(
                    form: {
                        id: "${formCampaign}"
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
                                mandatoryAttribute {
                                    id
                                    ... on LinkAttribute {
                                        linked_library {
                                            id
                                        }
                                    }
                                }
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
            return res;
        }
    });

    describe('Structure Items with mono-valued advanced link to Thematic', () => {
        // add _bis suffix to avoid conflicts with previous tests !
        const libThematic = 'lib_thematic_bis';
        const libCampaign = 'lib_campaigns_bis';
        const libStructureItem = 'lib_structure_items_bis'; // join library
        const attrStructureItemThematicBis = 'attribute_structure_items_thematic_bis'; // simple link
        const attrCampaignStructureItemsBis = 'attribute_campaign_structure_items_bis'; // advanced link multi
        const formCampaign = 'form_campaigns_bis';
        let thematic1: string;
        let thematic2: string;

        beforeAll(async () => {
            await makeGraphQlCall(`mutation {
                saveAttribute(
                    attribute: {
                        id: "${attrStructureItemThematicBis}",
                        type: ${AttributeTypes.ADVANCED_LINK},
                        format: text,
                        linked_library: "${libThematic}",
                        label: {en: "Thematic"},
                        multiple_values: false
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
                        "${attrStructureItemThematicBis}",
                    ],
                    mandatoryAttribute: "${attrStructureItemThematicBis}"
                }) { id }
            }`);

            thematic1 = await gqlCreateRecord(libThematic);
            thematic2 = await gqlCreateRecord(libThematic);
        });

        afterAll(async () => {
            await makeGraphQlCall(`mutation {
                d1: deleteRecord(library: "${libThematic}", id: "${thematic1}") { id }
                d2: deleteRecord(library: "${libThematic}", id: "${thematic2}") { id }
                d10: deleteLibrary(id: "${libThematic}") { id }
                d11: deleteLibrary(id: "${libStructureItem}") { id }
            }`);
        });

        describe('Campaign with advanced link structure_items', () => {
            let campaign: string;

            beforeAll(async () => {
                await makeGraphQlCall(`mutation {
                    saveAttribute(
                        attribute: {
                            id: "${attrCampaignStructureItemsBis}",
                            type: ${AttributeTypes.ADVANCED_LINK},
                            format: text,
                            linked_library: "${libStructureItem}",
                            label: {en: "Thematic"},
                            multiple_values: true
                        }
                    ) { id }
                }`);

                await makeGraphQlCall(`mutation {
                    saveLibrary(library: {
                        id: "${libCampaign}", 
                        label: {en: "Campaigns"}, 
                        behavior: ${LibraryBehavior.STANDARD},
                        attributes: [
                            "id",
                            "${attrCampaignStructureItemsBis}",
                        ]
                    }) { id }
                }`);
            });

            afterAll(async () => {
                await makeGraphQlCall(`mutation {
                    d10: deleteForm(library: "${libCampaign}", id: "${formCampaign}") { id }
                    d20: deleteLibrary(id: "${libCampaign}") { id }
                    d30: deleteAttribute(id: "${attrCampaignStructureItemsBis}") { id }
                }`);
            });

            beforeEach(async () => {
                campaign = await gqlCreateRecord(libCampaign);
            });

            afterEach(async () => {
                await makeGraphQlCall(`mutation {
                    deleteRecord(library: "${libCampaign}", id: "${campaign}") { id }
                }`);
            });

            it('should add joinLibraryContext in campaign form structure item element', async () => {
                const elementId = '123456';

                const res = await createCampaignFormWithStructureItem(elementId);
                expect(res.data.data.saveForm.id).toBe(formCampaign);
                expect(res.data.data.saveForm.library.id).toBe(libCampaign);
                expect(res.data.data.saveForm.elements[0].elements).toHaveLength(2);

                const joinLibraryElement = res.data.data.saveForm.elements[0].elements.find(e => e.id === elementId);
                expect(joinLibraryElement).toBeDefined();
                expect(joinLibraryElement.attribute.id).toBe(attrCampaignStructureItemsBis);
                expect(joinLibraryElement.joinLibraryContext.mandatoryAttribute.linked_library.id).toBe(libThematic);
                expect(joinLibraryElement.joinLibraryContext.mandatoryAttribute.id).toBe(attrStructureItemThematicBis);
            });

            it('saveValue campaign_structure_items with thematic should create join structure_item records bound to that thematic', async () => {
                const res = await makeGraphQlCall(`mutation {
                    saveValue(
                        library: "${libCampaign}",
                        recordId: "${campaign}",
                        attribute: "${attrCampaignStructureItemsBis}",
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
                expect(structureItemsRecords[0].property[0].id_value).toBeTruthy(); // simple link, no id_value

                const campaignRecords = await getCampaignRecordWithStructureItems(campaign);
                expect(campaignRecords[0].property[0].linkPayload.id).toBe(res.data.data.saveValue[0].payload.id);
                expect(campaignRecords[0].property[0].id_value).toBe(res.data.data.saveValue[0].id_value);
            });

            describe('Campaign with 2 structure items', () => {
                let campaignStructureItems: Array<{id: string; id_value: string}>;

                beforeEach(async () => {
                    const res = await makeGraphQlCall(`mutation {
                        saveValueBatch(
                            library: "${libCampaign}",
                            recordId: "${campaign}",
                            values: [
                                {
                                    attribute: "${attrCampaignStructureItemsBis}",
                                    payload: "${thematic1}"
                                },
                                {
                                    attribute: "${attrCampaignStructureItemsBis}",
                                    payload: "${thematic2}"
                                },
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
                    expect(campaignRecords[0].property).toHaveLength(2);

                    campaignStructureItems = res.data.data.saveValueBatch.values.map(v => ({
                        id: v.payload.id,
                        id_value: v.id_value,
                    }));
                });

                it('deleteValue campaign_structure_items should delete join structure_item records', async () => {
                    const res = await makeGraphQlCall(`mutation {
                        deleteValue(
                            library: "${libCampaign}",
                            recordId: "${campaign}",
                            attribute: "${attrCampaignStructureItemsBis}",
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
                        expect.arrayContaining([campaignStructureItems[1].id]),
                    );
                });
            });

            describe('Existing structure item', () => {
                let structureItem: string;

                beforeAll(async () => {
                    structureItem = await gqlCreateRecord(libStructureItem);
                });

                it('saveValue campaign_structure_items with existing structure item should still be possible', async () => {
                    const res = await makeGraphQlCall(`mutation {
                        saveValue(
                            library: "${libCampaign}",
                            recordId: "${campaign}",
                            attribute: "${attrCampaignStructureItemsBis}",
                            value: {
                                payload: "${structureItem}"
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
                    expect(res.data.data.saveValue[0].payload.id).toBe(structureItem);
                });

                afterAll(async () => {
                    await makeGraphQlCall(`mutation {
                        deleteRecord(library: "${libStructureItem}", id: "${structureItem}") { id }
                    }`);
                });
            });
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
                        property (attribute: "${attrStructureItemThematicBis}") {
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
                        property (attribute: "${attrCampaignStructureItemsBis}") {
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

        async function createCampaignFormWithStructureItem(elementId: string) {
            const res = await makeGraphQlCall(`mutation {
                saveForm(
                    form: {
                        id: "${formCampaign}"
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
                                                value: "${attrCampaignStructureItemsBis}"
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
                                mandatoryAttribute {
                                    id
                                    ... on LinkAttribute {
                                        linked_library {
                                            id
                                        }
                                    }
                                }
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
            return res;
        }
    });

    describe('Structure Items Categories with tree link to Category', () => {
        const libCategories = 'lib_categories';
        const treeCategories = 'tree_categories';
        const libStructureItemCategories = 'lib_structure_items_categories'; // join library
        const libStructureItem = 'lib_structure_items';
        const attrStructureItemCategories = 'attribute_structure_items_categories'; // advanced link multi
        const attrStructureItemCategoriesCategory = 'attribute_structure_items_categories_category'; // tree link mono
        const formStructureItem = 'form_structure_items';
        let category1: string;
        let category2: string;
        let categoryNode1: string;
        let categoryNode2: string;

        beforeAll(async () => {
            await makeGraphQlCall(`mutation {
                saveLibrary(library: {
                    id: "${libCategories}", 
                    label: {en: "Categories"},
                    behavior: ${LibraryBehavior.STANDARD}
                }) { id }
            }`);

            await makeGraphQlCall(`mutation {
                saveTree(
                    tree: {
                        id: "${treeCategories}",
                        label: {en: "Test tree"},
                        libraries: [{
                            library: "${libCategories}",
                            settings: {allowMultiplePositions: true, allowedAtRoot: true,  allowedChildren: ["__all__"]}
                        }]
                    }
                ) {
                    id
                }
            }`);

            await makeGraphQlCall(`mutation {
                saveAttribute(
                    attribute: {
                        id: "${attrStructureItemCategoriesCategory}",
                        type: ${AttributeTypes.TREE},
                        format: text,
                        linked_tree: "${treeCategories}",
                        label: {en: "Categories"},
                        multiple_values: false
                    }
                ) { id }
            }`);

            await makeGraphQlCall(`mutation {
                saveLibrary(library: {
                    id: "${libStructureItemCategories}", 
                    label: {en: "Structure Items Categories"}, 
                    behavior: ${LibraryBehavior.JOIN},
                    attributes: [
                        "id",
                        "${attrStructureItemCategoriesCategory}",
                    ],
                    mandatoryAttribute: "${attrStructureItemCategoriesCategory}"
                }) { id }
            }`);

            category1 = await gqlCreateRecord(libCategories);
            category2 = await gqlCreateRecord(libCategories);
            categoryNode1 = (
                await makeGraphQlCall(`mutation {
                treeAddElement(
                    treeId: "${treeCategories}", element: {id: "${category1}", library: "${libCategories}"}, order: 1
                ) {id},
            }`)
            ).data.data.treeAddElement.id;
            categoryNode2 = (
                await makeGraphQlCall(`mutation {
                treeAddElement(
                    treeId: "${treeCategories}", element: {id: "${category2}", library: "${libCategories}"}, order: 0
                ) {id},
            }`)
            ).data.data.treeAddElement.id;
        });

        afterAll(async () => {
            await makeGraphQlCall(`mutation {
                d1: deleteRecord(library: "${libCategories}", id: "${category1}") { id }
                d2: deleteRecord(library: "${libCategories}", id: "${category2}") { id }
                d10: deleteLibrary(id: "${libStructureItemCategories}") { id }
                d20: deleteAttribute(id: "${attrStructureItemCategoriesCategory}") { id }
                d30: deleteTree(id: "${treeCategories}") { id }
                d40: deleteLibrary(id: "${libCategories}") { id }
            }`);
        });

        describe('Structure item with advanced link structure_items_categories', () => {
            let structureItem: string;

            beforeAll(async () => {
                await makeGraphQlCall(`mutation {
                    saveAttribute(
                        attribute: {
                            id: "${attrStructureItemCategories}",
                            type: ${AttributeTypes.ADVANCED_LINK},
                            format: text,
                            linked_library: "${libStructureItemCategories}",
                            label: {en: "Categories"},
                            multiple_values: true
                        }
                    ) { id }
                }`);

                // in true scenario, this is a join library
                await makeGraphQlCall(`mutation {
                    saveLibrary(library: {
                        id: "${libStructureItem}", 
                        label: {en: "Campaigns"}, 
                        behavior: ${LibraryBehavior.STANDARD},
                        attributes: [
                            "id",
                            "${attrStructureItemCategories}",
                        ]
                    }) { id }
                }`);
            });

            afterAll(async () => {
                await makeGraphQlCall(`mutation {
                    d10: deleteForm(library: "${libStructureItem}", id: "${formStructureItem}") { id }
                    d20: deleteLibrary(id: "${libStructureItem}") { id }
                    d30: deleteAttribute(id: "${attrStructureItemCategories}") { id }
                }`);
            });

            beforeEach(async () => {
                structureItem = await gqlCreateRecord(libStructureItem);
            });

            afterEach(async () => {
                await makeGraphQlCall(`mutation {
                    deleteRecord(library: "${libStructureItem}", id: "${structureItem}") { id }
                }`);
            });

            it('should add joinLibraryContext in structure_item form categories item element', async () => {
                const elementId = '123456';

                const res = await createStructureItemFormWithStructureItemCategories(elementId);
                expect(res.data.data.saveForm.id).toBe(formStructureItem);
                expect(res.data.data.saveForm.library.id).toBe(libStructureItem);
                expect(res.data.data.saveForm.elements[0].elements).toHaveLength(2);

                const joinLibraryElement = res.data.data.saveForm.elements[0].elements.find(e => e.id === elementId);
                expect(joinLibraryElement).toBeDefined();
                expect(joinLibraryElement.attribute.id).toBe(attrStructureItemCategories);
                expect(joinLibraryElement.joinLibraryContext.mandatoryAttribute.linked_tree.id).toBe(treeCategories);
                expect(joinLibraryElement.joinLibraryContext.mandatoryAttribute.id).toBe(
                    attrStructureItemCategoriesCategory,
                );
            });

            it('saveValue structure_items_categories with category should create join structure_item_categories record bound to that category', async () => {
                const res = await makeGraphQlCall(`mutation {
                    saveValue(
                        library: "${libStructureItem}",
                        recordId: "${structureItem}",
                        attribute: "${attrStructureItemCategories}",
                        value: {
                            payload: "${categoryNode1}"
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

                const structureItemsRecords = await getStructureItemsCategoriesRecords(
                    res.data.data.saveValue[0].payload.id,
                );
                expect(structureItemsRecords[0].id).toBe(res.data.data.saveValue[0].payload.id);
                expect(structureItemsRecords[0].whoAmI.library.id).toBe(libStructureItemCategories);
                expect(structureItemsRecords[0].property[0].treePayload.id).toBe(categoryNode1);
                expect(structureItemsRecords[0].property[0].treePayload.record.id).toBe(category1);
                expect(structureItemsRecords[0].property[0].id_value).toBeTruthy();

                const structureItemRecords = await getStructureItemWithCategories(structureItem);
                expect(structureItemRecords[0].property[0].linkPayload.id).toBe(res.data.data.saveValue[0].payload.id);
                expect(structureItemRecords[0].property[0].id_value).toBe(res.data.data.saveValue[0].id_value);
            });

            describe('Structure item with 2 structure item categories', () => {
                let structureItemsCategories: Array<{id: string; id_value: string}>;

                beforeEach(async () => {
                    const res = await makeGraphQlCall(`mutation {
                        saveValueBatch(
                            library: "${libStructureItem}",
                            recordId: "${structureItem}",
                            values: [
                                {
                                    attribute: "${attrStructureItemCategories}",
                                    payload: "${categoryNode1}"
                                },
                                {
                                    attribute: "${attrStructureItemCategories}",
                                    payload: "${categoryNode2}"
                                },
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

                    const structureItemRecords = await getStructureItemWithCategories(structureItem);
                    expect(structureItemRecords[0].property).toHaveLength(2);

                    structureItemsCategories = res.data.data.saveValueBatch.values.map(v => ({
                        id: v.payload.id,
                        id_value: v.id_value,
                    }));
                });

                it('deleteValue structure_item_categories should delete join structure_item_category records', async () => {
                    const res = await makeGraphQlCall(`mutation {
                        deleteValue(
                            library: "${libStructureItem}",
                            recordId: "${structureItem}",
                            attribute: "${attrStructureItemCategories}",
                            value: {
                                id_value: "${structureItemsCategories[0].id_value}",
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
                    expect(res.data.data.deleteValue[0].id_value).toBe(structureItemsCategories[0].id_value);
                    expect(res.data.data.deleteValue[0].payload.id).toBe(structureItemsCategories[0].id);

                    const structureItemsRecords = await getStructureItemsCategoriesRecords(
                        res.data.data.deleteValue[0].payload.id,
                    );
                    expect(structureItemsRecords).toHaveLength(0); // should be deleted

                    const structureItemRecords = await getStructureItemWithCategories(structureItem);
                    expect(structureItemRecords[0].property).toHaveLength(1);
                    expect(structureItemRecords[0].property[0].linkPayload.id).toBe(structureItemsCategories[1].id);
                    expect(structureItemRecords[0].property[0].id_value).toBe(structureItemsCategories[1].id_value);
                });
            });

            describe('Existing structure item category', () => {
                let structureItemCategory: string;

                beforeAll(async () => {
                    structureItemCategory = await gqlCreateRecord(libStructureItemCategories);
                });

                it('saveValue campaign_structure_items with existing structure item should still be possible', async () => {
                    const res = await makeGraphQlCall(`mutation {
                        saveValue(
                            library: "${libStructureItem}",
                            recordId: "${structureItem}",
                            attribute: "${attrStructureItemCategories}",
                            value: {
                                payload: "${structureItemCategory}"
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
                    expect(res.data.data.saveValue[0].payload.id).toBe(structureItemCategory);
                });

                afterAll(async () => {
                    await makeGraphQlCall(`mutation {
                        deleteRecord(library: "${libStructureItemCategories}", id: "${structureItemCategory}") { id }
                    }`);
                });
            });
        });

        async function getStructureItemsCategoriesRecords(structureItemCategoryId: string) {
            const res = await makeGraphQlCall(`query {
                records(
                    library: "${libStructureItemCategories}",
                    filters: [ { field: "id", condition: ${AttributeCondition.EQUAL}, value: "${structureItemCategoryId}" }]
                ) {
                    list {
                        id
                        whoAmI {
                            library {
                                id
                            }
                        }
                        property (attribute: "${attrStructureItemCategoriesCategory}") {
                            id_value
                            ... on TreeValue {
                                treePayload: payload {
                                    id
                                    record {
                                        id
                                    }
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

        async function getStructureItemWithCategories(structureItemId: string) {
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
                        property (attribute: "${attrStructureItemCategories}") {
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

        async function createStructureItemFormWithStructureItemCategories(elementId: string) {
            const res = await makeGraphQlCall(`mutation {
                saveForm(
                    form: {
                        id: "${formStructureItem}"
                        library: "${libStructureItem}"
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
                                                value: "${attrStructureItemCategories}"
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
                                mandatoryAttribute {
                                    id
                                    ... on TreeAttribute {
                                        linked_tree {
                                            id
                                        }
                                    }
                                }
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
            return res;
        }
    });
});
