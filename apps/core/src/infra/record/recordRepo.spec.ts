import {aql, Database} from 'arangojs';
import {type IAttributeRepo} from '../attribute/attributeRepo';
import {type GetSearchQuery} from '../indexation/helpers/getSearchQuery';
import {cloneDeep, omit} from 'lodash';
import {mockCtx} from '../../__tests__/mocks/shared';
import {AttributeTypes} from '../../_types/attribute';
import {AttributeCondition, type IRecordFilterOption, Operator} from '../../_types/record';
import {type IAttributeTypeRepo, type IAttributeTypesRepo} from '../attributeTypes/attributeTypesRepo';
import {type IDbUtils} from '../db/dbUtils';
import {type IFilterTypesHelper} from './helpers/filterTypes';
import recordRepo, {type IRecordRepoDeps} from './recordRepo';
import {type ToAny} from '../../utils/utils';
import {SortOrder} from '../../_types/list';
import {mockAttrSimple} from '../../__tests__/mocks/attribute';
import {type IQueryInfos} from '../../_types/queryInfos';

const depsBase: ToAny<IRecordRepoDeps> = {
    'core.infra.db.dbService': vi.fn(),
    'core.infra.db.dbUtils': vi.fn(),
    'core.infra.attributeTypes': vi.fn(),
    'core.infra.attribute': vi.fn(),
    'core.infra.attributeTypes.helpers.getConditionPart': vi.fn(),
    'core.infra.record.helpers.getSearchVariablesQueryPart': vi.fn(),
    'core.infra.record.helpers.getSearchVariableName': vi.fn(),
    'core.infra.record.helpers.filterTypes': vi.fn(),
    'core.infra.indexation.helpers.getSearchQuery': vi.fn(),
};

