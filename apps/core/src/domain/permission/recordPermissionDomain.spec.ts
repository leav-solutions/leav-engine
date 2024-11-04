// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IValueRepo} from 'infra/value/valueRepo';
import {IQueryInfos} from '_types/queryInfos';
import {RecordPermissionsActions} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IPermissionByUserGroupsHelper} from './helpers/permissionByUserGroups';
import {ITreeBasedPermissionHelper} from './helpers/treeBasedPermissions';
import {ILibraryPermissionDomain} from './libraryPermissionDomain';
import recordPermissionDomain, {IRecordPermissionDomainDeps} from './recordPermissionDomain';
import {ToAny} from 'utils/utils';

const depsBase: ToAny<IRecordPermissionDomainDeps> = {
    'core.domain.permission.library': jest.fn(),
    'core.domain.permission.helpers.treeBasedPermissions': jest.fn(),
    'core.domain.permission.helpers.permissionByUserGroups': jest.fn(),
    'core.domain.permission.helpers.defaultPermission': jest.fn(),
    'core.domain.attribute': jest.fn(),
    'core.domain.helpers.getCoreEntityById': jest.fn(),
    'core.infra.value': jest.fn()
};

describe('recordPermissionDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'recordPermissionDomainTest'
    };

    const defaultPerm = false;

    describe('getRecordPermission', () => {
        const mockTreeBasedPerm = {
            getTreeBasedPermission: global.__mockPromise(true)
        } satisfies Mockify<ITreeBasedPermissionHelper>;

        const mockLibPermDomain: Mockify<ILibraryPermissionDomain> = {
            getLibraryPermission: jest.fn().mockReturnValue(defaultPerm)
        };

        const mockLibSimplePerms = {
            system: false,
            permissions_conf: {
                relation: 'AND',
                permissionTreeAttributes: ['category']
            }
        };

        const mockAttrProps = {
            category: {
                id: 'category',
                type: 'tree',
                linked_tree: 'categories'
            }
        };
        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getAttributeProperties: jest.fn().mockImplementation(({id}) => Promise.resolve(mockAttrProps[id]))
        };

        const mockValueRepo = {
            getValues: jest.fn().mockImplementation(({attribute}) => {
                let val;
                switch (attribute.id) {
                    case 'category':
                        val = {
                            id_value: 12345,
                            payload: {
                                record: {
                                    id: 1,
                                    library: 'category'
                                }
                            }
                        };
                        break;
                    case 'user_groups':
                        val = {
                            id_value: 54321,
                            payload: {
                                record: {
                                    id: 1,
                                    library: 'users_groups'
                                }
                            }
                        };
                        break;
                }

                return Promise.resolve([val]);
            })
        } satisfies Mockify<IValueRepo>;

        test('Return record permission', async () => {
            const mockGetCoreEntityById = global.__mockPromise(mockLibSimplePerms);

            const recordPermDomain = recordPermissionDomain({
                ...depsBase,
                'core.domain.permission.helpers.treeBasedPermissions': mockTreeBasedPerm as ITreeBasedPermissionHelper,
                'core.domain.permission.library': mockLibPermDomain as ILibraryPermissionDomain,
                'core.domain.helpers.getCoreEntityById': mockGetCoreEntityById,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValueRepo as any
            });

            const perm = await recordPermDomain.getRecordPermission({
                action: RecordPermissionsActions.ACCESS_RECORD,
                userId: '987654',
                library: 'test_lib',
                recordId: '123456',
                ctx
            });

            expect(mockTreeBasedPerm.getTreeBasedPermission.mock.calls.length).toBe(1);
            expect(mockValueRepo.getValues.mock.calls.length).toBe(1);
            expect(perm).toBe(true);
        });

        test('Return default permission if no config', async () => {
            const mockGetCoreEntityById = global.__mockPromise({system: false});

            const recordPermDomain = recordPermissionDomain({
                ...depsBase,
                'core.domain.permission.helpers.treeBasedPermissions': mockTreeBasedPerm as ITreeBasedPermissionHelper,
                'core.domain.permission.library': mockLibPermDomain as ILibraryPermissionDomain,
                'core.domain.helpers.getCoreEntityById': mockGetCoreEntityById,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValueRepo as any
            });

            const perm = await recordPermDomain.getRecordPermission({
                action: RecordPermissionsActions.ACCESS_RECORD,
                userId: '987654',
                library: 'test_lib',
                recordId: '123456',
                ctx
            });

            expect(mockLibPermDomain.getLibraryPermission).toBeCalled();
            expect(perm).toBe(defaultPerm);
        });
    });

    describe('getInheritedRecordPermission', () => {
        test('Return herited record permission', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(true)
            };

            const mockTreeBasedPerm: Mockify<ITreeBasedPermissionHelper> = {
                getInheritedTreeBasedPermission: global.__mockPromise(true)
            };

            const recordPermDomain = recordPermissionDomain({
                ...depsBase,
                'core.domain.permission.helpers.permissionByUserGroups':
                    mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.domain.permission.helpers.treeBasedPermissions': mockTreeBasedPerm as ITreeBasedPermissionHelper
            });

            const perm = await recordPermDomain.getInheritedRecordPermission({
                action: RecordPermissionsActions.ACCESS_RECORD,
                userGroupId: '12345',
                library: 'test_lib',
                permTree: 'test_tree',
                permTreeNode: '54321',
                ctx
            });

            expect(perm).toBe(true);
        });
    });
});
