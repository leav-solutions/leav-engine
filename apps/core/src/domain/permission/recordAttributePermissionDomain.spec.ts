import {SystemLibraries} from '../../_constants/systemLibraries';
import {type IValueRepo} from '../../infra/value/valueRepo';
import {type IQueryInfos} from '../../_types/queryInfos';
import {PermissionsRelations, RecordAttributePermissionsActions} from '../../_types/permissions';
import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type IAttributePermissionDomain} from './attributePermissionDomain';
import * as getDefaultPermission from './helpers/defaultPermission';
import {type ITreeBasedPermissionHelper} from './helpers/treeBasedPermissions';
import recordAttributePermissionDomain, {
    type IRecordAttributePermissionDomainDeps,
} from './recordAttributePermissionDomain';
import {type ToAny} from '../../utils/utils';

const depsBase: ToAny<IRecordAttributePermissionDomainDeps> = {
    'core.domain.permission.attribute': vi.fn(),
    'core.domain.permission.helpers.treeBasedPermissions': vi.fn(),
    'core.domain.permission.helpers.permissionByUserGroups': vi.fn(),
    'core.domain.permission.helpers.recordInCreationBypass': vi.fn(),
    'core.domain.attribute': vi.fn(),
    'core.infra.record': vi.fn(),
    'core.infra.value': vi.fn(),
};

describe('AttributePermissionDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'attributePermissionDomainTest',
    };
    describe('getAttributePermission', () => {
        const mockTreeBasedPerm = {
            getTreeBasedPermission: global.__mockPromise(true),
        } satisfies Mockify<ITreeBasedPermissionHelper>;

        const defaultPerm = false;

        const mockAttributeDomain: Mockify<IAttributeDomain> = {
            getAttributeProperties: global.__mockPromise({
                id: 'test_attr',
                permissions_conf: {
                    permissionTreeAttributes: ['category'],
                    relation: PermissionsRelations.AND,
                },
            }),
        };

        const mockValueRepo: Mockify<IValueRepo> = {
            getValues: vi.fn().mockImplementation(({attribute}) => {
                let val;
                switch (attribute.id) {
                    case 'category':
                        val = {
                            id_value: 12345,
                            payload: {
                                record: {
                                    id: 1,
                                    library: 'category',
                                },
                            },
                        };
                        break;
                    case 'test_attr':
                        val = {
                            id_value: 12345,
                            payload: {
                                record: {
                                    id: 1,
                                    library: 'category',
                                },
                            },
                        };
                        break;
                    case 'user_groups':
                        val = {
                            id_value: 54321,
                            payload: {
                                record: {
                                    id: 1,
                                    library: SystemLibraries.USERS_GROUPS,
                                },
                            },
                        };
                        break;
                }

                return Promise.resolve([val]);
            }),
        };

        test('Return permission', async () => {
            const getDefaultPermissionSpy = vi.spyOn(getDefaultPermission, 'default');

            const recordAttrPermDomain = recordAttributePermissionDomain({
                ...depsBase,
                'core.domain.permission.helpers.treeBasedPermissions': mockTreeBasedPerm as ITreeBasedPermissionHelper,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.infra.value': mockValueRepo as IValueRepo,
            });

            const perm = await recordAttrPermDomain.getRecordAttributePermission(
                RecordAttributePermissionsActions.EDIT_VALUE,
                'test_attr',
                'test_lib',
                '987654',
                ctx,
            );

            expect(getDefaultPermissionSpy.mock.calls.length).toBe(0);
            expect(mockTreeBasedPerm.getTreeBasedPermission.mock.calls.length).toBe(1);
            expect(perm).toBe(true);
        });

        test('Return default permission if no config', async () => {
            vi.spyOn(getDefaultPermission, 'default');
            const mockAttrNoPermsDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({
                    id: 'test_attr',
                }),
            };

            const mockAttrPermDomain: Mockify<IAttributePermissionDomain> = {
                getAttributePermission: global.__mockPromise(defaultPerm),
            };

            const recordAttrPermDomain = recordAttributePermissionDomain({
                ...depsBase,
                'core.domain.permission.helpers.treeBasedPermissions': mockTreeBasedPerm as ITreeBasedPermissionHelper,
                'core.domain.permission.attribute': mockAttrPermDomain as IAttributePermissionDomain,
                'core.domain.attribute': mockAttrNoPermsDomain as IAttributeDomain,
                'core.infra.value': mockValueRepo as IValueRepo,
            });

            const perm = await recordAttrPermDomain.getRecordAttributePermission(
                RecordAttributePermissionsActions.EDIT_VALUE,
                'test_attr',
                'test_lib',
                '987654',
                ctx,
            );

            expect(mockAttrPermDomain.getAttributePermission).toBeCalled();
            expect(perm).toBe(defaultPerm);
        });
    });
});
