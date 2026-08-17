import {AttributeFormat, AttributeType, type LibraryInput} from '../_gqlTypes';
import {TaskStatus} from '../../../_types/tasksManager';
import {adminUserSdk} from '../api/e2eUtils';
import {waitForTaskCompletedWithStatus} from '../api/taskUtils';

// Regression coverage for the `searchQuery` param on `listDistinctValues` and `saveValueBulk`:
// mass-editing a tree attribute must be scoped to the searched records, not the whole selection
// value. See apps/core/src/app/core/valueApp.ts's `listDistinctValues` resolver. Lives here (not
// under api/) because it needs the indexationManager wired up to build the fulltext search view.
describe('searchQueryScoping', () => {
    const treeLibName = 'search_query_scoping_tree_library_test';
    const treeName = 'search_query_scoping_tree_test';
    const libName = 'search_query_scoping_library_test';
    const labelAttrName = 'search_query_scoping_label_test';
    const treeAttrName = 'search_query_scoping_tree_attribute_test';

    let treeNodeId: string;
    let matchingRecordId1: string;
    let matchingRecordId2: string;
    let nonMatchingRecordId: string;

    const waitForIndexedMatchCount = (expectedCount: number): Promise<void> =>
        vi.waitFor(
            async () => {
                const {listDistinctValues: distinctValues} = await adminUserSdk.ListDistinctValues({
                    library: libName,
                    attribute: treeAttrName,
                    searchQuery: 'gizmoneedle',
                });
                expect(distinctValues[0]?.count ?? 0).toBe(expectedCount);
            },
            {timeout: 10_000, interval: 500},
        );

    beforeAll(async () => {
        await adminUserSdk.SaveAttribute({
            attribute: {
                id: labelAttrName,
                type: AttributeType.simple,
                format: AttributeFormat.text,
                label: {en: 'Label'},
            },
        });

        await adminUserSdk.SaveLibrary({
            library: {
                id: treeLibName,
                label: {en: 'Tree library'},
            },
        });

        await adminUserSdk.SaveTree({
            tree: {
                id: treeName,
                label: {en: 'Tree'},
                libraries: [
                    {
                        library: treeLibName,
                        settings: {allowMultiplePositions: false, allowedAtRoot: true, allowedChildren: ['__all__']},
                    },
                ],
            },
        });

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: treeAttrName,
                type: AttributeType.tree,
                label: {en: 'Tree attribute'},
                linked_tree: treeName,
                multiple_values: false,
            },
        });

        const libraryInput: LibraryInput = {
            id: libName,
            label: {en: 'Test library'},
            attributes: [labelAttrName, treeAttrName],
            // Fulltext search only ever matches attributes explicitly indexed for the library.
            fullTextAttributes: [labelAttrName],
        };
        await adminUserSdk.SaveLibrary({library: libraryInput});

        const {createRecord: treeLibRecord} = await adminUserSdk.CreateRecord({library: treeLibName});
        treeNodeId = (
            await adminUserSdk.TreeAddElement({
                treeId: treeName,
                element: {id: treeLibRecord.record.id, library: treeLibName},
            })
        ).treeAddElement.id;

        const createRecordWithLabelAndNode = async (label: string) => {
            const {createRecord} = await adminUserSdk.CreateRecord({
                library: libName,
                data: {
                    values: [
                        {attribute: labelAttrName, payload: label},
                        {attribute: treeAttrName, payload: treeNodeId},
                    ],
                },
            });
            return createRecord.record.id;
        };

        matchingRecordId1 = await createRecordWithLabelAndNode('gizmoneedle alpha');
        matchingRecordId2 = await createRecordWithLabelAndNode('gizmoneedle beta');
        nonMatchingRecordId = await createRecordWithLabelAndNode('widgetother');

        // Fulltext indexation is event-driven (RabbitMQ), not synchronous with record creation —
        // wait for the 2 needle records to be indexed before running any searchQuery assertion.
        await waitForIndexedMatchCount(2);
    });

    describe('listDistinctValues', () => {
        test('without searchQuery counts every record sharing the value', async () => {
            const {listDistinctValues: distinctValues} = await adminUserSdk.ListDistinctValues({
                library: libName,
                attribute: treeAttrName,
            });

            expect(distinctValues).toEqual([expect.objectContaining({count: 3, treeNode: {id: treeNodeId}})]);
        });

        test('with searchQuery only counts the matching records', async () => {
            const {listDistinctValues: distinctValues} = await adminUserSdk.ListDistinctValues({
                library: libName,
                attribute: treeAttrName,
                searchQuery: 'gizmoneedle',
            });

            expect(distinctValues).toEqual([expect.objectContaining({count: 2, treeNode: {id: treeNodeId}})]);
        });
    });

    describe('saveValueBulk', () => {
        test('with searchQuery only edits the matching records, leaving the rest untouched', async () => {
            const saveValueBulkTaskId = await adminUserSdk.SaveValueBulk({
                libraryId: libName,
                attributeId: treeAttrName,
                recordsFilters: [],
                searchQuery: 'gizmoneedle',
                mapping: [{values: [{before: treeNodeId, after: null}]}],
            });

            await waitForTaskCompletedWithStatus(saveValueBulkTaskId.saveValueBulk, TaskStatus.DONE);

            const {records: matchingRecord1} = await adminUserSdk.GetRecordByIdTreeValuesProperty({
                libraryId: libName,
                recordId: matchingRecordId1,
                attributeId: treeAttrName,
            });
            expect(matchingRecord1.list[0].property).toEqual([]);

            const {records: matchingRecord2} = await adminUserSdk.GetRecordByIdTreeValuesProperty({
                libraryId: libName,
                recordId: matchingRecordId2,
                attributeId: treeAttrName,
            });
            expect(matchingRecord2.list[0].property).toEqual([]);

            const {records: nonMatchingRecord} = await adminUserSdk.GetRecordByIdTreeValuesProperty({
                libraryId: libName,
                recordId: nonMatchingRecordId,
                attributeId: treeAttrName,
            });
            expect(nonMatchingRecord.list[0].property[0]).toMatchObject({
                payload: {id: treeNodeId},
            });
        });
    });
});
