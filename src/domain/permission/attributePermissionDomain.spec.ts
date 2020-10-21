import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IQueryInfos} from '_types/queryInfos';
import {AttributePermissionsActions} from '../../_types/permissions';
import attributePermissionDomain from './attributePermissionDomain';
import * as getDefaultPermission from './helpers/getDefaultPermission';
import * as getPermissionByUserGroups from './helpers/getPermissionByUserGroups';

jest.mock('./helpers/getDefaultPermission', () => jest.fn().mockReturnValue(false));

describe('AttributePermissionDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'permissionDomainTest'
    };

    describe('getAttributePermission', () => {
        const defaultPerm = false;
        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getAttributeProperties: global.__mockPromise({
                id: 'user_groups',
                linked_tree: 'users_groups'
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

        test('Return attribute permission', async () => {
            const mockPermRepo: Mockify<IPermissionRepo> = {};
            const permDomain = attributePermissionDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.permission': mockPermRepo as IPermissionRepo,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });
            jest.spyOn(getPermissionByUserGroups, 'default').mockReturnValue(Promise.resolve(true));
            jest.spyOn(getDefaultPermission, 'default').mockReturnValue(defaultPerm);

            const perm = await permDomain.getAttributePermission({
                action: AttributePermissionsActions.ACCESS_ATTRIBUTE,
                attributeId: 'test_attr',
                ctx
            });

            expect(perm).toBe(true);
        });

        test('Return default permission if nothing defined', async () => {
            const mockPermRepo: Mockify<IPermissionRepo> = {};
            const permDomain = attributePermissionDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.permission': mockPermRepo as IPermissionRepo,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            jest.spyOn(getPermissionByUserGroups, 'default').mockReturnValue(Promise.resolve(null));
            jest.spyOn(getDefaultPermission, 'default').mockReturnValue(defaultPerm);

            const perm = await permDomain.getAttributePermission({
                action: AttributePermissionsActions.ACCESS_ATTRIBUTE,
                attributeId: 'test_attr',
                ctx
            });

            expect(perm).toBe(defaultPerm);
        });
    });

    describe('getHeritedAttributePermission', () => {
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
            const permDomain = attributePermissionDomain({
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });
            jest.spyOn(getPermissionByUserGroups, 'default').mockReturnValue(Promise.resolve(true));

            const perm = await permDomain.getHeritedAttributePermission({
                action: AttributePermissionsActions.ACCESS_ATTRIBUTE,
                attributeId: 'test_attr',
                userGroupId: '12345',
                ctx
            });

            expect(perm).toBe(true);
        });

        test('Herit of default perm if nothing defined', async () => {
            const permDomain = attributePermissionDomain({
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            jest.spyOn(getPermissionByUserGroups, 'default').mockReturnValue(Promise.resolve(null));
            jest.spyOn(getDefaultPermission, 'default').mockReturnValue(false);

            const perm = await permDomain.getHeritedAttributePermission({
                action: AttributePermissionsActions.ACCESS_ATTRIBUTE,
                attributeId: 'test_attr',
                userGroupId: '12345',
                ctx
            });

            expect(perm).toBe(false);
        });
    });
});
