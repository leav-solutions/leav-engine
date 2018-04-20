import treeDomain from './treeDomain';
import {ITreeRepo} from 'infra/treeRepo';
import ValidationError from '../errors/ValidationError';

describe('treeDomain', () => {
    const mockTreeRepo = {
        createTree: jest.fn(),
        updateTree: jest.fn(),
        getTrees: jest.fn(),
        deleteTree: jest.fn(),
        addElement: jest.fn(),
        moveElement: jest.fn(),
        deleteElement: jest.fn(),
        isElementPresent: global.__mockPromise(false),
        getTreeContent: jest.fn()
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

    describe('addElement', () => {
        const mockRecordDomain = {
            find: global.__mockPromise([{id: 1345, library: 'test_lib'}])
        };

        test('Should an element to a tree', async () => {
            const treeRepo = {
                ...mockTreeRepo,
                addElement: global.__mockPromise({id: 1345, library: 'test_lib'}),
                getTrees: global.__mockPromise([{id: 'test_tree'}])
            };
            const domain = treeDomain(treeRepo, null, mockRecordDomain);

            const addedElement = await domain.addElement('test_tree', {id: 1345, library: 'test_lib'}, null);

            expect(treeRepo.addElement).toBeCalled();
        });

        test('Should throw if unknown tree, element or destination', async () => {
            const treeRepo = {
                ...mockTreeRepo,
                addElement: global.__mockPromise({id: 1345, library: 'test_lib'}),
                getTrees: global.__mockPromise([])
            };

            const domain = treeDomain(treeRepo, null, mockRecordDomain);

            const rej = await expect(
                domain.addElement('test_tree', {id: 1345, library: 'test_lib'}, {id: 999, library: 'other_lib'})
            ).rejects.toThrow(ValidationError);
        });

        test('Should throw if element already present in the tree', async () => {
            const treeRepo = {
                ...mockTreeRepo,
                addElement: global.__mockPromise({id: 1345, library: 'test_lib'}),
                getTrees: global.__mockPromise([mockTree]),
                isElementPresent: global.__mockPromise(true)
            };

            const recordDomain = {
                ...mockRecordDomain,
                find: global.__mockPromise([])
            };

            const domain = treeDomain(treeRepo, null, recordDomain);

            const rej = await expect(
                domain.addElement('test_tree', {id: 1345, library: 'test_lib'}, {id: 999, library: 'other_lib'})
            ).rejects.toThrow(ValidationError);
        });
    });

    describe('moveElement', () => {
        const mockRecordDomain = {
            find: global.__mockPromise([{id: 1345, library: 'test_lib'}])
        };

        test('Should move an element in a tree', async () => {
            const treeRepo = {
                ...mockTreeRepo,
                moveElement: global.__mockPromise({id: 1345, library: 'test_lib'}),
                getTrees: global.__mockPromise([{id: 'test_tree'}])
            };
            const domain = treeDomain(treeRepo, null, mockRecordDomain);

            const addedElement = await domain.moveElement('test_tree', {id: 1345, library: 'test_lib'}, null, {
                id: 999,
                library: 'other_lib'
            });

            expect(treeRepo.moveElement).toBeCalled();
        });

        test('Should throw if unknown tree, element or destination', async () => {
            const treeRepo = {
                ...mockTreeRepo,
                moveElement: global.__mockPromise({id: 1345, library: 'test_lib'}),
                getTrees: global.__mockPromise([])
            };

            const recordDomain = {
                ...mockRecordDomain,
                find: global.__mockPromise([])
            };

            const domain = treeDomain(treeRepo, null, recordDomain);

            const rej = await expect(
                domain.moveElement('test_tree', {id: 1345, library: 'test_lib'}, null, {id: 999, library: 'other_lib'})
            ).rejects.toThrow(ValidationError);
        });
    });

    describe('deleteElement', () => {
        const mockRecordDomain = {
            find: global.__mockPromise([{id: 1345, library: 'test_lib'}])
        };

        test('Should move an element in a tree', async () => {
            const treeRepo = {
                ...mockTreeRepo,
                deleteElement: global.__mockPromise({id: 1345, library: 'test_lib'}),
                getTrees: global.__mockPromise([{id: 'test_tree'}])
            };
            const domain = treeDomain(treeRepo, null, mockRecordDomain);

            const addedElement = await domain.deleteElement('test_tree', {id: 1345, library: 'test_lib'}, null, true);

            expect(treeRepo.deleteElement).toBeCalled();
        });

        test('Should throw if unknown tree, element or destination', async () => {
            const treeRepo = {
                ...mockTreeRepo,
                deleteElement: global.__mockPromise({id: 1345, library: 'test_lib'}),
                getTrees: global.__mockPromise([])
            };

            const recordDomain = {
                ...mockRecordDomain,
                find: global.__mockPromise([])
            };

            const domain = treeDomain(treeRepo, null, recordDomain);

            const rej = await expect(
                domain.deleteElement('test_tree', {id: 1345, library: 'test_lib'}, null, true)
            ).rejects.toThrow(ValidationError);
        });
    });

    describe('geTreeContent', () => {
        const mockAttributesDomain = {
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

            const treeRepo = {
                ...mockTreeRepo,
                getTreeContent: global.__mockPromise(treeContentData),
                getTrees: global.__mockPromise([{id: 'test_tree'}])
            };

            const mockRecordDomain = {
                find: jest.fn(),
                populateRecordFields: jest.fn((lib, rec, queryFields) => {
                    rec.modified_at = {value: rec.modified_at};
                    rec.created_at = {value: rec.created_at};

                    return rec;
                })
            };

            const domain = treeDomain(treeRepo, mockLibDomain, mockRecordDomain, mockAttributesDomain);

            const treeContent = await domain.getTreeContent('test_tree', ['modified_at', 'created_at']);

            expect(treeRepo.getTreeContent.mock.calls.length).toBe(1);
            expect(treeContent[0].record).toMatchObject({
                id: '223588194',
                created_at: {value: 1524057050},
                modified_at: {value: 1524057125},
                library: 'categories'
            });
        });

        test('Should throw if unknown tree', async () => {
            const treeContentData = [];

            const treeRepo = {
                ...mockTreeRepo,
                getTreeContent: global.__mockPromise(treeContentData),
                getTrees: global.__mockPromise([])
            };
            const domain = treeDomain(treeRepo, mockLibDomain, null, mockAttributesDomain);

            const rej = await expect(domain.getTreeContent('test_tree', ['modified_at', 'created_at'])).rejects.toThrow(
                ValidationError
            );
        });

        test('Should throw if unknown attribute', async () => {
            const treeContentData = [];

            const treeRepo = {
                ...mockTreeRepo,
                getTreeContent: global.__mockPromise(treeContentData),
                getTrees: global.__mockPromise([{id: 'test_tree'}])
            };

            const attrDomain = {...mockAttributesDomain, getAttributes: global.__mockPromise(['attr1', 'attr2'])};

            const domain = treeDomain(treeRepo, mockLibDomain, null, attrDomain);

            const rej = await expect(domain.getTreeContent('test_tree', ['attr1', 'attr3', 'attr2'])).rejects.toThrow(
                ValidationError
            );
        });
    });
});
