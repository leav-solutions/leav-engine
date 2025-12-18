// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IQueryInfos} from '_types/queryInfos';
import {
    type IPermissionsDependenciesTreeTarget,
    type IPermissionsTreeTarget,
    PermissionTypes,
    RecordPermissionsActions,
} from '../../../_types/permissions';
import {type IPermissionRepo} from '../../../infra/permission/permissionRepo';
import {getPermissionRepo} from './integrationTestRepoUtils';

describe('permissionRepo', () => {
    let permissionRepo: IPermissionRepo;

    const ctx: IQueryInfos = {
        userId: '1',
    };
    const recordId = 'test_record_id';
    const permissionTreeTarget1: IPermissionsTreeTarget = {nodeId: null, tree: 'test_tree'};
    const dependTreeTarget1: IPermissionsDependenciesTreeTarget = {
        tree: 'dependent_tree_1',
        nodeId: 'dependent_node_1',
        attributeId: 'dependent_attribute_1',
    };
    const dependTreeTarget2: IPermissionsDependenciesTreeTarget = {
        tree: 'dependent_tree_1',
        nodeId: 'dependent_node_2',
        attributeId: 'dependent_attribute_2',
    };

    beforeAll(async () => {
        permissionRepo = getPermissionRepo();
    });

    describe('many permission exists', () => {
        beforeAll(async () => {
            const simplePermission = await permissionRepo.savePermission({
                permData: {
                    type: PermissionTypes.RECORD,
                    applyTo: recordId,
                    usersGroup: null,
                    actions: {[RecordPermissionsActions.ACCESS_RECORD]: true},
                },
                ctx,
            });

            expect(simplePermission).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    type: PermissionTypes.RECORD,
                    applyTo: recordId,
                    usersGroup: null,
                    actions: {
                        [RecordPermissionsActions.ACCESS_RECORD]: true,
                    },
                }),
            );

            const permissionWithTreeTarget = await permissionRepo.savePermission({
                permData: {
                    type: PermissionTypes.RECORD,
                    applyTo: recordId,
                    usersGroup: null,
                    actions: {[RecordPermissionsActions.ACCESS_RECORD]: true},
                    permissionTreeTarget: permissionTreeTarget1,
                },
                ctx,
            });

            expect(permissionWithTreeTarget).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    type: PermissionTypes.RECORD,
                    applyTo: recordId,
                    usersGroup: null,
                    actions: {
                        [RecordPermissionsActions.ACCESS_RECORD]: true,
                    },
                    permissionTreeTarget: permissionTreeTarget1,
                }),
            );

            const permissionWithTreeDepend = await permissionRepo.savePermission({
                permData: {
                    type: PermissionTypes.RECORD,
                    applyTo: recordId,
                    usersGroup: null,
                    actions: {[RecordPermissionsActions.ACCESS_RECORD]: true},
                    permissionTreeTarget: permissionTreeTarget1,
                    dependenciesTreeTargets: [dependTreeTarget1],
                },
                ctx,
            });

            expect(permissionWithTreeDepend).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    type: PermissionTypes.RECORD,
                    applyTo: recordId,
                    usersGroup: null,
                    actions: {
                        [RecordPermissionsActions.ACCESS_RECORD]: true,
                    },
                    permissionTreeTarget: permissionTreeTarget1,
                    dependenciesTreeTargets: [dependTreeTarget1],
                }),
            );

            await permissionRepo.savePermission({
                permData: {
                    type: PermissionTypes.RECORD,
                    applyTo: recordId,
                    usersGroup: null,
                    actions: {[RecordPermissionsActions.ACCESS_RECORD]: true},
                    permissionTreeTarget: permissionTreeTarget1,
                    dependenciesTreeTargets: [dependTreeTarget1, dependTreeTarget2],
                },
                ctx,
            });
        });

        it('getPermissions simple without permission tree target', async () => {
            const fetchedPermission = await permissionRepo.getPermissions({
                type: PermissionTypes.RECORD,
                applyTo: recordId,
                usersGroupNodeId: null,
                ctx,
            });

            expect(fetchedPermission).toEqual(
                expect.objectContaining({
                    type: PermissionTypes.RECORD,
                    applyTo: recordId,
                    usersGroup: null,
                    actions: {
                        [RecordPermissionsActions.ACCESS_RECORD]: true,
                    },
                }),
            );
            expect(fetchedPermission?.permissionTreeTarget).toBeUndefined();
            expect(fetchedPermission?.dependenciesTreeTargets).toBeUndefined();
        });

        it('getPermissions simple with permission tree target', async () => {
            const fetchedPermission = await permissionRepo.getPermissions({
                type: PermissionTypes.RECORD,
                applyTo: recordId,
                usersGroupNodeId: null,
                permissionTreeTarget: permissionTreeTarget1,
                ctx,
            });

            expect(fetchedPermission).toEqual(
                expect.objectContaining({
                    type: PermissionTypes.RECORD,
                    applyTo: recordId,
                    usersGroup: null,
                    actions: {
                        [RecordPermissionsActions.ACCESS_RECORD]: true,
                    },
                    permissionTreeTarget: permissionTreeTarget1,
                }),
            );
            expect(fetchedPermission?.dependenciesTreeTargets).toBeUndefined();
        });

        it('getPermissions should not find not exact matching for permission tree target', async () => {
            const fetchedPermission = await permissionRepo.getPermissions({
                type: PermissionTypes.RECORD,
                applyTo: recordId,
                usersGroupNodeId: null,
                permissionTreeTarget: {...permissionTreeTarget1, nodeId: 'different_node_id'},
                ctx,
            });

            expect(fetchedPermission).toBeNull();
        });

        it('getPermissions simple with permission tree target and dependent attribute', async () => {
            const fetchedPermission = await permissionRepo.getPermissions({
                type: PermissionTypes.RECORD,
                applyTo: recordId,
                usersGroupNodeId: null,
                permissionTreeTarget: permissionTreeTarget1,
                dependenciesTreeTargets: [dependTreeTarget1],
                ctx,
            });

            expect(fetchedPermission).toEqual(
                expect.objectContaining({
                    type: PermissionTypes.RECORD,
                    applyTo: recordId,
                    usersGroup: null,
                    actions: {
                        [RecordPermissionsActions.ACCESS_RECORD]: true,
                    },
                    permissionTreeTarget: permissionTreeTarget1,
                    dependenciesTreeTargets: [dependTreeTarget1],
                }),
            );
        });

        it('getPermissions simple with permission tree target and 2 dependent attributes', async () => {
            const fetchedPermission = await permissionRepo.getPermissions({
                type: PermissionTypes.RECORD,
                applyTo: recordId,
                usersGroupNodeId: null,
                permissionTreeTarget: permissionTreeTarget1,
                dependenciesTreeTargets: [dependTreeTarget1, dependTreeTarget2],
                ctx,
            });

            expect(fetchedPermission).toEqual(
                expect.objectContaining({
                    type: PermissionTypes.RECORD,
                    applyTo: recordId,
                    usersGroup: null,
                    actions: {
                        [RecordPermissionsActions.ACCESS_RECORD]: true,
                    },
                    permissionTreeTarget: permissionTreeTarget1,
                    dependenciesTreeTargets: [dependTreeTarget1, dependTreeTarget2],
                }),
            );
        });

        it('getPermissions should not find not exact matching for depend tree target', async () => {
            const fetchedPermission = await permissionRepo.getPermissions({
                type: PermissionTypes.RECORD,
                applyTo: recordId,
                usersGroupNodeId: null,
                permissionTreeTarget: permissionTreeTarget1,
                dependenciesTreeTargets: [
                    dependTreeTarget1,
                    {
                        ...dependTreeTarget2,
                        nodeId: 'different_node_id',
                    },
                ],
                ctx,
            });

            expect(fetchedPermission).toBeNull();
        });

        it('getPermissions should ignore dependent tree target in order', async () => {
            const fetchedPermission = await permissionRepo.getPermissions({
                type: PermissionTypes.RECORD,
                applyTo: recordId,
                usersGroupNodeId: null,
                permissionTreeTarget: permissionTreeTarget1,
                dependenciesTreeTargets: [dependTreeTarget2, dependTreeTarget1],
                ctx,
            });

            expect(fetchedPermission).toBeNull();
        });
    });
});
