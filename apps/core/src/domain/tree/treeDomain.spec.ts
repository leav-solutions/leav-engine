// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {GetCoreEntityByIdFunc} from 'domain/helpers/getCoreEntityById';
import {IAdminPermissionDomain} from 'domain/permission/adminPermissionDomain';
import {ITreeNodePermissionDomain} from 'domain/permission/treeNodePermissionDomain';
import {ITreePermissionDomain} from 'domain/permission/treePermissionDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IVersionProfileRepo} from 'infra/versionProfile/versionProfileRepo';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {ICacheService, ICachesService} from '../../infra/cache/cacheService';
import {AdminPermissionsActions} from '../../_types/permissions';
import {ITree} from '../../_types/tree';
import {mockRecord} from '../../__tests__/mocks/record';
import {mockFilesTree, mockTree} from '../../__tests__/mocks/tree';
import {mockVersionProfile} from '../../__tests__/mocks/versionProfile';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IRecordDomain} from '../record/recordDomain';
import {IElementAncestorsHelper} from './helpers/elementAncestors';
import {IGetDefaultElementHelper} from './helpers/getDefaultElement';
import {ITreeDataValidationHelper} from './helpers/treeDataValidation';
import treeDomain from './treeDomain';

const mockCacheService: Mockify<ICacheService> = {
    getData: global.__mockPromise([null]),
    storeData: global.__mockPromise(),
    deleteData: global.__mockPromise()
};

const mockCachesService: Mockify<ICachesService> = {
    getCache: jest.fn().mockReturnValue(mockCacheService)
};

