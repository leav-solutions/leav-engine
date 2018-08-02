import {makeGraphQlCall} from '../e2eUtils';

describe('Permissions', () => {
    const permTreeName = 'perm_tree';
    const permTreeLibName = 'perm_tree_lib';
    const permLibName = 'perm_test_lib';

    let permTreeElemId;
    let allUsersTreeElemId;

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

        // Create an element to insert in permissions tree
        const res = await makeGraphQlCall(`mutation {
            createRecord(library: "${permTreeLibName}") {
                id
            }
        }`);
        permTreeElemId = res.data.data.createRecord.id;

        const resAddTree = await makeGraphQlCall(`mutation {
            treeAddElement(
                treeId: "${permTreeName}",
                element: {id: "${permTreeElemId}", library: "${permTreeLibName}"}
            ) {
                id
            }
        }`);

        const usersGroupsTreeContent = await makeGraphQlCall(`{
            treeContent(treeId: "users_groups") {
                record {
                    id
                }
            }
        }`);
        allUsersTreeElemId = usersGroupsTreeContent.data.data.treeContent[0].record.id;
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

    test('Save a permission', async () => {
        const res = await makeGraphQlCall(`mutation {
            savePermission(
                permission: {
                    type: RECORD,
                    usersGroup: "${allUsersTreeElemId}",
                    target: {tree: "${permTreeName}", library: "${permTreeLibName}", id: "${permTreeElemId}"},
                    actions: [
                        {name: ACCESS, allowed: true}, {name:EDIT, allowed: true}
                    ]
                }
            ) {
                type
                usersGroup
                target {
                    tree
                    library
                    id
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.savePermission.type).toBeDefined();
        expect(res.data.errors).toBeUndefined();
    });

    test('Get a permission', async () => {
        const res = await makeGraphQlCall(`{
            permission(
                type: RECORD,
                usersGroup: "${allUsersTreeElemId}",
                target: {tree: "${permTreeName}", library: "${permTreeLibName}", id: "${permTreeElemId}"},
                action: ACCESS
            )
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.permission).toBe(true);
        expect(res.data.errors).toBeUndefined();
    });
});