describe('RecordRepo', () => {
    const ctx: IQueryInfos = {
        userId: '0',
    };
    describe('createRecord', () => {
        test('Should create a new record', async function () {
            const recordData = {created_at: 1519303348, modified_at: 1519303348};
            const createdRecordData = {
                new: {
                    _id: 'users/222435651',
                    _rev: '_WSywvyC--_',
                    _key: 222435651,
                    created_at: 1519303348,
                    modified_at: 1519303348,
                },
            };

            const cleanCreatedRecordData = {
                id: '222435651',
                library: 'users',
                created_at: 1519303348,
                modified_at: 1519303348,
            };

            const mockDbCollec = {
                save: global.__mockPromise(createdRecordData),
            };

            const mockDb = new Database();
            mockDb.collection = vi.fn().mockReturnValue(mockDbCollec);

            const mockDbServ = {db: mockDb};

            const mockDbUtils = {
                cleanup: vi.fn().mockReturnValue(cleanCreatedRecordData),
            } satisfies Mockify<IDbUtils>;

            const recRepo = recordRepo({
                ...depsBase,
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
            });

            const createdRecord = await recRepo.createRecord({libraryId: 'test', recordData, ctx});
            expect(mockDbCollec.save.mock.calls.length).toBe(1);
            expect(mockDbCollec.save).toBeCalledWith(recordData, {returnNew: true});

            expect(mockDbUtils.cleanup.mock.calls.length).toBe(1);
            expect(Object.hasOwn(mockDbUtils.cleanup.mock.calls[0][0], 'library')).toBe(true);

            expect(createdRecord).toMatchObject(cleanCreatedRecordData);
        });
    });

    describe('updateRecord', () => {
        test('Should update a record', async function () {
            const recordData = {id: '222435651', modified_at: 1519303348};
            const updatedRecordData = {
                _id: 'users/222435651',
                _rev: '_WSywvyC--_',
                _key: 222435651,
                created_at: 1519303348,
                modified_at: 1519303348,
            };

            const cleanUpdatedRecordData = {
                id: '222435651',
                library: 'users',
                created_at: 1519303348,
                modified_at: 1519303348,
            };

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([{old: updatedRecordData, new: updatedRecordData}]),
            };

            const mockDbUtils = {
                cleanup: vi.fn().mockReturnValue(cleanUpdatedRecordData),
            } satisfies Mockify<IDbUtils>;

            const recRepo = recordRepo({
                ...depsBase,
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
            });

            const res = await recRepo.updateRecord({libraryId: 'test', recordData, ctx: mockCtx});

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch('UPDATE');
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(mockDbUtils.cleanup.mock.calls.length).toBe(2); // 1 for old, 1 for new

            expect(res.old).toMatchObject(cleanUpdatedRecordData);
            expect(res.new).toMatchObject(cleanUpdatedRecordData);
        });
    });

    describe('deleteRecord', () => {
        test('Should delete a record and return deleted record', async function () {
            const recordData = {id: '222435651', created_at: 1519303348, modified_at: 1519303348};
            const deletedRecordData = {
                _id: 'users/222435651',
                _rev: '_WSywvyC--_',
                _key: 222435651,
                created_at: 1519303348,
                modified_at: 1519303348,
            };

            const mockDbCollec = {
                remove: global.__mockPromise(deletedRecordData),
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
                        created_at: 1521047926,
                    },
                    {
                        _key: '223188816',
                        _id: 'core_edge_values_links/223188816',
                        _from: 'products/222763208',
                        _to: 'ubs/222536515',
                        _rev: '_WlGSULm--_',
                        attribute: 'linkedUb',
                        modified_at: 1522936384,
                        created_at: 1522936384,
                    },
                ]),
            };
            mockDbServ.db.collection = vi.fn().mockReturnValue(mockDbCollec);

            const mockDbUtils = {cleanup: vi.fn().mockReturnValue(recordData)} satisfies Mockify<IDbUtils>;

            const recRepo = recordRepo({
                ...depsBase,
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
            });

            const deleteRes = await recRepo.deleteRecord({libraryId: 'users', recordId: recordData.id, ctx});

            expect(mockDbCollec.remove.mock.calls.length).toBe(1);
            expect(mockDbCollec.remove).toBeCalledWith({_key: String(recordData.id)}, {returnOld: true});

            expect(mockDbUtils.cleanup.mock.calls.length).toBe(2);

            expect(deleteRes).toMatchObject(recordData);
        });
    });

    describe('find', () => {
        test('Should find records', async function () {
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
                        visual_simple: '222713677',
                    },
                    {
                        _key: '222536515',
                        _id: 'ubs/222536515',
                        _rev: '_WgFARB6--_',
                        created_at: 1520931648,
                        modified_at: 1520931648,
                        ean: '9876543219999999',
                    },
                ],
            };

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(mockQueryRes),
            };

            const mockCleanupRes = [
                {
                    id: '222536283',
                    created_at: 1520931427,
                    modified_at: 1520931427,
                    ean: '9876543219999999',
                    visual_simple: '222713677',
                },
                {
                    id: '222536515',
                    created_at: 1520931648,
                    modified_at: 1520931648,
                    ean: '9876543219999999',
                },
            ];

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: vi.fn().mockReturnValueOnce(mockCleanupRes[0]).mockReturnValueOnce(mockCleanupRes[1]),
            };

            const recRepo = recordRepo({
                ...depsBase,
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
            });

            const records = await recRepo.find({
                libraryId: 'test_lib',
                filters: [],
                pagination: null,
                withCount: true,
                ctx,
            });
            expect(mockDbServ.execute.mock.calls.length).toBe(1);

            expect(mockDbServ.execute.mock.calls[0][0]).toMatchSnapshot();

            expect(records).toEqual({
                cursor: null,
                totalCount: 2,
                list: mockCleanupRes,
            });
        });

        test('Should paginate with offset', async function () {
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
                        visual_simple: '222713677',
                    },
                    {
                        _key: '222536515',
                        _id: 'ubs/222536515',
                        _rev: '_WgFARB6--_',
                        created_at: 1520931648,
                        modified_at: 1520931648,
                        ean: '9876543219999999',
                    },
                ],
            };

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(mockQueryRes),
            };

            const mockCleanupRes = [
                {
                    id: '222536283',
                    created_at: 1520931427,
                    modified_at: 1520931427,
                    ean: '9876543219999999',
                    visual_simple: '222713677',
                },
                {
                    id: '222536515',
                    created_at: 1520931648,
                    modified_at: 1520931648,
                    ean: '9876543219999999',
                },
            ];

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: vi.fn().mockReturnValueOnce(mockCleanupRes[0]).mockReturnValueOnce(mockCleanupRes[1]),
            };

            const recRepo = recordRepo({
                ...depsBase,
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
            });

            const records = await recRepo.find({
                libraryId: 'test_lib',
                filters: [],
                pagination: {limit: 2, offset: 0},
                withCount: true,
                ctx,
            });
            expect(mockDbServ.execute.mock.calls.length).toBe(1);

            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch('LIMIT');

            expect(records.totalCount).toBe(5);
            expect(records.list.length).toBe(2);
        });

        test('Should paginate with cursor', async function () {
            const mockQueryRes = [
                {
                    _key: '222536283',
                    _id: 'ubs/222536283',
                    _rev: '_WgM_51a--_',
                    created_at: 1520931427,
                    modified_at: 1520931427,
                    ean: '9876543219999999',
                    visual_simple: '222713677',
                },
                {
                    _key: '222536515',
                    _id: 'ubs/222536515',
                    _rev: '_WgFARB6--_',
                    created_at: 1520931648,
                    modified_at: 1520931648,
                    ean: '9876543219999999',
                },
            ];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(mockQueryRes),
            };

            const mockCleanupRes = [
                {
                    id: '222536283',
                    created_at: 1520931427,
                    modified_at: 1520931427,
                    ean: '9876543219999999',
                    visual_simple: '222713677',
                },
                {
                    id: '222536515',
                    created_at: 1520931648,
                    modified_at: 1520931648,
                    ean: '9876543219999999',
                },
            ];

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: vi.fn().mockReturnValueOnce(mockCleanupRes[0]).mockReturnValueOnce(mockCleanupRes[1]),
            };

            const recRepo = recordRepo({
                ...depsBase,
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
            });

            const records = await recRepo.find({
                libraryId: 'test_lib',
                filters: [],
                pagination: {limit: 2, cursor: 'bmV4dDoyOjEzNDYzNDQ0'},
                ctx,
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
                    modified_at: 1520931427,
                },
            ];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(mockQueryRes),
            };

            const mockCleanupRes = {
                id: '222536283',
                created_at: 1520931427,
                modified_at: 1520931427,
            };

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: vi.fn().mockReturnValue(mockCleanupRes),
            };

            const recRepo = recordRepo({
                ...depsBase,
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
            });

            beforeEach(() => vi.clearAllMocks());

            test('Should not retrieve inactive records', async () => {
                await recRepo.find({
                    libraryId: 'test_lib',
                    filters: [],
                    pagination: null,
                    withCount: false,
                    retrieveInactive: false,
                    ctx,
                });
                expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch('active == true');
            });

            test('Should retrieve inactive records if forced', async () => {
                await recRepo.find({
                    libraryId: 'test_lib',
                    filters: [],
                    pagination: null,
                    withCount: false,
                    retrieveInactive: true,
                    ctx,
                });
                expect(mockDbServ.execute.mock.calls[0][0].query.query).not.toMatch('active == true');
            });
        });

        test('Handle fulltext search result', async () => {
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
                        visual_simple: '222713677',
                    },
                    {
                        _key: '222536515',
                        _id: 'ubs/222536515',
                        _rev: '_WgFARB6--_',
                        created_at: 1520931648,
                        modified_at: 1520931648,
                        ean: '9876543219999999',
                    },
                ],
            };

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(mockQueryRes),
            };

            const mockCleanupRes = [
                {
                    id: '222536283',
                    created_at: 1520931427,
                    modified_at: 1520931427,
                    ean: '9876543219999999',
                    visual_simple: '222713677',
                },
                {
                    id: '222536515',
                    created_at: 1520931648,
                    modified_at: 1520931648,
                    ean: '9876543219999999',
                },
            ];

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: vi.fn().mockReturnValueOnce(mockCleanupRes[0]).mockReturnValueOnce(mockCleanupRes[1]),
            };

            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getLibraryFullTextAttributes: global.__mockPromise(['id', 'label']),
            };

            const mockGetSearchQuery: Mockify<GetSearchQuery> = vi.fn(() => 'fulltextSearchQuery');

            const recRepo = recordRepo({
                ...depsBase,
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.infra.indexation.helpers.getSearchQuery': mockGetSearchQuery as GetSearchQuery,
            });

            const records = await recRepo.find({
                libraryId: 'test_lib',
                filters: [],
                pagination: null,
                withCount: true,
                fulltextSearch: 'fulltextSearch',
                ctx,
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(mockDbServ.execute.mock.calls[0][0]).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars.value0).toMatch('fulltextSearchQuery');

            expect(records).toEqual({
                cursor: null,
                totalCount: 2,
                list: mockCleanupRes,
            });
        });

        test('Should aggregate sorts', async () => {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([]),
            };

            const mockAttributeTypes: Mockify<IAttributeTypesRepo> = {
                getTypeRepo: vi.fn(() => ({
                    sortQueryPart: vi.fn(() => ({
                        query: 'sortQueryPart',
                    })),
                })),
            };

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: vi.fn(),
            };

            const recRepo = recordRepo({
                ...depsBase,
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
                'core.infra.attributeTypes': mockAttributeTypes as IAttributeTypesRepo,
            });

            await recRepo.find({
                libraryId: 'test_lib',
                sort: [
                    {
                        order: SortOrder.DESC,
                        attributes: [{...mockAttrSimple, reverse_link: undefined, id: 'attribute1'}],
                    },
                    {
                        order: SortOrder.ASC,
                        attributes: [{...mockAttrSimple, reverse_link: undefined, id: 'attribute2'}],
                    },
                ],
                ctx,
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(mockDbServ.execute.mock.calls[0][0]).toMatchSnapshot();
        });
    });

    describe('find with filters', () => {
        const mockFilters: IRecordFilterOption[] = [
            {
                attributes: [
                    {
                        id: 'test_attr',
                        type: null,
                    },
                ],
                condition: AttributeCondition.EQUAL,
                value: 'test',
            },
            {operator: Operator.AND},
            {
                attributes: [
                    {
                        id: 'test_attr2',
                        type: null,
                    },
                ],
                condition: AttributeCondition.EQUAL,
                value: 'test2',
            },
        ];

        test('Should filter records - simple', async function () {
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
                            test_attr: 'test',
                        },
                    ],
                }),
            };

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: vi.fn().mockReturnValue({
                    id: '222536515',
                    created_at: 1520931427,
                    modified_at: 1520931427,
                    test_attr: 'test',
                }),
            };

            const mockAttrSimpleRepo: Mockify<IAttributeTypeRepo> = {};

            const mockAttrRepo: Mockify<IAttributeTypesRepo> = {
                getTypeRepo: vi.fn().mockReturnValue(mockAttrSimpleRepo as IAttributeTypesRepo),
            };

            const mockGetSearchVariablesQueryPart = vi.fn().mockReturnValue(aql`<Variables>`);
            const mockGetSearchVariableName = vi.fn().mockReturnValue(aql`variableName`);
            const mockGetConditionPart = vi.fn().mockReturnValue(aql`<Condition>`);

            const mockFilterTypesHelper: Mockify<IFilterTypesHelper> = {
                isCountFilter: vi.fn().mockReturnValue(false),
                isAttributeFilter: vi.fn().mockReturnValue(true),
            };

            const recRepo = recordRepo({
                ...depsBase,
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
                'core.infra.attributeTypes': mockAttrRepo as IAttributeTypesRepo,
                'core.infra.record.helpers.getSearchVariablesQueryPart': mockGetSearchVariablesQueryPart,
                'core.infra.record.helpers.getSearchVariableName': mockGetSearchVariableName,
                'core.infra.attributeTypes.helpers.getConditionPart': mockGetConditionPart,
                'core.infra.record.helpers.filterTypes': mockFilterTypesHelper as IFilterTypesHelper,
            });

            const filters = cloneDeep(mockFilters);
            filters[0].attributes[0].type = AttributeTypes.SIMPLE;
            filters[2].attributes[0].type = AttributeTypes.SIMPLE;

            const records = await recRepo.find({
                libraryId: 'test_lib',
                filters,
                pagination: null,
                withCount: true,
                ctx,
            });

            expect(mockDbServ.execute.mock.calls[0][0]).toMatchSnapshot();
            expect(records).toEqual({
                cursor: null,
                totalCount: 1,
                list: [
                    {
                        id: '222536515',
                        created_at: 1520931427,
                        modified_at: 1520931427,
                        test_attr: 'test',
                    },
                ],
            });
        });
    });

    describe('getRecord', () => {
        beforeEach(() => {
            delete ctx.dataLoaders;
        });

        const mockRecord1 = {
            _key: '222536283',
            _id: 'ubs/222536283',
            _rev: '_WgM_51a--_',
            created_at: 1520931427,
            modified_at: 1520931427,
            ean: '9876543219999999',
            visual_simple: '222713677',
        };
        const mockRecord2 = {
            _key: '222536515',
            _id: 'ubs/222536515',
            _rev: '_WgFARB6--_',
            created_at: 1520931648,
            modified_at: 1520931648,
            ean: '9876543219999999',
        };

        test('Should return records in same order', async function () {
            const mockDbServ = {
                db: new Database(),
                execute: vi.fn().mockResolvedValue([mockRecord1, mockRecord2]),
            };

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: vi.fn().mockImplementation(record => ({
                    ...record,
                    cleanedUp: true,
                })),
            };

            const recRepo = recordRepo({
                ...depsBase,
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
            });

            const records = await Promise.all(
                [mockRecord1._key, mockRecord2._key].map(recordId =>
                    recRepo.getRecord({
                        libraryId: 'test_lib',
                        recordId,
                        ctx,
                    }),
                ),
            );
            expect(mockDbServ.execute.mock.calls.length).toBe(1);

            expect(omit(mockDbServ.execute.mock.calls[0][0], 'ctx')).toMatchSnapshot();

            expect(records).toHaveLength(2);
            expect(records.map(r => r?._id)).toEqual([mockRecord1._id, mockRecord2._id]);
        });

        test('Should return null for unknown record', async function () {
            const mockDbServ = {
                db: new Database(),
                execute: vi.fn().mockResolvedValue([mockRecord1, null, mockRecord2]),
            };

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: vi.fn().mockImplementation(record => ({
                    ...record,
                    cleanedUp: true,
                })),
            };

            const recRepo = recordRepo({
                ...depsBase,
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
            });

            const records = await Promise.all(
                [mockRecord1._key, 'unknown-record', mockRecord2._key].map(recordId =>
                    recRepo.getRecord({
                        libraryId: 'test_lib',
                        recordId,
                        ctx,
                    }),
                ),
            );
            expect(mockDbServ.execute.mock.calls.length).toBe(1);

            expect(records).toHaveLength(3);
            expect(records.map(r => r?._id || r)).toEqual([mockRecord1._id, null, mockRecord2._id]);
        });
    });
});