describe('treeDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'treeDomainTest'
    };

    const mockAdminPermDomain: Mockify<IAdminPermissionDomain> = {
        getAdminPermission: global.__mockPromise(true)
    };

    const mockAdminPermForbiddenDomain: Mockify<IAdminPermissionDomain> = {
        getAdminPermission: global.__mockPromise(false)
    };

    const treeDataValidationHelper: Mockify<ITreeDataValidationHelper> = {
        validate: jest.fn()
    };

    const mockTreeNodePermissionDomain: Mockify<ITreeNodePermissionDomain> = {
        getTreeNodePermission: global.__mockPromise(true)
    };

    const mockTreePermissionDomain: Mockify<ITreePermissionDomain> = {
        getTreePermission: global.__mockPromise(true)
    };

    const mockElementAncestorsHelper: Mockify<IElementAncestorsHelper> = {
        getCachedElementAncestors: global.__mockPromise([]),
        clearElementAncestorsCache: jest.fn()
    };

    const mockGetDefaultElementHelper: Mockify<IGetDefaultElementHelper> = {
        clearCache: jest.fn()
    };

    beforeEach(() => jest.clearAllMocks());

    const mockGetEntityByIdHelper = jest.fn().mockReturnValue(mockTree);
    const mockGetEntityByIdHelperNoResult = jest.fn().mockReturnValue(null);
    const mockGetEntityByIdHelperFilesTree = jest.fn().mockReturnValue({...mockFilesTree});

    const mockEventsManagerDomain: Mockify<IEventsManagerDomain> = {
        sendPubSubEvent: jest.fn(),
        sendDatabaseEvent: jest.fn()
    };

    const mockUtils: Mockify<IUtils> = {
        isIdValid: jest.fn().mockReturnValue(true),
        getCoreEntityCacheKey: jest.fn().mockReturnValue('coreEntity:tree:1'),
        generateExplicitValidationError: jest.fn().mockReturnValue(new ValidationError({}, ''))
    };

    describe('saveTree', () => {
        const mockHandleRemovedLibraries = jest.fn();
        test('Should create new tree', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                createTree: global.__mockPromise(mockTree),
                updateTree: jest.fn()
            };
            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperNoResult,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.utils': mockUtils as IUtils
            });

            const newTree = await domain.saveTree(mockTree, ctx);

            expect(treeRepo.createTree.mock.calls.length).toBe(1);
            expect(treeRepo.updateTree.mock.calls.length).toBe(0);

            expect(newTree).toMatchObject(mockTree);

            expect(mockAdminPermDomain.getAdminPermission).toBeCalled();
            expect(mockAdminPermDomain.getAdminPermission.mock.calls[0][0].action).toBe(
                AdminPermissionsActions.CREATE_TREE
            );
        });

        test('Should update existing tree', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                createTree: jest.fn(),
                updateTree: global.__mockPromise(mockTree),
                getTrees: global.__mockPromise({
                    list: [
                        {
                            ...mockTree,
                            permissions_conf: {
                                lib1: {permissionTreeAttributes: ['modified_at']}
                            }
                        }
                    ],
                    totalCount: 1
                })
            };

            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.domain.tree.helpers.handleRemovedLibraries': mockHandleRemovedLibraries,
                'core.utils': mockUtils as IUtils,
                'core.infra.cache.cacheService': mockCachesService as ICachesService,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain
            });

            const newTree = await domain.saveTree(mockTree, ctx);

            expect(treeRepo.createTree.mock.calls.length).toBe(0);
            expect(treeRepo.updateTree.mock.calls.length).toBe(1);
            expect(mockCacheService.deleteData).toBeCalledTimes(1);

            expect(newTree).toMatchObject(mockTree);

            expect(mockAdminPermDomain.getAdminPermission).toBeCalled();
            expect(mockAdminPermDomain.getAdminPermission.mock.calls[0][0].action).toBe(
                AdminPermissionsActions.EDIT_TREE
            );
            expect(mockHandleRemovedLibraries).toBeCalled();
        });

        test('Should throw if forbidden action', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                createTree: jest.fn(),
                updateTree: global.__mockPromise(mockTree)
            };

            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.permission.admin': mockAdminPermForbiddenDomain as IAdminPermissionDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.utils': mockUtils as IUtils
            });

            await expect(domain.saveTree(mockTree, ctx)).rejects.toThrow(PermissionError);
        });

        test('Should throw if validation fails', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                createTree: global.__mockPromise(mockTree),
                updateTree: jest.fn()
            };

            const failingDataValidationHelper: Mockify<ITreeDataValidationHelper> = {
                validate: jest.fn().mockImplementation(() => {
                    throw new ValidationError<ITree>({
                        id: 'Invalid ID'
                    });
                })
            };

            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': failingDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperNoResult,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.utils': mockUtils as IUtils
            });

            await expect(domain.saveTree(mockTree, ctx)).rejects.toThrow(ValidationError);
        });

        test('Should not save behavior on existing tree', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                createTree: jest.fn(),
                updateTree: global.__mockPromise(mockTree)
            };

            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.domain.tree.helpers.handleRemovedLibraries': mockHandleRemovedLibraries,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.infra.cache.cacheService': mockCachesService as ICachesService,
                'core.utils': mockUtils as IUtils
            });

            await domain.saveTree({...mockFilesTree}, ctx);
            expect(treeRepo.updateTree.mock.calls[0][0].behavior).toBeUndefined();
        });
    });

    describe('deleteTree', () => {
        test('Should delete a tree and return deleted tree', async function() {
            const mockAttributesDomain: Mockify<IAttributeDomain> = {
                getAttributes: global.__mockPromise({
                    totalCount: 2,
                    list: [
                        {id: 'modified_at', permissions_conf: {permissionTreeAttributes: ['modified_at']}},
                        {id: 'created_at'}
                    ]
                })
            };

            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({
                    list: [{id: 'lib1', permissions_conf: {permissionTreeAttributes: ['modified_at']}}],
                    totalCount: 1
                })
            };

            const treeRepo: Mockify<ITreeRepo> = {
                getTrees: global.__mockPromise({
                    list: [
                        {
                            ...mockTree,
                            permissions_conf: {
                                lib1: {permissionTreeAttributes: ['modified_at']}
                            }
                        }
                    ],
                    totalCount: 1
                }),
                deleteTree: global.__mockPromise({list: [mockTree], totalCount: 1})
            };

            const mockVersionProfileRepo: Mockify<IVersionProfileRepo> = {
                getVersionProfiles: global.__mockPromise({list: [mockVersionProfile]}),
                updateVersionProfile: global.__mockPromise(mockVersionProfile)
            };

            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                'core.infra.cache.cacheService': mockCachesService as ICachesService,
                'core.domain.attribute': mockAttributesDomain as IAttributeDomain,
                'core.infra.library': mockLibRepo as ILibraryRepo,
                'core.infra.versionProfile': mockVersionProfileRepo as IVersionProfileRepo,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.utils': mockUtils as IUtils
            });

            await domain.deleteTree(mockTree.id, ctx);

            expect(mockCacheService.deleteData).toBeCalledTimes(4); // 3 times for permissions + 1 for entity cache

            expect(treeRepo.deleteTree.mock.calls.length).toBe(1);

            expect(mockAdminPermDomain.getAdminPermission).toBeCalled();
            expect(mockAdminPermDomain.getAdminPermission.mock.calls[0][0].action).toBe(
                AdminPermissionsActions.DELETE_TREE
            );

            // Remove tree from version profiles using it
            expect(mockVersionProfileRepo.getVersionProfiles).toBeCalled();
            expect(mockVersionProfileRepo.updateVersionProfile).toBeCalled();
        });

        test('Should throw if unknown tree', async function() {
            const treeRepo: Mockify<ITreeRepo> = {
                getTrees: global.__mockPromise({list: [], totalCount: 0}),
                deleteTree: global.__mockPromise(mockTree)
            };

            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperNoResult
            });

            await expect(domain.deleteTree(mockTree.id, ctx)).rejects.toThrow(ValidationError);
        });

        test('Should throw if system tree', async function() {
            const treeData = {...mockTree, system: true};

            const treeRepo: Mockify<ITreeRepo> = {
                deleteTree: global.__mockPromise(treeData)
            };

            const mockGetEntityByIdHelperSystemTree = jest.fn().mockReturnValue(treeData);

            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperSystemTree
            });

            await expect(domain.deleteTree(mockTree.id, ctx)).rejects.toThrow(ValidationError);
        });

        test('Should throw if action forbidden', async function() {
            const treeData = {...mockTree, system: true};

            const treeRepo: Mockify<ITreeRepo> = {
                getTrees: global.__mockPromise([treeData]),
                deleteTree: global.__mockPromise(treeData)
            };

            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.permission.admin': mockAdminPermForbiddenDomain as IAdminPermissionDomain
            });

            await expect(domain.deleteTree(mockTree.id, ctx)).rejects.toThrow(PermissionError);
        });
    });

    describe('getTrees', () => {
        test('Should return a list of trees', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                getTrees: global.__mockPromise({list: [mockTree, mockTree], totalCount: 1})
            };
            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo
            });

            const trees = await domain.getTrees({params: {filters: {id: 'test'}}, ctx});

            expect(treeRepo.getTrees.mock.calls[0][0].params.filters).toMatchObject({id: 'test'});
            expect(trees.list.length).toBe(2);
        });

        test('Should add default sort', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                getTrees: global.__mockPromise({list: [mockTree, mockTree], totalCount: 1})
            };
            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo
            });

            await domain.getTrees({params: {filters: {id: 'test'}}, ctx});

            expect(treeRepo.getTrees.mock.calls[0][0].params.sort).toMatchObject({field: 'id', order: 'asc'});
        });
    });

    describe('getTreeProperties', () => {
        test('Should return tree properties', async () => {
            const mockTreeRepo: Mockify<ITreeRepo> = {
                getTrees: global.__mockPromise({list: [{...mockTree}], totalCount: 1})
            };

            const domain = treeDomain({
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper
            });

            const treeProps = await domain.getTreeProperties('test', ctx);

            expect(treeProps.id).toBe(mockTree.id);
        });

        test('Should throw if unknown tree', async () => {
            const mockTreeRepo: Mockify<ITreeRepo> = {
                getTrees: global.__mockPromise({list: [], totalCount: 0})
            };

            const domain = treeDomain({
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperNoResult,
                'core.utils': mockUtils as IUtils
            });

            await expect(domain.getTreeProperties('test', ctx)).rejects.toThrow(ValidationError);
        });
    });

    describe('addElement', () => {
        const mockAttributesDomain: Mockify<IAttributeDomain> = {
            getAttributes: global.__mockPromise([{id: 'modified_at'}, {id: 'created_at'}])
        };
        const mockRecordDomain: Mockify<IRecordDomain> = {
            find: global.__mockPromise({list: [{id: '1345', library: 'lib1'}], totalCount: 1})
        };

        test('Should add an element to a tree', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                addElement: global.__mockPromise({id: '1345', library: 'lib1'}),
                isNodePresent: global.__mockPromise(false),
                isRecordPresent: global.__mockPromise(false),
                getTreeContent: global.__mockPromise([])
            };
            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.attribute': mockAttributesDomain as IAttributeDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.domain.tree.helpers.getDefaultElement': mockGetDefaultElementHelper as IGetDefaultElementHelper,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain
            });

            await domain.addElement({
                treeId: 'test_tree',
                element: {id: '1345', library: 'lib1'},
                parent: null,
                ctx
            });

            expect(treeRepo.addElement).toBeCalled();
            expect(mockEventsManagerDomain.sendPubSubEvent).toBeCalled();
        });

        test('Should throw if unknown tree, element or destination', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                addElement: global.__mockPromise({id: '1345', library: 'lib1'}),
                isNodePresent: global.__mockPromise(false),
                getTrees: global.__mockPromise({list: [], totalCount: 0}),
                getElementAncestors: global.__mockPromise([]),
                getRecordByNodeId: global.__mockPromise({id: '1345', library: 'lib1'}),
                isRecordPresent: global.__mockPromise(false)
            };

            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperNoResult
            });

            await expect(
                domain.addElement({
                    treeId: 'test_tree',
                    element: {id: '1345', library: 'lib1'},
                    parent: '999',
                    ctx
                })
            ).rejects.toThrow(ValidationError);
        });

        test('Should throw if element already present in the tree', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                addElement: global.__mockPromise({id: '1345', library: 'lib1'}),
                getTrees: global.__mockPromise({list: [mockTree], totalCount: 1}),
                isNodePresent: global.__mockPromise(true)
            };

            const recordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({
                    list: [{list: [{id: '1345', library: 'lib1'}], totalCount: 1}],
                    totalCount: 1
                })
            };
            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.record': recordDomain as IRecordDomain
            });

            await expect(
                domain.addElement({
                    treeId: 'test_tree',
                    element: {id: '1345', library: 'lib1'},
                    parent: '999',
                    ctx
                })
            ).rejects.toThrow();
        });

        test('On files tree, throw if adding an element under a file', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                addElement: jest.fn(),
                getTrees: global.__mockPromise({list: [mockFilesTree], totalCount: 1}),
                isNodePresent: global.__mockPromise(true),
                isRecordPresent: global.__mockPromise(false),
                getRecordByNodeId: global.__mockPromise({id: '1345', library: 'lib2'}) // Parent record
            };

            const recordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({
                    list: [{list: [{id: '1345', library: 'lib1'}], totalCount: 1}],
                    totalCount: 1
                })
            };

            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.record': recordDomain as IRecordDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperFilesTree
            });

            await expect(
                domain.addElement({
                    treeId: 'test_tree',
                    element: {id: '1345', library: 'lib1'},
                    parent: '999',
                    ctx
                })
            ).rejects.toHaveProperty('fields.element');
        });

        test('Should throw if forbidden as child', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                addElement: global.__mockPromise({id: '1345', library: 'lib1'}),
                getTreeContent: global.__mockPromise([]),
                getTrees: global.__mockPromise({
                    list: [
                        {
                            ...mockTree,
                            libraries: {
                                lib1: {
                                    allowMultiplePositions: true,
                                    allowedAtRoot: false,
                                    allowedChildren: ['__all__']
                                },
                                lib2: {
                                    allowMultiplePositions: true,
                                    allowedAtRoot: true,
                                    allowedChildren: ['lib2']
                                }
                            }
                        }
                    ],
                    totalCount: 1
                }),
                isNodePresent: global.__mockPromise(true),
                isRecordPresent: global.__mockPromise(true),
                getRecordByNodeId: global.__mockPromise({id: '1345', library: 'lib2'}),
                getElementAncestors: global.__mockPromise([]),
                getElementChildren: global.__mockPromise([])
            };

            const recordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({
                    list: [{list: [{id: '1345', library: 'lib1'}], totalCount: 1}],
                    totalCount: 1
                })
            };

            const mockGetEntityByIdHelperWithLibsSettings = jest.fn().mockReturnValue({
                ...mockTree,
                libraries: {
                    lib1: {
                        allowMultiplePositions: true,
                        allowedAtRoot: false,
                        allowedChildren: ['__all__']
                    },
                    lib2: {
                        allowMultiplePositions: true,
                        allowedAtRoot: true,
                        allowedChildren: ['lib2']
                    }
                }
            });

            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.record': recordDomain as IRecordDomain,
                'core.utils': mockUtils as IUtils,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperWithLibsSettings,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper
            });

            await expect(
                domain.addElement({
                    treeId: 'test_tree',
                    element: {id: '1345', library: 'lib1'},
                    parent: null,
                    ctx
                })
            ).rejects.toHaveProperty('fields.element');

            await expect(
                domain.addElement({
                    treeId: 'test_tree',
                    element: {id: '1345', library: 'lib1'},
                    parent: '999',
                    ctx
                })
            ).rejects.toHaveProperty('fields.element');
        });
    });

    describe('moveElement', () => {
        const mockRecordDomain = {
            find: global.__mockPromise({list: [{id: '1345', library: 'lib1'}], totalCount: 1})
        };

        test('Should move an element in a tree', async () => {
            const mockAttributesDomain: Mockify<IAttributeDomain> = {
                getAttributes: global.__mockPromise({
                    totalCount: 2,
                    list: [
                        {id: 'modified_at', permissions_conf: {permissionTreeAttributes: ['modified_at']}},
                        {id: 'created_at'}
                    ]
                })
            };

            const mockLibDomain: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({
                    list: [{id: 'lib1', permissions_conf: {permissionTreeAttributes: ['modified_at']}}],
                    totalCount: 1
                })
            };

            const treeRepo: Mockify<ITreeRepo> = {
                moveElement: global.__mockPromise({id: '1345', library: 'lib1'}),
                getTrees: global.__mockPromise({
                    list: [
                        {
                            ...mockTree,
                            permissions_conf: {
                                lib1: {permissionTreeAttributes: ['modified_at']}
                            }
                        }
                    ],
                    totalCount: 1
                }),
                isNodePresent: global.__mockPromise(true),
                getElementAncestors: global.__mockPromise([]),
                getRecordByNodeId: global.__mockPromise({id: '1345', library: 'lib1'})
            };
            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.permission.tree': mockTreePermissionDomain as ITreePermissionDomain,
                'core.domain.permission.treeNode': mockTreeNodePermissionDomain as ITreeNodePermissionDomain,
                'core.infra.cache.cacheService': mockCachesService as ICachesService,
                'core.domain.attribute': mockAttributesDomain as IAttributeDomain,
                'core.infra.library': mockLibDomain as ILibraryRepo,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper,
                'core.domain.tree.helpers.getDefaultElement': mockGetDefaultElementHelper as IGetDefaultElementHelper,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain
            });

            await domain.moveElement({
                treeId: 'test_tree',
                nodeId: '1345',
                parentTo: '999',
                ctx
            });

            expect(mockCacheService.deleteData).toBeCalledTimes(3);
            expect(treeRepo.moveElement).toBeCalled();
            expect(mockEventsManagerDomain.sendPubSubEvent).toBeCalled();
        });

        test('Should throw if unknown tree, element or destination', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                moveElement: global.__mockPromise({id: '1345', library: 'lib1'}),
                getTrees: global.__mockPromise({list: [], totalCount: 0}),
                getElementAncestors: global.__mockPromise([]),
                isNodePresent: global.__mockPromise(false),
                getRecordByNodeId: global.__mockPromise({id: '1345', library: 'lib1'})
            };

            const recordDomain = {
                find: global.__mockPromise({list: [], totalCount: 0})
            };

            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.record': recordDomain as IRecordDomain,
                'core.domain.permission.tree': mockTreePermissionDomain as ITreePermissionDomain,
                'core.domain.permission.treeNode': mockTreeNodePermissionDomain as ITreeNodePermissionDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperNoResult,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper
            });

            await expect(
                domain.moveElement({
                    treeId: 'test_tree',
                    nodeId: '1345',
                    parentTo: '999',
                    ctx
                })
            ).rejects.toThrow(ValidationError);
        });

        test('On files tree, throw if moving an element under a file', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                addElement: jest.fn(),
                getTrees: global.__mockPromise({list: [mockFilesTree], totalCount: 1}),
                isNodePresent: global.__mockPromise(true),
                getElementAncestors: global.__mockPromise([]),
                getRecordByNodeId: global.__mockPromise({id: '1345', library: 'lib2'})
            };

            const recordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({
                    list: [{list: [{id: '1345', library: 'lib1'}], totalCount: 1}],
                    totalCount: 1
                })
            };

            const mockValueDomain: Mockify<IValueDomain> = {
                getValues: global.__mockPromise([{value: false}])
            };

            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.record': recordDomain as IRecordDomain,
                'core.domain.permission.tree': mockTreePermissionDomain as ITreePermissionDomain,
                'core.domain.permission.treeNode': mockTreeNodePermissionDomain as ITreeNodePermissionDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperFilesTree as GetCoreEntityByIdFunc,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper
            });

            await expect(
                domain.moveElement({
                    treeId: 'test_tree',
                    nodeId: '1345',
                    parentTo: '999',
                    ctx
                })
            ).rejects.toHaveProperty('fields.element');
        });

        test('Should throw if forbidden as child', async () => {
            const mockAttributesDomain: Mockify<IAttributeDomain> = {
                getAttributes: global.__mockPromise({
                    totalCount: 2,
                    list: [
                        {id: 'modified_at', permissions_conf: {permissionTreeAttributes: ['modified_at']}},
                        {id: 'created_at'}
                    ]
                })
            };

            const mockLibDomain: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({
                    list: [{id: 'lib1', permissions_conf: {permissionTreeAttributes: ['modified_at']}}],
                    totalCount: 1
                })
            };
            const treeRepo: Mockify<ITreeRepo> = {
                moveElement: global.__mockPromise({id: '1345', library: 'lib1'}),
                isNodePresent: global.__mockPromise(false),
                getTreeContent: global.__mockPromise([]),
                getElementChildren: global.__mockPromise([]),
                getTrees: global.__mockPromise({
                    list: [
                        {
                            ...mockTree,
                            libraries: {
                                lib1: {
                                    allowMultiplePositions: true,
                                    allowedAtRoot: false,
                                    allowedChildren: ['__all__']
                                },
                                lib2: {
                                    allowMultiplePositions: true,
                                    allowedAtRoot: true,
                                    allowedChildren: ['lib2']
                                }
                            }
                        }
                    ],
                    totalCount: 1
                }),
                getElementAncestors: global.__mockPromise([]),
                getRecordByNodeId: global.__mockPromise({id: '1345', library: 'lib1'})
            };

            const recordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({
                    list: [{list: [{id: '1345', library: 'lib1'}], totalCount: 1}],
                    totalCount: 1
                })
            };
            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.record': recordDomain as IRecordDomain,
                'core.domain.permission.tree': mockTreePermissionDomain as ITreePermissionDomain,
                'core.domain.permission.treeNode': mockTreeNodePermissionDomain as ITreeNodePermissionDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper as GetCoreEntityByIdFunc,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper,
                'core.domain.attribute': mockAttributesDomain as IAttributeDomain,
                'core.infra.library': mockLibDomain as ILibraryRepo
            });

            await expect(
                domain.moveElement({
                    treeId: 'test_tree',
                    nodeId: '1345',
                    parentTo: null,
                    ctx
                })
            ).rejects.toHaveProperty('fields.element');

            await expect(
                domain.moveElement({
                    treeId: 'test_tree',
                    nodeId: '1345',
                    parentTo: '999',
                    ctx
                })
            ).rejects.toHaveProperty('fields.element');
        });

        test('Should ignore tests if skipChecks is true', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                moveElement: global.__mockPromise({id: '1345', library: 'lib1'}),
                isNodePresent: global.__mockPromise(false),
                getTreeContent: global.__mockPromise([]),
                getElementChildren: global.__mockPromise([]),
                getTrees: global.__mockPromise({
                    list: [
                        {
                            ...mockTree,
                            libraries: {
                                lib1: {
                                    allowMultiplePositions: true,
                                    allowedAtRoot: false,
                                    allowedChildren: ['__all__']
                                },
                                lib2: {
                                    allowMultiplePositions: true,
                                    allowedAtRoot: true,
                                    allowedChildren: ['lib2']
                                }
                            }
                        }
                    ],
                    totalCount: 1
                }),
                getElementAncestors: global.__mockPromise([]),
                getRecordByNodeId: global.__mockPromise({id: '1345', library: 'lib1'})
            };
            const mockAttributesDomain: Mockify<IAttributeDomain> = {
                getAttributes: global.__mockPromise({
                    totalCount: 2,
                    list: [
                        {id: 'modified_at', permissions_conf: {permissionTreeAttributes: ['modified_at']}},
                        {id: 'created_at'}
                    ]
                })
            };
            const recordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({
                    list: [{list: [{id: '1345', library: 'lib1'}], totalCount: 1}],
                    totalCount: 1
                })
            };
            const mockLibDomain: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({
                    list: [{id: 'lib1', permissions_conf: {permissionTreeAttributes: ['modified_at']}}],
                    totalCount: 1
                })
            };
            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.record': recordDomain as IRecordDomain,
                'core.domain.permission.tree': mockTreePermissionDomain as ITreePermissionDomain,
                'core.domain.permission.treeNode': mockTreeNodePermissionDomain as ITreeNodePermissionDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper as GetCoreEntityByIdFunc,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper,
                'core.domain.attribute': mockAttributesDomain as IAttributeDomain,
                'core.infra.library': mockLibDomain as ILibraryRepo,
                'core.infra.cache.cacheService': mockCachesService as ICachesService,
                'core.domain.tree.helpers.getDefaultElement': mockGetDefaultElementHelper as IGetDefaultElementHelper,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain
            });

            await expect(
                domain.moveElement({
                    treeId: 'test_tree',
                    nodeId: '1345',
                    parentTo: null,
                    ctx,
                    skipChecks: true
                })
            ).resolves; //rejects.toHaveProperty('fields.element');

            await expect(
                domain.moveElement({
                    treeId: 'test_tree',
                    nodeId: '1345',
                    parentTo: '999',
                    ctx,
                    skipChecks: true
                })
            ).resolves; //rejects.toHaveProperty('fields.element');
        });
    });

    describe('deleteElement', () => {
        const mockRecordDomain = {
            find: global.__mockPromise({list: [{id: '1345', library: 'lib1'}], totalCount: 1})
        };

        test('Should delete an element in a tree', async () => {
            const mockAttributesDomain: Mockify<IAttributeDomain> = {
                getAttributes: global.__mockPromise({
                    totalCount: 2,
                    list: [
                        {id: 'modified_at', permissions_conf: {permissionTreeAttributes: ['modified_at']}},
                        {id: 'created_at'}
                    ]
                })
            };

            const mockLibDomain: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({
                    list: [{id: 'lib1', permissions_conf: {permissionTreeAttributes: ['modified_at']}}],
                    totalCount: 1
                })
            };

            const mockGetEntityByIdHelperWithPermissions = jest.fn().mockReturnValue({
                ...mockTree,
                id: 'test_tree',
                permissions_conf: {
                    lib1: {permissionTreeAttributes: ['modified_at']}
                }
            });

            const mockTreeRepo: Mockify<ITreeRepo> = {
                deleteElement: global.__mockPromise({id: '1345', library: 'lib1'}),
                getTrees: global.__mockPromise({
                    list: [
                        {
                            id: 'test_tree',
                            permissions_conf: {
                                lib1: {permissionTreeAttributes: ['modified_at']}
                            }
                        }
                    ],
                    totalCount: 0
                }),
                getElementAncestors: global.__mockPromise([]),
                isNodePresent: global.__mockPromise(true),
                getRecordByNodeId: global.__mockPromise(mockRecord)
            };

            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.permission.treeNode': mockTreeNodePermissionDomain as ITreeNodePermissionDomain,
                'core.infra.cache.cacheService': mockCachesService as ICachesService,
                'core.domain.attribute': mockAttributesDomain as IAttributeDomain,
                'core.infra.library': mockLibDomain as ILibraryRepo,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperWithPermissions as GetCoreEntityByIdFunc,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper,
                'core.domain.tree.helpers.getDefaultElement': mockGetDefaultElementHelper as IGetDefaultElementHelper,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain
            });

            await domain.deleteElement({
                treeId: 'test_tree',
                nodeId: '1345',
                deleteChildren: true,
                ctx
            });

            expect(mockCacheService.deleteData).toBeCalledTimes(3);
            expect(mockTreeRepo.deleteElement).toBeCalled();
            expect(mockEventsManagerDomain.sendPubSubEvent).toBeCalled();
        });

        test('Should throw if unknown tree, element or destination', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                deleteElement: global.__mockPromise({id: '1345', library: 'lib1'}),
                getElementAncestors: global.__mockPromise([]),
                isNodePresent: global.__mockPromise(true)
            };

            const recordDomain = {
                find: global.__mockPromise({list: [], totalCount: 0})
            };

            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.record': recordDomain as IRecordDomain,
                'core.domain.permission.treeNode': mockTreeNodePermissionDomain as ITreeNodePermissionDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperNoResult as GetCoreEntityByIdFunc
            });

            const rej = await expect(
                domain.deleteElement({
                    treeId: 'test_tree',
                    nodeId: '1345',
                    deleteChildren: true,
                    ctx
                })
            ).rejects.toThrow(ValidationError);
        });
    });

    describe('getTreeContent', () => {
        const mockAttributesDomain: Mockify<IAttributeDomain> = {
            getAttributes: global.__mockPromise([{id: 'modified_at'}, {id: 'created_at'}])
        };

        test('Should return tree content', async () => {
            const treeContentData = [
                {
                    record: {
                        id: '223588194',
                        created_at: 1524057050,
                        modified_at: 1524057125,
                        library: 'categories'
                    },
                    children: []
                },
                {
                    record: {
                        id: '223588185',
                        created_at: 1524057050,
                        modified_at: 1524057125,
                        library: 'categories'
                    },
                    children: [
                        {
                            record: {
                                id: '223588190',
                                created_at: 1524057050,
                                modified_at: 1524057125,
                                library: 'categories'
                            },
                            children: []
                        },
                        {
                            record: {
                                id: '223612473',
                                created_at: 1524130036,
                                modified_at: 1524130036,
                                library: 'categories'
                            },
                            children: [
                                {
                                    record: {
                                        id: '223612456',
                                        created_at: 1524130032,
                                        modified_at: 1524130032,
                                        library: 'categories'
                                    },
                                    children: []
                                }
                            ]
                        }
                    ]
                }
            ];

            const treeRepo: Mockify<ITreeRepo> = {
                getTreeContent: global.__mockPromise(treeContentData),
                getTrees: global.__mockPromise({list: [{id: 'test_tree'}], totalCount: 0})
            };

            const mockRecordDomain: Mockify<IRecordDomain> = {
                find: jest.fn()
            };

            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.attribute': mockAttributesDomain as IAttributeDomain,
                'core.domain.permission.tree': mockTreePermissionDomain as ITreePermissionDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper as GetCoreEntityByIdFunc
            });

            const treeContent = await domain.getTreeContent({treeId: 'test_tree', ctx});

            expect(treeRepo.getTreeContent.mock.calls.length).toBe(1);
            expect(treeContent[0].record).toMatchObject({
                id: '223588194',
                created_at: 1524057050,
                modified_at: 1524057125,
                library: 'categories'
            });
        });

        test('Should throw if unknown tree', async () => {
            const treeContentData = [];

            const treeRepo: Mockify<ITreeRepo> = {
                getTreeContent: global.__mockPromise(treeContentData)
            };

            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.attribute': mockAttributesDomain as IAttributeDomain,
                'core.domain.permission.tree': mockTreePermissionDomain as ITreePermissionDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperNoResult
            });

            await expect(domain.getTreeContent({treeId: 'test_tree', ctx})).rejects.toThrow(ValidationError);
        });

        test('Should throw if tree is not accessible', async () => {
            const treeContentData = [];

            const treeRepo: Mockify<ITreeRepo> = {
                getTreeContent: global.__mockPromise(treeContentData),
                getTrees: global.__mockPromise({list: [{id: 'test_tree'}], totalCount: 1})
            };

            const mockTreePermissionDomainForbidden: Mockify<ITreePermissionDomain> = {
                getTreePermission: global.__mockPromise(false)
            };

            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.attribute': mockAttributesDomain as IAttributeDomain,
                'core.domain.permission.tree': mockTreePermissionDomainForbidden as ITreePermissionDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper as GetCoreEntityByIdFunc
            });

            await expect(domain.getTreeContent({treeId: 'test_tree', ctx})).rejects.toThrow(PermissionError);
        });
    });

    describe('isNodePresent', () => {
        test('Should return if element is present or not', async () => {
            const mockTreeRepo: Mockify<ITreeRepo> = {
                isNodePresent: global.__mockPromise(true)
            };

            const domain = treeDomain({
                'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper as ITreeDataValidationHelper,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const isPresent = await domain.isNodePresent({
                treeId: 'test_tree',
                nodeId: '12345',
                ctx
            });

            expect(isPresent).toBe(true);
        });
    });

    describe('getRecordByNodeId', () => {
        test('Should return record by node id', async () => {
            const mockTreeRepo: Mockify<ITreeRepo> = {
                getRecordByNodeId: global.__mockPromise({id: '123456', library: 'my_lib'})
            };

            const domain = treeDomain({
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const record = await domain.getRecordByNodeId({
                treeId: 'test_tree',
                nodeId: '12345',
                ctx
            });

            expect(record).toEqual({id: '123456', library: 'my_lib'});
        });
    });

    describe('getNodesByRecord', () => {
        test('Should return nodes linked to record', async () => {
            const mockTreeRepo: Mockify<ITreeRepo> = {
                getNodesByRecord: global.__mockPromise(['123456'])
            };

            const domain = treeDomain({
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const record = await domain.getNodesByRecord({
                treeId: 'test_tree',
                record: {id: '123456', library: 'my_lib'},
                ctx
            });

            expect(record).toEqual(['123456']);
        });
    });
});
