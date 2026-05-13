import {e2eAdminUser, e2eGuestUser, makeGraphQlCall} from '../../e2eUtils';

describe('TreesAdminPermissions', () => {
    const treeId = 'trees_admin_permissions_tree_id';

    beforeAll(async () => {
        const res = await makeGraphQlCall(`mutation {
            saveTree(
                tree: {
                    id: "${treeId}",
                }
            ) {
                id
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.saveTree.id).toBe(treeId);
    });

    describe('create tree', () => {
        it('Should not be authorized to create a tree', async () => {
            const gqlMutation = `mutation {
                saveTree(
                   tree: {
                        id: "trees_admin_permissions_new_tree_id",
                    }
                ) {
                    id
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eGuestUser()})).rejects.toThrow(/Action forbidden/);
        });

        it('Should be authorized to create a tree', async () => {
            const gqlMutation = `mutation {
                saveTree(
                    tree: {
                        id: "trees_admin_permissions_new_tree_id",
                    }
                ) {
                    id
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eAdminUser()})).resolves.toBeDefined();
        });
    });

    describe('edit tree', () => {
        it('Should not be authorized to edit a tree', async () => {
            const gqlMutation = `mutation {
                saveTree(tree: {id: "${treeId}", label: {en: "new label"}}) {
                    id
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eGuestUser()})).rejects.toThrow(/Action forbidden/);
        });

        it('Should be authorized to edit a tree', async () => {
            const gqlMutation = `mutation {
                saveTree(tree: {id: "${treeId}", label: {en: "new label"}}) {
                    id
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eAdminUser()})).resolves.toBeDefined();
        });
    });

    describe('delete tree', () => {
        it('Should not be authorized to delete a tree', async () => {
            const gqlMutation = `mutation { deleteTree(id: "${treeId}") { id } }`;
            await expect(makeGraphQlCall(gqlMutation, {user: e2eGuestUser()})).rejects.toThrow(/Action forbidden/);
        });

        it('Should be authorized to delete a tree', async () => {
            const gqlMutation = `mutation { deleteTree(id: "${treeId}") { id } }`;
            await expect(makeGraphQlCall(gqlMutation, {user: e2eAdminUser()})).resolves.toBeDefined();
        });
    });
});
