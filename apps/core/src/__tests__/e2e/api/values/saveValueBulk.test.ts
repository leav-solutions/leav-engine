// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeTypes} from '../../../../_types/attribute';
import {
    gqlAddElemToTree,
    gqlSaveAttribute,
    gqlSaveTree,
    makeGraphQlCall,
    makeWebSocketGraphQlCall,
    waitGraphqlWebSocketMessage,
} from '../e2eUtils';
import {AttributeCondition} from '../../../../_types/record';
import {type Client as GraphqlWsClient} from 'graphql-ws';
import {type IPubSubNotificationData, type IPubSubTaskData} from '_types/eventsManager';
import {TaskStatus} from '../../../../_types/tasksManager';
import {adminsGroupId} from '../../../../_constants/users';

describe('saveValueBulk', () => {
    let graphqlClient: GraphqlWsClient;

    const testLibName = 'save_value_bulk_library_test';

    const treeName = 'save_value_bulk_tree_test';
    const treeLibName = 'save_value_bulk__tree_library_test';

    const attrSimpleName = 'save_value_bulk__attribute_test_simple';
    const attrTreeMonoValueName = 'save_value_bulk__attribute_test_tree_mono_value';
    const attrTreeMultiValueName = 'save_value_bulk__attribute_test_tree_multi_value';

    let node1RecordId1: string;
    let node1RecordId2: string;
    let node1RecordId3: string;
    let noNodeRecordId4: string;
    let node3RecordId5: string;

    let treeNodeId1: string;
    let treeNodeId2: string;
    let treeNodeId3: string;

    beforeAll(async () => {
        graphqlClient = await makeWebSocketGraphQlCall();

        await gqlSaveAttribute({
            id: attrSimpleName,
            type: AttributeTypes.SIMPLE,
            label: 'Test attr simple',
        });

        // Create library to use in tree
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {
                id: "${treeLibName}", 
                label: {en: "Test tree lib"},
            }) { id }
        }`);

        // create tree
        await gqlSaveTree(treeName, 'Test tree', [treeLibName]);

        // Create tree attribute linking to tree
        await makeGraphQlCall(`mutation {
            saveAttribute(
                attribute: {
                    id: "${attrTreeMonoValueName}",
                    type: tree,
                    linked_tree: "${treeName}",
                    multiple_values: false,
                    label: {en: "Test tree attr mini"}
                }
            ) { id }
        }`);

        await makeGraphQlCall(`mutation {
            saveAttribute(
                attribute: {
                    id: "${attrTreeMultiValueName}",
                    type: tree,
                    linked_tree: "${treeName}",
                    multiple_values: true,
                    label: {en: "Test tree attr multi"}
                }
            ) { id }
        }`);

        // Create library
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {
                id: "${testLibName}",
                label: {en: "Test lib"},
                attributes: [
                    "${attrSimpleName}",
                    "${attrTreeMonoValueName}",
                    "${attrTreeMultiValueName}",
                ],
                permissions_conf: {permissionTreeAttributes: ["${attrTreeMonoValueName}"], relation: and}
            }) { id }
        }`);

        // Create tree records
        const resTreeRecord = await makeGraphQlCall(`mutation {
            c1: createRecord(library: "${treeLibName}") { record {id} },
            c2: createRecord(library: "${treeLibName}") { record {id} },
            c3: createRecord(library: "${treeLibName}") { record {id} },
        }`);

        treeNodeId1 = await gqlAddElemToTree(treeName, {
            id: resTreeRecord.data.data.c1.record.id,
            library: treeLibName,
        });

        treeNodeId2 = await gqlAddElemToTree(treeName, {
            id: resTreeRecord.data.data.c2.record.id,
            library: treeLibName,
        });

        treeNodeId3 = await gqlAddElemToTree(treeName, {
            id: resTreeRecord.data.data.c3.record.id,
            library: treeLibName,
        });

        const resRecord = await makeGraphQlCall(`mutation {
            c1: createRecord(library: "${testLibName}", data: { values: [{ attribute: "${attrTreeMonoValueName}", payload: "${treeNodeId1}"}]}) { record {id} },
            c2: createRecord(library: "${testLibName}", data: { values: [{ attribute: "${attrTreeMonoValueName}", payload: "${treeNodeId1}"}]}) { record {id} },
            c3: createRecord(library: "${testLibName}", data: { values: [{ attribute: "${attrTreeMonoValueName}", payload: "${treeNodeId1}"}]}) { record {id} },
            c4: createRecord(library: "${testLibName}") { record {id} },
            c5: createRecord(library: "${testLibName}", data: { values: [{ attribute: "${attrTreeMonoValueName}", payload: "${treeNodeId3}"}]}) { record {id} },
        }`);

        node1RecordId1 = resRecord.data.data.c1.record.id;
        node1RecordId2 = resRecord.data.data.c2.record.id;
        node1RecordId3 = resRecord.data.data.c3.record.id;
        noNodeRecordId4 = resRecord.data.data.c4.record.id;
        node3RecordId5 = resRecord.data.data.c5.record.id;

        graphqlClient = await makeWebSocketGraphQlCall();

        await makeGraphQlCall(`mutation {
            savePermission(
                permission: {
                    type: record,
                    applyTo: "${testLibName}",
                    usersGroup: "${adminsGroupId}",
                    permissionTreeTarget: {
                        tree: "${treeName}", nodeId: "${treeNodeId3}"
                    },
                    actions: [
                        {name: edit_record, allowed: false},
                    ]
                }
            ) { type }
        }`);
    });

    describe('wrong configuration handle', () => {
        it('should throw error if attribute is not of tree type', async () => {
            const gqlMutation = `mutation {
            saveValueBulk(
                libraryId: "${testLibName}",
                attributeId: "${attrSimpleName}",
                recordsFilters: [],
                mapValues: [
                    {before: null, after: "some_value"}
                ]
            )
        }`;

            await expect(makeGraphQlCall(gqlMutation)).rejects.toThrow(
                /Attribute type simple is not supported for this operation/,
            );
        });

        it('should throw error if attribute is tree multiple values', async () => {
            const gqlMutation = `mutation {
            saveValueBulk(
                libraryId: "${testLibName}",
                attributeId: "${attrTreeMultiValueName}",
                recordsFilters: [],
                mapValues: [
                    {before: null, after: "some_value"}
                ]
            )
        }`;

            await expect(makeGraphQlCall(gqlMutation)).rejects.toThrow(
                /Multiple values attribute are not supported for this operation/,
            );
        });
    });

    describe('notifications', () => {
        it('should notify success', async () => {
            const gqlMutation = `mutation {
                saveValueBulk(
                    libraryId: "${testLibName}",
                    attributeId: "${attrTreeMonoValueName}",
                    recordsFilters: [
                        {field: "id", condition: ${AttributeCondition.EQUAL}, value: "${node1RecordId1}"}
                    ],
                    mapValues: [
                        {before: "${treeNodeId1}", after: "${treeNodeId1}"}
                    ]
                )
            }`;

            const saveValueBulkTaskId = (await makeGraphQlCall(gqlMutation)).data.data.saveValueBulk;

            const {notification} = await waitSaveValueBulkWSNotification();
            const {task} = await waitTaskCompleted(saveValueBulkTaskId);

            expect(task.status).toBe(TaskStatus.DONE);
            expect(notification.title).toContain('Bulk');
            expect(notification.level).toContain('success');
            expect(notification.message).toContain('1/1');
        });

        it('should notify success and count permissions errors', async () => {
            const gqlMutation = `mutation {
                saveValueBulk(
                    libraryId: "${testLibName}",
                    attributeId: "${attrTreeMonoValueName}",
                    recordsFilters: [
                        {field: "id", condition: ${AttributeCondition.EQUAL}, value: "${node3RecordId5}"},
                    ],
                    mapValues: [
                        {before: "${treeNodeId3}", after: "${treeNodeId3}"}
                    ]
                )
            }`;

            const saveValueBulkTaskId = (await makeGraphQlCall(gqlMutation)).data.data.saveValueBulk;

            const {notification} = await waitSaveValueBulkWSNotification();
            const {task} = await waitTaskCompleted(saveValueBulkTaskId);

            expect(task.status).toBe(TaskStatus.DONE);

            expect(notification.title).toContain('Bulk');
            expect(notification.level).toContain('success');
            expect(notification.message).toContain('0/1');
        });

        it('should notify error and count errors', async () => {
            const gqlMutation = `mutation {
                saveValueBulk(
                    libraryId: "${testLibName}",
                    attributeId: "${attrTreeMonoValueName}",
                    recordsFilters: [
                        {field: "id", condition: ${AttributeCondition.EQUAL}, value: "${node1RecordId1}"}
                    ],
                    mapValues: [
                        {before: ${treeNodeId1}, after: "id_not_existing"}
                    ]
                )
            }`;

            const saveValueBulkTaskId = (await makeGraphQlCall(gqlMutation)).data.data.saveValueBulk;
            const {notification} = await waitSaveValueBulkWSNotification();
            const {task} = await waitTaskCompleted(saveValueBulkTaskId);

            expect(task.status).toBe(TaskStatus.FAILED);
            expect(notification.title).toContain('Bulk');
            expect(notification.level).toContain('error');
            expect(notification.message).toContain('failed');
        });
    });

    describe('saving values', () => {
        it('should replace some current values', async () => {
            const gqlMutation = `mutation {
                saveValueBulk(
                    libraryId: "${testLibName}",
                    attributeId: "${attrTreeMonoValueName}",
                    recordsFilters: [
                        {field: "id", condition: ${AttributeCondition.EQUAL}, value: "${node1RecordId1}"},
                        {operator: OR},
                        {field: "id", condition: ${AttributeCondition.EQUAL}, value: "${node1RecordId2}"}
                    ],
                    mapValues: [
                        {before: "${treeNodeId1}", after: "${treeNodeId2}"}
                    ]
                )
            }`;

            const saveValueBulkTaskId = (await makeGraphQlCall(gqlMutation)).data.data.saveValueBulk;
            const {task} = await waitTaskCompleted(saveValueBulkTaskId);

            expect(task.status).toBe(TaskStatus.DONE);

            const record = await makeGraphQlCall(`query {
                records(
                    library: "${testLibName}",
                    filters: [
                        {field: "id", condition: ${AttributeCondition.EQUAL}, value: "${node1RecordId1}"},
                        {operator: OR},
                        {field: "id", condition: ${AttributeCondition.EQUAL}, value: "${node1RecordId2}"}
                    ]
                ) {
                    list {
                       id
                       property(attribute: "${attrTreeMonoValueName}") {
                            ... on TreeValue {
                                payload {
                                    id
                                }
                            }
                        }
                    }
                }
            }`);

            expect(record.data.data.records.list.length).toBe(2);
            expect(record.data.data.records.list[0].property[0].payload.id).toBe(treeNodeId2);
            expect(record.data.data.records.list[1].property[0].payload.id).toBe(treeNodeId2);
        });

        it('should replace an undefined value', async () => {
            const gqlMutation = `mutation {
            saveValueBulk(
                libraryId: "${testLibName}",
                attributeId: "${attrTreeMonoValueName}",
                recordsFilters: [
                    {field: "id", condition: ${AttributeCondition.EQUAL}, value: "${noNodeRecordId4}"}
                ],
                mapValues: [
                    {before: null, after: "${treeNodeId1}"}
                ]
            )
        }`;

            const saveValueBulkTaskId = (await makeGraphQlCall(gqlMutation)).data.data.saveValueBulk;
            const {task} = await waitTaskCompleted(saveValueBulkTaskId);

            expect(task.status).toBe(TaskStatus.DONE);

            const record = await makeGraphQlCall(`query {
                records(
                    library: "${testLibName}",
                    filters: [ {field: "id", condition: ${AttributeCondition.EQUAL}, value: "${noNodeRecordId4}"}]
                ) {
                    list {
                       id
                       property(attribute: "${attrTreeMonoValueName}") {
                            ... on TreeValue {
                                payload {
                                    id
                                }
                            }
                        }
                    }
                }
            }`);

            expect(record.data.data.records.list[0].property[0].payload.id).toBe(treeNodeId1);
        });

        it('should replace by an undefined value', async () => {
            const gqlMutation = `mutation {
            saveValueBulk(
                libraryId: "${testLibName}",
                attributeId: "${attrTreeMonoValueName}",
                recordsFilters: [
                    {field: "id", condition: ${AttributeCondition.EQUAL}, value: "${node1RecordId3}"}
                ],
                mapValues: [
                    {before: "${treeNodeId1}", after: null}
                ]
            )
        }`;

            const saveValueBulkTaskId = (await makeGraphQlCall(gqlMutation)).data.data.saveValueBulk;
            const {task} = await waitTaskCompleted(saveValueBulkTaskId);

            expect(task.status).toBe(TaskStatus.DONE);

            const record = await makeGraphQlCall(`query {
                records(
                    library: "${testLibName}",
                    filters: [ {field: "id", condition: ${AttributeCondition.EQUAL}, value: "${node1RecordId3}"}]
                ) {
                    list {
                       id
                       property(attribute: "${attrTreeMonoValueName}") {
                            ... on TreeValue {
                                payload {
                                    id
                                }
                            }
                        }
                    }
                }
            }`);

            expect(record.data.data.records.list[0].property[0]).toBeUndefined();
        });
    });

    const waitSaveValueBulkWSNotification = () =>
        waitGraphqlWebSocketMessage<Pick<IPubSubNotificationData, 'notification'>>(
            graphqlClient,
            subscriptionGraphqlQuery,
            {},
            data => data?.notification?.title?.includes('Bulk'),
            {timeoutMs: 20000},
        );

    const waitTaskCompleted = async (taskId: string) =>
        waitGraphqlWebSocketMessage<Pick<IPubSubTaskData, 'task'>>(
            graphqlClient,
            `
                subscription {
                    task (filters: { id: "${taskId}" }) {
                        id
                        label
                        status
                    }
                }
            `,
            {},
            data => [TaskStatus.DONE, TaskStatus.FAILED].includes(data?.task?.status),
            {timeoutMs: 20000},
        );

    const subscriptionGraphqlQuery = `
        subscription {
            notification {
                level
                message
                title
                date
                attachments {
                    label
                    url
                }
                relatedEntities {
                    label
                    url
                }
            }
        }
    `;
});
