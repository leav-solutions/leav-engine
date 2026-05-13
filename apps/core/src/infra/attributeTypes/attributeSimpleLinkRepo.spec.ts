import {Database} from 'arangojs';
import {aql} from 'arangojs/aql';
import {type DocumentCollection} from 'arangojs/collection';
import {type IDbService} from '../db/dbService';
import {type IDbUtils} from '../db/dbUtils';
import {type IFilterTypesHelper} from '../record/helpers/filterTypes';
import {type IQueryInfos} from '../../_types/queryInfos';
import {AttributeTypes} from '../../_types/attribute';
import {AttributeCondition} from '../../_types/record';
import {mockAttrSimpleLink} from '../../__tests__/mocks/attribute';
import {mockRecord} from '../../__tests__/mocks/record';
import attributeSimpleLinkRepo from './attributeSimpleLinkRepo';
import {type IAttributeTypeRepo, type IAttributeWithRevLink} from './attributeTypesRepo';
import {type IAttributeSimpleRepo} from './attributeSimpleRepo';
import {type ISaveLinkValue} from '../../_types/value';

describe('AttributeSimpleLinkRepo', () => {
    const mockAttribute: IAttributeWithRevLink = {
        id: 'test_simple_link_attr',
        type: AttributeTypes.SIMPLE_LINK,
        linked_library: 'test_linked_lib',
    };

    const mockAttrSimpleRepo: Mockify<IAttributeTypeRepo> = {
        createValue: null,
        updateValue: null,
        deleteValue: null,
        getValueById: null,
        getValues: null,
        sortQueryPart: null,
        clearAllValues: null,
    };
    const ctx: IQueryInfos = {
        userId: '0',
        queryId: 'attributeSimpleLinkRepoTest',
    };

    describe('createValue', () => {
        test('Should create a simple link value', async function () {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([
                    {doc: {...mockRecord, [mockAttribute.id]: '123456'}, linkedRecord: mockRecord},
                ]),
            };

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: vi.fn().mockReturnValue(mockRecord),
            };

            const updatedValueData: ISaveLinkValue = {
                payload: '123456',
            };

            const attrSimpleRepo = {
                ...mockAttrSimpleRepo,
                createValue: global.__mockPromise(updatedValueData),
                updateValue: global.__mockPromise(updatedValueData),
            };

            const attrRepo = attributeSimpleLinkRepo({
                'core.infra.attributeTypes.attributeSimple': attrSimpleRepo as IAttributeSimpleRepo,
                'core.infra.db.dbService': mockDbServ as IDbService,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
            });

            const createdVal = await attrRepo.createValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    payload: '123456',
                },
                ctx,
            });

            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/UPDATE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(createdVal).toMatchObject({
                ...updatedValueData,
                payload: {
                    ...mockRecord,
                    id: '123456',
                    library: 'test_linked_lib',
                },
            });
        });
    });

    describe('deleteValue', () => {
        test('Should delete a value', async () => {
            const deletedValueData = {
                payload: 'old_value_record_id',
                attribute: mockAttribute.id,
                created_by: null,
                modified_by: null,
            };

            const attrSimpleRepo = {
                ...mockAttrSimpleRepo,
                deleteValue: global.__mockPromise(deletedValueData),
            };

            const attrRepo = attributeSimpleLinkRepo({
                'core.infra.attributeTypes.attributeSimple': attrSimpleRepo as IAttributeSimpleRepo,
            });

            const deletedVal = await attrRepo.deleteValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    payload: {
                        id: '123456',
                    },
                },
                ctx,
            });

            expect(attrSimpleRepo.deleteValue.mock.calls.length).toBe(1);
            expect(attrSimpleRepo.deleteValue).toHaveBeenCalledWith({
                library: 'test_lib',
                recordId: '12345',
                attribute: {
                    ...mockAttribute,
                    type: AttributeTypes.SIMPLE,
                },
                value: {
                    payload: {
                        id: '123456',
                    },
                },
                ctx,
            });

            expect(deletedVal).toMatchObject({
                created_by: null,
                modified_by: null,
                attribute: mockAttribute.id,
                payload: {
                    id: 'old_value_record_id',
                    library: 'test_linked_lib',
                },
            });
        });
    });

    describe('getValues', () => {
        test('Should return values for simple link attribute', async function () {
            const queryRes = [
                {
                    _key: '987654',
                    _id: 'images/987654',
                    _rev: '_WgJhrXO--_',
                    created_at: 1521475225,
                    modified_at: 1521475225,
                },
                {
                    _key: '987655',
                    _id: 'images/987655',
                    _rev: '_WgJhrXO--_',
                    created_at: 1521475225,
                    modified_at: 1521475225,
                },
            ];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(queryRes),
            };

            const mockCleanupRes = vi.fn().mockReturnValue({
                id: 987654,
                created_at: 1521475225,
                modified_at: 1521475225,
            });

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: mockCleanupRes,
            };

            const attrRepo = attributeSimpleLinkRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
            });

            const values = await attrRepo.getValues({
                library: 'test_lib',
                recordId: '123456',
                attribute: mockAttribute,
                ctx,
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();
            expect(mockDbUtils.cleanup.mock.calls.length).toBe(1);

            expect(values.length).toBe(1);

            expect(values[0]).toMatchObject({
                id_value: null,
                payload: {
                    id: 987654,
                    created_at: 1521475225,
                    modified_at: 1521475225,
                },
            });
        });
    });

    describe('filterValueQueryPart', () => {
        const mockFilterTypesHelper: Mockify<IFilterTypesHelper> = {
            isCountFilter: vi.fn().mockReturnValue(false),
        };

        test('Should return query to retrieve value to filter on', () => {
            const mockDb = {
                collection: vi.fn().mockReturnValue({} as DocumentCollection),
            };

            const mockDbServ = {db: mockDb as unknown as Database};

            const mockRepo: Mockify<IAttributeTypeRepo> = {
                filterValueQueryPart: vi.fn().mockReturnValue(aql``),
            };

            const attrRepo = attributeSimpleLinkRepo({
                'core.infra.record.helpers.filterTypes': mockFilterTypesHelper as IFilterTypesHelper,
                'core.infra.db.dbService': mockDbServ,
            });

            const valueQuery = attrRepo.filterValueQueryPart(
                [
                    {id: 'label', type: AttributeTypes.SIMPLE_LINK, _repo: mockRepo as IAttributeTypeRepo},
                    {id: 'linked', type: AttributeTypes.SIMPLE, _repo: mockRepo as IAttributeTypeRepo},
                ],
                {condition: AttributeCondition.EQUAL, value: 'MyLabel'},
            );

            expect(valueQuery).toMatchSnapshot();
        });

        test('Should return query to retrieve value to filter on for reverse link', async () => {
            const mockDb = {
                collection: vi.fn().mockReturnValue({} as DocumentCollection),
            };

            const mockDbServ = {db: mockDb as unknown as Database};

            const mockRepo: Mockify<IAttributeTypeRepo> = {
                filterValueQueryPart: vi.fn().mockReturnValue(aql`<VALUE QUERY PART>`),
            };

            const attrRepo = attributeSimpleLinkRepo({
                'core.infra.record.helpers.filterTypes': mockFilterTypesHelper as IFilterTypesHelper,
                'core.infra.db.dbService': mockDbServ,
            });

            const valueQuery = attrRepo.filterValueQueryPart(
                [
                    {
                        id: 'linked_from',
                        type: AttributeTypes.SIMPLE_LINK,
                        reverse_link: {...mockAttrSimpleLink},
                        _repo: mockRepo as IAttributeTypeRepo,
                    },
                    {id: 'label', type: AttributeTypes.ADVANCED, _repo: mockRepo as IAttributeTypeRepo},
                ],
                {condition: AttributeCondition.EQUAL, value: 'MyLabel'},
            );

            expect(valueQuery).toMatchSnapshot();
        });

        test('Should return query to retrieve value to filter on for "count" filter', async () => {
            const mockDbServ = {
                db: new Database(),
            };

            const mockFilterTypesHelperCount: Mockify<IFilterTypesHelper> = {
                isCountFilter: vi.fn().mockReturnValue(true),
            };

            const mockRepo: Mockify<IAttributeTypeRepo> = {
                filterValueQueryPart: vi.fn().mockReturnValue(aql`<VALUE QUERY PART>`),
            };

            const attrRepo = attributeSimpleLinkRepo({
                'core.infra.record.helpers.filterTypes': mockFilterTypesHelperCount as IFilterTypesHelper,
                'core.infra.db.dbService': mockDbServ,
            });

            const valueQuery = attrRepo.filterValueQueryPart(
                [
                    {
                        id: 'linked_from',
                        type: AttributeTypes.SIMPLE_LINK,
                        _repo: mockRepo as IAttributeTypeRepo,
                    },
                ],
                {condition: AttributeCondition.VALUES_COUNT_EQUAL, value: '42'},
            );

            expect(valueQuery).toMatchSnapshot();
        });
    });

    describe('sortQueryPart', () => {
        test('Should return simple link sort', () => {
            const mockDb = {
                collection: vi.fn().mockReturnValue({} as DocumentCollection),
            };

            const mockDbServ = {db: mockDb as unknown as Database};

            const attrRepo = attributeSimpleLinkRepo({'core.infra.db.dbService': mockDbServ});
            const filter = attrRepo.sortQueryPart({
                attributes: [
                    {id: 'label', type: AttributeTypes.SIMPLE_LINK},
                    {id: 'linked', type: AttributeTypes.SIMPLE},
                ],
                order: 'ASC',
            });

            expect(filter).toMatchSnapshot();
        });
    });
});
