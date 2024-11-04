// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Database} from 'arangojs';
import {IDbDocument} from 'infra/db/_types';
import {IQueryInfos} from '_types/queryInfos';
import {mockTree} from '../../__tests__/mocks/tree';
import dbUtils, {IDbUtils} from '../db/dbUtils';
import treeRepo, {ITreeRepoDeps, TREES_COLLECTION_NAME} from './treeRepo';
import {ToAny} from 'utils/utils';

const depsBase: ToAny<ITreeRepoDeps> = {
    'core.infra.db.dbService': jest.fn(),
    'core.infra.db.dbUtils': jest.fn()
};

describe('TreeRepo', () => {
    const docTreeData = {
        _key: 'test_tree',
        system: false,
        libraries: ['test_lib'],
        label: {fr: 'test', en: 'test'}
    };

    const treeData = {
        id: 'test_tree',
        system: false,
        libraries: ['test_lib'],
        label: {fr: 'test', en: 'test'}
    };

    const ctx: IQueryInfos = {
        userId: '0',
        queryId: '132456'
    };
    describe('createTree', () => {
        test('Should create a tree', async function () {
            const mockEnsureIndex = jest.fn();
            const mockCollection = new Database().collection(TREES_COLLECTION_NAME);
            mockCollection.ensureIndex = mockEnsureIndex;

            const mockDb = new Database();
            mockDb.collection = jest.fn().mockReturnValue(mockCollection);

            const mockDbServ = {
                db: mockDb,
                execute: global.__mockPromise([docTreeData]),
                createCollection: global.__mockPromise()
            };

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue(treeData),
                convertToDoc: jest.fn().mockReturnValue(docTreeData)
            };

            const repo = treeRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const createdTree = await repo.createTree({
                treeData: {...mockTree},
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^INSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
            expect(mockDbServ.createCollection.mock.calls.length).toBe(2);
            expect(mockEnsureIndex).toBeCalled();

            expect(createdTree).toMatchObject(treeData);
        });
    });

    describe('updateTree', () => {
        test('Should update a tree', async function () {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([docTreeData])
            };

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue(treeData),
                convertToDoc: jest.fn().mockReturnValue(docTreeData)
            };

            const repo = treeRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const updatedTree = await repo.updateTree({
                treeData: {...mockTree},
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^UPDATE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(updatedTree).toMatchObject(treeData);
        });
    });

    describe('getTrees', () => {
        test('Should return all trees', async () => {
            const mockDbServ = {execute: global.__mockPromise([])};
            const mockDbUtils = {
                findCoreEntity: global.__mockPromise([
                    {
                        id: 'categories',
                        system: false,
                        label: {
                            fr: 'Arbre des catégories'
                        }
                    }
                ])
            } satisfies Mockify<IDbUtils>;

            const repo = treeRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const trees = await repo.getTrees({ctx});

            expect(mockDbUtils.findCoreEntity.mock.calls.length).toBe(1);
            expect(trees).toEqual([
                {
                    id: 'categories',
                    system: false,
                    label: {
                        fr: 'Arbre des catégories'
                    }
                }
            ]);
        });
    });

    describe('deleteTree', () => {
        test('Should delete tree', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([docTreeData]),
                dropCollection: global.__mockPromise()
            };

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue(treeData),
                convertToDoc: jest.fn().mockReturnValue(docTreeData)
            };

            const repo = treeRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            await repo.deleteTree({id: 'test_tree', ctx});

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^REMOVE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
            expect(mockDbServ.dropCollection.mock.calls.length).toBe(2);
        });
    });

    describe('AddElement', () => {
        test('Should add an element to the root', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromiseMultiple([
                    [
                        // Create node entity
                        {
                            _id: 'core_nodes_my_tree/19610667',
                            _key: '19610667'
                        }
                    ],
                    [
                        // Insert entity in tree
                        {
                            _from: 'core_trees/test_tree',
                            _to: 'core_nodes_my_tree/19610667',
                            order: 0
                        }
                    ]
                ])
            };

            const repo = treeRepo({...depsBase, 'core.infra.db.dbService': mockDbServ});

            const res = await repo.addElement({
                treeId: 'test_tree',
                element: {id: '13445', library: 'test_lib'},
                parent: null,
                ctx
            });

            expect(res).toEqual({
                id: '19610667',
                order: 0
            });
            expect(mockDbServ.execute.mock.calls.length).toBe(2);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^INSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatch(/^INSERT/);
            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[1][0].query.bindVars).toMatchSnapshot();
        });

        test('Should add an element under another', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromiseMultiple([
                    [
                        // Create node entity
                        {
                            _id: 'core_nodes_my_tree/19610667',
                            _key: '19610667'
                        }
                    ],
                    [
                        // Insert entity in tree
                        {
                            _from: 'core_nodes_my_tree/6789',
                            _to: 'core_nodes_my_tree/19610667',
                            order: 0
                        }
                    ]
                ])
            };

            const repo = treeRepo({...depsBase, 'core.infra.db.dbService': mockDbServ});

            const res = await repo.addElement({
                treeId: 'test_tree',
                element: {id: '13445', library: 'test_lib'},
                parent: '6789',
                order: 1,
                ctx
            });

            expect(res).toEqual({
                id: '19610667',
                order: 0
            });
            expect(mockDbServ.execute.mock.calls.length).toBe(2);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/INSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatch(/^INSERT/);
            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[1][0].query.bindVars).toMatchSnapshot();
        });
    });

    describe('MoveElement', () => {
        test('Should move an element', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([
                    {
                        _from: 'core_nodes_my_tree/6789',
                        _to: 'core_nodes_my_tree/19610667',
                        order: 0
                    }
                ])
            };

            const repo = treeRepo({...depsBase, 'core.infra.db.dbService': mockDbServ});
            await repo.moveElement({
                treeId: 'test_tree',
                nodeId: '13445',
                parentTo: '6789',
                order: 1,
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/UPDATE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
        });
    });

    describe('DeleteElement', () => {
        test('Should delete an element and its children', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromiseMultiple([
                    [], // Remove children
                    [], // Remove element
                    [
                        // Delete node entity
                        {
                            _id: 'core_nodes_my_tree/19610667',
                            _key: '19610667'
                        }
                    ]
                ])
            };

            const repo = treeRepo({...depsBase, 'core.infra.db.dbService': mockDbServ});
            const res = await repo.deleteElement({
                treeId: 'test_tree',
                nodeId: '13445',
                deleteChildren: true,
                ctx
            });

            expect(res).toEqual({id: '19610667'});

            expect(mockDbServ.execute.mock.calls.length).toBe(3);

            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/REMOVE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/OUTBOUND/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatch(/REMOVE/);
            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[1][0].query.bindVars).toMatchSnapshot();

            expect(mockDbServ.execute.mock.calls[2][0].query.query).toMatch(/REMOVE/);
            expect(mockDbServ.execute.mock.calls[2][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[2][0].query.bindVars).toMatchSnapshot();
        });

        test('Should delete an element and move its children up', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromiseMultiple([
                    ['core_trees/test_tree'], // Get element's parent
                    [
                        // Getting element's children
                        {
                            _key: '2',
                            _id: 'A/2'
                        },
                        {
                            _key: '1',
                            _id: 'B/1'
                        }
                    ],
                    [], // Removing element from its parent
                    [
                        // Removing node entity
                        {
                            _id: 'core_nodes_my_tree/19610667',
                            _key: '19610667'
                        }
                    ]
                ])
            };

            const repo = treeRepo({...depsBase, 'core.infra.db.dbService': mockDbServ}) as any;
            repo.moveElement = global.__mockPromise([]);

            const res = await repo.deleteElement({
                treeId: 'test_tree',
                nodeId: '13445',
                deleteChildren: false,
                ctx
            });

            expect(res).toEqual({id: '19610667'});
            expect(mockDbServ.execute.mock.calls.length).toBe(4);
            expect(repo.moveElement.mock.calls.length).toBe(2);

            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatch(/(?!REMOVE)/);
            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatch(/OUTBOUND/);
            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[1][0].query.bindVars).toMatchSnapshot();

            expect(typeof mockDbServ.execute.mock.calls[2][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[2][0].query.query).toMatch(/REMOVE/);
            expect(mockDbServ.execute.mock.calls[2][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[2][0].query.bindVars).toMatchSnapshot();
        });
    });

    describe('isElementPresent', () => {
        test('Should check if an element is present in the tree', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([
                    {
                        _key: '223539676',
                        _id: 'core_edge_tree_test_tree/223539676',
                        _from: 'users/223552816',
                        _to: 'users/223536900'
                    }
                ])
            };

            const repo = treeRepo({...depsBase, 'core.infra.db.dbService': mockDbServ});

            const isPresent = await repo.isNodePresent({
                treeId: 'test_tree',
                nodeId: '13445',
                ctx
            });

            expect(isPresent).toBe(true);
            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/FILTER/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
        });
        test('Should check if an element is present in the tree', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([])
            };

            const repo = treeRepo({...depsBase, 'core.infra.db.dbService': mockDbServ});

            const isPresent = await repo.isNodePresent({
                treeId: 'test_tree',
                nodeId: '13445',
                ctx
            });

            expect(isPresent).toBe(false);
        });
    });

    describe('isRecordPresent', () => {
        test('Should check if a record is present in the tree', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([
                    {
                        _key: '223539676',
                        _id: 'core_edge_tree_test_tree/223539676',
                        _from: 'core_nodes_test_tree/123456789',
                        _to: 'users/223536900'
                    }
                ])
            };

            const repo = treeRepo({...depsBase, 'core.infra.db.dbService': mockDbServ});

            const isPresent = await repo.isRecordPresent({
                treeId: 'test_tree',
                record: {id: '223536900', library: 'users'},
                ctx
            });

            expect(isPresent).toBe(true);
            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/FILTER/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
        });
        test('Should check if an element is present in the tree', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([])
            };

            const repo = treeRepo({...depsBase, 'core.infra.db.dbService': mockDbServ});

            const isPresent = await repo.isRecordPresent({
                treeId: 'test_tree',
                record: {id: '223536900', library: 'users'},
                ctx
            });

            expect(isPresent).toBe(false);
            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/FILTER/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
        });
    });

    describe('getTreeContent', () => {
        test('Should return full content of a tree', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([
                    {
                        id: '19637240',
                        record: {
                            _id: 'nouvelle_biblio/19610667',
                            _key: '19610667',
                            label: 'A',
                            path: ['test_tree']
                        },
                        order: 0
                    },
                    {
                        id: '19637279',
                        record: {
                            _id: 'nouvelle_biblio/19611412',
                            _key: '19611412',
                            label: 'B',
                            path: ['test_tree', '19637240']
                        },
                        order: 0
                    },
                    {
                        id: '19637318',
                        record: {
                            _id: 'nouvelle_biblio/19611963',
                            _key: '19611963',
                            label: 'C',
                            path: ['test_tree', '19637240']
                        },
                        order: 0
                    },
                    {
                        id: '19637350',
                        record: {
                            _id: 'nouvelle_biblio/19611963',
                            _key: '19611963',
                            label: 'C',
                            path: ['test_tree', '19637240', '19637279']
                        },
                        order: 0
                    },
                    {
                        id: '19637382',
                        record: {
                            _id: 'nouvelle_biblio/19611984',
                            _key: '19611984',
                            label: 'D',
                            path: ['test_tree', '19637240', '19637318']
                        },
                        order: 0
                    },
                    {
                        id: '19637411',
                        record: {
                            _id: 'nouvelle_biblio/19612005',
                            _key: '19612005',
                            label: 'E',
                            path: ['test_tree', '19637240', '19637318']
                        },
                        order: 0
                    }
                ])
            };

            const mockDbUtils = {
                cleanup: dbUtils().cleanup
            };

            const repo = treeRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const treeContent = await repo.getTreeContent({
                treeId: 'test_tree',
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars.value1).toBe('core_trees/test_tree');

            expect(treeContent).toEqual([
                {
                    id: '19637240',
                    record: {
                        id: '19610667',
                        label: 'A',
                        library: 'nouvelle_biblio'
                    },
                    order: 0,
                    children: [
                        {
                            id: '19637279',
                            record: {
                                id: '19611412',
                                label: 'B',
                                library: 'nouvelle_biblio'
                            },
                            order: 0,
                            children: [
                                {
                                    id: '19637350',
                                    record: {
                                        id: '19611963',
                                        label: 'C',
                                        library: 'nouvelle_biblio'
                                    },
                                    order: 0,
                                    children: []
                                }
                            ]
                        },
                        {
                            id: '19637318',
                            record: {
                                id: '19611963',
                                label: 'C',
                                library: 'nouvelle_biblio'
                            },
                            order: 0,
                            children: [
                                {
                                    id: '19637382',
                                    record: {
                                        id: '19611984',
                                        label: 'D',
                                        library: 'nouvelle_biblio'
                                    },
                                    order: 0,
                                    children: []
                                },
                                {
                                    id: '19637411',
                                    record: {
                                        id: '19612005',
                                        label: 'E',
                                        library: 'nouvelle_biblio'
                                    },
                                    order: 0,
                                    children: []
                                }
                            ]
                        }
                    ]
                }
            ]);
        });

        test('Should return children count of elements', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([
                    {
                        id: '19637240',
                        record: {
                            _id: 'nouvelle_biblio/19610667',
                            _key: '19610667',
                            label: 'A',
                            path: ['test_tree']
                        },
                        order: 0,
                        childrenCount: 1
                    },
                    {
                        id: '19637279',
                        record: {
                            _id: 'nouvelle_biblio/19611412',
                            _key: '19611412',
                            label: 'B',
                            path: ['test_tree', '19637240']
                        },
                        order: 0,
                        childrenCount: 0
                    }
                ])
            };

            const mockDbUtils = {
                cleanup: dbUtils().cleanup
            };

            const repo = treeRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const treeContent = await repo.getTreeContent({
                treeId: 'test_tree',
                childrenCount: true,
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/childrenCount/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars.value1).toBe('core_trees/test_tree');

            expect(treeContent).toEqual([
                {
                    id: '19637240',
                    record: {
                        id: '19610667',
                        label: 'A',
                        library: 'nouvelle_biblio'
                    },
                    order: 0,
                    childrenCount: 1,
                    children: [
                        {
                            id: '19637279',
                            record: {
                                id: '19611412',
                                label: 'B',
                                library: 'nouvelle_biblio'
                            },
                            order: 0,
                            childrenCount: 0,
                            children: []
                        }
                    ]
                }
            ]);
        });

        test('Should return content of a tree starting from a given node', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([])
            };

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest.fn()
            };

            const repo = treeRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });
            await repo.getTreeContent({
                treeId: 'test_tree',
                startingNode: '223588185',
                ctx
            });

            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars.value1).toMatch(/223588185/);
        });
    });

    describe('getElementChildren', () => {
        test('Should return element children', async () => {
            const traversalRes = [
                {
                    id: '19637382',
                    order: 0,
                    record: {
                        _key: '19611984',
                        _id: 'nouvelle_biblio/19611984',
                        label: 'D'
                    }
                },
                {
                    id: '19637411',
                    order: 0,
                    record: {
                        _key: '19612005',
                        _id: 'nouvelle_biblio/19612005',
                        label: 'E'
                    }
                }
            ];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };

            const mockCleanupRes = jest
                .fn()
                .mockReturnValueOnce({
                    id: '19611984',
                    label: 'D'
                })
                .mockReturnValueOnce({
                    id: '19612005',
                    label: 'E'
                });

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: mockCleanupRes
            };

            const repo = treeRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const values = await repo.getElementChildren({
                treeId: 'test_tree',
                nodeId: '123458',
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(values).toEqual({
                totalCount: null,
                list: [
                    {
                        id: '19637382',
                        order: 0,
                        childrenCount: null,
                        record: {
                            id: '19611984',
                            label: 'D'
                        }
                    },
                    {
                        id: '19637411',
                        order: 0,
                        childrenCount: null,
                        record: {
                            id: '19612005',
                            label: 'E'
                        }
                    }
                ]
            });
        });
    });

    describe('getElementAncestors', () => {
        test('Should return element ancestors', async () => {
            const traversalRes = [
                {
                    id: '19637318',
                    order: 0,
                    record: {
                        _key: '19611963',
                        _id: 'nouvelle_biblio/19611963',
                        label: 'C'
                    }
                },
                {
                    id: '19637240',
                    order: 0,
                    record: {
                        _key: '19610667',
                        _id: 'nouvelle_biblio/19610667',
                        label: 'A'
                    }
                }
            ];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };

            const mockCleanupRes = jest
                .fn()
                .mockReturnValueOnce({
                    id: '19610667',
                    label: 'A'
                })
                .mockReturnValueOnce({
                    id: '19611963',
                    label: 'C'
                });

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: mockCleanupRes
            };

            const repo = treeRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const values = await repo.getElementAncestors({
                treeId: 'test_tree',
                nodeId: '123458',
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(values).toEqual([
                {
                    id: '19637240',
                    order: 0,
                    record: {
                        id: '19610667',
                        label: 'A'
                    }
                },
                {
                    id: '19637318',
                    order: 0,
                    record: {
                        id: '19611963',
                        label: 'C'
                    }
                }
            ]);
        });
    });

    describe('getLinkedRecords', () => {
        test('Should return linked records', async () => {
            const traversalRes = [
                {
                    _key: '123456',
                    _id: 'images/123456',
                    _rev: '_WgJhrXO--_',
                    created_at: 77777,
                    modified_at: 77777
                },
                {
                    _key: '123457',
                    _id: 'images/123457',
                    _rev: '_WgJhrXO--_',
                    created_at: 88888,
                    modified_at: 88888
                },
                {
                    _key: '123458',
                    _id: 'images/123458',
                    _rev: '_WgJhrXO--_',
                    created_at: 99999,
                    modified_at: 99999
                }
            ];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };

            const mockCleanupRes = jest
                .fn()
                .mockReturnValueOnce({
                    id: '123456',
                    created_at: 77777,
                    modified_at: 77777
                })
                .mockReturnValueOnce({
                    id: '123457',
                    created_at: 88888,
                    modified_at: 88888
                })
                .mockReturnValueOnce({
                    id: '123458',
                    created_at: 99999,
                    modified_at: 99999
                });

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: mockCleanupRes
            };

            const repo = treeRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const values = await repo.getLinkedRecords({
                treeId: 'test_tree',
                attribute: 'test_attr',
                nodeId: '123458',
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(values).toEqual([
                {
                    id: '123456',
                    created_at: 77777,
                    modified_at: 77777
                },
                {
                    id: '123457',
                    created_at: 88888,
                    modified_at: 88888
                },
                {
                    id: '123458',
                    created_at: 99999,
                    modified_at: 99999
                }
            ]);
        });
    });

    describe('getRecordByNodeId', () => {
        test('Return record linked to node', async () => {
            const traversalRes: IDbDocument[] = [
                {
                    _key: '123456',
                    _id: 'mylib/123456',
                    _rev: '_WgJhrXO--_',
                    label: 'my record'
                }
            ];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };

            const mockCleanupRes = jest.fn().mockReturnValue({
                id: '123456',
                library: 'mylib',
                label: 'my record'
            });

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: mockCleanupRes
            };

            const repo = treeRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const record = await repo.getRecordByNodeId({
                treeId: 'test_tree',
                nodeId: '123458',
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(record).toEqual({
                id: '123456',
                library: 'mylib',
                label: 'my record'
            });
        });
    });

    describe('getNodesByRecord', () => {
        test('Return nodes linked to record', async () => {
            const traversalRes = ['123456', '654321'];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };

            const repo = treeRepo({
                ...depsBase,
                'core.infra.db.dbService': mockDbServ
            });

            const record = await repo.getNodesByRecord({
                treeId: 'test_tree',
                record: {id: '123456', library: 'mylib'},
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(record).toEqual(['123456', '654321']);
        });
    });

    describe('getNodesByLibrary', () => {
        test('Return nodes linked to library', async () => {
            const queryRes = ['123456', '654321'];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(queryRes)
            };

            const repo = treeRepo({
                ...depsBase,
                'core.infra.db.dbService': mockDbServ
            });

            const record = await repo.getNodesByLibrary({
                treeId: 'test_tree',
                libraryId: 'mylib',
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(record).toEqual(['123456', '654321']);
        });
    });
});
