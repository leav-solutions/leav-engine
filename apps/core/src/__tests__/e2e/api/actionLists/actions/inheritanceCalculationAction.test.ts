// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ActionsListEvents} from '../../../../../_types/actionsList';
import {AttributeTypes} from '../../../../../_types/attribute';
import {gqlCreateRecord, gqlSaveAttribute, gqlSaveLibrary, gqlSaveValue, makeGraphQlCall} from '../../e2eUtils';

describe('inheritanceCalculationAction', () => {
    const libraryId = 'test_inheritance_action_library';
    const libraryGqlType = 'testInheritanceActionLibrary';

    const linkAttributeId = 'test_inheritance_action_link';

    const sourceSimpleAttributeId = 'test_inheritance_action_source_simple';
    const sourceAdvancedLinkAttributeId = 'test_inheritance_action_source_advanced_link';
    const sourceTreeAttributeId = 'test_inheritance_action_source_tree';

    const simpleAttributeId = 'test_inheritance_action_simple';
    const advancedAttributeId = 'test_inheritance_action_advanced';
    const simpleLinkAttributeId = 'test_inheritance_action_simple_link';
    const advancedLinkAttributeId = 'test_inheritance_action_advanced_link';
    const treeAttributeId = 'test_inheritance_action_tree';

    let recordIdToInheritFrom: string;
    let recordIdForGetValues: string;
    let recordIdWithNoValues: string;

    beforeAll(async () => {
        // Create attributes
        await Promise.all([
            gqlSaveAttribute({
                id: simpleAttributeId,
                type: AttributeTypes.SIMPLE,
                label: 'SIMPLE',
                actionsList: {
                    [ActionsListEvents.GET_VALUE]: [
                        {
                            id: 'inheritanceCalculation',
                            name: 'inheritanceCalculation',
                            params: [
                                {
                                    name: 'Formula',
                                    value: `getValue(${linkAttributeId}).getValue(${sourceSimpleAttributeId})`
                                }
                            ]
                        }
                    ]
                }
            }),
            gqlSaveAttribute({
                id: advancedAttributeId,
                type: AttributeTypes.ADVANCED,
                label: 'ADVANCED',
                actionsList: {
                    [ActionsListEvents.GET_VALUE]: [
                        {
                            id: 'inheritanceCalculation',
                            name: 'inheritanceCalculation',
                            params: [
                                {
                                    name: 'Formula',
                                    value: `getValue(${linkAttributeId}).getValue(${sourceSimpleAttributeId})`
                                }
                            ]
                        }
                    ]
                }
            }),
            gqlSaveAttribute({
                id: simpleLinkAttributeId,
                type: AttributeTypes.SIMPLE_LINK,
                label: 'SIMPLE_LINK',
                linkedLibrary: 'users',
                actionsList: {
                    [ActionsListEvents.GET_VALUE]: [
                        {
                            id: 'inheritanceCalculation',
                            name: 'inheritanceCalculation',
                            params: [
                                {
                                    name: 'Formula',
                                    value: `getValue(${linkAttributeId}).getValue(${sourceAdvancedLinkAttributeId})`
                                }
                            ]
                        }
                    ]
                }
            }),
            gqlSaveAttribute({
                id: advancedLinkAttributeId,
                type: AttributeTypes.ADVANCED_LINK,
                label: 'ADVANCED_LINK',
                linkedLibrary: 'users',
                actionsList: {
                    [ActionsListEvents.GET_VALUE]: [
                        {
                            id: 'inheritanceCalculation',
                            name: 'inheritanceCalculation',
                            params: [
                                {
                                    name: 'Formula',
                                    value: `getValue(${linkAttributeId}).getValue(${sourceAdvancedLinkAttributeId})`
                                }
                            ]
                        }
                    ]
                }
            }),
            gqlSaveAttribute({
                id: treeAttributeId,
                type: AttributeTypes.TREE,
                label: 'TREE',
                linkedTree: 'users_groups',
                actionsList: {
                    [ActionsListEvents.GET_VALUE]: [
                        {
                            id: 'inheritanceCalculation',
                            name: 'inheritanceCalculation',
                            params: [
                                {
                                    name: 'Formula',
                                    value: `getValue(${linkAttributeId}).getValue(${sourceTreeAttributeId})`
                                }
                            ]
                        }
                    ]
                }
            }),
            gqlSaveAttribute({
                id: linkAttributeId,
                type: AttributeTypes.ADVANCED_LINK,
                label: 'LINK',
                linkedLibrary: libraryId
            }),
            gqlSaveAttribute({
                id: sourceSimpleAttributeId,
                type: AttributeTypes.SIMPLE,
                label: 'SIMPLE SOURCE'
            }),
            gqlSaveAttribute({
                id: sourceAdvancedLinkAttributeId,
                type: AttributeTypes.ADVANCED_LINK,
                label: 'SOURCE LINK',
                linkedLibrary: 'users'
            }),
            gqlSaveAttribute({
                id: sourceTreeAttributeId,
                type: AttributeTypes.TREE,
                label: 'SOURCE TREE',
                linkedTree: 'users_groups'
            })
        ]);

        // Create a library
        await gqlSaveLibrary(libraryId, 'test inheritance action library', [
            simpleAttributeId,
            advancedAttributeId,
            simpleLinkAttributeId,
            advancedLinkAttributeId,
            treeAttributeId,
            linkAttributeId,
            sourceSimpleAttributeId,
            sourceAdvancedLinkAttributeId,
            sourceTreeAttributeId
        ]);

        // Create a record
        [recordIdToInheritFrom, recordIdForGetValues, recordIdWithNoValues] = await Promise.all([
            gqlCreateRecord(libraryId),
            gqlCreateRecord(libraryId),
            gqlCreateRecord(libraryId)
        ]);

        // Add values on this record: 1 simple, 1 link and 1 tree
        await Promise.all([
            gqlSaveValue(sourceSimpleAttributeId, libraryId, recordIdToInheritFrom, 'text value'),
            gqlSaveValue(sourceAdvancedLinkAttributeId, libraryId, recordIdToInheritFrom, '1'), // link to admin
            gqlSaveValue(sourceTreeAttributeId, libraryId, recordIdToInheritFrom, '2'), // default users group
            gqlSaveValue(linkAttributeId, libraryId, recordIdForGetValues, recordIdToInheritFrom) // link between records
        ]);
    });

    test('Inherit values on simple attribute', async () => {
        const res = await makeGraphQlCall(`{
            ${libraryGqlType}(filters: [{field: "id", condition: EQUAL, value: "${recordIdForGetValues}"}]) {
                list {
                    ${simpleAttributeId}
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data[libraryGqlType].list[0][simpleAttributeId]).toBe('text value');
    });

    test('Inherit values on advanced attribute', async () => {
        const res = await makeGraphQlCall(`{
            ${libraryGqlType}(filters: [{field: "id", condition: EQUAL, value: "${recordIdForGetValues}"}]) {
                list {
                    ${advancedAttributeId}
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data[libraryGqlType].list[0][advancedAttributeId]).toBe('text value');
    });

    test('Inherit values on simple link attribute', async () => {
        const res = await makeGraphQlCall(`{
            ${libraryGqlType}(filters: [{field: "id", condition: EQUAL, value: "${recordIdForGetValues}"}]) {
                list {
                    ${simpleLinkAttributeId} {
                        id
                        library {
                            id
                        }
                    }
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data[libraryGqlType].list[0][simpleLinkAttributeId].id).toBe('1');
        expect(res.data.data[libraryGqlType].list[0][simpleLinkAttributeId].library.id).toBe('users');
    });

    test('Inherit values on advanced link attribute', async () => {
        const res = await makeGraphQlCall(`{
            ${libraryGqlType}(filters: [{field: "id", condition: EQUAL, value: "${recordIdForGetValues}"}]) {
                list {
                    ${advancedLinkAttributeId} {
                        id
                        library {
                            id
                        }
                    }
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data[libraryGqlType].list[0][advancedLinkAttributeId].id).toBe('1');
        expect(res.data.data[libraryGqlType].list[0][advancedLinkAttributeId].library.id).toBe('users');
    });

    test('Inherit values on tree attribute', async () => {
        const res = await makeGraphQlCall(`{
            ${libraryGqlType}(filters: [{field: "id", condition: EQUAL, value: "${recordIdForGetValues}"}]) {
                list {
                    ${treeAttributeId} {
                        id
                        record {
                            id
                            library {
                                id
                            }
                        }
                    }
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data[libraryGqlType].list[0][treeAttributeId].id).toBe('2');
        expect(res.data.data[libraryGqlType].list[0][treeAttributeId].record.id).toBe('2');
        expect(res.data.data[libraryGqlType].list[0][treeAttributeId].record.library.id).toBe('users_groups');
    });

    test('If no record to inherit from, return no value', async () => {
        const res = await makeGraphQlCall(`{
            ${libraryGqlType}(filters: [{field: "id", condition: EQUAL, value: "${recordIdWithNoValues}"}]) {
                list {
                    ${simpleAttributeId}
                    library {
                        id
                    }
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data[libraryGqlType].list[0][simpleAttributeId]).toBeNull();
    });
});
