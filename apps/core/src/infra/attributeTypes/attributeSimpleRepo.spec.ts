// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Database} from 'arangojs';
import {IFilterTypesHelper} from 'infra/record/helpers/filterTypes';
import {IQueryInfos} from '_types/queryInfos';
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';
import {AttributeCondition} from '../../_types/record';
import {mockAttrSimple} from '../../__tests__/mocks/attribute';
import attributeSimpleRepo from './attributeSimpleRepo';

describe('AttributeSimpleRepo', () => {
    const mockAttribute = {
        id: 'test_attr',
        type: AttributeTypes.SIMPLE
    };
    const ctx: IQueryInfos = {
        userId: '0',
        queryId: 'attributeSimpleRepoTest'
    };

    describe('createValue', () => {
        test('Should create a new index value', async function () {
            const updatedRecordData = {
                _id: 'test_lib/222435651',
                _rev: '_WSywvyC--_',
                _key: 222435651,
                test_attr: 'test_val'
            };

            const updatedValueData = {
                payload: 'test_val'
            };

            const mockDbServ = {db: new Database(), execute: global.__mockPromise([updatedRecordData])};

            const attrRepo = attributeSimpleRepo({'core.infra.db.dbService': mockDbServ});

            const createdVal = await attrRepo.createValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    payload: 'test val'
                },
                ctx
            });

            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/UPDATE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(createdVal).toMatchObject(updatedValueData);
        });
    });

    describe('getValues', () => {
        test('Should return values for index attribute', async function () {
            const queryRes = ['test val', 'other val that should not be returned'];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(queryRes)
            };

            const attrRepo = attributeSimpleRepo({'core.infra.db.dbService': mockDbServ});

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

            expect(values.length).toBe(1);
            expect(values[0]).toMatchObject({
                payload: 'test val',
                attribute: 'test_attr'
            });
        });
    });

    describe('deleteValue', () => {
        test('Should delete a value', async () => {
            const updatedRecordData = {
                _id: 'test_lib/222435651',
                _rev: '_WSywvyC--_',
                _key: 222435651
            };

            const deletedValueData = {
                payload: null
            };

            const mockDbServ = {db: new Database(), execute: global.__mockPromise([updatedRecordData])};

            const attrRepo = attributeSimpleRepo({'core.infra.db.dbService': mockDbServ});

            const deletedVal = await attrRepo.deleteValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    payload: 'test val'
                },
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(deletedVal).toMatchObject(deletedValueData);
        });
    });

    describe('sortQueryPart', () => {
        test('Should return simple sort', () => {
            const attrRepo = attributeSimpleRepo();
            const filter = attrRepo.sortQueryPart({
                attributes: [{id: 'id', type: AttributeTypes.SIMPLE}],
                order: 'ASC'
            });

            expect(filter.query).toMatch(/^SORT/);
            expect(filter).toMatchSnapshot();
        });
    });

    describe('filterValueQueryPart', () => {
        const mockFilterTypesHelper: Mockify<IFilterTypesHelper> = {
            isCountFilter: jest.fn().mockReturnValue(false)
        };

        test('Should query to retrieve value to filter on', () => {
            const attrRepo = attributeSimpleRepo({
                'core.infra.record.helpers.filterTypes': mockFilterTypesHelper as IFilterTypesHelper
            });
            const valueQuery = attrRepo.filterValueQueryPart([{...mockAttrSimple, _repo: null, reverse_link: null}], {
                condition: AttributeCondition.EQUAL,
                attributes: [{...mockAttrSimple, reverse_link: null}],
                value: '123456'
            });

            expect(valueQuery.query).toMatch(/^r\./);
            expect(valueQuery).toMatchSnapshot();
        });

        test('Should query to retrieve value to filter on, on extended format', () => {
            const attrRepo = attributeSimpleRepo({
                'core.infra.record.helpers.filterTypes': mockFilterTypesHelper as IFilterTypesHelper
            });
            const valueQuery = attrRepo.filterValueQueryPart(
                [
                    {...mockAttrSimple, format: AttributeFormats.EXTENDED, _repo: null, reverse_link: null},
                    {...mockAttrSimple, id: 'subfield', _repo: null, reverse_link: null}
                ],
                {
                    condition: AttributeCondition.EQUAL,
                    attributes: [{...mockAttrSimple, reverse_link: null}],
                    value: '123456'
                }
            );

            expect(valueQuery).toMatchSnapshot();
        });
    });

    describe('clearAllValues', () => {
        test('Should delete field of given attribute', async () => {
            const librarieusUsingAttribute = [
                {
                    _key: 'users',
                    label: {en: 'Users', fr: 'Utilisateurs'},
                    system: true
                },
                {
                    _key: 'products',
                    label: {en: 'Products', fr: 'Produits'},
                    system: false
                }
            ];

            const mockDbServ = {
                db: new Database(),
                execute: jest
                    .fn()
                    .mockReturnValueOnce(librarieusUsingAttribute) // Number of deleted values
                    .mockReturnValueOnce([]) // Number of deleted values
                    .mockReturnValueOnce([])
            };

            const attrTypeRepo = attributeSimpleRepo({'core.infra.db.dbService': mockDbServ});
            const res = await attrTypeRepo.clearAllValues({
                attribute: {id: 'test_attr', type: AttributeTypes.SIMPLE},
                ctx
            });

            expect(res).toEqual(true);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
        });
    });
});
