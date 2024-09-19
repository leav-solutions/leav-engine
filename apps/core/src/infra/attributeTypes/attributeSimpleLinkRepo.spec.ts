// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Database} from 'arangojs';
import {aql} from 'arangojs/aql';
import {DocumentCollection} from 'arangojs/collection';
import {IDbService} from 'infra/db/dbService';
import {IDbUtils} from 'infra/db/dbUtils';
import {IFilterTypesHelper} from 'infra/record/helpers/filterTypes';
import {IQueryInfos} from '_types/queryInfos';
import {AttributeTypes} from '../../_types/attribute';
import {AttributeCondition} from '../../_types/record';
import {mockAttrSimpleLink} from '../../__tests__/mocks/attribute';
import {mockRecord} from '../../__tests__/mocks/record';
import attributeSimpleLinkRepo from './attributeSimpleLinkRepo';
import {IAttributeTypeRepo} from './attributeTypesRepo';

describe('AttributeSimpleLinkRepo', () => {
    const mockAttribute = {
        id: 'test_simple_link_attr',
        type: AttributeTypes.SIMPLE_LINK,
        linked_library: 'test_linked_lib'
    };

    const mockAttrSimpleRepo: Mockify<IAttributeTypeRepo> = {
        createValue: null,
        updateValue: null,
        deleteValue: null,
        getValueById: null,
        getValues: null,
        sortQueryPart: null,
        clearAllValues: null
    };
    const ctx: IQueryInfos = {
        userId: '0',
        queryId: 'attributeSimpleLinkRepoTest'
    };

    describe('createValue', () => {
        test('Should create a simple link value', async function () {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([
                    {doc: {...mockRecord, [mockAttribute.id]: '123456'}, linkedRecord: mockRecord}
                ])
            };

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue(mockRecord)
            };

            const updatedValueData = {
                payload: '123456'
            };

            const attrSimpleRepo = {
                ...mockAttrSimpleRepo,
                createValue: global.__mockPromise(updatedValueData),
                updateValue: global.__mockPromise(updatedValueData)
            };

            const attrRepo = attributeSimpleLinkRepo({
                'core.infra.attributeTypes.attributeSimple': attrSimpleRepo as IAttributeTypeRepo,
                'core.infra.db.dbService': mockDbServ as IDbService,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const createdVal = await attrRepo.createValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    payload: 123456
                },
                ctx
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
                    library: 'test_linked_lib'
                }
            });
        });
    });

    describe('deleteValue', () => {
        test('Should delete a value', async () => {
            const deletedValueData = {
                payload: '123456'
            };

            const attrSimpleRepo = {
                ...mockAttrSimpleRepo,
                deleteValue: global.__mockPromise(deletedValueData)
            };

            const attrRepo = attributeSimpleLinkRepo({
                'core.infra.attributeTypes.attributeSimple': attrSimpleRepo as IAttributeTypeRepo
            });

            const deletedVal = await attrRepo.deleteValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    payload: 123456
                },
                ctx
            });

            expect(attrSimpleRepo.deleteValue.mock.calls.length).toBe(1);
            expect(attrSimpleRepo.deleteValue).toBeCalledWith({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    payload: 123456
                },
                ctx
            });

            expect(deletedVal).toMatchObject({
                ...deletedValueData,
                payload: {
                    id: '123456',
                    library: 'test_linked_lib'
                }
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
                    modified_at: 1521475225
                },
                {
                    _key: '987655',
                    _id: 'images/987655',
                    _rev: '_WgJhrXO--_',
                    created_at: 1521475225,
                    modified_at: 1521475225
                }
            ];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(queryRes)
            };

            const mockCleanupRes = jest.fn().mockReturnValue({
                id: 987654,
                created_at: 1521475225,
                modified_at: 1521475225
            });

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: mockCleanupRes
            };

            const attrRepo = attributeSimpleLinkRepo({
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
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();
            expect(mockDbUtils.cleanup.mock.calls.length).toBe(1);

            expect(values.length).toBe(1);

            expect(values[0]).toMatchObject({
                id_value: null,
                value: {
                    id: 987654,
                    created_at: 1521475225,
                    modified_at: 1521475225
                }
            });
        });
    });

    describe('getReverseValues', () => {
        test('Should return values for advanced reverse link attribute into simple link', async function () {
            const queryRes = [
                {
                    _key: '987654',
                    _id: 'images/987654',
                    _rev: '_WgJhrXO--_',
                    created_at: 1521475225,
                    modified_at: 1521475225
                },
                {
                    _key: '987655',
                    _id: 'images/987655',
                    _rev: '_WgJhrXO--_',
                    created_at: 1521475225,
                    modified_at: 1521475225
                }
            ];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(queryRes)
            };

            const mockCleanupRes = jest.fn().mockReturnValue({
                id: 987654,
                created_at: 1521475225,
                modified_at: 1521475225
            });

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: mockCleanupRes
            };

            const attrRepo = attributeSimpleLinkRepo({
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
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();
            expect(mockDbUtils.cleanup.mock.calls.length).toBe(1);

            expect(values.length).toBe(1);

            expect(values[0]).toMatchObject({
                id_value: null,
                value: {
                    id: 987654,
                    created_at: 1521475225,
                    modified_at: 1521475225
                }
            });
        });
    });

    describe('filterValueQueryPart', () => {
        const mockFilterTypesHelper: Mockify<IFilterTypesHelper> = {
            isCountFilter: jest.fn().mockReturnValue(false)
        };

        test('Should return query to retrieve value to filter on', () => {
            const mockDb = {
                collection: jest.fn().mockReturnValue({} as DocumentCollection)
            };

            const mockDbServ = {db: mockDb as unknown as Database};

            const mockRepo: Mockify<IAttributeTypeRepo> = {
                filterValueQueryPart: jest.fn().mockReturnValue(aql``)
            };

            const attrRepo = attributeSimpleLinkRepo({
                'core.infra.record.helpers.filterTypes': mockFilterTypesHelper as IFilterTypesHelper,
                'core.infra.db.dbService': mockDbServ
            });

            const valueQuery = attrRepo.filterValueQueryPart(
                [
                    {id: 'label', type: AttributeTypes.SIMPLE_LINK, _repo: mockRepo as IAttributeTypeRepo},
                    {id: 'linked', type: AttributeTypes.SIMPLE, _repo: mockRepo as IAttributeTypeRepo}
                ],
                {condition: AttributeCondition.EQUAL, value: 'MyLabel'}
            );

            expect(valueQuery).toMatchSnapshot();
        });

        test('Should return query to retrieve value to filter on for reverse link', async () => {
            const mockDb = {
                collection: jest.fn().mockReturnValue({} as DocumentCollection)
            };

            const mockDbServ = {db: mockDb as unknown as Database};

            const mockRepo: Mockify<IAttributeTypeRepo> = {
                filterValueQueryPart: jest.fn().mockReturnValue(aql`<VALUE QUERY PART>`)
            };

            const attrRepo = attributeSimpleLinkRepo({
                'core.infra.record.helpers.filterTypes': mockFilterTypesHelper as IFilterTypesHelper,
                'core.infra.db.dbService': mockDbServ
            });

            const valueQuery = attrRepo.filterValueQueryPart(
                [
                    {
                        id: 'linked_from',
                        type: AttributeTypes.SIMPLE_LINK,
                        reverse_link: {...mockAttrSimpleLink},
                        _repo: mockRepo as IAttributeTypeRepo
                    },
                    {id: 'label', type: AttributeTypes.ADVANCED, _repo: mockRepo as IAttributeTypeRepo}
                ],
                {condition: AttributeCondition.EQUAL, value: 'MyLabel'}
            );

            expect(valueQuery).toMatchSnapshot();
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

            const attrRepo = attributeSimpleLinkRepo({
                'core.infra.record.helpers.filterTypes': mockFilterTypesHelperCount as IFilterTypesHelper,
                'core.infra.db.dbService': mockDbServ
            });

            const valueQuery = attrRepo.filterValueQueryPart(
                [
                    {
                        id: 'linked_from',
                        type: AttributeTypes.SIMPLE_LINK,
                        _repo: mockRepo as IAttributeTypeRepo
                    }
                ],
                {condition: AttributeCondition.VALUES_COUNT_EQUAL, value: '42'}
            );

            expect(valueQuery).toMatchSnapshot();
        });
    });

    describe('sortQueryPart', () => {
        test('Should return simple link sort', () => {
            const mockDb = {
                collection: jest.fn().mockReturnValue({} as DocumentCollection)
            };

            const mockDbServ = {db: mockDb as unknown as Database};

            const attrRepo = attributeSimpleLinkRepo({'core.infra.db.dbService': mockDbServ});
            const filter = attrRepo.sortQueryPart({
                attributes: [
                    {id: 'label', type: AttributeTypes.SIMPLE_LINK},
                    {id: 'linked', type: AttributeTypes.SIMPLE}
                ],
                order: 'ASC'
            });

            expect(filter.query).toMatch(/^SORT/);
            expect(filter).toMatchSnapshot();
        });
    });
});
