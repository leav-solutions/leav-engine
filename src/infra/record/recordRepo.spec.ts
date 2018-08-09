import {Database} from 'arangojs';
import {cloneDeep} from 'lodash';
import {AttributeTypes} from '../../_types/attribute';
import {IRecordFilterOption} from '../../_types/record';
import {IAttributeTypeRepo, IAttributeTypesRepo} from '../attributeTypes/attributeTypesRepo';
import {IDbUtils} from '../db/dbUtils';
import recordRepo from './recordRepo';

describe('RecordRepo', () => {
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
                id: 222435651,
                library: 'users',
                created_at: 1519303348,
                modified_at: 1519303348
            };

            const mockDbCollec = {
                save: global.__mockPromise(createdRecordData),
                document: global.__mockPromise(createdRecordData)
            };

            const mockDb = {collection: jest.fn().mockReturnValue(mockDbCollec)};

            const mockDbServ = {db: mockDb};

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue(cleanCreatedRecordData)
            };

            const recRepo = recordRepo(mockDbServ, mockDbUtils as IDbUtils);

            const createdRecord = await recRepo.createRecord('test', recordData);
            expect(mockDbCollec.save.mock.calls.length).toBe(1);
            expect(mockDbCollec.save).toBeCalledWith(recordData);

            expect(mockDbUtils.cleanup.mock.calls.length).toBe(1);
            expect(mockDbUtils.cleanup.mock.calls[0][0].hasOwnProperty('library')).toBe(true);

            expect(createdRecord).toMatchObject(cleanCreatedRecordData);
        });
    });

    describe('updateRecord', () => {
        test('Should update a record', async function() {
            const recordData = {id: 222435651, modified_at: 1519303348};
            const updatedRecordData = {
                _id: 'users/222435651',
                _rev: '_WSywvyC--_',
                _key: 222435651,
                created_at: 1519303348,
                modified_at: 1519303348
            };

            const cleanUpdatedRecordData = {
                id: 222435651,
                library: 'users',
                created_at: 1519303348,
                modified_at: 1519303348
            };

            const mockDbServ = {db: new Database(), execute: global.__mockPromise([updatedRecordData])};

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue(cleanUpdatedRecordData)
            };

            const recRepo = recordRepo(mockDbServ, mockDbUtils as IDbUtils);

            const updatedRecord = await recRepo.updateRecord('test', recordData);
            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/UPDATE/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();

            expect(mockDbUtils.cleanup.mock.calls.length).toBe(1);

            expect(updatedRecord).toMatchObject(cleanUpdatedRecordData);
        });
    });

    describe('deleteRecord', () => {
        test('Should delete a record and return deleted record', async function() {
            const recordData = {id: 222435651, created_at: 1519303348, modified_at: 1519303348};
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

            const recRepo = recordRepo(mockDbServ, mockDbUtils as IDbUtils);

            const deleteRes = await recRepo.deleteRecord('users', recordData.id);

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/REMOVE/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();

            expect(mockDbCollec.remove.mock.calls.length).toBe(1);
            expect(mockDbCollec.remove).toBeCalledWith({_key: recordData.id});

            expect(mockDbUtils.cleanup.mock.calls.length).toBe(1);

            expect(deleteRes).toMatchObject(recordData);
        });
    });

    describe('find', () => {
        test('Should find records', async function() {
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

            const recRepo = recordRepo(mockDbServ, mockDbUtils as IDbUtils);

            const records = await recRepo.find('test_lib');
            expect(mockDbServ.execute.mock.calls.length).toBe(1);

            expect(mockDbServ.execute.mock.calls[0][0]).toMatchSnapshot();

            expect(records).toEqual(mockCleanupRes);
        });
    });

    describe('find with filters', () => {
        const mockFilters: IRecordFilterOption[] = [
            {
                attribute: {
                    id: 'test_attr',
                    type: null
                },
                value: 'test'
            },
            {
                attribute: {
                    id: 'test_attr2',
                    type: null
                },
                value: 'test2'
            }
        ];

        test('Should filter records - simple', async function() {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([
                    {
                        _key: '222536515',
                        _id: 'test_lib/222536515',
                        _rev: '_WgM_51a--_',
                        created_at: 1520931427,
                        modified_at: 1520931427,
                        test_attr: 'test'
                    }
                ])
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
                getTypeRepo: jest.fn().mockReturnValue(mockAttrSimpleRepo as IAttributeTypesRepo)
            };

            const recRepo = recordRepo(mockDbServ, mockDbUtils as IDbUtils, mockAttrRepo as IAttributeTypesRepo);

            const filters = cloneDeep(mockFilters);
            filters[0].attribute.type = AttributeTypes.SIMPLE;
            filters[1].attribute.type = AttributeTypes.SIMPLE;

            const records = await recRepo.find('test_lib', filters);

            expect(mockDbServ.execute.mock.calls[0][0]).toMatchSnapshot();
            expect(mockAttrSimpleRepo.filterQueryPart).toBeCalled();
            expect(records).toEqual([
                {
                    id: '222536515',
                    created_at: 1520931427,
                    modified_at: 1520931427,
                    test_attr: 'test'
                }
            ]);
        });
    });
});
