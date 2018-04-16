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
});
