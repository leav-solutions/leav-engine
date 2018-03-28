import attributeAdvancedRepo from './attributeAdvancedRepo';
import {AttributeTypes} from '../../_types/attribute';
import {Database} from 'arangojs';

describe('AttributeStandardRepo', () => {
    const mockAttribute = {
        id: 'test_attr',
        type: AttributeTypes.ADVANCED
    };

    describe('createValue', () => {
        test('Should create a new standard value', async function() {
            const createdValueData = {
                _id: 'core_values/987654',
                _rev: '_WSywvyC--_',
                _key: 987654,
                value: 'test_val'
            };

            const createdEdgeData = {
                _id: 'core_edge_values_links/222435651',
                _rev: '_WSywvyC--_',
                _from: 'test_lib/12345',
                _to: 'core_values/987654',
                _key: 978654321,
                attribute: 'test_attr',
                modified_at: 400999999,
                created_at: 400999999
            };

            const newValueData = {
                id: 987654,
                value: 'test_val',
                attribute: 'test_attr',
                modified_at: 400999999,
                created_at: 400999999
            };

            const mockDbCollec = {
                save: global.__mockPromise(createdValueData),
                document: global.__mockPromise(createdValueData)
            };

            const mockDbEdgeCollec = {
                save: global.__mockPromise(createdEdgeData),
                firstExample: global.__mockPromise(createdEdgeData)
            };

            const mockDb = {
                collection: jest.fn().mockReturnValue(mockDbCollec),
                edgeCollection: jest.fn().mockReturnValue(mockDbEdgeCollec)
            };

            const mockDbServ = {db: mockDb};

            const attrRepo = attributeAdvancedRepo(mockDbServ);

            const createdVal = await attrRepo.createValue('test_lib', 12345, mockAttribute, {
                value: 'test val',
                modified_at: 400999999,
                created_at: 400999999
            });

            expect(mockDbCollec.save.mock.calls.length).toBe(1);
            expect(mockDbCollec.save).toBeCalledWith({value: 'test val'});

            expect(mockDbEdgeCollec.save.mock.calls.length).toBe(1);
            expect(mockDbEdgeCollec.save).toBeCalledWith({
                _from: 'test_lib/12345',
                _to: 'core_values/987654',
                attribute: 'test_attr',
                modified_at: 400999999,
                created_at: 400999999
            });

            expect(createdVal).toMatchObject(newValueData);
        });
    });

    describe('updateValue', () => {
        test('Should update a standard value', async function() {
            const savedValueData = {
                _id: 'core_values/987654',
                _rev: '_WSywvyC--_',
                _key: 987654,
                value: 'test_val'
            };

            const savedEdgeData = {
                _id: 'core_edge_values_links/222435651',
                _rev: '_WSywvyC--_',
                _from: 'test_lib/12345',
                _to: 'core_values/987654',
                _key: 978654321,
                attribute: 'test_attr',
                modified_at: 400999999,
                created_at: 400999999
            };

            const valueData = {
                id: 987654,
                value: 'test_val',
                attribute: 'test_attr',
                modified_at: 400999999,
                created_at: 400999999
            };

            const mockDbCollec = {
                update: global.__mockPromise(savedValueData),
                document: global.__mockPromise(savedValueData)
            };

            const mockDbEdgeCollec = {
                updateByExample: global.__mockPromise(),
                firstExample: global.__mockPromise(savedEdgeData)
            };

            const mockDb = {
                collection: jest.fn().mockReturnValue(mockDbCollec),
                edgeCollection: jest.fn().mockReturnValue(mockDbEdgeCollec)
            };

            const mockDbServ = {db: mockDb};

            const attrRepo = attributeAdvancedRepo(mockDbServ);

            const savedVal = await attrRepo.updateValue('test_lib', 12345, mockAttribute, {
                id: 987654,
                value: 'test val',
                modified_at: 500999999
            });

            expect(mockDbCollec.update.mock.calls.length).toBe(1);
            expect(mockDbCollec.update).toBeCalledWith({_key: 987654}, {value: 'test val'});

            expect(mockDbEdgeCollec.updateByExample.mock.calls.length).toBe(1);
            expect(mockDbEdgeCollec.updateByExample).toBeCalledWith(
                {
                    _from: 'test_lib/12345',
                    _to: 'core_values/987654'
                },
                {
                    _from: 'test_lib/12345',
                    _to: 'core_values/987654',
                    attribute: 'test_attr',
                    modified_at: 500999999
                }
            );

            expect(savedVal).toMatchObject(valueData);
        });
    });

    describe('deleteValue', () => {
        test('Should delete a value', async function() {
            const deletedValueData = {
                _id: 'core_values/123456789',
                _rev: '_WSywvyC--_',
                _key: 123456789,
                value: 'test_val'
            };

            const deletedEdgeData = {
                _id: 'core_edge_values_links/222435651',
                _rev: '_WSywvyC--_',
                _from: 'test_lib/12345',
                _to: 'core_values/987654',
                _key: 978654321,
                attribute: 'test_attr',
                modified_at: 400999999,
                created_at: 400999999
            };

            const oldValueData = {
                id: 123456789,
                attribute: 'test_attr',
                modified_at: 400999999,
                created_at: 400999999
            };

            const mockDbCollec = {
                remove: global.__mockPromise(deletedValueData)
            };

            const mockDbEdgeCollec = {
                removeByExample: global.__mockPromise(deletedEdgeData)
            };

            const mockDb = {
                collection: jest.fn().mockReturnValue(mockDbCollec),
                edgeCollection: jest.fn().mockReturnValue(mockDbEdgeCollec)
            };

            const mockDbServ = {db: mockDb};

            const attrRepo = attributeAdvancedRepo(mockDbServ);

            const deletedVal = await attrRepo.deleteValue('test_lib', 12345, mockAttribute, {
                id: 123456789,
                value: 'test val',
                modified_at: 400999999,
                created_at: 400999999
            });

            expect(mockDbCollec.remove.mock.calls.length).toBe(1);
            expect(mockDbCollec.remove).toBeCalledWith({_key: 123456789});

            expect(mockDbEdgeCollec.removeByExample.mock.calls.length).toBe(1);
            expect(mockDbEdgeCollec.removeByExample).toBeCalledWith({
                _from: 'test_lib/12345',
                _to: 'core_values/123456789'
            });

            expect(deletedVal).toMatchObject(oldValueData);
        });
    });

    describe('getValueByID', () => {
        test('Should return value', async function() {
            const lookupValueRes = [
                {
                    _key: 987654,
                    value: 'test val'
                }
            ];

            const edgeRes = [
                {
                    _from: 'test_lib/987654',
                    _to: 'core_values/987654',
                    modified_at: 99999,
                    created_at: 99999,
                    attribute: 'test_attr'
                }
            ];

            const mockDbCollec = {
                lookupByKeys: global.__mockPromise(lookupValueRes)
            };

            const mockDbEdgeCollec = {
                inEdges: global.__mockPromise(edgeRes)
            };

            const mockDb = {
                collection: jest.fn().mockReturnValue(mockDbCollec),
                edgeCollection: jest.fn().mockReturnValue(mockDbEdgeCollec)
            };

            const mockDbServ = {db: mockDb};

            const attrRepo = attributeAdvancedRepo(mockDbServ);

            const value = await attrRepo.getValueById('test_lib', 987654, mockAttribute, {
                id: 132465,
                value: 'test val'
            });

            expect(mockDbCollec.lookupByKeys.mock.calls.length).toBe(1);
            expect(mockDbEdgeCollec.inEdges.mock.calls.length).toBe(1);
            expect(value).toMatchObject({
                id: 987654,
                value: 'test val',
                modified_at: 99999,
                created_at: 99999,
                attribute: 'test_attr'
            });
        });

        test("Should return null if value doesn't exists", async function() {
            const mockDbCollec = {
                lookupByKeys: global.__mockPromise([])
            };

            const mockDbEdgeCollec = {
                inEdges: global.__mockPromise()
            };

            const mockDb = {
                collection: jest.fn().mockReturnValue(mockDbCollec),
                edgeCollection: jest.fn().mockReturnValue(mockDbEdgeCollec)
            };

            const mockDbServ = {db: mockDb};

            const attrRepo = attributeAdvancedRepo(mockDbServ);

            const value = await attrRepo.getValueById('test_lib', 987654, mockAttribute, {
                id: 132465,
                value: 'test val'
            });

            expect(mockDbCollec.lookupByKeys.mock.calls.length).toBe(1);
            expect(mockDbEdgeCollec.inEdges.mock.calls.length).toBe(0);
            expect(value).toBeNull();
        });
    });

    describe('getValues', () => {
        test('Should return values for standard attribute', async function() {
            const traversalRes = [
                {
                    value: {
                        _key: 987654,
                        value: 'test val'
                    },
                    edge: {
                        _from: 'test_lib/123456',
                        _to: 'core_values/987654',
                        attribute: 'test_attr',
                        modified_at: 99999,
                        created_at: 99999
                    }
                },
                {
                    value: {
                        _key: 987655,
                        value: 'test val2'
                    },
                    edge: {
                        _from: 'test_lib/123456',
                        _to: 'core_values/987655',
                        attribute: 'test_attr',
                        modified_at: 99999,
                        created_at: 99999
                    }
                }
            ];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };

            const attrRepo = attributeAdvancedRepo(mockDbServ);

            const values = await attrRepo.getValues('test_lib', 123456, mockAttribute);

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();

            expect(values.length).toBe(2);
            expect(values[0]).toMatchObject({
                id: 987654,
                value: 'test val',
                attribute: 'test_attr',
                modified_at: 99999,
                created_at: 99999
            });
        });
    });

    describe('filterQueryPart', () => {
        test('Should return simple filter', () => {
            const attrRepo = attributeAdvancedRepo(null);
            const filter = attrRepo.filterQueryPart('label', 0, 'MyLabel');

            expect(filter).toMatchSnapshot();
        });
    });
});
