import {makeGraphQlCall} from '../e2eUtils';

describe('Permissions', () => {
    const permTreeName = 'perm_tree';
    const permTreeLibName = 'perm_tree_lib';
    const permLibName = 'perm_test_lib';

    beforeAll(async () => {
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {id: "${permTreeLibName}", label: {fr: "Test lib"}}) { id }
        }`);

        await makeGraphQlCall(`mutation {
            saveTree(
                tree: {id: "${permTreeName}", label: {fr: "Permissions Test tree"}, libraries: ["${permTreeLibName}"]}
            ) {
                id
            }
        }`);
    });

    test('Save library permissions config', async () => {
        const res = await makeGraphQlCall(`mutation {
            saveLibrary(library: {
                id: "${permLibName}",
                label: {fr: "Permissions Test lib"},
                permissionsConf: {trees: ["${permTreeName}"], relation: AND}
            }) {
                permissionsConf {
                    trees
                    relation
                  }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.saveLibrary.permissionsConf).toBeDefined();
        expect(res.data.errors).toBeUndefined();
    });
});
