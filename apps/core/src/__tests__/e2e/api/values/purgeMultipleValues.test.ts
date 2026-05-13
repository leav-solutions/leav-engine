import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {
    adminUserSdk,
    gqlAddElemToTree,
    gqlCreateRecord,
    gqlGetValue,
    gqlSaveAttribute,
    gqlSaveTree,
    gqlSaveValueBis,
    makeGraphQlCall,
} from '../e2eUtils';
import {TaskStatus} from '../../../../_types/tasksManager';
import {waitForTaskCompletedWithStatus} from '../taskUtils';

describe('Purge multiple values', () => {
    const testLibId = 'purge_multiple_values_library_test';
    const treeLibId = 'purge_multiple_values__tree_library_test';
    const treeId = 'purge_multiple_values_tree_test';

    const attrAdvancedId = 'purge_multiple_values__attribute_test_advanced';
    const attrAdvancedLinkId = 'purge_multiple_values__attribute_test_advanced_link';
    const attrTreeId = 'purge_multiple_values__attribute_test_tree';

    let testRecordId: string;
    let treeRecord1: string;
    let treeRecord2: string;
    let recordTarget1: string;
    let recordTarget2: string;

    let idValue1: string;
    let idValue2: string;
    let idRecordValue1: string;
    let idRecordValue2: string;
    let idNodeValue1: string;
    let idNodeValue2: string;

    let treeNodeId1: string;
    let treeNodeId2: string;

    beforeAll(async () => {
        await gqlSaveAttribute({
            id: attrAdvancedId,
            type: AttributeTypes.ADVANCED,
            label: 'Test attr advanced',
            multipleValues: true,
            format: AttributeFormats.TEXT,
        });

        await gqlSaveAttribute({
            id: attrAdvancedLinkId,
            type: AttributeTypes.ADVANCED_LINK,
            label: 'Test attr advanced link',
            multipleValues: true,
            linkedLibrary: testLibId,
        });

        await makeGraphQlCall(`mutation {
            saveLibrary(library: {
                id: "${treeLibId}", 
                label: {en: "Test tree lib"},
            }) { id }
        }`);

        await gqlSaveTree(treeId, 'Test tree', [treeLibId]);

        await gqlSaveAttribute({
            id: attrTreeId,
            type: AttributeTypes.TREE,
            label: 'Test attr tree',
            multipleValues: true,
            linkedTree: treeId,
        });

        await adminUserSdk.SaveLibrary({
            library: {
                id: testLibId,
                label: {en: 'Test lib'},
                attributes: [attrAdvancedId, attrAdvancedLinkId, attrTreeId],
            },
        });

        treeRecord1 = await gqlCreateRecord(treeLibId);
        treeRecord2 = await gqlCreateRecord(treeLibId);

        treeNodeId1 = await gqlAddElemToTree(treeId, {
            id: treeRecord1,
            library: treeLibId,
        });
        treeNodeId2 = await gqlAddElemToTree(treeId, {
            id: treeRecord2,
            library: treeLibId,
        });

        recordTarget1 = await gqlCreateRecord(testLibId);
        recordTarget2 = await gqlCreateRecord(testLibId);
        testRecordId = await gqlCreateRecord(testLibId);

        idValue1 = await gqlSaveValueBis(attrAdvancedId, testLibId, testRecordId, {payload: 'value1'});
        idValue2 = await gqlSaveValueBis(attrAdvancedId, testLibId, testRecordId, {payload: 'value2'});

        idRecordValue1 = await gqlSaveValueBis(attrAdvancedLinkId, testLibId, testRecordId, {
            payload: recordTarget1,
        });
        idRecordValue2 = await gqlSaveValueBis(attrAdvancedLinkId, testLibId, testRecordId, {
            payload: recordTarget2,
        });

        idNodeValue1 = await gqlSaveValueBis(attrTreeId, testLibId, testRecordId, {payload: treeNodeId1});
        idNodeValue2 = await gqlSaveValueBis(attrTreeId, testLibId, testRecordId, {payload: treeNodeId2});

        // Set multiple values property as false for all attributes
        await gqlSaveAttribute({
            id: attrAdvancedId,
            type: AttributeTypes.ADVANCED,
            label: 'Test attr advanced',
            multipleValues: false,
            linkedLibrary: testLibId,
        });

        await gqlSaveAttribute({
            id: attrAdvancedLinkId,
            type: AttributeTypes.ADVANCED_LINK,
            label: 'Test attr advanced link',
            multipleValues: false,
            linkedLibrary: testLibId,
        });

        await gqlSaveAttribute({
            id: attrTreeId,
            type: AttributeTypes.TREE,
            label: 'Test attr tree',
            multipleValues: false,
            linkedTree: treeId,
        });
    });

    it('should purge multiple values on advanced attribute', async () => {
        const gqlMutation = `mutation {
            purgeMultipleValues(attributeId: "${attrAdvancedId}")
        }`;

        const purgeMultipleValuesTaskId = (await makeGraphQlCall(gqlMutation)).data.data.purgeMultipleValues;
        await waitForTaskCompletedWithStatus(purgeMultipleValuesTaskId, TaskStatus.DONE);

        // Enable multipleValues to check that only the latest value remains, because of the gqlGetValue query
        // returning a single value when multipleValues is false, even if several values exist for the record
        await gqlSaveAttribute({
            id: attrAdvancedId,
            type: AttributeTypes.ADVANCED,
            label: 'Test attr advanced',
            multipleValues: true,
            linkedLibrary: testLibId,
        });

        const values = await gqlGetValue(testLibId, testRecordId, attrAdvancedId);

        expect(values).toHaveLength(1);
        expect(values).toEqual([
            {
                id_value: idValue2,
                valuePayload: 'value2',
            },
        ]);
    });

    it('should purge multiple values on advanced link attribute', async () => {
        const gqlMutation = `mutation {
            purgeMultipleValues(attributeId: "${attrAdvancedLinkId}")
        }`;
        const purgeMultipleValuesTaskId = (await makeGraphQlCall(gqlMutation)).data.data.purgeMultipleValues;
        await waitForTaskCompletedWithStatus(purgeMultipleValuesTaskId, TaskStatus.DONE);

        // Enable multipleValues to check that only the latest value remains, because of the gqlGetValue query
        // returning a single value when multipleValues is false, even if several values exist for the record
        await gqlSaveAttribute({
            id: attrAdvancedLinkId,
            type: AttributeTypes.ADVANCED_LINK,
            label: 'Test attr advanced link',
            multipleValues: true,
            linkedLibrary: testLibId,
        });

        const values = await gqlGetValue(testLibId, testRecordId, attrAdvancedLinkId);

        expect(values).toHaveLength(1);
        expect(values).toEqual([
            {
                id_value: idRecordValue2,
                linkPayload: {
                    whoAmI: {
                        id: recordTarget2,
                        label: null,
                    },
                },
            },
        ]);
    });

    it('should purge multiple values on tree attribute', async () => {
        const gqlMutation = `mutation {
            purgeMultipleValues(attributeId: "${attrTreeId}")
        }`;
        const purgeMultipleValuesTaskId = (await makeGraphQlCall(gqlMutation)).data.data.purgeMultipleValues;
        await waitForTaskCompletedWithStatus(purgeMultipleValuesTaskId, TaskStatus.DONE);

        // Enable multipleValues to check that only the latest value remains, because of the gqlGetValue query
        // returning a single value when multipleValues is false, even if several values exist for the record
        await gqlSaveAttribute({
            id: attrTreeId,
            type: AttributeTypes.TREE,
            label: 'Test attr tree',
            multipleValues: true,
            linkedTree: treeId,
        });

        const values = await gqlGetValue(testLibId, testRecordId, attrTreeId);

        expect(values).toHaveLength(1);
        expect(values).toEqual([
            {
                id_value: idNodeValue2,
                treePayload: {
                    id: treeNodeId2,
                },
            },
        ]);
    });
});
