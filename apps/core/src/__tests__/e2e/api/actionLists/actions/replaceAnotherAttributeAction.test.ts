import {type ILinkValue, type IStandardValue, type ITreeValue} from '../../../../../_types/value';
import {type ActionsListConfig, ActionsListEvents} from '../../../../../_types/actionsList';
import {AttributeFormats, AttributeTypes} from '../../../../../_types/attribute';
import {
    adminUserSdk,
    gqlAddElemToTree,
    gqlCreateRecord,
    gqlDeleteValue,
    gqlSaveAttribute,
    gqlSaveTree,
    gqlSaveValueBis,
    makeGraphQlCall,
} from '../../e2eUtils';

describe('replaceAnotherAttributeAction', () => {
    const libraryId = 'test_replace_another_attribute_action_library';
    const attrSimpleId = 'test_replace_another_attribute_action_simple_attr';
    const testTreeLibraryName = 'test_replace_another_attribute_action_tree_library';
    const testTreeName = 'test_replace_another_attribute_action_attr_tree';

    let treeNodeRecord1Id: string;
    let treeNodeRecord2Id: string;
    let treeNodeRecord3Id: string;
    let treeNode1Id: string;
    let treeNode2Id: string;
    let treeNode3Id: string;
    let parentRecordId: string;

    beforeAll(async () => {
        await adminUserSdk.SaveLibrary({library: {id: testTreeLibraryName, label: {en: 'Test node lib'}}});
        await gqlSaveTree(testTreeName, 'Attribute tree', [testTreeLibraryName]);

        treeNodeRecord1Id = await gqlCreateRecord(testTreeLibraryName);
        treeNodeRecord2Id = await gqlCreateRecord(testTreeLibraryName);
        treeNodeRecord3Id = await gqlCreateRecord(testTreeLibraryName);

        treeNode1Id = await gqlAddElemToTree(testTreeName, {id: treeNodeRecord1Id, library: testTreeLibraryName});
        treeNode2Id = await gqlAddElemToTree(testTreeName, {id: treeNodeRecord2Id, library: testTreeLibraryName});
        treeNode3Id = await gqlAddElemToTree(testTreeName, {id: treeNodeRecord3Id, library: testTreeLibraryName});
    });

    describe('on record itself', () => {
        const attrSimpleTriggerId = 'test_replace_another_attribute_action_simple_attr_trigger';

        beforeAll(async () => {
            await gqlSaveAttribute({
                id: attrSimpleId,
                label: 'Test register another attribute action simple attr',
                type: AttributeTypes.SIMPLE,
            });
            await gqlSaveAttribute({
                id: attrSimpleTriggerId,
                label: 'Test register another attribute action simple attr trigger',
                type: AttributeTypes.SIMPLE,
                actionsList: {
                    [ActionsListEvents.SAVE_VALUE]: [
                        {
                            id: 'validateFormat',
                            name: 'Validate Format',
                        },
                    ],
                    [ActionsListEvents.POST_SAVE_VALUE]: [
                        {
                            id: 'replaceAnotherAttribute',
                            name: 'replaceAnotherAttribute',
                            params: [
                                {
                                    name: 'attributePath',
                                    value: attrSimpleId,
                                },
                            ],
                        },
                    ],
                },
            });
            await adminUserSdk.SaveLibrary({
                library: {id: libraryId, label: {en: 'Test node lib'}, attributes: [attrSimpleId, attrSimpleTriggerId]},
            });
        });

        beforeEach(async () => {
            parentRecordId = await gqlCreateRecord(libraryId);
        });

        it('set trigger value should update the other attribute value', async () => {
            await gqlSaveValueBis(attrSimpleTriggerId, libraryId, parentRecordId, {payload: 'Trigger Value'});

            const values = await getStandardAttributeValues(attrSimpleId, libraryId, parentRecordId);
            expect(values.length).toBe(1);
            expect(values[0].payload).toBe('Trigger Value');
        });
    });

    describe('on remote record through simple link attribute', () => {
        let linkedRecordId: string;
        const linkedLibraryId = 'test_replace_another_attribute_action_link_library';
        const attrSimpleLinkId = 'test_replace_another_attribute_action_simple_link_attr';
        const attrSimpleTriggerId = 'test_replace_another_attribute_action_simple_attr_trigger';

        const saveTriggerLibrary = async (triggerAttributeId: string) => {
            await gqlSaveAttribute({
                id: attrSimpleLinkId,
                label: 'Test register another attribute action simple attr trigger',
                type: AttributeTypes.SIMPLE_LINK,
                linkedLibrary: linkedLibraryId,
            });
            await adminUserSdk.SaveLibrary({
                library: {
                    id: libraryId,
                    label: {en: 'Test node lib'},
                    attributes: [attrSimpleLinkId, triggerAttributeId],
                },
            });
        };

        describe('register simple attribute', () => {
            beforeAll(async () => {
                await gqlSaveAttribute({
                    id: attrSimpleId,
                    label: 'Test register another attribute action simple attr',
                    type: AttributeTypes.SIMPLE,
                });
                await adminUserSdk.SaveLibrary({
                    library: {id: linkedLibraryId, label: {en: 'Test node lib'}, attributes: [attrSimpleId]},
                });

                await gqlSaveAttribute({
                    id: attrSimpleTriggerId,
                    label: 'Test register another attribute action simple attr trigger',
                    type: AttributeTypes.SIMPLE,
                    actionsList: {
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                id: 'validateFormat',
                                name: 'Validate Format',
                            },
                        ],
                        [ActionsListEvents.POST_SAVE_VALUE]: [
                            {
                                id: 'replaceAnotherAttribute',
                                name: 'replaceAnotherAttribute',
                                params: [
                                    {
                                        name: 'attributePath',
                                        value: `${attrSimpleLinkId}.${attrSimpleId}`,
                                    },
                                ],
                            },
                        ],
                    },
                });
                await saveTriggerLibrary(attrSimpleTriggerId);
            });

            beforeEach(async () => {
                linkedRecordId = await gqlCreateRecord(linkedLibraryId);
                parentRecordId = await gqlCreateRecord(libraryId);
                await gqlSaveValueBis(attrSimpleLinkId, libraryId, parentRecordId, {payload: linkedRecordId});
            });

            it('set trigger value should update the linked attribute value', async () => {
                await gqlSaveValueBis(attrSimpleTriggerId, libraryId, parentRecordId, {
                    payload: 'Trigger Value through link',
                });
                const values = await getStandardAttributeValues(attrSimpleId, linkedLibraryId, linkedRecordId);
                expect(values.length).toBe(1);
                expect(values[0].payload).toBe('Trigger Value through link');
            });
        });
    });

    describe('on remote record through advanced multiple link attribute with inheritanceCalculation', () => {
        let childRecordId1: string;
        let childRecordId2: string;
        const linkedLibraryId = 'test_replace_another_attribute_action_link_library';
        const attrChildAdvancedLinkId = 'test_replace_another_attribute_action_advanced_multiple_link_attr';

        const saveTriggerLibrary = async (triggerAttributeId: string) => {
            await gqlSaveAttribute({
                id: attrChildAdvancedLinkId,
                label: 'Test register another attribute action advanced multiple link attr',
                type: AttributeTypes.ADVANCED_LINK,
                multipleValues: true,
                linkedLibrary: linkedLibraryId,
            });
            await adminUserSdk.SaveLibrary({
                library: {
                    id: libraryId,
                    label: {en: 'Test node lib'},
                    attributes: [attrChildAdvancedLinkId, triggerAttributeId],
                },
            });
        };

        const attributeActionListConfig = (
            inheritanceAttributeId: string,
            replaceAttributePath: string,
        ): ActionsListConfig => ({
            [ActionsListEvents.SAVE_VALUE]: [
                {
                    id: 'validateFormat',
                    name: 'Validate Format',
                },
            ],
            [ActionsListEvents.POST_SAVE_VALUE]: [
                {
                    id: 'inheritanceCalculation',
                    name: 'inheritanceCalculation',
                    params: [
                        {
                            name: 'Formula',
                            value: `getValue(${inheritanceAttributeId})`,
                        },
                        {
                            name: 'Return only calculated value',
                            value: 'true',
                        },
                    ],
                },
                {
                    id: 'replaceAnotherAttribute',
                    name: 'replaceAnotherAttribute',
                    params: [
                        {
                            name: 'attributePath',
                            value: `${replaceAttributePath}`,
                        },
                    ],
                },
            ],
            [ActionsListEvents.POST_DELETE_VALUE]: [
                {
                    id: 'inheritanceCalculation',
                    name: 'inheritanceCalculation',
                    params: [
                        {
                            name: 'Formula',
                            value: `getValue(${inheritanceAttributeId})`,
                        },
                        {
                            name: 'Return only calculated value',
                            value: 'true',
                        },
                    ],
                },
                {
                    id: 'replaceAnotherAttribute',
                    name: 'replaceAnotherAttribute',
                    params: [
                        {
                            name: 'attributePath',
                            value: `${replaceAttributePath}`,
                        },
                    ],
                },
            ],
        });

        beforeEach(async () => {
            childRecordId1 = await gqlCreateRecord(linkedLibraryId);
            childRecordId2 = await gqlCreateRecord(linkedLibraryId);
            parentRecordId = await gqlCreateRecord(libraryId);
            await gqlSaveValueBis(attrChildAdvancedLinkId, libraryId, parentRecordId, {payload: childRecordId1});
            await gqlSaveValueBis(attrChildAdvancedLinkId, libraryId, parentRecordId, {payload: childRecordId2});
        });

        describe('register simple attribute', () => {
            const attrSimpleTriggerId = 'test_replace_another_attribute_action_simple_attr_trigger';

            beforeAll(async () => {
                await gqlSaveAttribute({
                    id: attrSimpleId,
                    label: 'Test register another attribute action simple attr',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.TEXT,
                });
                await adminUserSdk.SaveLibrary({
                    library: {id: linkedLibraryId, label: {en: 'Test node lib'}, attributes: [attrSimpleId]},
                });

                await gqlSaveAttribute({
                    id: attrSimpleTriggerId,
                    label: 'Test register another attribute action advanced multiple link attr trigger',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.TEXT,
                    actionsList: attributeActionListConfig(
                        attrSimpleTriggerId,
                        `${attrChildAdvancedLinkId}.${attrSimpleId}`,
                    ),
                });
                await saveTriggerLibrary(attrSimpleTriggerId);
            });

            const assertSimpleAttributePayload = async (linkedRecordId: string, expectedPayload: string | null) => {
                const recValues = await getStandardAttributeValues(attrSimpleId, linkedLibraryId, linkedRecordId);
                expect(recValues.length).toBe(expectedPayload ? 1 : 0);
                if (expectedPayload) {
                    expect(recValues[0].payload).toBe(expectedPayload);
                }
            };

            it('set trigger value should update the children records value', async () => {
                await gqlSaveValueBis(attrSimpleTriggerId, libraryId, parentRecordId, {
                    payload: 'Trigger Value through link',
                });

                await assertSimpleAttributePayload(childRecordId1, 'Trigger Value through link');
                await assertSimpleAttributePayload(childRecordId2, 'Trigger Value through link');
            });

            describe('when one value is set', () => {
                beforeEach(async () => {
                    await gqlSaveValueBis(attrSimpleTriggerId, libraryId, parentRecordId, {
                        payload: 'A string value',
                    });
                });

                it('set new trigger value should replace value in all children records value', async () => {
                    await gqlSaveValueBis(attrSimpleTriggerId, libraryId, parentRecordId, {
                        payload: 'A new string value',
                    });
                    await assertSimpleAttributePayload(childRecordId1, 'A new string value');
                    await assertSimpleAttributePayload(childRecordId2, 'A new string value');
                });

                it('delete trigger value should remove all children records value', async () => {
                    await gqlDeleteValue(attrSimpleTriggerId, libraryId, parentRecordId, undefined);
                    await assertSimpleAttributePayload(childRecordId1, null);
                    await assertSimpleAttributePayload(childRecordId2, null);
                });
            });
        });

        describe('register simple link attribute', () => {
            const attrSimpleLinkId = 'test_replace_another_attribute_action_simple_link_attr';
            const attrSimpleLinkTriggerId = 'test_replace_another_attribute_action_simple_link_attr_trigger';

            beforeAll(async () => {
                await gqlSaveAttribute({
                    id: attrSimpleLinkId,
                    label: 'Test register another attribute action simple link attr',
                    type: AttributeTypes.SIMPLE_LINK,
                    linkedLibrary: testTreeLibraryName,
                });
                await adminUserSdk.SaveLibrary({
                    library: {id: linkedLibraryId, label: {en: 'Test node lib'}, attributes: [attrSimpleLinkId]},
                });

                await gqlSaveAttribute({
                    id: attrSimpleLinkTriggerId,
                    label: 'Test register another attribute action advanced multiple link attr trigger',
                    type: AttributeTypes.SIMPLE_LINK,
                    linkedLibrary: testTreeLibraryName,
                    actionsList: attributeActionListConfig(
                        attrSimpleLinkTriggerId,
                        `${attrChildAdvancedLinkId}.${attrSimpleLinkId}`,
                    ),
                });
                await saveTriggerLibrary(attrSimpleLinkTriggerId);
            });

            const assertSimpleLinkAttributePayloadId = async (linkedRecordId: string, expectedRecordId: string) => {
                const recValues = await getLinkAttributeValues(attrSimpleLinkId, linkedLibraryId, linkedRecordId);
                expect(recValues.length).toBe(expectedRecordId ? 1 : 0);
                if (expectedRecordId) {
                    expect(recValues[0].payload.id).toBe(expectedRecordId);
                }
            };

            it('set trigger value should update the children records value', async () => {
                await gqlSaveValueBis(attrSimpleLinkTriggerId, libraryId, parentRecordId, {payload: treeNodeRecord1Id});

                await assertSimpleLinkAttributePayloadId(childRecordId1, treeNodeRecord1Id);
                await assertSimpleLinkAttributePayloadId(childRecordId2, treeNodeRecord1Id);
            });

            describe('when one value is set', () => {
                beforeEach(async () => {
                    await gqlSaveValueBis(attrSimpleLinkTriggerId, libraryId, parentRecordId, {
                        payload: treeNodeRecord1Id,
                    });
                });

                it('set new trigger value should replace value in all children records value', async () => {
                    await gqlSaveValueBis(attrSimpleLinkTriggerId, libraryId, parentRecordId, {
                        payload: treeNodeRecord2Id,
                    });
                    await assertSimpleLinkAttributePayloadId(childRecordId1, treeNodeRecord2Id);
                    await assertSimpleLinkAttributePayloadId(childRecordId2, treeNodeRecord2Id);
                });

                it('delete trigger value should remove all children records value', async () => {
                    await gqlDeleteValue(attrSimpleLinkTriggerId, libraryId, parentRecordId, undefined);
                    await assertSimpleLinkAttributePayloadId(childRecordId1, null);
                    await assertSimpleLinkAttributePayloadId(childRecordId2, null);
                });
            });
        });

        describe('register advanced standard attribute', () => {
            const attrAdvancedStandardId = 'test_replace_another_attribute_action_advanced_standard_attr';
            const attrAdvancedStandardTriggerId =
                'test_replace_another_attribute_action_advanced_standard_attr_trigger';

            const saveStandardAttributes = async multipleValues => {
                await gqlSaveAttribute({
                    id: attrAdvancedStandardId,
                    label: 'Test register another attribute action advanced standard attr',
                    type: AttributeTypes.ADVANCED,
                    format: AttributeFormats.TEXT,
                    multipleValues,
                });
                await adminUserSdk.SaveLibrary({
                    library: {id: linkedLibraryId, label: {en: 'Test node lib'}, attributes: [attrAdvancedStandardId]},
                });

                await gqlSaveAttribute({
                    id: attrAdvancedStandardTriggerId,
                    label: 'Test register another attribute action advanced standard attr trigger',
                    type: AttributeTypes.ADVANCED,
                    format: AttributeFormats.TEXT,
                    multipleValues,
                    actionsList: attributeActionListConfig(
                        attrAdvancedStandardTriggerId,
                        `${attrChildAdvancedLinkId}.${attrAdvancedStandardId}`,
                    ),
                });
                await saveTriggerLibrary(attrAdvancedStandardTriggerId);
            };

            const assertStandardAttributePayload = async (linkedRecordId, payloads: Array<string | number>) => {
                const recValues = await getStandardAttributeValues(
                    attrAdvancedStandardId,
                    linkedLibraryId,
                    linkedRecordId,
                );
                expect(recValues.length).toBe(payloads.length);
                expect(recValues).toEqual(
                    expect.arrayContaining(payloads.map(payload => expect.objectContaining({payload}))),
                );
            };

            describe('mono attribute', () => {
                beforeAll(async () => {
                    await saveStandardAttributes(false);
                });

                it('set trigger one value string should update the children records value', async () => {
                    await gqlSaveValueBis(attrAdvancedStandardTriggerId, libraryId, parentRecordId, {
                        payload: 'Test string value',
                    });

                    await assertStandardAttributePayload(childRecordId1, ['Test string value']);
                    await assertStandardAttributePayload(childRecordId2, ['Test string value']);
                });

                describe('when one value is set', () => {
                    let savedIdValue: string;
                    beforeEach(async () => {
                        savedIdValue = await gqlSaveValueBis(attrAdvancedStandardTriggerId, libraryId, parentRecordId, {
                            payload: 'A string value',
                        });
                    });

                    it('set new trigger value should replace value in all children records value', async () => {
                        await gqlSaveValueBis(attrAdvancedStandardTriggerId, libraryId, parentRecordId, {
                            id_value: savedIdValue,
                            payload: 'A new string value',
                        });
                        await assertStandardAttributePayload(childRecordId1, ['A new string value']);
                        await assertStandardAttributePayload(childRecordId2, ['A new string value']);
                    });

                    it('delete trigger value should remove all children records value', async () => {
                        await gqlDeleteValue(attrAdvancedStandardTriggerId, libraryId, parentRecordId, savedIdValue);

                        await assertStandardAttributePayload(childRecordId1, []);
                        await assertStandardAttributePayload(childRecordId2, []);
                    });
                });
            });

            describe('multi attribute', () => {
                beforeAll(async () => {
                    await saveStandardAttributes(true);
                });

                it('set trigger one value should update the all linked attribute value', async () => {
                    await gqlSaveValueBis(attrAdvancedStandardTriggerId, libraryId, parentRecordId, {
                        payload: 'Test string value',
                    });

                    await assertStandardAttributePayload(childRecordId1, ['Test string value']);
                    await assertStandardAttributePayload(childRecordId2, ['Test string value']);
                });

                describe('when multiple values are set', () => {
                    let savedIdValue1: string;
                    let savedIdValue2: string;
                    beforeEach(async () => {
                        savedIdValue1 = await gqlSaveValueBis(
                            attrAdvancedStandardTriggerId,
                            libraryId,
                            parentRecordId,
                            {
                                payload: 'Test string value',
                            },
                        );
                        savedIdValue2 = await gqlSaveValueBis(
                            attrAdvancedStandardTriggerId,
                            libraryId,
                            parentRecordId,
                            {
                                payload: 'Another test string value',
                            },
                        );
                    });

                    it('set trigger two values should update children records value', async () => {
                        await assertStandardAttributePayload(childRecordId1, [
                            'Test string value',
                            'Another test string value',
                        ]);
                        await assertStandardAttributePayload(childRecordId2, [
                            'Test string value',
                            'Another test string value',
                        ]);
                    });

                    it('delete trigger value should remove all children records value', async () => {
                        const deleteValueId = savedIdValue1;
                        const remainingPayloadValue = 'Another test string value';

                        await gqlDeleteValue(attrAdvancedStandardTriggerId, libraryId, parentRecordId, deleteValueId);

                        await assertStandardAttributePayload(childRecordId1, [remainingPayloadValue]);
                        await assertStandardAttributePayload(childRecordId2, [remainingPayloadValue]);
                    });
                });
            });
        });

        describe('register advanced link attribute', () => {
            const attrAdvancedLinkId = 'test_replace_another_attribute_action_link_attr';
            const attrAdvancedLinkTriggerId = 'test_replace_another_attribute_action_advanced_link_attr_trigger';

            const saveLinkAttributes = async multipleValues => {
                await gqlSaveAttribute({
                    id: attrAdvancedLinkId,
                    label: 'Test register another attribute action link attr',
                    type: AttributeTypes.ADVANCED_LINK,
                    linkedLibrary: testTreeLibraryName,
                    multipleValues,
                });
                await adminUserSdk.SaveLibrary({
                    library: {id: linkedLibraryId, label: {en: 'Test node lib'}, attributes: [attrAdvancedLinkId]},
                });

                await gqlSaveAttribute({
                    id: attrAdvancedLinkTriggerId,
                    label: 'Test register another attribute action advanced multiple link attr trigger',
                    type: AttributeTypes.ADVANCED_LINK,
                    linkedLibrary: testTreeLibraryName,
                    multipleValues,
                    actionsList: attributeActionListConfig(
                        attrAdvancedLinkTriggerId,
                        `${attrChildAdvancedLinkId}.${attrAdvancedLinkId}`,
                    ),
                });
                await saveTriggerLibrary(attrAdvancedLinkTriggerId);
            };

            const assertLinkAttributePayloadId = async (linkedRecordId, recordIds: string[]) => {
                const recValues = await getLinkAttributeValues(attrAdvancedLinkId, linkedLibraryId, linkedRecordId);
                expect(recValues.length).toBe(recordIds.length);
                expect(recValues).toEqual(
                    expect.arrayContaining(
                        recordIds.map(treeNodeId =>
                            expect.objectContaining({payload: expect.objectContaining({id: treeNodeId})}),
                        ),
                    ),
                );
            };

            describe('mono link attribute', () => {
                beforeAll(async () => {
                    await saveLinkAttributes(false);
                });

                it('set trigger one value should update the children records value', async () => {
                    await gqlSaveValueBis(attrAdvancedLinkTriggerId, libraryId, parentRecordId, {
                        payload: treeNodeRecord1Id,
                    });

                    await assertLinkAttributePayloadId(childRecordId1, [treeNodeRecord1Id]);
                    await assertLinkAttributePayloadId(childRecordId2, [treeNodeRecord1Id]);
                });

                describe('when one value is set', () => {
                    let savedIdValue: string;
                    beforeEach(async () => {
                        savedIdValue = await gqlSaveValueBis(attrAdvancedLinkTriggerId, libraryId, parentRecordId, {
                            payload: treeNodeRecord1Id,
                        });
                    });

                    it('set new trigger value should replace value in all children records value', async () => {
                        await gqlSaveValueBis(attrAdvancedLinkTriggerId, libraryId, parentRecordId, {
                            payload: treeNodeRecord3Id,
                        });
                        await assertLinkAttributePayloadId(childRecordId1, [treeNodeRecord3Id]);
                        await assertLinkAttributePayloadId(childRecordId2, [treeNodeRecord3Id]);
                    });

                    it('delete trigger value should remove all linked records value', async () => {
                        const deleteValueId = savedIdValue;

                        await gqlDeleteValue(attrAdvancedLinkTriggerId, libraryId, parentRecordId, deleteValueId);

                        await assertLinkAttributePayloadId(childRecordId1, []);
                        await assertLinkAttributePayloadId(childRecordId2, []);
                    });
                });
            });

            describe('multi link attribute', () => {
                beforeAll(async () => {
                    await saveLinkAttributes(true);
                });

                it('set trigger one value should update the children records value', async () => {
                    await gqlSaveValueBis(attrAdvancedLinkTriggerId, libraryId, parentRecordId, {
                        payload: treeNodeRecord1Id,
                    });

                    await assertLinkAttributePayloadId(childRecordId1, [treeNodeRecord1Id]);
                    await assertLinkAttributePayloadId(childRecordId2, [treeNodeRecord1Id]);
                });

                describe('when multiple values are set', () => {
                    let savedIdValue1: string;
                    let savedIdValue2: string;
                    beforeEach(async () => {
                        savedIdValue1 = await gqlSaveValueBis(attrAdvancedLinkTriggerId, libraryId, parentRecordId, {
                            payload: treeNodeRecord1Id,
                        });
                        savedIdValue2 = await gqlSaveValueBis(attrAdvancedLinkTriggerId, libraryId, parentRecordId, {
                            payload: treeNodeRecord2Id,
                        });
                    });

                    it('set trigger two values should update the children records value', async () => {
                        await assertLinkAttributePayloadId(childRecordId1, [treeNodeRecord1Id, treeNodeRecord2Id]);
                        await assertLinkAttributePayloadId(childRecordId2, [treeNodeRecord1Id, treeNodeRecord2Id]);
                    });

                    it('delete trigger value should remove all children records value', async () => {
                        const deleteValueId = savedIdValue1;
                        const remainingRecordLinkId = savedIdValue2;

                        await gqlDeleteValue(attrAdvancedLinkTriggerId, libraryId, parentRecordId, deleteValueId);

                        await assertLinkAttributePayloadId(childRecordId1, [treeNodeRecord2Id]);
                        await assertLinkAttributePayloadId(childRecordId2, [treeNodeRecord2Id]);
                    });
                });
            });
        });

        describe('register tree attribute', () => {
            const attrTreeId = 'test_replace_another_attribute_action_multi_tree_attr';
            const attrTreeTriggerId = 'test_replace_another_attribute_action_multi_tree_attr_trigger';

            const saveTreeAttributes = async (multipleValues: boolean) => {
                await gqlSaveAttribute({
                    id: attrTreeId,
                    label: 'Test register another attribute action tree attr',
                    type: AttributeTypes.TREE,
                    multipleValues,
                    linkedTree: testTreeName,
                });
                await adminUserSdk.SaveLibrary({
                    library: {id: linkedLibraryId, label: {en: 'Test node lib'}, attributes: [attrTreeId]},
                });

                await gqlSaveAttribute({
                    id: attrTreeTriggerId,
                    label: 'Test register another attribute action advanced multiple link attr trigger',
                    type: AttributeTypes.TREE,
                    multipleValues,
                    linkedTree: testTreeName,
                    actionsList: attributeActionListConfig(
                        attrTreeTriggerId,
                        `${attrChildAdvancedLinkId}.${attrTreeId}`,
                    ),
                });
                await saveTriggerLibrary(attrTreeTriggerId);
            };

            const assertTreeAttributePayloadId = async (linkedRecordId, treeNodeIds: string[]) => {
                const recValues = await getTreeAttributeValues(attrTreeId, linkedLibraryId, linkedRecordId);
                expect(recValues.length).toBe(treeNodeIds.length);
                expect(recValues).toEqual(
                    expect.arrayContaining(
                        treeNodeIds.map(treeNodeId =>
                            expect.objectContaining({payload: expect.objectContaining({id: treeNodeId})}),
                        ),
                    ),
                );
            };

            describe('mono tree attribute', () => {
                beforeAll(async () => {
                    await saveTreeAttributes(false);
                });

                it('set trigger value should update the children records value', async () => {
                    await gqlSaveValueBis(attrTreeTriggerId, libraryId, parentRecordId, {payload: treeNode1Id});

                    await assertTreeAttributePayloadId(childRecordId1, [treeNode1Id]);
                    await assertTreeAttributePayloadId(childRecordId2, [treeNode1Id]);
                });

                describe('when multiple nodes are set in children', () => {
                    beforeEach(async () => {
                        await gqlSaveValueBis(attrTreeId, linkedLibraryId, childRecordId1, {payload: treeNode1Id});
                        await gqlSaveValueBis(attrTreeId, linkedLibraryId, childRecordId2, {payload: treeNode2Id});
                    });

                    it('set trigger value should update the children records value', async () => {
                        await gqlSaveValueBis(attrTreeTriggerId, libraryId, parentRecordId, {payload: treeNode2Id});

                        await assertTreeAttributePayloadId(childRecordId1, [treeNode2Id]);
                        await assertTreeAttributePayloadId(childRecordId2, [treeNode2Id]);
                    });

                    it('set trigger value to empty should clear the children records value', async () => {
                        const savedIdValue = await gqlSaveValueBis(attrTreeTriggerId, libraryId, parentRecordId, {
                            payload: treeNode2Id,
                        });

                        await gqlDeleteValue(attrTreeTriggerId, libraryId, parentRecordId, savedIdValue);

                        await assertTreeAttributePayloadId(childRecordId1, []);
                        await assertTreeAttributePayloadId(childRecordId2, []);
                    });
                });
            });

            describe('multi tree attribute', () => {
                beforeAll(async () => {
                    await saveTreeAttributes(true);
                });

                it('set trigger value should update the children records value', async () => {
                    await gqlSaveValueBis(attrTreeTriggerId, libraryId, parentRecordId, {payload: treeNode1Id});
                    await assertTreeAttributePayloadId(childRecordId1, [treeNode1Id]);
                    await assertTreeAttributePayloadId(childRecordId2, [treeNode1Id]);

                    await gqlSaveValueBis(attrTreeTriggerId, libraryId, parentRecordId, {payload: treeNode2Id});
                    await assertTreeAttributePayloadId(childRecordId1, [treeNode1Id, treeNode2Id]);
                    await assertTreeAttributePayloadId(childRecordId2, [treeNode1Id, treeNode2Id]);
                });

                describe('when multiple nodes are set in children', () => {
                    beforeEach(async () => {
                        await gqlSaveValueBis(attrTreeId, linkedLibraryId, childRecordId1, {payload: treeNode1Id});
                        await gqlSaveValueBis(attrTreeId, linkedLibraryId, childRecordId1, {payload: treeNode2Id});

                        await gqlSaveValueBis(attrTreeId, linkedLibraryId, childRecordId2, {payload: treeNode1Id});
                        await gqlSaveValueBis(attrTreeId, linkedLibraryId, childRecordId2, {payload: treeNode3Id});
                    });

                    it('set trigger value should replace the children records value', async () => {
                        await gqlSaveValueBis(attrTreeTriggerId, libraryId, parentRecordId, {payload: treeNode3Id});
                        await assertTreeAttributePayloadId(childRecordId1, [treeNode3Id]);
                        await assertTreeAttributePayloadId(childRecordId2, [treeNode3Id]);
                    });

                    it('set trigger value to empty should clear the children records value', async () => {
                        const savedIdValue = await gqlSaveValueBis(attrTreeTriggerId, libraryId, parentRecordId, {
                            payload: treeNode2Id,
                        });

                        await assertTreeAttributePayloadId(childRecordId1, [treeNode2Id]);
                        await assertTreeAttributePayloadId(childRecordId2, [treeNode2Id]);

                        await gqlDeleteValue(attrTreeTriggerId, libraryId, parentRecordId, savedIdValue);

                        await assertTreeAttributePayloadId(childRecordId1, []);
                        await assertTreeAttributePayloadId(childRecordId2, []);
                    });
                });
            });
        });
    });

    const getStandardAttributeValues = async (
        _attributeId: string,
        _libraryId: string,
        _recordId: string,
    ): Promise<IStandardValue[]> => {
        const res = await makeGraphQlCall(`{
            records(
                library: "${_libraryId}",
                filters: [{field: "id", condition: EQUAL, value: "${_recordId}"}]
            ) {
                list {
                    property(attribute: "${_attributeId}") {
                        ...on Value {
                            id_value
                            payload
                        }
                    }
                }
            }
        }`);

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        return res.data.data.records.list[0].property;
    };

    const getLinkAttributeValues = async (
        _attributeId: string,
        _libraryId: string,
        _recordId: string,
    ): Promise<ILinkValue[]> => {
        const res = await makeGraphQlCall(`{
            records(
                library: "${_libraryId}",
                filters: [{field: "id", condition: EQUAL, value: "${_recordId}"}]
            ) {
                list {
                    property(attribute: "${_attributeId}") {
                        ...on LinkValue {
                            id_value
                            payload {
                                id
                            }
                        }
                    }
                }
            }
        }`);

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        return res.data.data.records.list[0].property;
    };

    const getTreeAttributeValues = async (
        _attributeId: string,
        _libraryId: string,
        _recordId: string,
    ): Promise<ITreeValue[]> => {
        const res = await makeGraphQlCall(`{
            records(
                library: "${_libraryId}",
                filters: [{field: "id", condition: EQUAL, value: "${_recordId}"}]
            ) {
                list {
                    property(attribute: "${_attributeId}") {
                        ...on TreeValue {
                            id_value
                            payload {
                                id
                            }
                        }
                    }
                }
            }
        }`);

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        return res.data.data.records.list[0].property;
    };
});
