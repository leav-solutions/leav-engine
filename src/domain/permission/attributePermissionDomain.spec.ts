import {IValueRepo} from 'infra/value/valueRepo';
import {AttributePermissionsActions, PermissionsRelations} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import attributePermissionDomain from './attributePermissionDomain';
import {IPermissionDomain} from './permissionDomain';
import {ITreePermissionDomain} from './treePermissionDomain';

describe('AttributePermissionDomain', () => {
    describe('getAttributePermission', () => {
        const mockTreePermDomain: Mockify<ITreePermissionDomain> = {
            getTreePermission: global.__mockPromise(true)
        };

        const defaultPerm = false;
        const mockPermDomain: Mockify<IPermissionDomain> = {
            getDefaultPermission: jest.fn().mockReturnValue(defaultPerm)
        };

        const mockAttributeDomain: Mockify<IAttributeDomain> = {
            getAttributeProperties: global.__mockPromise({
                id: 'test_attr',
                permissions_conf: {
                    permissionTreeAttributes: ['category'],
                    relation: PermissionsRelations.AND
                }
            })
        };

        const mockValueRepo: Mockify<IValueRepo> = {
            getValues: jest.fn().mockImplementation((lib, rec, attr) => {
                let val;
                switch (attr.id) {
                    case 'category':
                        val = {
                            id_value: 12345,
                            value: {
                                record: {
                                    id: 1,
                                    library: 'category'
                                }
                            }
                        };
                        break;
                    case 'test_attr':
                        val = {
                            id_value: 12345,
                            value: {
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
                            value: {
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
        };

        test('Return permission', async () => {
            const attrDomain = attributePermissionDomain(
                mockPermDomain as IPermissionDomain,
                mockTreePermDomain as ITreePermissionDomain,
                mockAttributeDomain as IAttributeDomain,
                mockValueRepo as IValueRepo
            );

            const perm = await attrDomain.getAttributePermission(
                AttributePermissionsActions.EDIT_VALUE,
                12345,
                'test_attr',
                'test_lib',
                987654
            );

            expect(mockPermDomain.getDefaultPermission.mock.calls.length).toBe(0);
            expect(mockTreePermDomain.getTreePermission.mock.calls.length).toBe(1);
            expect(perm).toBe(true);
        });

        test('Return default permission if no config', async () => {
            const mockAttrNoPermsDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({
                    id: 'test_attr'
                })
            };

            const attrDomain = attributePermissionDomain(
                mockPermDomain as IPermissionDomain,
                mockTreePermDomain as ITreePermissionDomain,
                mockAttrNoPermsDomain as IAttributeDomain,
                mockValueRepo as IValueRepo
            );

            const perm = await attrDomain.getAttributePermission(
                AttributePermissionsActions.EDIT_VALUE,
                12345,
                'test_attr',
                'test_lib',
                987654
            );

            expect(mockPermDomain.getDefaultPermission.mock.calls.length).toBe(1);
            expect(perm).toBe(defaultPerm);
        });
    });
});
