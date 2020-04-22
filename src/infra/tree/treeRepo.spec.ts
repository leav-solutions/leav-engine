import {Database} from 'arangojs';
import {TreeBehavior} from '../../_types/tree';
import dbUtils, {IDbUtils} from '../db/dbUtils';
import treeRepo from './treeRepo';
import {IQueryInfos} from '_types/queryInfos';

describe('TreeRepo', () => {
    const docTreeData = {
        _key: 'test_tree',
        system: false,
        libraries: ['test_lib', 'test_lib2'],
        label: {fr: 'test', en: 'test'}
    };

    const treeData = {
        id: 'test_tree',
        system: false,
        libraries: ['test_lib', 'test_lib2'],
        label: {fr: 'test', en: 'test'}
    };
    const ctx: IQueryInfos = {
        userId: 0,
        queryId: '132456'
    };
    describe('createTree', () => {
        test('Should create a tree', async function() {
            const mockDbServ = {
                db: new Database(),
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
                treeData: {
                    id: 'test_tree',
                    behavior: TreeBehavior.STANDARD,
                    libraries: ['test_lib', 'test_lib2'],
                    system: false,
                    label: {fr: 'Test'}
                },
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^INSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
            expect(mockDbServ.createCollection.mock.calls.length).toBe(1);

            expect(createdTree).toMatchObject(treeData);
        });
    });

    describe('updateTree', () => {
        test('Should update a tree', async function() {
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
                treeData: {
                    id: 'test_tree',
                    behavior: TreeBehavior.STANDARD,
                    libraries: ['test_lib', 'test_lib2'],
                    system: false,
                    label: {fr: 'Test'}
                },
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
            const mockDbServ = {db: null, execute: global.__mockPromise([])};
            const mockDbUtils: Mockify<IDbUtils> = {
                findCoreEntity: global.__mockPromise([
                    {
                        id: 'categories',
                        system: false,
                        label: {
                            fr: 'Arbre des catégories'
                        }
                    }
                ])
            };

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

            const deletedTree = await repo.deleteTree({id: 'test_tree', ctx});

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^REMOVE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
            expect(mockDbServ.dropCollection.mock.calls.length).toBe(1);
        });
    });

    describe('AddElement', () => {
        test('Should add an element to the root', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([])
            };

            const repo = treeRepo({'core.infra.db.dbService': mockDbServ});
            const addedElement = await repo.addElement({
                treeId: 'test_tree',
                element: {id: 13445, library: 'test_lib'},
                parent: null,
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^INSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
        });

        test('Should add an element under another', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([])
            };

            const repo = treeRepo({'core.infra.db.dbService': mockDbServ});

            const addedElement = await repo.addElement({
                treeId: 'test_tree',
                element: {id: 13445, library: 'test_lib'},
                parent: {id: 6789, library: 'test_lib2'},
                order: 1,
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/INSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
        });
    });

    describe('MoveElement', () => {
        test('Should move an element', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([])
            };

            const repo = treeRepo({'core.infra.db.dbService': mockDbServ});
            const addedElement = await repo.moveElement({
                treeId: 'test_tree',
                element: {id: 13445, library: 'test_lib'},
                parentTo: {
                    id: 6789,
                    library: 'users'
                },
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
                execute: global.__mockPromise([])
            };

            const repo = treeRepo({'core.infra.db.dbService': mockDbServ});
            const deletedElement = await repo.deleteElement({
                treeId: 'test_tree',
                element: {id: 13445, library: 'test_lib'},
                deleteChildren: true,
                ctx
            });

            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/REMOVE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/OUTBOUND/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(mockDbServ.execute.mock.calls.length).toBe(2);
            expect(typeof mockDbServ.execute.mock.calls[1][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatch(/REMOVE/);
            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[1][0].query.bindVars).toMatchSnapshot();
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
                    [] // Removing element
                ])
            };

            const repo = treeRepo({'core.infra.db.dbService': mockDbServ}) as any;
            repo.moveElement = global.__mockPromise([]);

            const deletedElement = await repo.deleteElement({
                treeId: 'test_tree',
                element: {id: 13445, library: 'test_lib'},
                deleteChildren: false,
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(3);
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

            const repo = treeRepo({'core.infra.db.dbService': mockDbServ});

            const isPresent = await repo.isElementPresent({
                treeId: 'test_tree',
                element: {id: 13445, library: 'test_lib'},
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

            const repo = treeRepo({'core.infra.db.dbService': mockDbServ});

            const isPresent = await repo.isElementPresent({
                treeId: 'test_tree',
                element: {id: 13445, library: 'test_lib'},
                ctx
            });

            expect(isPresent).toBe(false);
        });
    });

    describe('getTreeContent', () => {
        test('Should return full content of a tree', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([
                    {
                        order: 0,
                        record: {
                            _id: 'core_trees/test_tree',
                            _key: 'categories',
                            _rev: '_Wm_Qdtu--_',
                            label: {
                                fr: 'Arbre des catégories'
                            },
                            libraries: ['categories'],
                            system: false,
                            path: ['core_trees/test_tree']
                        }
                    },
                    {
                        order: 0,
                        record: {
                            _id: 'categories/223588194',
                            _key: '223588194',
                            _rev: '_Wm_Sdaq--_',
                            created_at: 1524057050,
                            id: '223588194',
                            modified_at: 1524057125,
                            path: ['core_trees/test_tree', 'categories/223588194']
                        }
                    },
                    {
                        order: 1,
                        record: {
                            _id: 'categories/223588185',
                            _key: '223588185',
                            _rev: '_Wm_SdZ2--_',
                            created_at: 1524057050,
                            id: '223588185',
                            modified_at: 1524057125,
                            path: ['core_trees/test_tree', 'categories/223588185']
                        }
                    },
                    {
                        order: 0,
                        record: {
                            _id: 'categories/223588190',
                            _key: '223588190',
                            _rev: '_Wm_SdaS--_',
                            created_at: 1524057050,
                            id: '223588190',
                            modified_at: 1524057125,
                            path: ['core_trees/test_tree', 'categories/223588185', 'categories/223588190']
                        }
                    },
                    {
                        order: 1,
                        record: {
                            _id: 'categories/223612473',
                            _key: '223612473',
                            _rev: '_WmDqKmm--_',
                            created_at: 1524130036,
                            modified_at: 1524130036,
                            path: ['core_trees/test_tree', 'categories/223588185', 'categories/223612473']
                        }
                    },
                    {
                        order: 0,
                        record: {
                            _id: 'categories/223612456',
                            _key: '223612456',
                            _rev: '_WmDqGxW--_',
                            created_at: 1524130032,
                            modified_at: 1524130032,
                            path: [
                                'core_trees/test_tree',
                                'categories/223588185',
                                'categories/223612473',
                                'categories/223612456'
                            ]
                        }
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
                    order: 0,
                    record: {
                        id: '223588194',
                        created_at: 1524057050,
                        modified_at: 1524057125,
                        library: 'categories'
                    },
                    children: []
                },
                {
                    order: 1,
                    record: {
                        id: '223588185',
                        created_at: 1524057050,
                        modified_at: 1524057125,
                        library: 'categories'
                    },
                    children: [
                        {
                            order: 0,
                            record: {
                                id: '223588190',
                                created_at: 1524057050,
                                modified_at: 1524057125,
                                library: 'categories'
                            },
                            children: []
                        },
                        {
                            order: 1,
                            record: {
                                id: '223612473',
                                created_at: 1524130036,
                                modified_at: 1524130036,
                                library: 'categories'
                            },
                            children: [
                                {
                                    order: 0,
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
            const treeContent = await repo.getTreeContent({
                treeId: 'test_tree',
                startingNode: {id: 223588185, library: 'categories'},
                ctx
            });

            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars.value1).toBe('categories/223588185');
        });
    });
    describe('getDefaultElement', () => {
        test('Should return the first element of a tree', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([
                    {
                        order: 0,
                        record: {
                            _id: 'core_trees/test_tree',
                            _key: 'categories',
                            _rev: '_Wm_Qdtu--_',
                            label: {
                                fr: 'Arbre des catégories'
                            },
                            libraries: ['categories'],
                            system: false,
                            path: ['core_trees/test_tree']
                        }
                    },
                    {
                        order: 0,
                        record: {
                            _id: 'categories/223588194',
                            _key: '223588194',
                            _rev: '_Wm_Sdaq--_',
                            created_at: 1524057050,
                            id: '223588194',
                            modified_at: 1524057125,
                            path: ['core_trees/test_tree', 'categories/223588194']
                        }
                    },
                    {
                        order: 1,
                        record: {
                            _id: 'categories/223588185',
                            _key: '223588185',
                            _rev: '_Wm_SdZ2--_',
                            created_at: 1524057050,
                            id: '223588185',
                            modified_at: 1524057125,
                            path: ['core_trees/test_tree', 'categories/223588185']
                        }
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

            const treeElement = await repo.getDefaultElement({id: 'test_tree', ctx});

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars.value1).toBe('core_trees/test_tree');

            expect(treeElement).toEqual({
                id: '223588194',
                library: 'categories'
            });
        });
    });

    describe('getElementChildren', () => {
        test('Should return element children', async () => {
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
                    id: 123456,
                    created_at: 77777,
                    modified_at: 77777
                })
                .mockReturnValueOnce({
                    id: 123457,
                    created_at: 88888,
                    modified_at: 88888
                })
                .mockReturnValueOnce({
                    id: 123458,
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

            const values = await repo.getElementChildren({
                treeId: 'test_tree',
                element: {id: 123458, library: 'images'},
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(values).toEqual([
                {
                    record: {
                        id: 123456,
                        created_at: 77777,
                        modified_at: 77777
                    }
                },
                {
                    record: {
                        id: 123457,
                        created_at: 88888,
                        modified_at: 88888
                    }
                },
                {
                    record: {
                        id: 123458,
                        created_at: 99999,
                        modified_at: 99999
                    }
                }
            ]);
        });
    });

    describe('getElementParents', () => {
        test('Should return element parents', async () => {
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
                    id: 123456,
                    created_at: 77777,
                    modified_at: 77777
                })
                .mockReturnValueOnce({
                    id: 123457,
                    created_at: 88888,
                    modified_at: 88888
                })
                .mockReturnValueOnce({
                    id: 123458,
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

            const values = await repo.getElementAncestors({
                treeId: 'test_tree',
                element: {id: 123458, library: 'images'},
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(values).toEqual([
                {
                    record: {
                        id: 123456,
                        created_at: 77777,
                        modified_at: 77777
                    }
                },
                {
                    record: {
                        id: 123457,
                        created_at: 88888,
                        modified_at: 88888
                    }
                },
                {
                    record: {
                        id: 123458,
                        created_at: 99999,
                        modified_at: 99999
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
                    id: 123456,
                    created_at: 77777,
                    modified_at: 77777
                })
                .mockReturnValueOnce({
                    id: 123457,
                    created_at: 88888,
                    modified_at: 88888
                })
                .mockReturnValueOnce({
                    id: 123458,
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
                element: {id: 123458, library: 'images'},
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(values).toEqual([
                {
                    id: 123456,
                    created_at: 77777,
                    modified_at: 77777
                },
                {
                    id: 123457,
                    created_at: 88888,
                    modified_at: 88888
                },
                {
                    id: 123458,
                    created_at: 99999,
                    modified_at: 99999
                }
            ]);
        });
    });
});
