import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {RecordPermissions} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {ILibraryDomain} from '../library/libraryDomain';
import {IPermissionDomain} from './permissionDomain';
import recordPermissionDomain from './recordPermissionDomain';

describe('recordPermissionDomain', () => {
    describe('getRecordPermission', () => {
        const mockLibSimplePerms = {
            system: false,
            permissionsConf: {
                relation: 'AND',
                permissionTreeAttributes: ['category']
            }
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

        const mockLibDomain: Mockify<ILibraryDomain> = {
            getLibraryProperties: global.__mockPromise(mockLibSimplePerms)
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
        const mockLibMultiplePerms = {
            system: false,
            permissionsConf: {
                relation: 'and',
                permissionTreeAttributes: ['category', 'status']
            }
        };
        const mockLibMultipleDomain: Mockify<ILibraryDomain> = {
            getLibraryProperties: global.__mockPromise(mockLibMultiplePerms)
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

        test('1 tree / 1 user group with heritage', async () => {
            const recordPermDomain = recordPermissionDomain(
                mockPermDomain as IPermissionDomain,
                mockLibDomain as ILibraryDomain,
                mockTreeRepo as ITreeRepo,
                mockAttrDomain as IAttributeDomain,
                mockValueRepo as IValueRepo
            );

            const perm = await recordPermDomain.getRecordPermission(
                RecordPermissions.ACCESS,
                987654,
                'test_lib',
                123456
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

            const recordPermDomain = recordPermissionDomain(
                mockPermDomainNoVal as IPermissionDomain,
                mockLibDomain as ILibraryDomain,
                mockTreeRepo as ITreeRepo,
                mockAttrDomain as IAttributeDomain,
                mockValueRepo as IValueRepo
            );

            const perm = await recordPermDomain.getRecordPermission(
                RecordPermissions.ACCESS,
                987654,
                'test_lib',
                123456
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

            const recordPermDomain = recordPermissionDomain(
                mockPermDomain as IPermissionDomain,
                mockLibDomain as ILibraryDomain,
                mockTreeRepo as ITreeRepo,
                mockAttrDomain as IAttributeDomain,
                mockValueNoCatRepo as IValueRepo
            );

            const perm = await recordPermDomain.getRecordPermission(
                RecordPermissions.ACCESS,
                987654,
                'test_lib',
                123456
            );

            expect(perm).toBe(defaultPerm);
        });

        test('n permissions trees with AND', async () => {
            const recordPermDomain = recordPermissionDomain(
                mockPermMultipleDomain as IPermissionDomain,
                mockLibMultipleDomain as ILibraryDomain,
                mockTreeMultipleRepo as ITreeRepo,
                mockAttrMultipleDomain as IAttributeDomain,
                mockValueMultipleRepo as IValueRepo
            );

            const perm = await recordPermDomain.getRecordPermission(
                RecordPermissions.ACCESS,
                987654,
                'test_lib',
                123456
            );

            expect(mockTreeMultipleRepo.getElementAncestors.mock.calls.length).toBe(3);
            expect(perm).toBe(false);
            expect(mockPermMultipleDomain.getSimplePermission.mock.calls.length).toBe(18);
        });

        test('n permissions trees with OR', async () => {
            const mockLibMultipleOrPerms = {
                system: false,
                permissionsConf: {
                    relation: 'or',
                    permissionTreeAttributes: ['category', 'status']
                }
            };
            const mockLibMultipleOrDomain = {
                getLibraryProperties: global.__mockPromise(mockLibMultipleOrPerms)
            };

            const recordPermDomain = recordPermissionDomain(
                mockPermMultipleDomain as IPermissionDomain,
                mockLibMultipleOrDomain as ILibraryDomain,
                mockTreeMultipleRepo as ITreeRepo,
                mockAttrMultipleDomain as IAttributeDomain,
                mockValueMultipleRepo as IValueRepo
            );

            const perm = await recordPermDomain.getRecordPermission(
                RecordPermissions.ACCESS,
                987654,
                'test_lib',
                123456
            );

            expect(perm).toBe(true);
        });

        test('n users groups', async () => {
            const mockLibMultiGroupDomain = {...mockLibDomain};
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

            const recordPermDomain = recordPermissionDomain(
                mockPermMultiGroupDomain as IPermissionDomain,
                mockLibMultiGroupDomain as ILibraryDomain,
                mockTreeMultiGroupRepo as ITreeRepo,
                mockAttrMultiGroupDomain as IAttributeDomain,
                mockValueMultiGroupRepo as IValueRepo
            );

            const perm = await recordPermDomain.getRecordPermission(
                RecordPermissions.ACCESS,
                987654,
                'test_lib',
                123456
            );

            expect(mockTreeMultiGroupRepo.getElementAncestors.mock.calls.length).toBe(3);
            expect(perm).toBe(true);
            expect(mockPermMultiGroupDomain.getSimplePermission.mock.calls.length).toBe(18);
        });
    });
});
