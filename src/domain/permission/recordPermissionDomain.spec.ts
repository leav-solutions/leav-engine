import {IValueRepo} from 'infra/value/valueRepo';
import {RecordPermissionsActions} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {ILibraryDomain} from '../library/libraryDomain';
import {IPermissionDomain} from './permissionDomain';
import recordPermissionDomain from './recordPermissionDomain';
import {ITreePermissionDomain} from './treePermissionDomain';

describe('recordPermissionDomain', () => {
    describe('getRecordPermission', () => {
        const defaultPerm = false;

        const mockTreePermDomain: Mockify<ITreePermissionDomain> = {
            getTreePermission: global.__mockPromise(true)
        };

        const mockPermDomain: Mockify<IPermissionDomain> = {
            getDefaultPermission: jest.fn().mockReturnValue(defaultPerm),
            getLibraryPermission: jest.fn().mockReturnValue(defaultPerm)
        };

        const mockLibSimplePerms = {
            system: false,
            permissionsConf: {
                relation: 'AND',
                permissionTreeAttributes: ['category']
            }
        };
        const mockLibDomain: Mockify<ILibraryDomain> = {
            getLibraryProperties: global.__mockPromise(mockLibSimplePerms)
        };

        const mockAttrProps = {
            category: {
                id: 'category',
                type: 'tree',
                linked_tree: 'categories'
            }
        };
        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getAttributeProperties: jest.fn().mockImplementation(attrId => Promise.resolve(mockAttrProps[attrId]))
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

        test('Return tree permission', async () => {
            const recordPermDomain = recordPermissionDomain(
                mockPermDomain as IPermissionDomain,
                mockTreePermDomain as ITreePermissionDomain,
                mockLibDomain as ILibraryDomain,
                mockAttrDomain as IAttributeDomain,
                mockValueRepo as IValueRepo
            );

            const perm = await recordPermDomain.getRecordPermission(
                RecordPermissionsActions.ACCESS,
                987654,
                'test_lib',
                123456
            );

            expect(mockTreePermDomain.getTreePermission.mock.calls.length).toBe(1);
            expect(mockValueRepo.getValues.mock.calls.length).toBe(1);
            expect(perm).toBe(true);
        });

        test('Return default permission if no config', async () => {
            const mockLibNoPermsDomain = {
                ...mockLibDomain,
                getLibraryProperties: global.__mockPromise({
                    system: false
                })
            };

            const recordPermDomain = recordPermissionDomain(
                mockPermDomain as IPermissionDomain,
                mockTreePermDomain as ITreePermissionDomain,
                mockLibNoPermsDomain as ILibraryDomain,
                mockAttrDomain as IAttributeDomain,
                mockValueRepo as IValueRepo
            );

            const perm = await recordPermDomain.getRecordPermission(
                RecordPermissionsActions.ACCESS,
                987654,
                'test_lib',
                123456
            );

            expect(mockPermDomain.getLibraryPermission).toBeCalled();
            expect(perm).toBe(defaultPerm);
        });
    });
});
