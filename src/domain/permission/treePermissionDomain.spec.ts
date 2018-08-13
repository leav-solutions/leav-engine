import {RecordPermissionsActions, PermissionsRelations} from '../../_types/permissions';
import treePermissionDomain from './treePermissionDomain';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IValueRepo} from 'infra/value/valueRepo';
import {IPermissionDomain} from './permissionDomain';

describe('TreePermissionDomain', () => {
    describe('getTreePermission', () => {
        const mockTreeRepo: Mockify<ITreeRepo> = {
            getElementAncestors: jest.fn().mockImplementation((treeId, elem) => {
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
            getAttributeProperties: jest.fn().mockImplementation(attrId => Promise.resolve(mockAttrProps[attrId]))
        };

        const mockValueRepo: Mockify<IValueRepo> = {
            getValues: jest.fn().mockImplementation((lib, rec, attr) => {
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

        const defaultPerm = false;
        const mockPermDomain: Mockify<IPermissionDomain> = {
            getSimplePermission: jest
                .fn()
                .mockImplementation((type, applyTo, action, usersGroup, permissionTreeTarget) => {
                    if (usersGroup === 1 && permissionTreeTarget.id === 'A') {
                        return Promise.resolve(true);
                    } else {
                        return Promise.resolve(null);
                    }
                }),
            getDefaultPermission: jest.fn().mockReturnValue(defaultPerm)
        };

        const mockPermMultipleDomain: Mockify<IPermissionDomain> = {
            getSimplePermission: jest
                .fn()
                .mockImplementation((type, applyTo, action, usersGroup, permissionTreeTarget) => {
                    if (
                        usersGroup === 1 &&
                        permissionTreeTarget.library === 'category' &&
                        permissionTreeTarget.id === 'A'
                    ) {
                        return Promise.resolve(true);
                    } else if (
                        usersGroup === 1 &&
                        permissionTreeTarget.library === 'status' &&
                        permissionTreeTarget.id === 'AA'
                    ) {
                        return Promise.resolve(false);
                    } else {
                        return Promise.resolve(null);
                    }
                }),
            getDefaultPermission: jest.fn().mockReturnValue(defaultPerm)
        };

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
            getElementAncestors: jest.fn().mockImplementation((treeId, elem) => Promise.resolve(ancestors[treeId]))
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
            getAttributeProperties: jest.fn().mockImplementation(attrId => Promise.resolve(attributesProps[attrId]))
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
        const mockValueMultipleRepo: Mockify<IValueRepo> = {
            getValues: jest.fn().mockImplementation((lib, rec, attr) => Promise.resolve([values[attr.id]]))
        };

        const mockPermConf = {
            relation: PermissionsRelations.AND,
            permissionTreeAttributes: ['category']
        };

        test('1 tree / 1 user group with heritage', async () => {
            const treePermDomain = treePermissionDomain(
                mockPermDomain as IPermissionDomain,
                mockTreeRepo as ITreeRepo,
                mockAttrDomain as IAttributeDomain,
                mockValueRepo as IValueRepo
            );

            const perm = await treePermDomain.getTreePermission(
                RecordPermissionsActions.ACCESS,
                987654,
                'test_lib',
                {
                    category: [
                        {
                            record: {
                                id: 321654,
                                library: 'category'
                            }
                        }
                    ]
                },
                mockPermConf
            );

            expect(mockTreeRepo.getElementAncestors.mock.calls.length).toBe(2);
            expect(perm).toBe(true);
            expect(mockPermDomain.getSimplePermission.mock.calls.length).toBe(9);
        });

        test('No permissions defined (default config)', async () => {
            const mockPermDomainNoVal: Mockify<IPermissionDomain> = {
                ...mockPermDomain,
                getSimplePermission: global.__mockPromise(null)
            };

            const treePermDomain = treePermissionDomain(
                mockPermDomainNoVal as IPermissionDomain,
                mockTreeRepo as ITreeRepo,
                mockAttrDomain as IAttributeDomain,
                mockValueRepo as IValueRepo
            );

            const perm = await treePermDomain.getTreePermission(
                RecordPermissionsActions.ACCESS,
                987654,
                'test_lib',
                {
                    category: [
                        {
                            record: {
                                id: 321654,
                                library: 'category'
                            }
                        }
                    ]
                },
                mockPermConf
            );

            expect(perm).toBe(defaultPerm);
        });

        test('No value on permission tree attribute', async () => {
            const mockValueNoCatRepo: Mockify<IValueRepo> = {
                getValues: jest.fn().mockImplementation((lib, rec, attr) => {
                    switch (attr.id) {
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
                            break;
                    }
                })
            };

            const treePermDomain = treePermissionDomain(
                mockPermDomain as IPermissionDomain,
                mockTreeRepo as ITreeRepo,
                mockAttrDomain as IAttributeDomain,
                mockValueNoCatRepo as IValueRepo
            );

            const perm = await treePermDomain.getTreePermission(
                RecordPermissionsActions.ACCESS,
                987654,
                'test_lib',
                {
                    category: []
                },
                mockPermConf
            );

            expect(perm).toBe(defaultPerm);
        });

        test('n permissions trees with AND', async () => {
            const treePermDomain = treePermissionDomain(
                mockPermMultipleDomain as IPermissionDomain,
                mockTreeMultipleRepo as ITreeRepo,
                mockAttrMultipleDomain as IAttributeDomain,
                mockValueMultipleRepo as IValueRepo
            );

            const perm = await treePermDomain.getTreePermission(
                RecordPermissionsActions.ACCESS,
                987654,
                'test_lib',
                {
                    category: [
                        {
                            record: {
                                id: 321654,
                                library: 'category'
                            }
                        }
                    ],
                    status: [
                        {
                            record: {
                                id: 123456,
                                library: 'status'
                            }
                        }
                    ]
                },
                {
                    relation: PermissionsRelations.AND,
                    permissionTreeAttributes: ['category', 'status']
                }
            );

            expect(mockTreeMultipleRepo.getElementAncestors.mock.calls.length).toBe(3);
            expect(perm).toBe(false);
            expect(mockPermMultipleDomain.getSimplePermission.mock.calls.length).toBe(18);
        });
        test('n permissions trees with AND', async () => {
            const treePermDomain = treePermissionDomain(
                mockPermMultipleDomain as IPermissionDomain,
                mockTreeMultipleRepo as ITreeRepo,
                mockAttrMultipleDomain as IAttributeDomain,
                mockValueMultipleRepo as IValueRepo
            );

            const perm = await treePermDomain.getTreePermission(
                RecordPermissionsActions.ACCESS,
                987654,
                'test_lib',
                {
                    category: [
                        {
                            record: {
                                id: 321654,
                                library: 'category'
                            }
                        }
                    ],
                    status: [
                        {
                            record: {
                                id: 123456,
                                library: 'status'
                            }
                        }
                    ]
                },
                {
                    relation: PermissionsRelations.OR,
                    permissionTreeAttributes: ['category', 'status']
                }
            );

            expect(perm).toBe(true);
        });

        test('n users groups', async () => {
            const mockAttrMultiGroupDomain = {...mockAttrDomain};
            const mockTreeMultiGroupRepo = {
                ...mockTreeRepo,
                getElementAncestors: jest.fn().mockImplementation((treeId, elem) => {
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
                            if (elem.id === 2) {
                                parents = [
                                    {
                                        record: {
                                            id: 1,
                                            library: 'users_groups'
                                        }
                                    },
                                    {
                                        record: {
                                            id: 4,
                                            library: 'users_groups'
                                        }
                                    },
                                    {
                                        record: {
                                            id: 5,
                                            library: 'users_groups'
                                        }
                                    }
                                ];
                            } else {
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
                            }
                            break;
                    }

                    return Promise.resolve(parents);
                })
            };

            const valuesMultiGroup = {
                category: [
                    {
                        id_value: 12345,
                        value: {
                            record: {
                                id: 'A',
                                library: 'category'
                            }
                        }
                    }
                ],
                user_groups: [
                    {
                        id_value: 654987,
                        value: {
                            record: {
                                id: 1,
                                library: 'users_groups'
                            }
                        }
                    },
                    {
                        id_value: 654988,
                        value: {
                            record: {
                                id: 5,
                                library: 'users_groups'
                            }
                        }
                    }
                ]
            };
            const mockValueMultiGroupRepo: Mockify<IValueRepo> = {
                getValues: jest.fn().mockImplementation((lib, rec, attr) => Promise.resolve(valuesMultiGroup[attr.id]))
            };

            const mockPermMultiGroupDomain: Mockify<IPermissionDomain> = {
                ...mockPermDomain,
                getSimplePermission: jest
                    .fn()
                    .mockImplementation((type, applyTo, action, usersGroup, permissionTreeTarget) => {
                        if (
                            usersGroup === 1 &&
                            permissionTreeTarget.library === 'category' &&
                            permissionTreeTarget.id === 'A'
                        ) {
                            return Promise.resolve(true);
                        } else if (
                            usersGroup === 5 &&
                            permissionTreeTarget.library === 'category' &&
                            permissionTreeTarget.id === 'B'
                        ) {
                            return Promise.resolve(false);
                        } else {
                            return Promise.resolve(null);
                        }
                    })
            };

            const treePermDomain = treePermissionDomain(
                mockPermMultiGroupDomain as IPermissionDomain,
                mockTreeMultiGroupRepo as ITreeRepo,
                mockAttrMultiGroupDomain as IAttributeDomain,
                mockValueMultiGroupRepo as IValueRepo
            );

            const perm = await treePermDomain.getTreePermission(
                RecordPermissionsActions.ACCESS,
                987654,
                'test_lib',
                {
                    category: [
                        {
                            record: {
                                id: 321654,
                                library: 'category'
                            }
                        }
                    ]
                },
                mockPermConf
            );

            expect(mockTreeMultiGroupRepo.getElementAncestors.mock.calls.length).toBe(3);
            expect(perm).toBe(true);
            expect(mockPermMultiGroupDomain.getSimplePermission.mock.calls.length).toBe(18);
        });
    });
});
