import {AttributeTypes} from '../../../../_types/attribute';
import {AttributeFormat, type AttributeInput, AttributeType, LibraryBehavior, type LibraryInput} from '../../_gqlTypes';
import {
    adminUserSdk,
    gqlAddElemToTree,
    gqlCreateRecord,
    gqlSaveAttribute,
    gqlSaveTree,
    makeGraphQlCall,
} from '../e2eUtils';

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
                    label: {fr: "Test attr", en: "Test attr en"},
                    description: {fr: "Test attr", en: "Test attr en"},
                }
            ) {
                id
                actions_list {
                    saveValue {
                      name
                    }
                }
                permissions {
                    access_attribute
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.saveAttribute.id).toBe(testAttrName);
        expect(res.data.data.saveAttribute.actions_list.saveValue).toBeTruthy();
        expect(res.data.data.saveAttribute.permissions.access_attribute).toBeDefined();
        expect(res.data.errors).toBeUndefined();

        // Check if new attribute is in attributes list
        const libsRes = await makeGraphQlCall('{ attributes { list {id} } }');

        expect(libsRes.status).toBe(200);
        expect(libsRes.data.data.attributes.list.filter(lib => lib.id === testAttrName).length).toBe(1);
    });

    test('Get Attribute by ID', async () => {
        const res = await makeGraphQlCall(`{attributes(filters: {id: "${testAttrName}"}) { list {id} }}`);

        expect(res.status).toBe(200);
        expect(res.data.data.attributes.list.length).toBe(1);
        expect(res.data.errors).toBeUndefined();
    });

    test('Get Attribute by IDs', async () => {
        const res = await makeGraphQlCall(
            `{attributes(filters: {ids: ["${testAttrName}", "created_by"]}) { list {id} }}`,
        );

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.attributes.list.length).toBe(2);
    });

    test('Return only request language on label', async () => {
        const res = await makeGraphQlCall(
            `{attributes(filters: {id: "${testAttrName}"}) { list {id label(lang: [fr])}}}`,
        );

        expect(res.status).toBe(200);
        expect(res.data.data.attributes.list.length).toBe(1);
        expect(res.data.data.attributes.list[0].label.fr).toBeTruthy();
        expect(res.data.data.attributes.list[0].label.en).toBeUndefined();
        expect(res.data.errors).toBeUndefined();
    });

    test('Return only request language on description', async () => {
        const res = await makeGraphQlCall(
            `{attributes(filters: {id: "${testAttrName}"}) { list {id description(lang: [fr]) label(lang: [fr])}}}`,
        );

        expect(res.status).toBe(200);
        expect(res.data.data.attributes.list.length).toBe(1);
        expect(res.data.data.attributes.list[0].description.fr).toBeTruthy();
        expect(res.data.data.attributes.list[0].description.en).toBeUndefined();
        expect(res.data.errors).toBeUndefined();
    });

    test('Filter attributes by libraries', async () => {
        // Search attribute "login" linked to a library different than users, should not find anything
        const res = await makeGraphQlCall(`{
            usersAttrs: attributes(filters: {id: "login", libraries: ["users"]}) {list {id}},
            usersGroupsAttrs: attributes(filters: {id: "login", libraries: ["users_groups"]}) {list {id}}
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.usersGroupsAttrs.list.length).toBe(0);
        expect(res.data.data.usersAttrs.list.length).toBe(1);
        expect(res.data.errors).toBeUndefined();
    });

    test('Filter attributes by excluded libraries', async () => {
        // Search attributes not linked to users library, should not find "login"
        const res = await makeGraphQlCall(`{
            notUsersAttrs: attributes(filters: {librariesExcluded: ["users"]}) {list {id}}
        }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.notUsersAttrs.list.length).toBeGreaterThanOrEqual(0);
        expect(res.data.data.notUsersAttrs.list.filter(attr => attr.id === 'login').length).toBe(0);
    });

    test('Get error if deleting system attribute', async () => {
        await expect(makeGraphQlCall('mutation {deleteAttribute(id: "modified_by") { id }}')).rejects.toThrow(
            /Cannot delete system attribute/,
        );
    });

    test('Delete an attribute', async () => {
        const res = await makeGraphQlCall(`mutation {deleteAttribute(id: "${testAttrName}") { id }}`);

        expect(res.status).toBe(200);
        expect(res.data.data.deleteAttribute).toBeDefined();
        expect(res.data.data.deleteAttribute.id).toBe(testAttrName);
        expect(res.data.errors).toBeUndefined();
    });

    test('Save metadata fields', async () => {
        const metadataAttrId = 'simple_metadata_attribute';
        const attributeWithMetadataId = 'adv_attribute_with_metadata';
        // Create a simple attribute we can use for metadata
        await makeGraphQlCall(`mutation {
            saveAttribute(
                attribute: {
                    id: "${metadataAttrId}",
                    type: simple,
                    format: text,
                    label: {fr: "Test attr", en: "Test attr en"}
                }
            ) {
                id
            }
        }`);

        // Create an advanced attribute with metadata
        const res = await makeGraphQlCall(`mutation {
            saveAttribute(
                attribute: {
                    id: "${attributeWithMetadataId}",
                    type: advanced,
                    format: text,
                    label: {fr: "Test attr", en: "Test attr en"},
                    metadata_fields: ["${metadataAttrId}"]
                }
            ) {
                id
                metadata_fields {
                    id
                    type
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.saveAttribute.metadata_fields).toBeDefined();
        expect(res.data.data.saveAttribute.metadata_fields[0].id).toBe(metadataAttrId);
        expect(res.data.data.saveAttribute.metadata_fields[0].type).toBe('simple');
        expect(res.data.errors).toBeUndefined();
    });

    test('Should reset values list and configuration if disabled', async () => {
        const valuesListAttrId = 'simple_values_list_attribute';

        const res = await makeGraphQlCall(`mutation {
            saveAttribute(
                attribute: {
                    id: "${valuesListAttrId}",
                    type: advanced,
                    format: text,
                    label: {fr: "Test attr", en: "Test attr en"},
                    values_list: {
                        enable: true,
                        allowFreeEntry: true,
                        allowListUpdate: true,
                        values: [
                            "value1",
                            "value2"
                        ]
                    },
                }
            ) {
                ... on StandardAttribute {
                  values_list {
                    ... on StandardStringValuesListConf {
                        enable
                        allowFreeEntry
                        allowListUpdate
                        values
                    }
                  }
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.saveAttribute.values_list).toBeDefined();
        expect(res.data.data.saveAttribute.values_list.enable).toBe(true);
        expect(res.data.data.saveAttribute.values_list.allowFreeEntry).toBe(true);
        expect(res.data.data.saveAttribute.values_list.allowListUpdate).toBe(true);
        expect(res.data.data.saveAttribute.values_list.values).toEqual(['value1', 'value2']);

        const res2 = await makeGraphQlCall(`mutation {
            saveAttribute(
                attribute: {
                    id: "${valuesListAttrId}",
                    type: advanced,
                    format: text,
                    label: {fr: "Test attr", en: "Test attr en"},
                    values_list: {
                        enable: false,
                    },
                }
            ) {
                ... on StandardAttribute {
                  values_list {
                    ... on StandardStringValuesListConf {
                        enable
                        allowFreeEntry
                        allowListUpdate
                        values
                    }
                  }
                }
            }
        }`);

        expect(res2.status).toBe(200);
        expect(res2.data.data.saveAttribute.values_list).toBeDefined();
        expect(res2.data.data.saveAttribute.values_list.enable).toBe(false);
        expect(res2.data.data.saveAttribute.values_list.allowFreeEntry).toBe(false);
        expect(res2.data.data.saveAttribute.values_list.allowListUpdate).toBe(false);
        expect(res2.data.data.saveAttribute.values_list.values).toEqual([]);
    });

    describe('With join library through link', () => {
        const targetLibrary: LibraryInput = {
            id: 'test_attribute_target_library',
        };

        const mandatoryAttribute: AttributeInput = {
            id: 'test_attribute_on_target_library_mandatory_attr',
            type: AttributeType.simple_link,
            format: AttributeFormat.text,
            label: {fr: 'Test attr', en: 'Test attr en'},
            linked_library: targetLibrary.id,
        };

        const joinLibrary: LibraryInput = {
            id: 'test_attribute_join_library',
            behavior: LibraryBehavior.join,
            attributes: [mandatoryAttribute.id],
            mandatoryAttribute: mandatoryAttribute.id,
        };

        const joinAttributeSmartFilter: AttributeInput = {
            id: 'test_attribute_with_smart_filter_on_join_library_link',
            type: AttributeType.advanced_link,
            format: AttributeFormat.text,
            label: {fr: 'Test attr', en: 'Test attr en'},
            linked_library: joinLibrary.id,
        };

        beforeAll(async () => {
            await adminUserSdk.SaveLibrary({
                library: targetLibrary,
            });
            await adminUserSdk.SaveAttribute({
                attribute: mandatoryAttribute,
            });
            await adminUserSdk.SaveLibrary({
                library: joinLibrary,
            });
        });
        test('Attribute without smart_filter', async () => {
            await adminUserSdk.SaveAttribute({
                attribute: joinAttributeSmartFilter,
            });

            const attr = await adminUserSdk.getLinkAttributeSmartFilter({
                filters: {
                    id: joinAttributeSmartFilter.id,
                },
            });

            expect(attr.attributes.list).toHaveLength(1);
            expect(attr.attributes.list[0]).toEqual(
                expect.objectContaining({
                    smart_filter: null,
                }),
            );
        });

        test('Attribute with smart_filter should return through mandatory attribute', async () => {
            await adminUserSdk.SaveAttribute({
                attribute: {
                    ...joinAttributeSmartFilter,
                    smart_filter: {
                        enable: true,
                    },
                },
            });

            const attr = await adminUserSdk.getLinkAttributeSmartFilter({
                filters: {
                    id: joinAttributeSmartFilter.id,
                },
            });

            expect(attr.attributes.list).toHaveLength(1);
            expect(attr.attributes.list[0]).toEqual(
                expect.objectContaining({
                    smart_filter: {
                        enable: true,
                        through: {
                            id: mandatoryAttribute.id,
                        },
                    },
                }),
            );
        });
    });

    describe('Tree selection configuration', () => {
        const treeSelectionLibId = 'test_attribute_tree_selection_library';
        const treeSelectionTreeId = 'test_attribute_tree_selection_tree';
        const treeSelectionAttrId = 'test_attribute_tree_selection';
        let treeSelectionNodeId: string;

        const _saveTreeSelectionConf = (conf: string) =>
            makeGraphQlCall(`mutation {
                saveAttribute(attribute: {id: "${treeSelectionAttrId}", tree_selection_conf: ${conf}}) {
                    ... on TreeAttribute {
                        tree_selection_conf {
                            selectableNodes
                            defaultExpanded
                            displayRootNode
                            maxDepth
                            showSelectChildrenButton
                            showSelectDescendantsButton
                        }
                    }
                }
            }`);

        beforeAll(async () => {
            await adminUserSdk.SaveLibrary({library: {id: treeSelectionLibId, label: {en: 'Test lib'}}});
            await gqlSaveTree(treeSelectionTreeId, 'Test tree selection', [treeSelectionLibId]);

            const recordId = await gqlCreateRecord(treeSelectionLibId);
            treeSelectionNodeId = await gqlAddElemToTree(treeSelectionTreeId, {
                id: recordId,
                library: treeSelectionLibId,
            });

            await gqlSaveAttribute({
                id: treeSelectionAttrId,
                type: AttributeTypes.TREE,
                linkedTree: treeSelectionTreeId,
                label: 'Test attr tree selection',
            });
        });

        test('Should be null when never configured', async () => {
            const res = await makeGraphQlCall(`{
                attributes(filters: {id: "${treeSelectionAttrId}"}) {
                    list {
                        ... on TreeAttribute {
                            tree_selection_conf { selectableNodes maxDepth }
                        }
                    }
                }
            }`);

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data.attributes.list[0].tree_selection_conf).toBeNull();
        });

        test('Should save and retrieve the whole configuration', async () => {
            const conf = {
                selectableNodes: 'leaves_only',
                defaultExpanded: true,
                displayRootNode: treeSelectionNodeId,
                maxDepth: 2,
                showSelectChildrenButton: true,
                showSelectDescendantsButton: true,
            };

            const res = await _saveTreeSelectionConf(`{
                selectableNodes: leaves_only,
                defaultExpanded: true,
                displayRootNode: "${treeSelectionNodeId}",
                maxDepth: 2,
                showSelectChildrenButton: true,
                showSelectDescendantsButton: true
            }`);

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data.saveAttribute.tree_selection_conf).toEqual(conf);

            // Make sure it has actually been persisted
            const getRes = await makeGraphQlCall(`{
                attributes(filters: {id: "${treeSelectionAttrId}"}) {
                    list {
                        ... on TreeAttribute {
                            tree_selection_conf {
                                selectableNodes
                                defaultExpanded
                                displayRootNode
                                maxDepth
                                showSelectChildrenButton
                                showSelectDescendantsButton
                            }
                        }
                    }
                }
            }`);

            expect(getRes.data.errors).toBeUndefined();
            expect(getRes.data.data.attributes.list[0].tree_selection_conf).toEqual(conf);
        });

        test('Should reject a maxDepth lower than 1', async () => {
            await expect(_saveTreeSelectionConf('{maxDepth: 0}')).rejects.toThrow(
                /Invalid tree selection configuration on field maxDepth/,
            );
        });

        test('Should reject a displayRootNode which is not in the linked tree', async () => {
            await expect(_saveTreeSelectionConf('{displayRootNode: "unknown_node"}')).rejects.toThrow(/Unknown node/);
        });

        test('Should reject a configuration on a non tree attribute', async () => {
            const nonTreeAttrId = 'test_attribute_tree_selection_on_simple';
            await gqlSaveAttribute({
                id: nonTreeAttrId,
                type: AttributeTypes.SIMPLE,
                label: 'Test attr not a tree',
            });

            await expect(
                makeGraphQlCall(`mutation {
                    saveAttribute(attribute: {id: "${nonTreeAttrId}", tree_selection_conf: {defaultExpanded: true}}) {
                        id
                    }
                }`),
            ).rejects.toThrow(/must be of type tree/);
        });
    });

    describe('Column split configuration', () => {
        const columnSplitLibId = 'test_attribute_column_split_library';
        const columnSplitTreeId = 'test_attribute_column_split_tree';
        const columnSplitTreeAttrId = 'test_attribute_column_split_on_tree';
        const columnSplitClosedAttrId = 'test_attribute_column_split_on_closed_list';
        const columnSplitOpenAttrId = 'test_attribute_column_split_on_open_list';
        const columnSplitNoListAttrId = 'test_attribute_column_split_on_no_list';

        beforeAll(async () => {
            await adminUserSdk.SaveLibrary({library: {id: columnSplitLibId, label: {en: 'Test lib'}}});
            await gqlSaveTree(columnSplitTreeId, 'Test tree column split', [columnSplitLibId]);

            await gqlSaveAttribute({
                id: columnSplitTreeAttrId,
                type: AttributeTypes.TREE,
                linkedTree: columnSplitTreeId,
                label: 'Test attr column split on tree',
            });

            await makeGraphQlCall(`mutation {
                saveAttribute(
                    attribute: {
                        id: "${columnSplitClosedAttrId}",
                        type: advanced,
                        format: text,
                        label: {fr: "Test attr", en: "Test attr en"},
                        values_list: {enable: true, allowFreeEntry: false, values: ["value1", "value2"]}
                    }
                ) { id }
            }`);

            await makeGraphQlCall(`mutation {
                saveAttribute(
                    attribute: {
                        id: "${columnSplitOpenAttrId}",
                        type: advanced,
                        format: text,
                        label: {fr: "Test attr", en: "Test attr en"},
                        values_list: {enable: true, allowFreeEntry: true, values: ["value1", "value2"]}
                    }
                ) { id }
            }`);

            await gqlSaveAttribute({
                id: columnSplitNoListAttrId,
                type: AttributeTypes.SIMPLE,
                label: 'Test attr column split without values list',
            });
        });

        test('Should save on a tree attribute and be relisted', async () => {
            const {saveAttribute} = await adminUserSdk.SaveAttribute({
                attribute: {id: columnSplitTreeAttrId, column_split_enabled: true},
            });

            expect(saveAttribute.column_split_enabled).toBe(true);

            const res = await makeGraphQlCall(`{
                attributes(filters: {id: "${columnSplitTreeAttrId}"}) { list { column_split_enabled } }
            }`);

            expect(res.data.data.attributes.list[0].column_split_enabled).toBe(true);
        });

        test('Should save on a standard attribute with a closed values list', async () => {
            const {saveAttribute} = await adminUserSdk.SaveAttribute({
                attribute: {id: columnSplitClosedAttrId, column_split_enabled: true},
            });

            expect(saveAttribute.column_split_enabled).toBe(true);
        });

        test('Should reject on a standard attribute with an open (free entry) values list', async () => {
            await expect(
                adminUserSdk.SaveAttribute({attribute: {id: columnSplitOpenAttrId, column_split_enabled: true}}),
            ).rejects.toThrow(/must be a tree or have a closed values list/);
        });

        test('Should reject on a standard attribute without any values list', async () => {
            await expect(
                adminUserSdk.SaveAttribute({attribute: {id: columnSplitNoListAttrId, column_split_enabled: true}}),
            ).rejects.toThrow(/must be a tree or have a closed values list/);
        });
    });
});
