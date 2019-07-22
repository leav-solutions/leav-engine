import {Database} from 'arangojs';
import {IDbUtils} from 'infra/db/dbUtils';
import {AttributeTypes} from '../../_types/attribute';
import attributeSimpleLinkRepo from './attributeSimpleLinkRepo';
import {IAttributeTypeRepo} from './attributeTypesRepo';

describe('AttributeIndexRepo', () => {
    const mockAttribute = {
        id: 'test_simple_link_attr',
        type: AttributeTypes.SIMPLE_LINK
    };

    const mockAttrSimpleRepo: IAttributeTypeRepo = {
        createValue: null,
        updateValue: null,
        deleteValue: null,
        getValueById: null,
        getValues: null,
        filterQueryPart: null,
        clearAllValues: null
    };

    describe('createValue', () => {
        test('Should create a simple link value', async function() {
            const updatedValueData = {
                value: 123456
            };

            const attrSimpleRepo = {
                ...mockAttrSimpleRepo,
                createValue: global.__mockPromise(updatedValueData),
                updateValue: global.__mockPromise(updatedValueData)
            };

            const attrRepo = attributeSimpleLinkRepo(null, attrSimpleRepo, null);

            const createdVal = await attrRepo.createValue('test_lib', 12345, mockAttribute, {
                value: 123456
            });

            expect(attrSimpleRepo.createValue.mock.calls.length).toBe(1);
            expect(attrSimpleRepo.createValue).toBeCalledWith('test_lib', 12345, mockAttribute, {
                value: 123456
            });

            expect(createdVal).toMatchObject(updatedValueData);
        });
    });

    describe('deleteValue', () => {
        test('Should delete a value', async () => {
            const deletedValueData = {
                value: null
            };

            const attrSimpleRepo = {
                ...mockAttrSimpleRepo,
                deleteValue: global.__mockPromise(deletedValueData)
            };

            const attrRepo = attributeSimpleLinkRepo(null, attrSimpleRepo, null);

            const deletedVal = await attrRepo.deleteValue('test_lib', 12345, mockAttribute, {
                value: 123456
            });

            expect(attrSimpleRepo.deleteValue.mock.calls.length).toBe(1);
            expect(attrSimpleRepo.deleteValue).toBeCalledWith('test_lib', 12345, mockAttribute, {
                value: 123456
            });

            expect(deletedVal).toMatchObject(deletedValueData);
        });
    });

    describe('getValues', () => {
        test('Should return values for simple link attribute', async function() {
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

            const attrRepo = attributeSimpleLinkRepo(mockDbServ, null, mockDbUtils as IDbUtils);

            const values = await attrRepo.getValues('test_lib', 123456, mockAttribute);

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
});
