// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, Database} from 'arangojs';
import {IDbUtils} from 'infra/db/dbUtils';
import {IFilterTypesHelper} from 'infra/record/helpers/filterTypes';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import {AttributeTypes} from '../../_types/attribute';
import {AttributeCondition} from '../../_types/record';
import {IValue} from '../../_types/value';
import {mockAttrTreeVersionableSimple} from '../../__tests__/mocks/attribute';
import attributeTreeRepo from './attributeTreeRepo';
import {IAttributeTypeRepo} from './attributeTypesRepo';

describe('AttributeTreeRepo', () => {
    const mockAttribute = {
        id: 'test_tree_attr',
        type: AttributeTypes.TREE,
        linked_tree: 'test_tree',
        multiple_values: true
    };

    const savedEdgeData = {
        _id: 'core_edge_values_links/222435651',
        _rev: '_WSywvyC--_',
        _from: 'test_lib/12345',
        _to: 'categories/123456',
        _key: '978654321',
        attribute: 'test_tree_attr',
        modified_at: 400999999,
        created_at: 400999999,
        modified_by: '0',
        created_by: '0',
        metadata: {my_attribute: 'metadata value'},
        version: {
            my_tree: '1'
        }
    };

    const valueData: IValue = {
        id_value: '978654321',
        payload: 'categories/123456',
        attribute: 'test_tree_attr',
        modified_at: 400999999,
        created_at: 400999999,
        modified_by: '0',
        created_by: '0',
        metadata: {my_attribute: 'metadata value'},
        version: {my_tree: '1'}
    };

    const mockUtils: Mockify<IUtils> = {
        decomposeValueEdgeDestination: jest.fn().mockReturnValue({library: 'categories', id: '123456'})
    };

    const ctx: IQueryInfos = {
        userId: '0',
        queryId: 'treeRepoTest'
    };

    describe('createValue', () => {
        test('Should create a new advanced tree value', async function () {
            const mockRecord = {
                id: '123456',
                library: 'categories'
            };

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([
                    {
                        newEdge: savedEdgeData,
                        linkedRecord: mockRecord
                    }
                ])
            };

            const mockDbUtilsWithCleanup: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue({
                    id: '123456',
                    library: 'categories'
                })
            };

            const attrRepo = attributeTreeRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtilsWithCleanup,
                'core.utils': mockUtils as IUtils
            });

            const createdVal = await attrRepo.createValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    payload: 'categories/123456',
                    modified_at: 400999999,
                    created_at: 400999999,
                    metadata: {my_attribute: 'metadata value'},
                    version: {my_tree: '1'}
                },
                ctx
            });

            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/INSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(createdVal).toMatchObject({
                id_value: '978654321',
                payload: {
                    record: {
                        id: '123456',
                        library: 'categories'
                    }
                },
                attribute: 'test_tree_attr',
                modified_at: 400999999,
                created_at: 400999999,
                modified_by: '0',
                created_by: '0',
                metadata: {my_attribute: 'metadata value'},
                version: {my_tree: '1'}
            });
        });
    });

    describe('updateValue', () => {
        test('Should update a advanced link value', async function () {
            const mockRecord = {
                id: '123456',
                library: 'categories'
            };

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([
                    {
                        newEdge: savedEdgeData,
                        linkedRecord: mockRecord
                    }
                ])
            };

            const mockDbUtilsWithCleanup: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue({
                    id: '123456',
                    library: 'categories'
                })
            };

            const attrRepo = attributeTreeRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtilsWithCleanup,
                'core.utils': mockUtils as IUtils
            });

            const savedVal = await attrRepo.updateValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    id_value: '987654',
                    payload: 'categories/123456',
                    modified_at: 400999999,
                    metadata: {my_attribute: 'metadata value'},
                    version: {my_tree: '1'}
                },
                ctx
            });

            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/UPDATE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(savedVal).toMatchObject({
                ...valueData,
                payload: {
                    record: {
                        id: '123456',
                        library: 'categories'
                    }
                }
            });
        });
    });

    describe('deleteValue', () => {
        test('Should delete a value', async function () {
            const deletedEdgeData = {
                _id: 'core_edge_values_links/445566',
                _rev: '_WSywvyC--_',
                _from: 'test_lib/12345',
                _to: 'categories/123456',
                _key: '445566'
            };

            const mockRecord = {
                id: '123456',
                library: 'categories'
            };

            const mockDbUtilsWithCleanup: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue({
                    id: '123456',
                    library: 'categories'
                })
            };

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([
                    {
                        edge: deletedEdgeData,
                        linkedRecord: mockRecord
                    }
                ])
            };

            const attrRepo = attributeTreeRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtilsWithCleanup,
                'core.utils': mockUtils as IUtils
            });

            const deletedVal = await attrRepo.deleteValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    id_value: '445566',
                    payload: 'categories/123456',
                    modified_at: 400999999,
                    created_at: 400999999
                },
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/REMOVE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(deletedVal).toMatchObject({
                id_value: '445566',
                payload: {
                    record: {library: 'categories', id: '123456'}
                }
            });
        });
    });

    describe('getValueByID', () => {
        test('Should return value', async function () {
            const traversalRes = [
                {
                    linkedNode: {
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
                        created_at: 99999,
                        modified_by: '0',
                        created_by: '0',
                        metadata: {my_attribute: 'metadata value'}
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

            const mockDbUtilsWithCleanup: Mockify<IDbUtils> = {
                cleanup: mockCleanupRes
            };

            const attrRepo = attributeTreeRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtilsWithCleanup as IDbUtils
            });

            const value = await attrRepo.getValueById({
                library: 'test_lib',
                recordId: '987654',
                attribute: mockAttribute,
                valueId: '112233',
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
            expect(value).toMatchObject({
                id_value: '112233',
                payload: {
                    record: {
                        id: 123456,
                        created_at: 88888,
                        modified_at: 88888
                    }
                },
                modified_by: '0',
                created_by: '0',
                modified_at: 99999,
                created_at: 99999,
                attribute: 'test_tree_attr',
                metadata: {my_attribute: 'metadata value'}
            });
        });

        test("Should return null if value doesn't exists", async function () {
            const traversalRes = [];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };

            const attrRepo = attributeTreeRepo({'core.infra.db.dbService': mockDbServ});

            const value = await attrRepo.getValueById({
                library: 'test_lib',
                recordId: '987654',
                attribute: mockAttribute,
                valueId: '112233',
                // value: {
                //     id_value: '112233',
                //     value: 'categories/123456'
                // },
                ctx
            });

            expect(value).toBeNull();
        });
    });

    describe('getValues', () => {
        const traversalRes = [
            {
                id: '987654',
                record: {
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
                    created_at: 99999,
                    modified_by: '0',
                    created_by: '0',
                    metadata: {my_attribute: 'metadata value'}
                }
            },
            {
                id: '654321',
                record: {
                    _key: '123457',
                    _id: 'images/123457',
                    _rev: '_WgJhrXO--_',
                    created_at: 88888,
                    modified_at: 88888
                },
                edge: {
                    _key: '11223344',
                    _id: 'core_edge_values_links/11223344',
                    _from: 'ubs/222536283',
                    _to: 'images/123457',
                    _rev: '_WgJilsW--_',
                    attribute: 'test_tree_attr',
                    modified_at: 99999,
                    created_at: 99999,
                    modified_by: '0',
                    created_by: '0',
                    metadata: {my_attribute: 'metadata value'}
                }
            }
        ];

        test('Should return linked tree element', async function () {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };

            const mockCleanupRes = jest
                .fn()
                .mockReturnValueOnce({
                    id: 123456,
                    created_at: 88888,
                    modified_at: 88888
                })
                .mockReturnValueOnce({
                    id: 123457,
                    created_at: 88888,
                    modified_at: 88888
                });

            const mockDbUtilsWithCleanup: Mockify<IDbUtils> = {
                cleanup: mockCleanupRes
            };

            const attrRepo = attributeTreeRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtilsWithCleanup as IDbUtils
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
                id_value: '112233',
                payload: {
                    record: {
                        id: 123456,
                        created_at: 88888,
                        modified_at: 88888
                    }
                },
                attribute: 'test_tree_attr',
                modified_at: 99999,
                created_at: 99999,
                modified_by: '0',
                created_by: '0',
                metadata: {my_attribute: 'metadata value'}
            });

            expect(values[1]).toMatchObject({
                id_value: '11223344',
                payload: {
                    record: {
                        id: 123457,
                        created_at: 88888,
                        modified_at: 88888
                    }
                },
                attribute: 'test_tree_attr',
                modified_at: 99999,
                created_at: 99999,
                modified_by: '0',
                created_by: '0',
                metadata: {my_attribute: 'metadata value'}
            });
        });

        test('Should return linked tree element filtered by version', async function () {
            const traversalResWithVers = [
                {
                    id: '987654',
                    record: {
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
                        created_at: 99999,
                        modified_by: '0',
                        created_by: '0',
                        version: {my_tree: '1345'}
                    }
                }
            ];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalResWithVers)
            };

            const mockCleanupRes = jest.fn().mockReturnValue({
                id: 123456,
                created_at: 88888,
                modified_at: 88888
            });

            const mockDbUtilsWithCleanup: Mockify<IDbUtils> = {
                cleanup: mockCleanupRes
            };

            const attrRepo = attributeTreeRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtilsWithCleanup as IDbUtils
            });
            const values = await attrRepo.getValues({
                library: 'test_lib',
                recordId: '123456',
                attribute: {...mockAttrTreeVersionableSimple, reverse_link: undefined},
                forceGetAllValues: false,
                options: {
                    version: {
                        my_tree: '1345'
                    }
                },
                ctx
            });

            expect(values.length).toBe(1);
            expect(values[0].id_value).toBe('112233');
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch('FILTER edge.version');
        });

        test('Should return only first linked tree element if not multiple values', async function () {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([traversalRes[0]])
            };

            const mockAttributeNotMultiVal = {
                ...mockAttribute,
                multiple_values: false
            };

            const mockCleanupRes = jest.fn().mockReturnValue({
                id: 123456,
                created_at: 88888,
                modified_at: 88888
            });

            const mockDbUtilsWithCleanup: Mockify<IDbUtils> = {
                cleanup: mockCleanupRes
            };

            const attrRepo = attributeTreeRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtilsWithCleanup as IDbUtils
            });

            const values = await attrRepo.getValues({
                library: 'test_lib',
                recordId: '123456',
                attribute: mockAttributeNotMultiVal,
                ctx
            });

            expect(values.length).toBe(1);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch('LIMIT 1');
            expect(values[0]).toMatchObject({
                id_value: '112233',
                payload: {
                    record: {
                        id: 123456,
                        created_at: 88888,
                        modified_at: 88888
                    }
                },
                attribute: 'test_tree_attr',
                modified_at: 99999,
                created_at: 99999,
                modified_by: '0',
                created_by: '0'
            });
        });

        test('Should return all values if forced', async function () {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };
            const mockAttributeNotMultiVal = {
                ...mockAttribute,
                multiple_values: false
            };

            const mockCleanupRes = jest.fn().mockReturnValue({
                id: 123456,
                created_at: 88888,
                modified_at: 88888
            });

            const mockDbUtilsWithCleanup: Mockify<IDbUtils> = {
                cleanup: mockCleanupRes
            };

            const attrRepo = attributeTreeRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtilsWithCleanup as IDbUtils
            });

            const values = await attrRepo.getValues({
                library: 'test_lib',
                recordId: '123456',
                attribute: mockAttributeNotMultiVal,
                forceGetAllValues: true,
                ctx
            });

            expect(values.length).toBe(2);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
        });
    });

    describe('filterValueQueryPart', () => {
        const mockFilterTypesHelper: Mockify<IFilterTypesHelper> = {
            isCountFilter: jest.fn().mockReturnValue(false)
        };

        test('Should return query to retrieve value to filter on', () => {
            const mockDbServ = {
                db: new Database()
            };
            const mockRepo: Mockify<IAttributeTypeRepo> = {
                filterValueQueryPart: jest.fn().mockReturnValue(aql``)
            };

            const attrRepo = attributeTreeRepo({
                'core.infra.record.helpers.filterTypes': mockFilterTypesHelper as IFilterTypesHelper,
                'core.infra.db.dbService': mockDbServ
            });
            const filter = attrRepo.filterValueQueryPart(
                [
                    {id: 'label', type: AttributeTypes.TREE, _repo: mockRepo as IAttributeTypeRepo},
                    {id: 'linked', type: AttributeTypes.SIMPLE, _repo: mockRepo as IAttributeTypeRepo}
                ],
                {condition: AttributeCondition.EQUAL, value: 'MyLabel'}
            );

            expect(filter).toMatchSnapshot();
        });

        test('Should return query to retrieve value to filter on for "count" filter', async () => {
            const mockDbServ = {
                db: new Database()
            };

            const mockFilterTypesHelperCount: Mockify<IFilterTypesHelper> = {
                isCountFilter: jest.fn().mockReturnValue(true)
            };

            const mockRepo: Mockify<IAttributeTypeRepo> = {
                filterValueQueryPart: jest.fn().mockReturnValue(aql`<VALUE QUERY PART>`)
            };

            const attrRepo = attributeTreeRepo({
                'core.infra.record.helpers.filterTypes': mockFilterTypesHelperCount as IFilterTypesHelper,
                'core.infra.db.dbService': mockDbServ
            });

            const valueQuery = attrRepo.filterValueQueryPart(
                [
                    {
                        id: 'tree_attr',
                        type: AttributeTypes.TREE,
                        _repo: mockRepo as IAttributeTypeRepo
                    }
                ],
                {condition: AttributeCondition.IS_EMPTY}
            );

            expect(valueQuery).toMatchSnapshot();
        });
    });

    describe('sortQueryPart', () => {
        test('Should return tree filter', () => {
            const mockDbServ = {
                db: new Database()
            };
            const attrRepo = attributeTreeRepo({'core.infra.db.dbService': mockDbServ});
            const filter = attrRepo.sortQueryPart({
                attributes: [
                    {id: 'label', type: AttributeTypes.TREE},
                    {id: 'linked', type: AttributeTypes.SIMPLE}
                ],
                order: 'ASC'
            });

            expect(filter.query).toMatch(/^SORT/);
            expect(filter).toMatchSnapshot();
        });
    });
});
