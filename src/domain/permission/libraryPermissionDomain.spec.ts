// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IQueryInfos} from '_types/queryInfos';
import {LibraryPermissionsActions} from '../../_types/permissions';
import * as getDefaultPermission from './helpers/getDefaultPermission';
import * as getPermissionByUserGroups from './helpers/getPermissionByUserGroups';
import libraryPermissionDomain from './libraryPermissionDomain';

jest.mock('./helpers/getDefaultPermission', () => jest.fn().mockReturnValue(false));

describe('LibraryPermissionDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'permissionDomainTest'
    };

    describe('getLibraryPermission', () => {
        const defaultPerm = false;
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
            const mockPermRepo: Mockify<IPermissionRepo> = {};
            const permDomain = libraryPermissionDomain({
                'core.infra.permission': mockPermRepo as IPermissionRepo,
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });
            jest.spyOn(getPermissionByUserGroups, 'default').mockReturnValue(Promise.resolve(true));
            jest.spyOn(getDefaultPermission, 'default').mockReturnValue(defaultPerm);

            const perm = await permDomain.getLibraryPermission({
                action: LibraryPermissionsActions.ACCESS_RECORD,
                libraryId: 'test_lib',
                userId: '12345',
                ctx
            });

            expect(perm).toBe(true);
        });

        test('Return default permission if nothing defined', async () => {
            const mockPermRepo: Mockify<IPermissionRepo> = {};
            const permDomain = libraryPermissionDomain({
                'core.infra.permission': mockPermRepo as IPermissionRepo,
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            jest.spyOn(getPermissionByUserGroups, 'default').mockReturnValue(Promise.resolve(null));
            jest.spyOn(getDefaultPermission, 'default').mockReturnValue(defaultPerm);

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
            const permDomain = libraryPermissionDomain({
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });
            jest.spyOn(getPermissionByUserGroups, 'default').mockReturnValue(Promise.resolve(true));

            const perm = await permDomain.getHeritedLibraryPermission({
                action: LibraryPermissionsActions.ACCESS_RECORD,
                libraryId: 'test_lib',
                userGroupId: '12345',
                ctx
            });

            expect(perm).toBe(true);
        });
        test('Herit of default perm if nothing defined', async () => {
            const permDomain = libraryPermissionDomain({
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            jest.spyOn(getPermissionByUserGroups, 'default').mockReturnValue(Promise.resolve(null));
            jest.spyOn(getDefaultPermission, 'default').mockReturnValue(false);

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
