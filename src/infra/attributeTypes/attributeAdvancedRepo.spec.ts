import {Database} from 'arangojs';
import {IDbUtils} from 'infra/db/dbUtils';
import {AttributeTypes} from '../../_types/attribute';
import {mockAttrAdvVersionableSimple} from '../../__tests__/mocks/attribute';
import attributeAdvancedRepo from './attributeAdvancedRepo';

describe('AttributeStandardRepo', () => {
    const mockAttribute = {
        id: 'test_attr',
        type: AttributeTypes.ADVANCED,
        multipleValues: true
    };

    const mockDbUtils: Mockify<IDbUtils> = {
        convertValueVersionToDb: jest.fn().mockReturnValue({my_tree: 'test_lib/1'}),
        convertValueVersionFromDb: jest.fn().mockReturnValue({
            my_tree: {
                id: 1,
                library: 'test_lib'
            }
        })
    };

    describe('createValue', () => {
        test('Should create a new advanced value', async function() {
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
                id_value: 987654,
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

        test('Should save version on value', async function() {
            const createdValueData = {
                _id: 'core_values/987654',
                _rev: '_WSywvyC--_',
                _key: 987654,
                value: 'test_val',
                version: {
                    my_tree: 'test_lib/1'
                }
            };

            const createdEdgeData = {
                _id: 'core_edge_values_links/222435651',
                _rev: '_WSywvyC--_',
                _from: 'test_lib/12345',
                _to: 'core_values/987654',
                _key: 978654321,
                attribute: 'test_attr',
                modified_at: 400999999,
                created_at: 400999999,
                version: {
                    my_tree: 'test_lib/1'
                }
            };

            const newValueData = {
                id_value: 987654,
                value: 'test_val',
                attribute: 'test_attr',
                modified_at: 400999999,
                created_at: 400999999,
                version: {
                    my_tree: {
                        id: 1,
                        library: 'test_lib'
                    }
                }
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

            const attrRepo = attributeAdvancedRepo(mockDbServ, mockDbUtils);

            const createdVal = await attrRepo.createValue('test_lib', 12345, mockAttribute, {
                value: 'test val',
                modified_at: 400999999,
                created_at: 400999999,
                version: {
                    my_tree: {
                        id: 1,
                        library: 'test_lib'
                    }
                }
            });

            expect(mockDbCollec.save.mock.calls.length).toBe(1);
            expect(mockDbCollec.save).toBeCalledWith({value: 'test val'});

            expect(mockDbEdgeCollec.save.mock.calls.length).toBe(1);
            expect(mockDbEdgeCollec.save).toBeCalledWith({
                _from: 'test_lib/12345',
                _to: 'core_values/987654',
                attribute: 'test_attr',
                modified_at: 400999999,
                created_at: 400999999,
                version: {
                    my_tree: 'test_lib/1'
                }
            });

            expect(createdVal).toMatchObject(newValueData);
        });
    });

    describe('updateValue', () => {
        test('Should update an advanced value', async function() {
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
                id_value: 987654,
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
                id_value: 987654,
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

        test('Should update value version', async function() {
            const savedValueData = {
                _id: 'core_values/987654',
                _rev: '_WSywvyC--_',
                _key: 987654,
                value: 'test_val',
                version: {
                    my_tree: 'test_lib/1'
                }
            };

            const savedEdgeData = {
                _id: 'core_edge_values_links/222435651',
                _rev: '_WSywvyC--_',
                _from: 'test_lib/12345',
                _to: 'core_values/987654',
                _key: 978654321,
                attribute: 'test_attr',
                modified_at: 400999999,
                created_at: 400999999,
                version: {
                    my_tree: 'test_lib/1'
                }
            };

            const valueData = {
                id_value: 987654,
                value: 'test_val',
                attribute: 'test_attr',
                modified_at: 400999999,
                created_at: 400999999,
                version: {
                    my_tree: {
                        id: 1,
                        library: 'test_lib'
                    }
                }
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

            const attrRepo = attributeAdvancedRepo(mockDbServ, mockDbUtils);

            const savedVal = await attrRepo.updateValue('test_lib', 12345, mockAttribute, {
                id_value: 987654,
                value: 'test val',
                modified_at: 500999999,
                version: {
                    my_tree: {
                        id: 1,
                        library: 'test_lib'
                    }
                }
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
                    modified_at: 500999999,
                    version: {
                        my_tree: 'test_lib/1'
                    }
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
                id_value: 123456789,
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
                id_value: 123456789,
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
                id_value: 132465,
                value: 'test val'
            });

            expect(mockDbCollec.lookupByKeys.mock.calls.length).toBe(1);
            expect(mockDbEdgeCollec.inEdges.mock.calls.length).toBe(1);
            expect(value).toMatchObject({
                id_value: 987654,
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
                id_value: 132465,
                value: 'test val'
            });

            expect(mockDbCollec.lookupByKeys.mock.calls.length).toBe(1);
            expect(mockDbEdgeCollec.inEdges.mock.calls.length).toBe(0);
            expect(value).toBeNull();
        });
    });

    describe('getValues', () => {
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

        test('Should return values for advanced attribute', async function() {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };

            const attrRepo = attributeAdvancedRepo(mockDbServ, mockDbUtils);

            const values = await attrRepo.getValues('test_lib', 123456, mockAttribute);

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();

            expect(values.length).toBe(2);
            expect(values[0]).toMatchObject({
                id_value: 987654,
                value: 'test val',
                attribute: 'test_attr',
                modified_at: 99999,
                created_at: 99999
            });
        });

        test('Should return only first value if not multiple values', async function() {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([traversalRes[0]])
            };

            const attrRepo = attributeAdvancedRepo(mockDbServ, mockDbUtils);

            const mockAttrNotMultival = {
                ...mockAttribute,
                multipleValues: false
            };

            const values = await attrRepo.getValues('test_lib', 123456, mockAttrNotMultival);

            expect(values.length).toBe(1);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch('LIMIT 1');
            expect(values[0]).toMatchObject({
                id_value: 987654,
                value: 'test val',
                attribute: 'test_attr',
                modified_at: 99999,
                created_at: 99999
            });
        });

        test('Should return values filtered by version', async function() {
            const traversalResWithVers = [
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
                        created_at: 99999,
                        version: {
                            my_tree: 'my_lib/1345'
                        }
                    }
                }
            ];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalResWithVers)
            };

            const attrRepo = attributeAdvancedRepo(mockDbServ, mockDbUtils);

            const values = await attrRepo.getValues('test_lib', 123456, mockAttrAdvVersionableSimple, false, {
                version: {my_tree: {library: 'my_lib', id: 1345}}
            });

            expect(values).toHaveLength(1);
            expect(values[0].value).toBe('test val');
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch('FILTER edge.version');
        });

        test('Should return all values if forced', async function() {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };

            const attrRepo = attributeAdvancedRepo(mockDbServ, mockDbUtils);

            const mockAttrNotMultival = {
                ...mockAttribute,
                multipleValues: false
            };

            const values = await attrRepo.getValues('test_lib', 123456, mockAttrNotMultival, true);

            expect(values.length).toBe(2);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
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
