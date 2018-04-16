import treeDomain from './treeDomain';
import {ITreeRepo} from 'infra/treeRepo';
import ValidationError from '../errors/ValidationError';

describe('treeDomain', () => {
    const mockTreeRepo = {
        createTree: jest.fn(),
        updateTree: jest.fn(),
        getTrees: jest.fn(),
        deleteTree: jest.fn()
    };

    const mockTree = {
        id: 'test',
        system: false,
        libraries: ['test_lib', 'test_lib2'],
        label: {fr: 'Test'}
    };

    const mockLibDomain = {
        getLibraries: global.__mockPromise([{id: 'test_lib'}, {id: 'test_lib2'}])
    };

    describe('saveTree', () => {
        test('Should create new tree', async () => {
            const treeRepo = {
                ...mockTreeRepo,
                createTree: global.__mockPromise(mockTree),
                getTrees: global.__mockPromise([])
            };
            const domain = treeDomain(treeRepo, mockLibDomain);

            const newTree = await domain.saveTree(mockTree);

            expect(treeRepo.createTree.mock.calls.length).toBe(1);
            expect(treeRepo.updateTree.mock.calls.length).toBe(0);

            expect(newTree).toMatchObject(mockTree);
        });

        test('Should update existing tree', async () => {
            const treeRepo = {
                ...mockTreeRepo,
                updateTree: global.__mockPromise(mockTree),
                getTrees: global.__mockPromise([mockTree])
            };
            const domain = treeDomain(treeRepo, mockLibDomain);

            const newTree = await domain.saveTree(mockTree);

            expect(treeRepo.createTree.mock.calls.length).toBe(0);
            expect(treeRepo.updateTree.mock.calls.length).toBe(1);

            expect(newTree).toMatchObject(mockTree);
        });

        test('Should throw if unknown libraries', async () => {
            const treeRepo = {
                ...mockTreeRepo,
                createTree: global.__mockPromise(mockTree),
                getTrees: global.__mockPromise([])
            };

            const treeData = {
                ...mockTree,
                libraries: ['test_lib', 'unexisting_lib']
            };

            const domain = treeDomain(treeRepo, mockLibDomain);

            await expect(domain.saveTree(treeData)).rejects.toThrow(ValidationError);
        });
    });

    describe('deleteTree', () => {
        test('Should delete a tree and return deleted tree', async function() {
            const treeRepo = {
                ...mockTreeRepo,
                deleteTree: global.__mockPromise(mockTree)
            };

            const domain = treeDomain(treeRepo);
            domain.getTrees = global.__mockPromise([mockTree]);

            const deleteRes = await domain.deleteTree(mockTree.id);

            expect(treeRepo.deleteTree.mock.calls.length).toBe(1);
        });

        test('Should throw if unknown tree', async function() {
            const treeRepo = {
                ...mockTreeRepo,
                deleteTree: global.__mockPromise(mockTree)
            };

            const domain = treeDomain(treeRepo);
            domain.getTrees = global.__mockPromise([]);
            await expect(domain.deleteTree(mockTree.id)).rejects.toThrow(ValidationError);
        });

        test('Should throw if system tree', async function() {
            const treeData = {...mockTree, system: true};

            const treeRepo = {
                ...mockTreeRepo,
                deleteTree: global.__mockPromise(treeData)
            };

            const domain = treeDomain(treeRepo);
            domain.getTrees = global.__mockPromise([treeData]);
            await expect(domain.deleteTree(mockTree.id)).rejects.toThrow(ValidationError);
        });
    });

    describe('getTrees', () => {
        test('Should return a list of trees', async () => {
            const treeRepo = {
                ...mockTreeRepo,
                getTrees: global.__mockPromise([mockTree, mockTree])
            };
            const domain = treeDomain(treeRepo);

            const trees = await domain.getTrees({id: 'test'});

            expect(treeRepo.getTrees).toBeCalledWith({id: 'test'});
            expect(trees.length).toBe(2);
        });
    });
});
