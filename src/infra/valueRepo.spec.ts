import valueRepo from './valueRepo';
import {Database} from 'arangojs';
import {AttributeTypes} from '../_types/attribute';

describe('ValueRepo', () => {
    describe('saveValue', () => {
        test('Should save an indexed value', async function() {
            const updatedRecordData = {
                _id: 'test_lib/222435651',
                _rev: '_WSywvyC--_',
                _key: 222435651,
                test_attr: 'test_val'
            };

            const updatedValueData = {
                value: 'test_val'
            };

            const mockDbCollec = {
                update: global.__mockPromise(updatedRecordData),
                document: global.__mockPromise(updatedRecordData)
            };

            const mockDb = {collection: jest.fn().mockReturnValue(mockDbCollec)};

            const mockDbServ = {db: mockDb};

            const valRepo = valueRepo(mockDbServ);

            const createdVal = await valRepo.saveValue(
                'test_lib',
                '12345',
                {
                    id: 'test_attr',
                    type: AttributeTypes.INDEX
                },
                {
                    value: 'test val'
                }
            );

            expect(mockDbCollec.update.mock.calls.length).toBe(1);
            expect(mockDbCollec.update).toBeCalledWith({_key: '12345'}, {test_attr: 'test val'});

            expect(createdVal).toMatchObject(updatedValueData);
        });

        test('Should save a new standard value', async function() {
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

            const valRepo = valueRepo(mockDbServ);

            const createdVal = await valRepo.saveValue(
                'test_lib',
                '12345',
                {
                    id: 'test_attr',
                    type: AttributeTypes.STANDARD
                },
                {
                    value: 'test val',
                    modified_at: 400999999,
                    created_at: 400999999
                }
            );

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

            const valRepo = valueRepo(mockDbServ);

            const savedVal = await valRepo.saveValue(
                'test_lib',
                '12345',
                {
                    id: 'test_attr',
                    type: AttributeTypes.STANDARD
                },
                {
                    id: 987654,
                    value: 'test val',
                    modified_at: 500999999
                }
            );

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

            const valRepo = valueRepo(mockDbServ);

            const value = await valRepo.getValueById(987654);

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

            const valRepo = valueRepo(mockDbServ);

            const value = await valRepo.getValueById(987654);

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

            const valRepo = valueRepo(mockDbServ);

            const values = await valRepo.getValues('test_lib', 123456, {
                id: 'test_attr',
                type: AttributeTypes.STANDARD
            });

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

        test('Should return values for index attribute', async function() {
            const queryRes = ['test val'];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(queryRes)
            };

            const valRepo = valueRepo(mockDbServ);

            const values = await valRepo.getValues('test_lib', 123456, {
                id: 'test_attr',
                type: AttributeTypes.INDEX
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();

            expect(values.length).toBe(1);
            expect(values[0]).toMatchObject({
                value: 'test val',
                attribute: 'test_attr'
            });
        });
    });
});
