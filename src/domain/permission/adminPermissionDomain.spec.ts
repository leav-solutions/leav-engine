import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {AdminPermisisonsActions} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import adminPermissionDomain from './adminPermissionDomain';
import {IPermissionDomain} from './permissionDomain';

describe('AdminPermissionDomain', () => {
    describe('getAdminPermission', () => {
        const defaultPerm = false;
        const mockAttrRepo: Mockify<IAttributeRepo> = {
            getAttributes: global.__mockPromise([
                {
                    id: 'user_groups',
                    linked_tree: 'users_groups'
                }
            ])
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

        test('Return admin permission', async () => {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                getPermissionByUserGroups: global.__mockPromise(true),
                getDefaultPermission: jest.fn().mockReturnValue(defaultPerm)
            };

            const adminPermDomain = adminPermissionDomain(
                mockPermDomain as IPermissionDomain,
                mockAttrRepo as IAttributeRepo,
                mockValRepo as IValueRepo,
                mockTreeRepo as ITreeRepo
            );

            const perm = await adminPermDomain.getAdminPermission(AdminPermisisonsActions.CREATE_ATTRIBUTE, 12345);

            expect(perm).toBe(true);
        });

        test('Return default permission if nothing defined', async () => {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                getPermissionByUserGroups: global.__mockPromise(null),
                getDefaultPermission: jest.fn().mockReturnValue(defaultPerm)
            };

            const adminPermDomain = adminPermissionDomain(
                mockPermDomain as IPermissionDomain,
                mockAttrRepo as IAttributeRepo,
                mockValRepo as IValueRepo,
                mockTreeRepo as ITreeRepo
            );

            const perm = await adminPermDomain.getAdminPermission(AdminPermisisonsActions.CREATE_ATTRIBUTE, 12345);

            expect(perm).toBe(defaultPerm);
        });
    });
});
