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
        const treeToDelete = testTreeName + '2';
        const res = await makeGraphQlCall(`mutation {deleteTree(id: "${treeToDelete}") { id }}`);

        expect(res.status).toBe(200);
        expect(res.data.data.deleteTree).toBeDefined();
        expect(res.data.data.deleteTree.id).toBe(treeToDelete);
        expect(res.data.errors).toBeUndefined();
    });

    test('Manipulate elements in a tree', async () => {
        const resCreaRecord = await makeGraphQlCall(`
                mutation {
                    r1: createRecord(library: "users") {id},
                    r2: createRecord(library: "users") {id}
                }
            `);
        const recordId1 = resCreaRecord.data.data.r1.id;
        const recordId2 = resCreaRecord.data.data.r2.id;

        const resAdd = await makeGraphQlCall(`mutation {
                a1: treeAddElement(treeId: "${testTreeName}", element: {id: "${recordId1}", library: "users"}) {id},
                a2: treeAddElement(treeId: "${testTreeName}", element: {id: "${recordId2}", library: "users"}) {id}
            }`);

        expect(resAdd.status).toBe(200);
        expect(resAdd.data.data.a1).toBeDefined();
        expect(resAdd.data.data.a1.id).toBeTruthy();
        expect(resAdd.data.errors).toBeUndefined();

        const resMove = await makeGraphQlCall(`mutation {
                treeMoveElement(
                    treeId: "${testTreeName}",
                    element: {id: "${recordId1}", library: "users"}
                    parentTo: {id: "${recordId2}", library: "users"}
                ) {
                    id
                }
            }`);

        expect(resMove.status).toBe(200);
        expect(resMove.data.data.treeMoveElement).toBeDefined();
        expect(resMove.data.data.treeMoveElement.id).toBeTruthy();
        expect(resMove.data.errors).toBeUndefined();

        const restreeContent = await makeGraphQlCall(`
        {
            treeContent(treeId: "${testTreeName}", fields: ["id", "modified_at", "created_at"])
        }
        `);

        expect(restreeContent.status).toBe(200);
        expect(restreeContent.data.data.treeContent).toBeDefined();
        expect(Array.isArray(restreeContent.data.data.treeContent)).toBe(true);
        expect(restreeContent.data.errors).toBeUndefined();

        const resDel = await makeGraphQlCall(`mutation {
            treeDeleteElement(
                treeId: "${testTreeName}",
                element: {id: "${recordId2}", library: "users"}
            ) {
                id
            }
        }`);

        expect(resDel.status).toBe(200);
        expect(resDel.data.data.treeDeleteElement).toBeDefined();
        expect(resDel.data.data.treeDeleteElement.id).toBeTruthy();
        expect(resDel.data.errors).toBeUndefined();
    });
});
