// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, Database} from 'arangojs';
import {IDbUtils} from 'infra/db/dbUtils';
import {IQueryInfos} from '_types/queryInfos';
import {AttributeTypes} from '../../_types/attribute';
import {AttributeCondition} from '../../_types/record';
import attributeSimpleLinkRepo from './attributeSimpleLinkRepo';
import {IAttributeTypeRepo} from './attributeTypesRepo';

describe('AttributeSimpleLinkRepo', () => {
    const mockAttribute = {
        id: 'test_simple_link_attr',
        type: AttributeTypes.SIMPLE_LINK,
        linked_library: 'test_linked_lib'
    };

    const mockAttrSimpleRepo: IAttributeTypeRepo = {
        createValue: null,
        updateValue: null,
        deleteValue: null,
        getValueById: null,
        getValues: null,
        filterQueryPart: null,
        sortQueryPart: null,
        clearAllValues: null
    };
    const ctx: IQueryInfos = {
        userId: '0',
        queryId: 'attributeSimpleLinkRepoTest'
    };

    describe('createValue', () => {
        test('Should create a simple link value', async function () {
            const updatedValueData = {
                value: '123456'
            };

            const attrSimpleRepo = {
                ...mockAttrSimpleRepo,
                createValue: global.__mockPromise(updatedValueData),
                updateValue: global.__mockPromise(updatedValueData)
            };

            const attrRepo = attributeSimpleLinkRepo({'core.infra.attributeTypes.attributeSimple': attrSimpleRepo});

            const createdVal = await attrRepo.createValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    value: 123456
                },
                ctx
            });

            expect(attrSimpleRepo.createValue.mock.calls.length).toBe(1);
            expect(attrSimpleRepo.createValue).toBeCalledWith({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    value: 123456
                },
                ctx
            });

            expect(createdVal).toMatchObject({
                ...updatedValueData,
                value: {
                    id: '123456',
                    library: 'test_linked_lib'
                }
            });
        });
    });

    describe('deleteValue', () => {
        test('Should delete a value', async () => {
            const deletedValueData = {
                value: '123456'
            };

            const attrSimpleRepo = {
                ...mockAttrSimpleRepo,
                deleteValue: global.__mockPromise(deletedValueData)
            };

            const attrRepo = attributeSimpleLinkRepo({'core.infra.attributeTypes.attributeSimple': attrSimpleRepo});

            const deletedVal = await attrRepo.deleteValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    value: 123456
                },
                ctx
            });

            expect(attrSimpleRepo.deleteValue.mock.calls.length).toBe(1);
            expect(attrSimpleRepo.deleteValue).toBeCalledWith({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    value: 123456
                },
                ctx
            });

            expect(deletedVal).toMatchObject({
                ...deletedValueData,
                value: {
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
    describe('filterQueryPart', () => {
        test('Should return simple link filter', () => {
            const mockDbServ = {
                db: new Database()
            };

            const mockRepo: Mockify<IAttributeTypeRepo> = {
                filterQueryPart: jest.fn().mockReturnValue(null)
            };

            const attrRepo = attributeSimpleLinkRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.attributeTypes.helpers.getConditionPart': () => aql`== ${'MyLabel'}`
            });
            const filter = attrRepo.filterQueryPart(
                [
                    {id: 'label', type: AttributeTypes.SIMPLE_LINK, _repo: mockRepo as IAttributeTypeRepo},
                    {id: 'linked', type: AttributeTypes.SIMPLE, _repo: mockRepo as IAttributeTypeRepo}
                ],
                {condition: AttributeCondition.EQUAL, value: 'MyLabel'}
            );

            expect(filter.query).toMatch(/^FILTER/);
            expect(filter).toMatchSnapshot();
        });
    });
    describe('sortQueryPart', () => {
        test('Should return simple link sort', () => {
            const mockDbServ = {
                db: new Database()
            };
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
