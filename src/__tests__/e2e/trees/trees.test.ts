import {makeGraphQlCall} from '../e2eUtils';

describe('Trees', () => {
    const testTreeName = 'test_tree';
    test('Create Tree', async () => {
        const res = await makeGraphQlCall(`mutation {
            saveTree(
                tree: {id: "${testTreeName}", label: {fr: "Test tree"}, libraries: ["users"]}
            ) {
                id
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.saveTree.id).toBe(testTreeName);
        expect(res.data.errors).toBeUndefined();

        // Create another one for tests
        await makeGraphQlCall(`mutation {
            saveTree(
                tree: {id: "${testTreeName}2", label: {fr: "Test tree 2"}, libraries: ["users"]}
            ) {
                id
            }
        }`);
    });

    test('Get Trees list', async () => {
        const res = await makeGraphQlCall('{ trees { id libraries } }');

        expect(res.status).toBe(200);
        expect(res.data.data.trees.length).toBeGreaterThanOrEqual(2);
        expect(res.data.errors).toBeUndefined();
    });

    test('Get Tree by ID', async () => {
        const res = await makeGraphQlCall(`{ trees(id: "${testTreeName}") { id libraries } }`);

        expect(res.status).toBe(200);
        expect(res.data.data.trees.length).toBe(1);
        expect(res.data.data.trees[0].libraries).toBeDefined();
        expect(res.data.errors).toBeUndefined();
    });

    test('Delete a tree', async () => {
        const res = await makeGraphQlCall(`mutation {deleteTree(id: "${testTreeName}") { id }}`);

        expect(res.status).toBe(200);
        expect(res.data.data.deleteTree).toBeDefined();
        expect(res.data.data.deleteTree.id).toBe(testTreeName);
        expect(res.data.errors).toBeUndefined();
    });
});
