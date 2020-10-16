import {IValueRepo} from 'infra/value/valueRepo';
import {IQueryInfos} from '_types/queryInfos';
import {PermissionsRelations, RecordAttributePermissionsActions} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import * as getDefaultPermission from './helpers/getDefaultPermission';
import recordAttributePermissionDomain from './recordAttributePermissionDomain';
import {ITreePermissionDomain} from './treePermissionDomain';

jest.mock('./helpers/getDefaultPermission', () => jest.fn().mockReturnValue(false));

describe('AttributePermissionDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'attributePermissionDomainTest'
    };
    describe('getAttributePermission', () => {
        const mockTreePermDomain: Mockify<ITreePermissionDomain> = {
            getTreePermission: global.__mockPromise(true)
        };

        const defaultPerm = false;

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
            getValues: jest.fn().mockImplementation(({attribute}) => {
                let val;
                switch (attribute.id) {
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
            jest.spyOn(getDefaultPermission, 'default');

            const recordAttrPermDomain = recordAttributePermissionDomain({
                'core.domain.permission.tree': mockTreePermDomain as ITreePermissionDomain,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.infra.value': mockValueRepo as IValueRepo
            });

            const perm = await recordAttrPermDomain.getRecordAttributePermission(
                RecordAttributePermissionsActions.EDIT_VALUE,
                '12345',
                'test_attr',
                'test_lib',
                '987654',
                ctx
            );

            expect((getDefaultPermission.default as jest.Mock).mock.calls.length).toBe(0);
            expect(mockTreePermDomain.getTreePermission.mock.calls.length).toBe(1);
            expect(perm).toBe(true);
        });

        test('Return default permission if no config', async () => {
            jest.spyOn(getDefaultPermission, 'default');
            const mockAttrNoPermsDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({
                    id: 'test_attr'
                })
            };

            const recordAttrPermDomain = recordAttributePermissionDomain({
                'core.domain.permission.tree': mockTreePermDomain as ITreePermissionDomain,
                'core.domain.attribute': mockAttrNoPermsDomain as IAttributeDomain,
                'core.infra.value': mockValueRepo as IValueRepo
            });

            const perm = await recordAttrPermDomain.getRecordAttributePermission(
                RecordAttributePermissionsActions.EDIT_VALUE,
                '12345',
                'test_attr',
                'test_lib',
                '987654',
                ctx
            );

            expect((getDefaultPermission.default as jest.Mock).mock.calls.length).toBe(1);
            expect(perm).toBe(defaultPerm);
        });
    });
});
