// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, Database} from 'arangojs';
import {IDbUtils} from 'infra/db/dbUtils';
import {IQueryInfos} from '_types/queryInfos';
import {AttributeTypes} from '../../_types/attribute';
import {AttributeCondition} from '../../_types/record';
import {mockAttrAdvVersionableSimple} from '../../__tests__/mocks/attribute';
import attributeAdvancedRepo from './attributeAdvancedRepo';

describe('AttributeStandardRepo', () => {
    const mockAttribute = {
        id: 'test_attr',
        type: AttributeTypes.ADVANCED,
        multiple_values: true
    };

    const mockDbUtils: Mockify<IDbUtils> = {
        convertValueVersionToDb: jest.fn().mockReturnValue({my_tree: 'test_lib/1'}),
        convertValueVersionFromDb: jest.fn().mockReturnValue({
            my_tree: {
                id: '1',
                library: 'test_lib'
            }
        })
    };
    const ctx: IQueryInfos = {
        userId: '0',
        queryId: 'attributeAdvancedRepoTest'
    };

    describe('createValue', () => {
        test('Should create a new advanced value', async function () {
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
                created_at: 400999999,
                modified_by: '0',
                created_by: '0',
                metadata: {my_attribute: 'metadata value'}
            };

            const newValueData = {
                id_value: 987654,
                value: 'test_val',
                attribute: 'test_attr',
                modified_at: 400999999,
                created_at: 400999999,
                created_by: '0',
                modified_by: '0',
                metadata: {my_attribute: 'metadata value'}
            };

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromiseMultiple([[createdValueData], [createdEdgeData]])
            };

            const attrRepo = attributeAdvancedRepo({'core.infra.db.dbService': mockDbServ});

            const createdVal = await attrRepo.createValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    value: 'test val',
                    modified_at: 400999999,
                    created_at: 400999999,
                    metadata: {my_attribute: 'metadata value'}
                },
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(2);

            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/INSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(typeof mockDbServ.execute.mock.calls[1][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatch(/INSERT/);
            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[1][0].query.bindVars).toMatchSnapshot();

            expect(createdVal).toMatchObject(newValueData);
        });

        test('Should save version on value', async function () {
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
                modified_by: '0',
                created_by: '0',
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
                modified_by: '0',
                created_by: '0',
                version: {
                    my_tree: {
                        id: '1',
                        library: 'test_lib'
                    }
                }
            };

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromiseMultiple([[createdValueData], [createdEdgeData]])
            };

            const attrRepo = attributeAdvancedRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const createdVal = await attrRepo.createValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    value: 'test val',
                    modified_at: 400999999,
                    created_at: 400999999,
                    version: {
                        my_tree: {
                            id: '1',
                            library: 'test_lib'
                        }
                    }
                },
                ctx
            });

            expect(typeof mockDbServ.execute.mock.calls[1][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatch(/INSERT/);
            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[1][0].query.bindVars).toMatchSnapshot();

            expect(createdVal).toMatchObject(newValueData);
        });
    });

    describe('updateValue', () => {
        test('Should update an advanced value', async function () {
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
                created_at: 400999999,
                modified_by: '0',
                created_by: '0',
                metadata: {my_attribute: 'metadata value'}
            };

            const valueData = {
                id_value: 987654,
                value: 'test_val',
                attribute: 'test_attr',
                modified_at: 400999999,
                created_at: 400999999,
                modified_by: '0',
                created_by: '0',
                metadata: {my_attribute: 'metadata value'}
            };

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromiseMultiple([[savedValueData], [savedEdgeData]])
            };

            const attrRepo = attributeAdvancedRepo({'core.infra.db.dbService': mockDbServ});

            const savedVal = await attrRepo.updateValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    id_value: '987654',
                    value: 'test val',
                    modified_at: 500999999,
                    metadata: {my_attribute: 'metadata value'}
                },
                ctx
            });

            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/UPDATE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(typeof mockDbServ.execute.mock.calls[1][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatch(/UPDATE/);
            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[1][0].query.bindVars).toMatchSnapshot();

            expect(savedVal).toMatchObject(valueData);
        });

        test('Should update value version', async function () {
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
                modified_by: '0',
                created_by: '0',
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
                modified_by: '0',
                created_by: '0',
                version: {
                    my_tree: {
                        id: '1',
                        library: 'test_lib'
                    }
                }
            };

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromiseMultiple([[savedValueData], [savedEdgeData]])
            };

            const attrRepo = attributeAdvancedRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const savedVal = await attrRepo.updateValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    id_value: '987654',
                    value: 'test val',
                    modified_at: 500999999,
                    version: {
                        my_tree: {
                            id: '1',
                            library: 'test_lib'
                        }
                    }
                },
                ctx
            });

            expect(savedVal).toMatchObject(valueData);
        });
    });

    describe('deleteValue', () => {
        test('Should delete a value', async function () {
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
                created_at: 400999999,
                modified_by: '0',
                created_by: '0'
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

            const mockDbServ = {db: (mockDb as unknown) as Database};

            const attrRepo = attributeAdvancedRepo({'core.infra.db.dbService': mockDbServ});

            const deletedVal = await attrRepo.deleteValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    id_value: '123456789',
                    value: 'test val',
                    modified_at: 400999999,
                    created_at: 400999999,
                    modified_by: '0',
                    created_by: '0'
                },
                ctx
            });

            expect(mockDbCollec.remove.mock.calls.length).toBe(1);
            expect(mockDbCollec.remove).toBeCalledWith({_key: '123456789'});

            expect(mockDbEdgeCollec.removeByExample.mock.calls.length).toBe(1);
            expect(mockDbEdgeCollec.removeByExample).toBeCalledWith({
                _from: 'test_lib/12345',
                _to: 'core_values/123456789'
            });

            expect(deletedVal).toMatchObject(oldValueData);
        });
    });

    describe('getValueByID', () => {
        test('Should return value', async function () {
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
                    modified_by: '0',
                    created_by: '0',
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

            const mockDbServ = {db: (mockDb as unknown) as Database};

            const attrRepo = attributeAdvancedRepo({'core.infra.db.dbService': mockDbServ});

            const value = await attrRepo.getValueById({
                library: 'test_lib',
                recordId: '987654',
                attribute: mockAttribute,
                valueId: '132465',
                ctx
            });

            expect(mockDbCollec.lookupByKeys.mock.calls.length).toBe(1);
            expect(mockDbEdgeCollec.inEdges.mock.calls.length).toBe(1);
            expect(value).toMatchObject({
                id_value: 987654,
                value: 'test val',
                modified_at: 99999,
                created_at: 99999,
                modified_by: '0',
                created_by: '0',
                attribute: 'test_attr'
            });
        });

        test("Should return null if value doesn't exists", async function () {
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

            const mockDbServ = {db: (mockDb as unknown) as Database};

            const attrRepo = attributeAdvancedRepo({'core.infra.db.dbService': mockDbServ});

            const value = await attrRepo.getValueById({
                library: 'test_lib',
                recordId: '987654',
                attribute: mockAttribute,
                valueId: '132465',
                ctx
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
                    created_at: 99999,
                    modified_by: '0',
                    created_by: '0',
                    metadata: {my_attribute: 'metadata value'}
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
                    created_at: 99999,
                    modified_by: '0',
                    created_by: '0',
                    metadata: {my_attribute: 'metadata value'}
                }
            }
        ];

        test('Should return values for advanced attribute', async function () {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };

            const attrRepo = attributeAdvancedRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const values = await attrRepo.getValues({
                library: 'test_lib',
                recordId: '123456',
                attribute: mockAttribute,
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(values.length).toBe(2);
            expect(values[0]).toMatchObject({
                id_value: 987654,
                value: 'test val',
                attribute: 'test_attr',
                modified_at: 99999,
                created_at: 99999,
                modified_by: '0',
                created_by: '0',
                metadata: {my_attribute: 'metadata value'}
            });
        });

        test('Should return only first value if not multiple values', async function () {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([traversalRes[0]])
            };

            const attrRepo = attributeAdvancedRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const mockAttrNotMultival = {
                ...mockAttribute,
                multiple_values: false
            };

            const values = await attrRepo.getValues({
                library: 'test_lib',
                recordId: '123456',
                attribute: mockAttrNotMultival,
                ctx
            });

            expect(values.length).toBe(1);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch('LIMIT 1');
            expect(values[0]).toMatchObject({
                id_value: 987654,
                value: 'test val',
                attribute: 'test_attr',
                modified_at: 99999,
                created_at: 99999,
                modified_by: '0',
                created_by: '0'
            });
        });

        test('Should return values filtered by version', async function () {
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
                        modified_by: '0',
                        created_by: '0',
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

            const attrRepo = attributeAdvancedRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const values = await attrRepo.getValues({
                library: 'test_lib',
                recordId: '123456',
                attribute: mockAttrAdvVersionableSimple,
                forceGetAllValues: false,
                options: {
                    version: {my_tree: {library: 'my_lib', id: '1345'}}
                },
                ctx
            });

            expect(values).toHaveLength(1);
            expect(values[0].value).toBe('test val');
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch('FILTER edge.version');
        });

        test('Should return all values if forced', async function () {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };

            const attrRepo = attributeAdvancedRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const mockAttrNotMultival = {
                ...mockAttribute,
                multiple_values: false
            };

            const values = await attrRepo.getValues({
                library: 'test_lib',
                recordId: '123456',
                attribute: mockAttrNotMultival,
                forceGetAllValues: true,
                ctx
            });

            expect(values.length).toBe(2);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
        });
    });

    describe('filterQueryPart', () => {
        test('Should return advanced filter', () => {
            const mockDbServ = {
                db: new Database()
            };
            const attrRepo = attributeAdvancedRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.attributeTypes.helpers.getConditionPart': () => aql`rVal == ${'MyLabel'}`
            });
            const filter = attrRepo.filterQueryPart(
                [{id: 'label', type: AttributeTypes.ADVANCED, _repo: null}],
                {condition: AttributeCondition.EQUAL, value: 'MyLabel'},
                'r'
            );

            expect(filter.query).toMatch(/FILTER/);
            expect(filter).toMatchSnapshot();
        });
    });

    describe('sortQueryPart', () => {
        test('Should return advanced filter', () => {
            const mockDbServ = {
                db: new Database()
            };
            const attrRepo = attributeAdvancedRepo({'core.infra.db.dbService': mockDbServ});
            const filter = attrRepo.sortQueryPart({
                attributes: [{id: 'label', type: AttributeTypes.ADVANCED}],
                order: 'ASC'
            });

            expect(filter.query).toMatch(/^SORT/);
            expect(filter).toMatchSnapshot();
        });
    });
});
