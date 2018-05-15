import {Database} from 'arangojs';
import {AttributeTypes} from '../../_types/attribute';
import {IValue} from '../../_types/value';
import {ITreeRepo} from '../treeRepo';
import attributeTreeRepo from './attributeTreeRepo';

const mockAttrTreeRepo: Mockify<ITreeRepo> = {
    createTree: null,
    updateTree: null,
    getTrees: null,
    deleteTree: null,
    addElement: null,
    moveElement: null,
    deleteElement: null,
    isElementPresent: null,
    getTreeContent: null,
    getElementAncestors: null
};

describe('AttributeTreeRepo', () => {
    const mockAttribute = {
        id: 'test_tree_attr',
        type: AttributeTypes.TREE,
        linked_tree: 'test_tree'
    };

    const savedEdgeData = {
        _id: 'core_edge_values_links/222435651',
        _rev: '_WSywvyC--_',
        _from: 'test_lib/12345',
        _to: 'categories/123456',
        _key: 978654321,
        attribute: 'test_tree_attr',
        modified_at: 400999999,
        created_at: 400999999
    };

    const valueData: IValue = {
        id_value: 978654321,
        value: 'categories/123456',
        attribute: 'test_tree_attr',
        modified_at: 400999999,
        created_at: 400999999
    };

    describe('createValue', () => {
        test('Should create a new advanced link value', async function() {
            const mockDbEdgeCollec = {
                save: global.__mockPromise(savedEdgeData),
                firstExample: global.__mockPromise(savedEdgeData)
            };

            const mockDb = {
                edgeCollection: jest.fn().mockReturnValue(mockDbEdgeCollec)
            };

            const mockDbServ = {db: mockDb};

            const attrRepo = attributeTreeRepo(mockDbServ, null);

            const createdVal = await attrRepo.createValue('test_lib', 12345, mockAttribute, {
                value: 'categories/123456',
                modified_at: 400999999,
                created_at: 400999999
            });

            expect(mockDbEdgeCollec.save.mock.calls.length).toBe(1);
            expect(mockDbEdgeCollec.save).toBeCalledWith({
                _from: 'test_lib/12345',
                _to: 'categories/123456',
                attribute: 'test_tree_attr',
                modified_at: 400999999,
                created_at: 400999999
            });

            expect(createdVal).toMatchObject({
                id_value: 978654321,
                value: 'categories/123456',
                attribute: 'test_tree_attr',
                modified_at: 400999999,
                created_at: 400999999
            });
        });
    });

    describe('updateValue', () => {
        test('Should update a advanced link value', async function() {
            const mockDbEdgeCollec = {
                updateByExample: global.__mockPromise(),
                firstExample: global.__mockPromise(savedEdgeData)
            };

            const mockDb = {
                edgeCollection: jest.fn().mockReturnValue(mockDbEdgeCollec)
            };

            const mockDbServ = {db: mockDb};

            const attrRepo = attributeTreeRepo(mockDbServ, null);

            const savedVal = await attrRepo.updateValue('test_lib', 12345, mockAttribute, {
                id_value: 987654,
                value: 'categories/123456',
                modified_at: 400999999
            });

            expect(mockDbEdgeCollec.updateByExample.mock.calls.length).toBe(1);
            expect(mockDbEdgeCollec.updateByExample).toBeCalledWith(
                {
                    _key: 987654
                },
                {
                    _from: 'test_lib/12345',
                    _to: 'categories/123456',
                    attribute: 'test_tree_attr',
                    modified_at: 400999999
                }
            );

            expect(savedVal).toMatchObject(valueData);
        });
    });

    describe('deleteValue', () => {
        test('Should delete a value', async function() {
            const deletedEdgeData = {
                _id: 'core_edge_values_links/222435651',
                _rev: '_WSywvyC--_',
                _from: 'test_lib/12345',
                _to: 'categories/123456',
                _key: 978654321
            };

            const mockDbEdgeCollec = {
                removeByExample: global.__mockPromise(deletedEdgeData)
            };

            const mockDb = {
                edgeCollection: jest.fn().mockReturnValue(mockDbEdgeCollec)
            };

            const mockDbServ = {db: mockDb};

            const attrRepo = attributeTreeRepo(mockDbServ, null);

            const deletedVal = await attrRepo.deleteValue('test_lib', 12345, mockAttribute, {
                id_value: 445566,
                value: 'categories/123456',
                modified_at: 400999999,
                created_at: 400999999
            });

            expect(mockDbEdgeCollec.removeByExample.mock.calls.length).toBe(1);
            expect(mockDbEdgeCollec.removeByExample).toBeCalledWith({_key: 445566});

            expect(deletedVal).toMatchObject({id_value: 445566});
        });
    });

    describe('getValueByID', () => {
        test('Should return value', async function() {
            const traversalRes = [
                {
                    linkedRecord: {
                        _key: '123456',
                        _id: 'categories/123456',
                        _rev: '_WgJhrXO--_',
                        created_at: 88888,
                        modified_at: 88888
                    },
                    edge: {
                        _key: '112233',
                        _id: 'core_edge_values_links/112233',
                        _from: 'ubs/222536283',
                        _to: 'categories/123456',
                        _rev: '_WgJilsW--_',
                        attribute: 'test_tree_attr',
                        modified_at: 99999,
                        created_at: 99999
                    }
                }
            ];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };

            const mockCleanupRes = jest.fn().mockReturnValueOnce({
                id: 123456,
                created_at: 88888,
                modified_at: 88888
            });

            const mockDbUtils = {
                cleanup: mockCleanupRes
            };

            const attrRepo = attributeTreeRepo(mockDbServ, mockDbUtils);

            const value = await attrRepo.getValueById('test_lib', 987654, mockAttribute, {
                id_value: 112233,
                value: 'categories/123456'
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();
            expect(value).toMatchObject({
                id_value: 112233,
                value: {
                    id: 123456,
                    created_at: 88888,
                    modified_at: 88888
                },
                modified_at: 99999,
                created_at: 99999,
                attribute: 'test_tree_attr'
            });
        });

        test("Should return null if value doesn't exists", async function() {
            const traversalRes = [];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };

            const attrRepo = attributeTreeRepo(mockDbServ, null);

            const value = await attrRepo.getValueById('test_lib', 987654, mockAttribute, {
                id_value: 112233,
                value: 'categories/123456'
            });

            expect(value).toBeNull();
        });
    });

    describe('getValues', () => {
        test('Should return linked tree element', async function() {
            const traversalRes = [
                {
                    linkedRecord: {
                        _key: '123456',
                        _id: 'images/123456',
                        _rev: '_WgJhrXO--_',
                        created_at: 88888,
                        modified_at: 88888
                    },
                    edge: {
                        _key: '112233',
                        _id: 'core_edge_values_links/112233',
                        _from: 'ubs/222536283',
                        _to: 'images/123456',
                        _rev: '_WgJilsW--_',
                        attribute: 'test_tree_attr',
                        modified_at: 99999,
                        created_at: 99999
                    }
                }
            ];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };

            const mockCleanupRes = jest.fn().mockReturnValueOnce({
                id: 123456,
                created_at: 88888,
                modified_at: 88888
            });

            const mockDbUtils = {
                cleanup: mockCleanupRes
            };

            const attrRepo = attributeTreeRepo(mockDbServ, mockDbUtils);

            const values = await attrRepo.getValues('test_lib', 123456, mockAttribute);

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();

            expect(values.length).toBe(1);
            expect(values[0]).toMatchObject({
                id_value: 112233,
                value: [
                    {
                        record: {
                            id: 123456,
                            created_at: 88888,
                            modified_at: 88888
                        }
                    }
                ],
                attribute: 'test_tree_attr',
                modified_at: 99999,
                created_at: 99999
            });
        });
    });
});
