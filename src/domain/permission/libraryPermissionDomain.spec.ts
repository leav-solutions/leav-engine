// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IQueryInfos} from '_types/queryInfos';
import {LibraryPermissionsActions} from '../../_types/permissions';
import {IDefaultPermissionHelper} from './helpers/defaultPermission';
import {IPermissionByUserGroupsHelper} from './helpers/permissionByUserGroups';
import libraryPermissionDomain from './libraryPermissionDomain';

describe('LibraryPermissionDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'permissionDomainTest'
    };

    const defaultPerm = false;
    const mockDefaultPermHelper: Mockify<IDefaultPermissionHelper> = {
        getDefaultPermission: global.__mockPromise(defaultPerm)
    };

    describe('getLibraryPermission', () => {
        const mockAttrRepo: Mockify<IAttributeRepo> = {
            getAttributes: global.__mockPromise({
                list: [
                    {
                        id: 'user_groups',
                        linked_tree: 'users_groups'
                    }
                ],
                totalCount: 0
            })
        };

        const mockValRepo: Mockify<IValueRepo> = {
            getValues: global.__mockPromise([
                {
                    id_value: 54321,
                    value: {
                        record: {
                            id: 1,
                            library: 'users_groups'
                        }
                    }
                }
            ])
        };

        const mockTreeRepo: Mockify<ITreeRepo> = {
            getElementAncestors: global.__mockPromise([
                {
                    record: {
                        id: 1,
                        library: 'users_groups'
                    }
                },
                {
                    record: {
                        id: 2,
                        library: 'users_groups'
                    }
                },
                {
                    record: {
                        id: 3,
                        library: 'users_groups'
                    }
                }
            ])
        };

        test('Return library permission', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(true)
            };

            const permDomain = libraryPermissionDomain({
                'core.domain.permission.helpers.defaultPermission': mockDefaultPermHelper as IDefaultPermissionHelper,
                'core.domain.permission.helpers.permissionByUserGroups': mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const perm = await permDomain.getLibraryPermission({
                action: LibraryPermissionsActions.ACCESS_RECORD,
                libraryId: 'test_lib',
                userId: '12345',
                ctx
            });

            expect(perm).toBe(true);
        });

        test('Return default permission if nothing defined', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(null)
            };

            const permDomain = libraryPermissionDomain({
                'core.domain.permission.helpers.defaultPermission': mockDefaultPermHelper as IDefaultPermissionHelper,
                'core.domain.permission.helpers.permissionByUserGroups': mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const perm = await permDomain.getLibraryPermission({
                action: LibraryPermissionsActions.ACCESS_RECORD,
                libraryId: 'test_lib',
                userId: '12345',
                ctx
            });

            expect(perm).toBe(defaultPerm);
        });
    });

    describe('getHeritedLibraryPermission', () => {
        const mockTreeRepo: Mockify<ITreeRepo> = {
            getElementAncestors: global.__mockPromise([
                {
                    record: {
                        id: 1,
                        library: 'users_groups'
                    }
                },
                {
                    record: {
                        id: 2,
                        library: 'users_groups'
                    }
                },
                {
                    record: {
                        id: 3,
                        library: 'users_groups'
                    }
                }
            ])
        };
        test('Return herited library permission', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(true)
            };

            const permDomain = libraryPermissionDomain({
                'core.domain.permission.helpers.permissionByUserGroups': mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const perm = await permDomain.getHeritedLibraryPermission({
                action: LibraryPermissionsActions.ACCESS_RECORD,
                libraryId: 'test_lib',
                userGroupId: '12345',
                ctx
            });

            expect(perm).toBe(true);
        });
        test('Herit of default perm if nothing defined', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(null)
            };

            const permDomain = libraryPermissionDomain({
                'core.domain.permission.helpers.defaultPermission': mockDefaultPermHelper as IDefaultPermissionHelper,
                'core.domain.permission.helpers.permissionByUserGroups': mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const perm = await permDomain.getHeritedLibraryPermission({
                action: LibraryPermissionsActions.ACCESS_RECORD,
                libraryId: 'test_lib',
                userGroupId: '12345',
                ctx
            });

            expect(perm).toBe(false);
        });
    });
});
