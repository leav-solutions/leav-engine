import treeRepo from './treeRepo';
import {Database} from 'arangojs';

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
    describe('createTree', () => {
        test('Should create a tree', async function() {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([docTreeData]),
                createCollection: global.__mockPromise()
            };

            const mockDbUtils = {
                cleanup: jest.fn().mockReturnValue(treeData),
                convertToDoc: jest.fn().mockReturnValue(docTreeData)
            };

            const repo = treeRepo(mockDbServ, mockDbUtils);

            const createdTree = await repo.createTree({
                id: 'test_tree',
                libraries: ['test_lib', 'test_lib2'],
                system: false,
                label: {fr: 'Test'}
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/^INSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();
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

            const mockDbUtils = {
                cleanup: jest.fn().mockReturnValue(treeData),
                convertToDoc: jest.fn().mockReturnValue(docTreeData)
            };

            const repo = treeRepo(mockDbServ, mockDbUtils);

            const updatedTree = await repo.updateTree({
                id: 'test_tree',
                libraries: ['test_lib', 'test_lib2'],
                system: false,
                label: {fr: 'Test'}
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/^UPDATE/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();

            expect(updatedTree).toMatchObject(treeData);
        });
    });

    describe('getTrees', () => {
        test('Should return all trees', async () => {
            const mockDbServ = {db: null, execute: global.__mockPromise([])};
            const mockDbUtils = {cleanup: jest.fn()};

            const repo = treeRepo(mockDbServ, mockDbUtils);

            const trees = await repo.getTrees();

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/FOR l IN core_trees/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();
        });
        test('Should filter trees', async () => {
            const mockDbServ = {db: null, execute: global.__mockPromise([])};
            const mockDbUtils = {
                cleanup: jest.fn(),
                convertToDoc: jest.fn().mockReturnValue({_key: 'test', system: false})
            };

            const repo = treeRepo(mockDbServ, mockDbUtils);

            const trees = await repo.getTrees({id: 'test'});

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/FOR l IN core_trees/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/FILTER/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();
        });
    });

    describe('deleteTree', () => {
        test('Should delete tree', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([docTreeData]),
                dropCollection: global.__mockPromise()
            };

            const mockDbUtils = {
                cleanup: jest.fn().mockReturnValue(treeData),
                convertToDoc: jest.fn().mockReturnValue(docTreeData)
            };

            const repo = treeRepo(mockDbServ, mockDbUtils);

            const deletedTree = await repo.deleteTree('test_tree');

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/^REMOVE/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();
            expect(mockDbServ.dropCollection.mock.calls.length).toBe(1);
        });
    });

    describe('AddElement', () => {
        test('Should add an element to the root', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([])
            };

            const repo = treeRepo(mockDbServ, null);
            const addedElement = await repo.addElement('test_tree', {id: 13445, library: 'test_lib'}, null);

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/^INSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();
        });

        test('Should add an element under another', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([])
            };

            const repo = treeRepo(mockDbServ, null);

            const addedElement = await repo.addElement(
                'test_tree',
                {id: 13445, library: 'test_lib'},
                {id: 6789, library: 'test_lib2'}
            );

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/INSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();
        });
    });

    describe('MoveElement', () => {
        test('Should move an element', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([])
            };

            const repo = treeRepo(mockDbServ, null);
            const addedElement = await repo.moveElement('test_tree', {id: 13445, library: 'test_lib'}, null, {
                id: 6789,
                library: 'users'
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/UPDATE/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();
        });
    });

    describe('DeleteElement', () => {
        test('Should delete an element and its children', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([])
            };

            const repo = treeRepo(mockDbServ, null);
            const deletedElement = await repo.deleteElement('test_tree', {id: 13445, library: 'test_lib'}, null, true);

            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/REMOVE/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/OUTBOUND/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();

            expect(mockDbServ.execute.mock.calls.length).toBe(2);
            expect(typeof mockDbServ.execute.mock.calls[1][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[1][0].query).toMatch(/REMOVE/);
            expect(mockDbServ.execute.mock.calls[1][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[1][0].bindVars).toMatchSnapshot();
        });

        test('Should delete an element and move its children up', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromiseMultiple([
                    [
                        // Getting element's children
                        {
                            _key: '2',
                            _id: 'A/2',
                            _rev: '_Wl1NK7u--_'
                        },
                        {
                            _key: '1',
                            _id: 'B/1',
                            _rev: '_Wl1NZGO--_'
                        }
                    ],
                    [] // Removing element
                ])
            };

            const repo = treeRepo(mockDbServ, null) as any;
            repo.moveElement = global.__mockPromise([]);

            const deletedElement = await repo.deleteElement('test_tree', {id: 13445, library: 'test_lib'}, null, false);

            expect(mockDbServ.execute.mock.calls.length).toBe(2);
            expect(repo.moveElement.mock.calls.length).toBe(2);

            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/(?!REMOVE)/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/OUTBOUND/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();

            expect(typeof mockDbServ.execute.mock.calls[1][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[1][0].query).toMatch(/REMOVE/);
            expect(mockDbServ.execute.mock.calls[1][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[1][0].bindVars).toMatchSnapshot();
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
                        _to: 'users/223536900',
                        _rev: '_Wl8h5b2--B'
                    }
                ])
            };

            const repo = treeRepo(mockDbServ, null);

            const isPresent = await repo.isElementPresent('test_tree', {id: 13445, library: 'test_lib'});

            expect(isPresent).toBe(true);
            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/FILTER/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();
        });
        test('Should check if an element is present in the tree', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([])
            };

            const repo = treeRepo(mockDbServ, null);

            const isPresent = await repo.isElementPresent('test_tree', {id: 13445, library: 'test_lib'});

            expect(isPresent).toBe(false);
        });
    });
});
