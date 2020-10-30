// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IQueryInfos} from '_types/queryInfos';
import {PermissionsRelations, PermissionTypes, RecordPermissionsActions} from '../../../_types/permissions';
import {IPermissionByUserGroupsHelper} from './permissionByUserGroups';
import treeBasedPermissions from './treeBasedPermissions';

describe('TreePermissionDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'treePermissionDomainTest'
    };

    describe('getTreePermission', () => {
        const mockTreeRepo: Mockify<ITreeRepo> = {
            getElementAncestors: jest.fn().mockImplementation(({treeId}) => {
                let parents;
                switch (treeId) {
                    case 'categories':
                        parents = [
                            {
                                record: {
                                    id: 'A',
                                    library: 'category'
                                }
                            },
                            {
                                record: {
                                    id: 'B',
                                    library: 'category'
                                }
                            },
                            {
                                record: {
                                    id: 'C',
                                    library: 'category'
                                }
                            }
                        ];
                        break;
                    case 'users_groups':
                        parents = [
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
                        ];
                        break;
                }

                return Promise.resolve(parents);
            })
        };

        const mockAttrProps = {
            category: {
                id: 'category',
                type: 'tree',
                linked_tree: 'categories'
            },
            user_groups: {
                id: 'user_groups',
                type: 'tree',
                linked_tree: 'users_groups'
            }
        };
        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getAttributeProperties: jest.fn().mockImplementation(({id}) => Promise.resolve(mockAttrProps[id]))
        };

        const mockValueRepo: Mockify<IValueRepo> = {
            getValues: jest.fn().mockImplementation(() => {
                const val = {
                    id_value: 54321,
                    value: {
                        record: {
                            id: 1,
                            library: 'users_groups'
                        }
                    }
                };

                return Promise.resolve([val]);
            })
        };

        const mockValueMultipleRepo: Mockify<IValueRepo> = {
            getValues: jest.fn().mockImplementation(({attribute}) => Promise.resolve([values[attribute.id]]))
        };

        const defaultPerm = false;

        const ancestors = {
            categories: [
                {
                    record: {
                        id: 'A',
                        library: 'category'
                    }
                },
                {
                    record: {
                        id: 'B',
                        library: 'category'
                    }
                },
                {
                    record: {
                        id: 'C',
                        library: 'category'
                    }
                }
            ],
            statuses: [
                {
                    record: {
                        id: 'AA',
                        library: 'status'
                    }
                },
                {
                    record: {
                        id: 'BB',
                        library: 'status'
                    }
                },
                {
                    record: {
                        id: 'CC',
                        library: 'status'
                    }
                }
            ],
            users_groups: [
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
            ]
        };
        const mockTreeMultipleRepo: Mockify<ITreeRepo> = {
            getElementAncestors: jest.fn().mockImplementation(({treeId}) => Promise.resolve(ancestors[treeId]))
        };

        const attributesProps = {
            category: {
                id: 'category',
                type: 'tree',
                linked_tree: 'categories'
            },
            status: {
                id: 'status',
                type: 'tree',
                linked_tree: 'statuses'
            },
            user_groups: {
                id: 'user_groups',
                type: 'tree',
                linked_tree: 'users_groups'
            }
        };
        const mockAttrMultipleDomain: Mockify<IAttributeDomain> = {
            getAttributeProperties: jest.fn().mockImplementation(({id}) => Promise.resolve(attributesProps[id]))
        };

        const values = {
            category: {
                id_value: 12345,
                value: {
                    record: {
                        id: 'A',
                        library: 'category'
                    }
                }
            },
            status: {
                id_value: 98765,
                value: {
                    record: {
                        id: 'AA',
                        library: 'statuses'
                    }
                }
            },
            user_groups: {
                id_value: 54321,
                value: {
                    record: {
                        id: 1,
                        library: 'users_groups'
                    }
                }
            }
        };

        const mockPermConf = {
            relation: PermissionsRelations.AND,
            permissionTreeAttributes: ['category']
        };

        const params = {
            type: PermissionTypes.RECORD_ATTRIBUTE,
            action: RecordPermissionsActions.ACCESS_RECORD,
            userId: '987654',
            applyTo: 'test_lib',
            treeValues: {
                category: [
                    {
                        record: {
                            id: '321654',
                            library: 'category'
                        }
                    }
                ]
            },
            permissions_conf: mockPermConf,
            getDefaultPermission: jest.fn().mockReturnValue(defaultPerm)
        };

        beforeEach(() => jest.clearAllMocks());

        test('1 tree / 1 user group with heritage', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(true)
            };

            const treePermDomain = treeBasedPermissions({
                'core.domain.permission.helpers.permissionByUserGroups': mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValueRepo as IValueRepo
            });

            const perm = await treePermDomain.getTreeBasedPermission(params, ctx);

            expect(mockTreeRepo.getElementAncestors.mock.calls.length).toBe(2);
            expect(perm).toBe(true);
            expect(mockPermByUserGroupsHelper.getPermissionByUserGroups.mock.calls.length).toBe(1);
        });

        test('No permissions defined (default config)', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(null)
            };

            const treePermDomain = treeBasedPermissions({
                'core.domain.permission.helpers.permissionByUserGroups': mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValueRepo as IValueRepo
            });

            const perm = await treePermDomain.getTreeBasedPermission(params, ctx);

            expect(params.getDefaultPermission).toBeCalled();
            expect(perm).toBe(false);
        });

        test('Return permission on tree root level', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: jest.fn().mockImplementation(({permissionTreeTarget}) => {
                    return Promise.resolve(permissionTreeTarget.id === null ? true : null);
                })
            };

            const treePermDomain = treeBasedPermissions({
                'core.domain.permission.helpers.permissionByUserGroups': mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValueRepo as IValueRepo
            });

            const perm = await treePermDomain.getTreeBasedPermission(
                {
                    ...params
                },
                ctx
            );

            expect(perm).toBe(true);
        });

        test('No value on permission tree attribute', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(null)
            };

            const mockValueNoCatRepo: Mockify<IValueRepo> = {
                getValues: jest.fn().mockImplementation(({library, recordId, attribute}) => {
                    switch (attribute.id) {
                        case 'category':
                            return Promise.resolve([]);
                        case 'user_groups':
                            return Promise.resolve([
                                {
                                    id_value: 54321,
                                    value: {
                                        record: {
                                            id: 1,
                                            library: 'users_groups'
                                        }
                                    }
                                }
                            ]);
                    }
                })
            };

            const treePermDomain = treeBasedPermissions({
                'core.domain.permission.helpers.permissionByUserGroups': mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValueNoCatRepo as IValueRepo
            });

            const perm = await treePermDomain.getTreeBasedPermission(
                {
                    ...params,
                    treeValues: {
                        category: []
                    }
                },
                ctx
            );

            expect(perm).toBe(defaultPerm);
        });

        test('n permissions trees with AND', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: jest.fn().mockImplementation(({permissionTreeTarget}) => {
                    if (permissionTreeTarget.tree === 'categories' && permissionTreeTarget.id === 'C') {
                        return Promise.resolve(true);
                    } else if (permissionTreeTarget.tree === 'statuses' && permissionTreeTarget.id === 'CC') {
                        return Promise.resolve(false);
                    } else {
                        return Promise.resolve(null);
                    }
                })
            };

            const treePermDomain = treeBasedPermissions({
                'core.domain.permission.helpers.permissionByUserGroups': mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.infra.tree': mockTreeMultipleRepo as ITreeRepo,
                'core.domain.attribute': mockAttrMultipleDomain as IAttributeDomain,
                'core.infra.value': mockValueMultipleRepo as IValueRepo
            });

            const perm = await treePermDomain.getTreeBasedPermission(
                {
                    ...params,
                    treeValues: {
                        category: [
                            {
                                record: {
                                    id: '321654',
                                    library: 'category'
                                }
                            }
                        ],
                        status: [
                            {
                                record: {
                                    id: '123456',
                                    library: 'status'
                                }
                            }
                        ]
                    },
                    permissions_conf: {
                        relation: PermissionsRelations.AND,
                        permissionTreeAttributes: ['category', 'status']
                    }
                },
                ctx
            );

            expect(mockTreeMultipleRepo.getElementAncestors.mock.calls.length).toBe(3);
            expect(perm).toBe(false);
            expect(mockPermByUserGroupsHelper.getPermissionByUserGroups.mock.calls.length).toBe(2);
        });

        test('n permissions trees with OR', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: jest.fn().mockImplementation(({permissionTreeTarget}) => {
                    if (permissionTreeTarget.tree === 'categories' && permissionTreeTarget.id === 'C') {
                        return Promise.resolve(true);
                    } else if (permissionTreeTarget.tree === 'statuses' && permissionTreeTarget.id === 'CC') {
                        return Promise.resolve(false);
                    } else {
                        return Promise.resolve(null);
                    }
                })
            };

            const treePermDomain = treeBasedPermissions({
                'core.domain.permission.helpers.permissionByUserGroups': mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.infra.tree': mockTreeMultipleRepo as ITreeRepo,
                'core.domain.attribute': mockAttrMultipleDomain as IAttributeDomain,
                'core.infra.value': mockValueMultipleRepo as IValueRepo
            });

            const perm = await treePermDomain.getTreeBasedPermission(
                {
                    ...params,
                    treeValues: {
                        category: [
                            {
                                record: {
                                    id: '321654',
                                    library: 'category'
                                }
                            }
                        ],
                        status: [
                            {
                                record: {
                                    id: '123456',
                                    library: 'status'
                                }
                            }
                        ]
                    },
                    permissions_conf: {
                        relation: PermissionsRelations.OR,
                        permissionTreeAttributes: ['category', 'status']
                    }
                },
                ctx
            );

            expect(perm).toBe(true);
        });
    });
});
