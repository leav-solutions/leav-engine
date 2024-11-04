// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
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
            records(
                library: "${libraryId}",
                filters: [{field: "id", condition: EQUAL, value: "${recordIdForGetValues}"}]
            ) {
                list {
                    ${simpleAttributeId}: property(attribute: "${simpleAttributeId}") {
                        ...on Value {
                            payload
                            isInherited
                        }
                    }
                }
            }
        }`);

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);

        const inheritedValue = res.data.data.records.list[0][simpleAttributeId].find(v => v.isInherited);
        expect(inheritedValue.payload).toBe('text value');
    });

    test('Inherit values on advanced attribute', async () => {
        const res = await makeGraphQlCall(`{
            records(
                library: "${libraryId}",
                filters: [{field: "id", condition: EQUAL, value: "${recordIdForGetValues}"}]
            ) {
                list {
                    ${advancedAttributeId}: property(attribute: "${advancedAttributeId}") {
                        ...on Value {
                            payload
                        }
                    }
                }
            }
        }`);

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data.records.list[0][advancedAttributeId][0].payload).toBe('text value');
    });

    test('Inherit values on simple link attribute', async () => {
        const res = await makeGraphQlCall(`{
            records(
                library: "${libraryId}",
                filters: [{field: "id", condition: EQUAL, value: "${recordIdForGetValues}"}]
            ) {
                list {
                    ${simpleLinkAttributeId}: property(attribute: "${simpleLinkAttributeId}") {
                        ...on LinkValue {
                            payload {
                                id
                                library {
                                    id
                                }
                            }
                        }
                    }
                }
            }
        }`);

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data.records.list[0][simpleLinkAttributeId][0].payload.id).toBe('1');
        expect(res.data.data.records.list[0][simpleLinkAttributeId][0].payload.library.id).toBe('users');
    });

    test('Inherit values on advanced link attribute', async () => {
        const res = await makeGraphQlCall(`{
            records(
                library: "${libraryId}",
                filters: [{field: "id", condition: EQUAL, value: "${recordIdForGetValues}"}]
            ) {
                list {
                    ${advancedLinkAttributeId}: property(attribute: "${advancedLinkAttributeId}") {
                        ...on LinkValue {
                            payload {
                                id
                                library {
                                    id
                                }
                            }
                        }
                    }
                }
            }
        }`);

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data.records.list[0][advancedLinkAttributeId][0].payload.id).toBe('1');
        expect(res.data.data.records.list[0][advancedLinkAttributeId][0].payload.library.id).toBe('users');
    });

    test('Inherit values on tree attribute', async () => {
        const res = await makeGraphQlCall(`{
            records(
                library: "${libraryId}",
                filters: [{field: "id", condition: EQUAL, value: "${recordIdForGetValues}"}]
            ) {
                list {
                    ${treeAttributeId}: property(attribute: "${treeAttributeId}") {
                        ...on TreeValue {
                            payload {
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
                }
            }
        }`);

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data.records.list[0][treeAttributeId][0].payload.id).toBe('2');
        expect(res.data.data.records.list[0][treeAttributeId][0].payload.record.id).toBe('2');
        expect(res.data.data.records.list[0][treeAttributeId][0].payload.record.library.id).toBe('users_groups');
    });

    test('If no record to inherit from, return no value', async () => {
        const res = await makeGraphQlCall(`{
            records(
                library: "${libraryId}",
                filters: [{field: "id", condition: EQUAL, value: "${recordIdWithNoValues}"}]
            ) {
                list {
                    ${simpleAttributeId}: property(attribute: "${simpleAttributeId}") {
                        ...on Value {
                            payload
                        }
                    }

                    library {
                        id
                    }
                }
            }
        }`);

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data.records.list[0][simpleAttributeId][0].payload).toBeNull();
    });
});
