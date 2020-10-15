import {IAppPermissionDomain} from 'domain/permission/appPermissionDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {LibraryBehavior} from '../../_types/library';
import {AppPermissionsActions} from '../../_types/permissions';
import {TreeBehavior} from '../../_types/tree';
import {mockFilesTree} from '../../__tests__/mocks/tree';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {ILibraryDomain} from '../library/libraryDomain';
import {IRecordDomain} from '../record/recordDomain';
import treeDomain from './treeDomain';

describe('treeDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'treeDomainTest'
    };
    const mockTree = {
        id: 'test',
        system: false,
        libraries: ['lib1', 'lib2'],
        label: {fr: 'Test'},
        behavior: TreeBehavior.STANDARD
    };

    const mockLibDomain: Mockify<ILibraryDomain> = {
        getLibraries: global.__mockPromise({list: [{id: 'lib1'}, {id: 'lib2'}], totalCount: 2})
    };

    const mockAppPermDomain: Mockify<IAppPermissionDomain> = {
        getAppPermission: global.__mockPromise(true)
    };

    const mockAppPermForbiddenDomain: Mockify<IAppPermissionDomain> = {
        getAppPermission: global.__mockPromise(false)
    };

    beforeEach(() => jest.clearAllMocks());

    describe('saveTree', () => {
        const mockUtils: Mockify<IUtils> = {
            validateID: jest.fn().mockReturnValue(true)
        };
        test('Should create new tree', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                createTree: global.__mockPromise(mockTree),
                updateTree: jest.fn(),
                getTrees: global.__mockPromise({list: [], totalCount: 0})
            };
            const domain = treeDomain({
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                'core.utils': mockUtils as IUtils
            });

            const newTree = await domain.saveTree(mockTree, ctx);

            expect(treeRepo.createTree.mock.calls.length).toBe(1);
            expect(treeRepo.updateTree.mock.calls.length).toBe(0);

            expect(newTree).toMatchObject(mockTree);

            expect(mockAppPermDomain.getAppPermission).toBeCalled();
            expect(mockAppPermDomain.getAppPermission.mock.calls[0][0].action).toBe(AppPermissionsActions.CREATE_TREE);
        });

        test('Should update existing tree', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                createTree: jest.fn(),
                updateTree: global.__mockPromise(mockTree),
                getTrees: global.__mockPromise({list: [mockTree], totalCount: 1})
            };
            const domain = treeDomain({
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                'core.utils': mockUtils as IUtils
            });

            const newTree = await domain.saveTree(mockTree, ctx);

            expect(treeRepo.createTree.mock.calls.length).toBe(0);
            expect(treeRepo.updateTree.mock.calls.length).toBe(1);

            expect(newTree).toMatchObject(mockTree);

            expect(mockAppPermDomain.getAppPermission).toBeCalled();
            expect(mockAppPermDomain.getAppPermission.mock.calls[0][0].action).toBe(AppPermissionsActions.EDIT_TREE);
        });

        test('Should throw if unknown libraries', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                createTree: global.__mockPromise(mockTree),
                getTrees: global.__mockPromise({list: [], totalCount: 0})
            };

            const treeData = {
                ...mockTree,
                libraries: ['lib1', 'unexisting_lib']
            };

            const domain = treeDomain({
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                'core.utils': mockUtils as IUtils
            });

            await expect(domain.saveTree(treeData, ctx)).rejects.toThrow(ValidationError);
        });

        test('Should throw if forbidden action', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                createTree: jest.fn(),
                updateTree: global.__mockPromise(mockTree),
                getTrees: global.__mockPromise({list: [mockTree], totalCount: 1})
            };
            const domain = treeDomain({
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.domain.permission.app': mockAppPermForbiddenDomain as IAppPermissionDomain,
                'core.utils': mockUtils as IUtils
            });

            await expect(domain.saveTree(mockTree, ctx)).rejects.toThrow(PermissionError);
        });

        test('Should throw if invalid ID', async function() {
            const mockUtilsInvalidID: Mockify<IUtils> = {
                validateID: jest.fn().mockReturnValue(false)
            };

            const treeRepo: Mockify<ITreeRepo> = {
                createTree: jest.fn(),
                updateTree: global.__mockPromise(mockTree),
                getTrees: global.__mockPromise({list: [mockTree], totalCount: 1})
            };
            const domain = treeDomain({
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                'core.utils': mockUtilsInvalidID as IUtils
            });

            await expect(domain.saveTree(mockTree, ctx)).rejects.toThrow(ValidationError);
        });

        test('Should not save behavior on existing tree', async () => {
            const mockFilesLibDomain: Mockify<ILibraryDomain> = {
                getLibraries: global.__mockPromise({
                    list: [{id: 'lib1', behavior: LibraryBehavior.FILES}],
                    totalCount: 1
                })
            };

            const treeRepo: Mockify<ITreeRepo> = {
                createTree: jest.fn(),
                updateTree: global.__mockPromise(mockTree),
                getTrees: global.__mockPromise({list: [mockTree], totalCount: 1})
            };

            const domain = treeDomain({
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.library': mockFilesLibDomain as ILibraryDomain,
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                'core.utils': mockUtils as IUtils
            });

            await domain.saveTree({...mockFilesTree}, ctx);
            expect(treeRepo.updateTree.mock.calls[0][0].behavior).toBeUndefined();
        });

        test('On files behavior, throw if binding a non-files library', async () => {
            const treeToSave = {...mockFilesTree};
            const treeRepo: Mockify<ITreeRepo> = {
                createTree: jest.fn(),
                updateTree: global.__mockPromise(treeToSave),
                getTrees: global.__mockPromise({list: [treeToSave], totalCount: 1})
            };

            const domain = treeDomain({
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                'core.utils': mockUtils as IUtils
            });

            await expect(domain.saveTree(treeToSave, ctx)).rejects.toHaveProperty('fields.libraries');
        });

        test('On files behavior, throw if binding more than one library', async () => {
            const treeToSave = {...mockFilesTree, libraries: ['lib1', 'lib2']};
            const treeRepo: Mockify<ITreeRepo> = {
                createTree: jest.fn(),
                updateTree: global.__mockPromise(treeToSave),
                getTrees: global.__mockPromise({list: [treeToSave], totalCount: 1})
            };

            const domain = treeDomain({
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                'core.utils': mockUtils as IUtils
            });

            await expect(domain.saveTree(treeToSave, ctx)).rejects.toHaveProperty('fields.libraries');
        });
    });

    describe('deleteTree', () => {
        test('Should delete a tree and return deleted tree', async function() {
            const treeRepo: Mockify<ITreeRepo> = {
                deleteTree: global.__mockPromise(mockTree)
            };

            const domain = treeDomain({
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain
            });
            domain.getTrees = global.__mockPromise({list: [mockTree], totalCount: 1});

            const deleteRes = await domain.deleteTree(mockTree.id, ctx);

            expect(treeRepo.deleteTree.mock.calls.length).toBe(1);

            expect(mockAppPermDomain.getAppPermission).toBeCalled();
            expect(mockAppPermDomain.getAppPermission.mock.calls[0][0].action).toBe(AppPermissionsActions.DELETE_TREE);
        });

        test('Should throw if unknown tree', async function() {
            const treeRepo: Mockify<ITreeRepo> = {
                deleteTree: global.__mockPromise(mockTree)
            };

            const domain = treeDomain({
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain
            });
            domain.getTrees = global.__mockPromise({list: [], totalCount: 0});
            await expect(domain.deleteTree(mockTree.id, ctx)).rejects.toThrow(ValidationError);
        });

        test('Should throw if system tree', async function() {
            const treeData = {...mockTree, system: true};

            const treeRepo: Mockify<ITreeRepo> = {
                deleteTree: global.__mockPromise(treeData)
            };

            const domain = treeDomain({
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain
            });
            domain.getTrees = global.__mockPromise({list: [treeData], totalCount: 1});
            await expect(domain.deleteTree(mockTree.id, ctx)).rejects.toThrow(ValidationError);
        });

        test('Should throw if action forbidden', async function() {
            const treeData = {...mockTree, system: true};

            const treeRepo: Mockify<ITreeRepo> = {
                deleteTree: global.__mockPromise(treeData)
            };

            const domain = treeDomain({
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.permission.app': mockAppPermForbiddenDomain as IAppPermissionDomain
            });
            domain.getTrees = global.__mockPromise([treeData]);
            await expect(domain.deleteTree(mockTree.id, ctx)).rejects.toThrow(PermissionError);
        });
    });

    describe('getTrees', () => {
        test('Should return a list of trees', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                getTrees: global.__mockPromise({list: [mockTree, mockTree], totalCount: 1})
            };
            const domain = treeDomain({'core.infra.tree': treeRepo as ITreeRepo});

            const trees = await domain.getTrees({params: {filters: {id: 'test'}}, ctx});

            expect(treeRepo.getTrees.mock.calls[0][0].params.filters).toMatchObject({id: 'test'});
            expect(trees.list.length).toBe(2);
        });

        test('Should return a list of trees', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                getTrees: global.__mockPromise({list: [mockTree, mockTree], totalCount: 1})
            };
            const domain = treeDomain({'core.infra.tree': treeRepo as ITreeRepo});

            const trees = await domain.getTrees({params: {filters: {id: 'test'}}, ctx});

            expect(treeRepo.getTrees.mock.calls[0][0].params.sort).toMatchObject({field: 'id', order: 'asc'});
        });
    });

    describe('addElement', () => {
        const mockRecordDomain: Mockify<IRecordDomain> = {
            find: global.__mockPromise({list: [{id: '1345', library: 'lib1'}], totalCount: 1})
        };

        test('Should an element to a tree', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                addElement: global.__mockPromise({id: '1345', library: 'lib1'}),
                isElementPresent: global.__mockPromise(false),
                getTrees: global.__mockPromise({list: [{id: 'test_tree'}], totalCount: 0})
            };
            const domain = treeDomain({
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.record': mockRecordDomain as IRecordDomain
            });

            const addedElement = await domain.addElement({
                treeId: 'test_tree',
                element: {id: '1345', library: 'lib1'},
                parent: null,
                ctx
            });

            expect(treeRepo.addElement).toBeCalled();
        });

        test('Should throw if unknown tree, element or destination', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                addElement: global.__mockPromise({id: '1345', library: 'lib1'}),
                isElementPresent: global.__mockPromise(false),
                getTrees: global.__mockPromise({list: [], totalCount: 0})
            };

            const domain = treeDomain({
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.record': mockRecordDomain as IRecordDomain
            });

            const rej = await expect(
                domain.addElement({
                    treeId: 'test_tree',
                    element: {id: '1345', library: 'lib1'},
                    parent: {id: '999', library: 'other_lib'},
                    ctx
                })
            ).rejects.toThrow(ValidationError);
        });

        test('Should throw if element already present in the tree', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                addElement: global.__mockPromise({id: '1345', library: 'lib1'}),
                getTrees: global.__mockPromise({list: [mockTree], totalCount: 0}),
                isElementPresent: global.__mockPromise(true)
            };

            const recordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({
                    list: [{list: [{id: '1345', library: 'lib1'}], totalCount: 1}],
                    totalCount: 1
                })
            };
            const domain = treeDomain({
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.record': recordDomain as IRecordDomain
            });

            const rej = await expect(
                domain.addElement({
                    treeId: 'test_tree',
                    element: {id: '1345', library: 'lib1'},
                    parent: {id: '999', library: 'other_lib'},
                    ctx
                })
            ).rejects.toThrow();
        });

        test('On files tree, throw if adding an element under a file', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                addElement: jest.fn(),
                getTrees: global.__mockPromise({list: [mockFilesTree], totalCount: 1}),
                isElementPresent: global.__mockPromise(false)
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
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.record': recordDomain as IRecordDomain,
                'core.domain.value': mockValueDomain as IValueDomain
            });

            await expect(
                domain.addElement({
                    treeId: 'test_tree',
                    element: {id: '1345', library: 'lib1'},
                    parent: {id: '999', library: 'other_lib'},
                    ctx
                })
            ).rejects.toHaveProperty('fields.parent');
        });
    });

    describe('moveElement', () => {
        const mockRecordDomain = {
            find: global.__mockPromise({list: [{id: '1345', library: 'lib1'}], totalCount: 1})
        };

        test('Should move an element in a tree', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                moveElement: global.__mockPromise({id: '1345', library: 'lib1'}),
                getTrees: global.__mockPromise({list: [{id: 'test_tree'}], totalCount: 0})
            };
            const domain = treeDomain({
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.record': mockRecordDomain as IRecordDomain
            });

            const addedElement = await domain.moveElement({
                treeId: 'test_tree',
                element: {id: '1345', library: 'lib1'},
                parentTo: {
                    id: '999',
                    library: 'other_lib'
                },
                ctx
            });

            expect(treeRepo.moveElement).toBeCalled();
        });

        test('Should throw if unknown tree, element or destination', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                moveElement: global.__mockPromise({id: '1345', library: 'lib1'}),
                getTrees: global.__mockPromise({list: [], totalCount: 0})
            };

            const recordDomain = {
                find: global.__mockPromise({list: [], totalCount: 0})
            };

            const domain = treeDomain({
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.record': recordDomain as IRecordDomain
            });

            const rej = await expect(
                domain.moveElement({
                    treeId: 'test_tree',
                    element: {id: '1345', library: 'lib1'},
                    parentTo: {id: '999', library: 'other_lib'},
                    ctx
                })
            ).rejects.toThrow(ValidationError);
        });

        test('On files tree, throw if moving an element under a file', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                addElement: jest.fn(),
                getTrees: global.__mockPromise({list: [mockFilesTree], totalCount: 1}),
                isElementPresent: global.__mockPromise(false)
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
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.record': recordDomain as IRecordDomain,
                'core.domain.value': mockValueDomain as IValueDomain
            });

            await expect(
                domain.moveElement({
                    treeId: 'test_tree',
                    element: {id: '1345', library: 'lib1'},
                    parentTo: {id: '999', library: 'other_lib'},
                    ctx
                })
            ).rejects.toHaveProperty('fields.parent');
        });
    });

    describe('deleteElement', () => {
        const mockRecordDomain = {
            find: global.__mockPromise({list: [{id: '1345', library: 'lib1'}], totalCount: 1})
        };

        test('Should move an element in a tree', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                deleteElement: global.__mockPromise({id: '1345', library: 'lib1'}),
                getTrees: global.__mockPromise({list: [{id: 'test_tree'}], totalCount: 0})
            };

            const domain = treeDomain({
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.record': mockRecordDomain as IRecordDomain
            });

            const addedElement = await domain.deleteElement({
                treeId: 'test_tree',
                element: {id: '1345', library: 'lib1'},
                deleteChildren: true,
                ctx
            });

            expect(treeRepo.deleteElement).toBeCalled();
        });

        test('Should throw if unknown tree, element or destination', async () => {
            const treeRepo: Mockify<ITreeRepo> = {
                deleteElement: global.__mockPromise({id: '1345', library: 'lib1'}),
                getTrees: global.__mockPromise({list: [], totalCount: 0})
            };

            const recordDomain = {
                find: global.__mockPromise({list: [], totalCount: 0})
            };

            const domain = treeDomain({
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.record': recordDomain as IRecordDomain
            });

            const rej = await expect(
                domain.deleteElement({
                    treeId: 'test_tree',
                    element: {id: '1345', library: 'lib1'},
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
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.attribute': mockAttributesDomain as IAttributeDomain
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
                getTreeContent: global.__mockPromise(treeContentData),
                getTrees: global.__mockPromise({list: [], totalCount: 0})
            };

            const domain = treeDomain({
                'core.infra.tree': treeRepo as ITreeRepo,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.domain.attribute': mockAttributesDomain as IAttributeDomain
            });

            const rej = await expect(domain.getTreeContent({treeId: 'test_tree', ctx})).rejects.toThrow(
                ValidationError
            );
        });
    });

    describe('isElementPresent', () => {
        test('Should return if element is present or not', async () => {
            const mockTreeRepo: Mockify<ITreeRepo> = {
                isElementPresent: global.__mockPromise(true)
            };

            const domain = treeDomain({
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.library': mockLibDomain as ILibraryDomain
            });

            const isPresent = await domain.isElementPresent({
                treeId: 'test_tree',
                element: {id: '12345', library: 'lib1'},
                ctx
            });

            expect(isPresent).toBe(true);
        });
    });
});
