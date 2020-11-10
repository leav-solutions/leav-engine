import {Database} from 'arangojs';
import {cloneDeep} from 'lodash';
import {AttributeTypes} from '../../_types/attribute';
import {IRecordFilterOption, Operator} from '../../_types/record';
import {IAttributeTypeRepo, IAttributeTypesRepo} from '../attributeTypes/attributeTypesRepo';
import {IDbUtils} from '../db/dbUtils';
import recordRepo from './recordRepo';

describe('RecordRepo', () => {
    const ctx = {
        userId: '0',
        requestId: '123465'
    };
    describe('createRecord', () => {
        test('Should create a new record', async function() {
            const recordData = {created_at: 1519303348, modified_at: 1519303348};
            const createdRecordData = {
                _id: 'users/222435651',
                _rev: '_WSywvyC--_',
                _key: 222435651,
                created_at: 1519303348,
                modified_at: 1519303348
            };

            const cleanCreatedRecordData = {
                id: '222435651',
                library: 'users',
                created_at: 1519303348,
                modified_at: 1519303348
            };

            const mockDbCollec = {
                save: global.__mockPromise(createdRecordData),
                document: global.__mockPromise(createdRecordData)
            };

            const mockDb = new Database();
            mockDb.collection = jest.fn().mockReturnValue(mockDbCollec);

            const mockDbServ = {db: mockDb};

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue(cleanCreatedRecordData)
            };

            const recRepo = recordRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const createdRecord = await recRepo.createRecord({libraryId: 'test', recordData, ctx});
            expect(mockDbCollec.save.mock.calls.length).toBe(1);
            expect(mockDbCollec.save).toBeCalledWith(recordData);

            expect(mockDbUtils.cleanup.mock.calls.length).toBe(1);
            expect(mockDbUtils.cleanup.mock.calls[0][0].hasOwnProperty('library')).toBe(true);

            expect(createdRecord).toMatchObject(cleanCreatedRecordData);
        });
    });

    describe('updateRecord', () => {
        test('Should update a record', async function() {
            const recordData = {id: '222435651', modified_at: 1519303348};
            const updatedRecordData = {
                _id: 'users/222435651',
                _rev: '_WSywvyC--_',
                _key: 222435651,
                created_at: 1519303348,
                modified_at: 1519303348
            };

            const cleanUpdatedRecordData = {
                id: '222435651',
                library: 'users',
                created_at: 1519303348,
                modified_at: 1519303348
            };

            const mockDbCollec = {
                update: global.__mockPromise(updatedRecordData)
            };

            const mockDbServ = {db: new Database()};
            mockDbServ.db.collection = jest.fn().mockReturnValue(mockDbCollec);

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue(cleanUpdatedRecordData)
            };

            const recRepo = recordRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const updatedRecord = await recRepo.updateRecord({libraryId: 'test', recordData, ctx});

            expect(mockDbCollec.update.mock.calls.length).toBe(1);
            expect(mockDbCollec.update).toBeCalledWith(
                {_key: String(recordData.id)},
                {...recordData, id: undefined},
                {returnOld: true}
            );

            expect(mockDbUtils.cleanup.mock.calls.length).toBe(1);

            expect(updatedRecord).toMatchObject(cleanUpdatedRecordData);
        });
    });

    describe('deleteRecord', () => {
        test('Should delete a record and return deleted record', async function() {
            const recordData = {id: '222435651', created_at: 1519303348, modified_at: 1519303348};
            const deletedRecordData = {
                _id: 'users/222435651',
                _rev: '_WSywvyC--_',
                _key: 222435651,
                created_at: 1519303348,
                modified_at: 1519303348
            };

            const mockDbCollec = {
                remove: global.__mockPromise(deletedRecordData)
            };

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([
                    {
                        _key: '222612340',
                        _id: 'core_edge_values_links/222612340',
                        _from: 'ubs/222536515',
                        _to: 'core_values/222612335',
                        _rev: '_Wf3oPWC--_',
                        attribute: 'label',
                        modified_at: 1521047926,
                        created_at: 1521047926
                    },
                    {
                        _key: '223188816',
                        _id: 'core_edge_values_links/223188816',
                        _from: 'products/222763208',
                        _to: 'ubs/222536515',
                        _rev: '_WlGSULm--_',
                        attribute: 'linkedUb',
                        modified_at: 1522936384,
                        created_at: 1522936384
                    }
                ])
            };
            mockDbServ.db.collection = jest.fn().mockReturnValue(mockDbCollec);

            const mockDbUtils: Mockify<IDbUtils> = {cleanup: jest.fn().mockReturnValue(recordData)};

            const recRepo = recordRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const deleteRes = await recRepo.deleteRecord({libraryId: 'users', recordId: recordData.id, ctx});

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/REMOVE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(mockDbCollec.remove.mock.calls.length).toBe(1);
            expect(mockDbCollec.remove).toBeCalledWith({_key: String(recordData.id)}, {returnOld: true});

            expect(mockDbUtils.cleanup.mock.calls.length).toBe(2);

            expect(deleteRes).toMatchObject(recordData);
        });
    });

    describe('find', () => {
        test('Should find records', async function() {
            const mockQueryRes = {
                totalCount: 2,
                results: [
                    {
                        _key: '222536283',
                        _id: 'ubs/222536283',
                        _rev: '_WgM_51a--_',
                        created_at: 1520931427,
                        modified_at: 1520931427,
                        ean: '9876543219999999',
                        visual_simple: '222713677'
                    },
                    {
                        _key: '222536515',
                        _id: 'ubs/222536515',
                        _rev: '_WgFARB6--_',
                        created_at: 1520931648,
                        modified_at: 1520931648,
                        ean: '9876543219999999'
                    }
                ]
            };

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(mockQueryRes)
            };

            const mockCleanupRes = [
                {
                    id: '222536283',
                    created_at: 1520931427,
                    modified_at: 1520931427,
                    ean: '9876543219999999',
                    visual_simple: '222713677'
                },
                {
                    id: '222536515',
                    created_at: 1520931648,
                    modified_at: 1520931648,
                    ean: '9876543219999999'
                }
            ];

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest
                    .fn()
                    .mockReturnValueOnce(mockCleanupRes[0])
                    .mockReturnValueOnce(mockCleanupRes[1])
            };

            const recRepo = recordRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const records = await recRepo.find({
                libraryId: 'test_lib',
                filters: [],
                pagination: null,
                withCount: true,
                ctx
            });
            expect(mockDbServ.execute.mock.calls.length).toBe(1);

            expect(mockDbServ.execute.mock.calls[0][0]).toMatchSnapshot();

            expect(records).toEqual({
                cursor: null,
                totalCount: 2,
                list: mockCleanupRes
            });
        });

        test('Should paginate with offset', async function() {
            const mockQueryRes = {
                totalCount: 5,
                results: [
                    {
                        _key: '222536283',
                        _id: 'ubs/222536283',
                        _rev: '_WgM_51a--_',
                        created_at: 1520931427,
                        modified_at: 1520931427,
                        ean: '9876543219999999',
                        visual_simple: '222713677'
                    },
                    {
                        _key: '222536515',
                        _id: 'ubs/222536515',
                        _rev: '_WgFARB6--_',
                        created_at: 1520931648,
                        modified_at: 1520931648,
                        ean: '9876543219999999'
                    }
                ]
            };

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(mockQueryRes)
            };

            const mockCleanupRes = [
                {
                    id: '222536283',
                    created_at: 1520931427,
                    modified_at: 1520931427,
                    ean: '9876543219999999',
                    visual_simple: '222713677'
                },
                {
                    id: '222536515',
                    created_at: 1520931648,
                    modified_at: 1520931648,
                    ean: '9876543219999999'
                }
            ];

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest
                    .fn()
                    .mockReturnValueOnce(mockCleanupRes[0])
                    .mockReturnValueOnce(mockCleanupRes[1])
            };

            const recRepo = recordRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const records = await recRepo.find({
                libraryId: 'test_lib',
                filters: [],
                pagination: {limit: 2, offset: 0},
                withCount: true,
                ctx
            });
            expect(mockDbServ.execute.mock.calls.length).toBe(1);

            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch('LIMIT');

            expect(records.totalCount).toBe(5);
            expect(records.list.length).toBe(2);
        });

        test('Should paginate with cursor', async function() {
            const mockQueryRes = [
                {
                    _key: '222536283',
                    _id: 'ubs/222536283',
                    _rev: '_WgM_51a--_',
                    created_at: 1520931427,
                    modified_at: 1520931427,
                    ean: '9876543219999999',
                    visual_simple: '222713677'
                },
                {
                    _key: '222536515',
                    _id: 'ubs/222536515',
                    _rev: '_WgFARB6--_',
                    created_at: 1520931648,
                    modified_at: 1520931648,
                    ean: '9876543219999999'
                }
            ];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(mockQueryRes)
            };

            const mockCleanupRes = [
                {
                    id: '222536283',
                    created_at: 1520931427,
                    modified_at: 1520931427,
                    ean: '9876543219999999',
                    visual_simple: '222713677'
                },
                {
                    id: '222536515',
                    created_at: 1520931648,
                    modified_at: 1520931648,
                    ean: '9876543219999999'
                }
            ];

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest
                    .fn()
                    .mockReturnValueOnce(mockCleanupRes[0])
                    .mockReturnValueOnce(mockCleanupRes[1])
            };

            const recRepo = recordRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const records = await recRepo.find({
                libraryId: 'test_lib',
                filters: [],
                pagination: {limit: 2, cursor: 'bmV4dDoyOjEzNDYzNDQ0'},
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch('LIMIT');
            expect(mockDbServ.execute.mock.calls[0][0].withTotalCount).not.toBe(true); // No count

            expect(records.list.length).toBe(2);
            expect(records.cursor.next).toBeTruthy();
        });

        describe('Inactive records', () => {
            const mockQueryRes = [
                {
                    _key: '222536283',
                    _id: 'ubs/222536283',
                    _rev: '_WgM_51a--_',
                    created_at: 1520931427,
                    modified_at: 1520931427
                }
            ];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(mockQueryRes)
            };

            const mockCleanupRes = {
                id: '222536283',
                created_at: 1520931427,
                modified_at: 1520931427
            };

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue(mockCleanupRes)
            };

            const recRepo = recordRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            beforeEach(() => jest.clearAllMocks());

            test('Should not retrieve inactive records', async () => {
                const records = await recRepo.find({
                    libraryId: 'test_lib',
                    filters: [],
                    pagination: null,
                    withCount: false,
                    retrieveInactive: false,
                    ctx
                });
                expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch('active == true');
            });

            test('Should retrieve inactive records if forced', async () => {
                const records = await recRepo.find({
                    libraryId: 'test_lib',
                    filters: [],
                    pagination: null,
                    withCount: false,
                    retrieveInactive: true,
                    ctx
                });
                expect(mockDbServ.execute.mock.calls[0][0].query.query).not.toMatch('active == true');
            });
        });
    });

    describe('find with filters', () => {
        const mockFilters: IRecordFilterOption[] = [
            {
                attributes: [
                    {
                        id: 'test_attr',
                        type: null
                    }
                ],
                value: 'test'
            },
            {operator: Operator.AND},
            {
                attributes: [
                    {
                        id: 'test_attr2',
                        type: null
                    }
                ],
                value: 'test2'
            }
        ];

        test('Should filter records - simple', async function() {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise({
                    totalCount: 1,
                    results: [
                        {
                            _key: '222536515',
                            _id: 'test_lib/222536515',
                            _rev: '_WgM_51a--_',
                            created_at: 1520931427,
                            modified_at: 1520931427,
                            test_attr: 'test'
                        }
                    ]
                })
            };

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue({
                    id: '222536515',
                    created_at: 1520931427,
                    modified_at: 1520931427,
                    test_attr: 'test'
                })
            };

            const mockAttrSimpleRepo: Mockify<IAttributeTypeRepo> = {
                filterQueryPart: jest
                    .fn()
                    .mockReturnValueOnce({
                        query: 'FILTER r.@filterField0 == @filterValue0',
                        bindVars: {
                            filterField0: 'test_attr',
                            filterValue0: 'test'
                        }
                    })
                    .mockReturnValueOnce({
                        query: 'FILTER r.@filterField1 == @filterValue1',
                        bindVars: {
                            filterField1: 'test_attr2',
                            filterValue1: 'test2'
                        }
                    })
            };

            const mockAttrRepo: Mockify<IAttributeTypesRepo> = {
                getTypeRepo: jest.fn().mockReturnValue(mockAttrSimpleRepo as IAttributeTypesRepo),
                getQueryPart: jest.fn().mockReturnValue(mockAttrSimpleRepo as IAttributeTypesRepo)
            };

            const recRepo = recordRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
                'core.infra.attributeTypes': mockAttrRepo as IAttributeTypesRepo
            });

            const filters = cloneDeep(mockFilters);
            filters[0].attributes[0].type = AttributeTypes.SIMPLE;
            filters[2].attributes[0].type = AttributeTypes.SIMPLE;

            const records = await recRepo.find({
                libraryId: 'test_lib',
                filters,
                pagination: null,
                withCount: true,
                ctx
            });

            expect(mockDbServ.execute.mock.calls[0][0]).toMatchSnapshot();
            expect(mockAttrSimpleRepo.filterQueryPart).toBeCalled();
            expect(records).toEqual({
                cursor: null,
                totalCount: 1,
                list: [
                    {
                        id: '222536515',
                        created_at: 1520931427,
                        modified_at: 1520931427,
                        test_attr: 'test'
                    }
                ]
            });
        });
    });

    describe('search', () => {
        test('should search records', async function() {
            const mockQueryRes = {
                took: 322,
                timed_out: false,
                _shards: {total: 1, successful: 1, skipped: 0, failed: 0},
                hits: {
                    total: {value: 1, relation: 'eq'},
                    max_score: 0.2876821,
                    hits: [
                        {
                            _id: 1,
                            _source: {
                                library: 'test_lib'
                            }
                        }
                    ]
                }
            };

            const mockElasticsearch = {
                multiMatch: global.__mockPromise(mockQueryRes)
            };

            const recRepo = recordRepo({
                'core.infra.elasticsearch.elasticsearchService': mockElasticsearch
            });

            const result = await recRepo.search('test_lib', 'text');

            expect(mockElasticsearch.multiMatch.mock.calls.length).toBe(1);
            expect(mockElasticsearch.multiMatch.mock.calls[0][0]).toMatchSnapshot();

            expect(result).toEqual({
                totalCount: 1,
                list: [
                    {
                        id: 1,
                        library: 'test_lib'
                    }
                ]
            });
        });

        test('should search record with from/size params', async function() {
            const mockQueryRes = {
                took: 322,
                timed_out: false,
                _shards: {total: 1, successful: 1, skipped: 0, failed: 0},
                hits: {
                    total: {value: 2, relation: 'eq'},
                    max_score: 0.2876821,
                    hits: [
                        {
                            _id: 1,
                            _source: {
                                library: 'test_lib'
                            }
                        }
                    ]
                }
            };

            const mockElasticsearch = {
                multiMatch: global.__mockPromise(mockQueryRes)
            };

            const recRepo = recordRepo({
                'core.infra.elasticsearch.elasticsearchService': mockElasticsearch
            });

            const result = await recRepo.search('test_lib', 'text', 0, 1);

            expect(mockElasticsearch.multiMatch.mock.calls.length).toBe(1);
            expect(mockElasticsearch.multiMatch.mock.calls[0][0]).toMatchSnapshot();

            expect(result).toEqual({
                totalCount: 2,
                list: [
                    {
                        id: 1,
                        library: 'test_lib'
                    }
                ]
            });
        });
    });
});
