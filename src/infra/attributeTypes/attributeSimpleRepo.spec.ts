import {Database} from 'arangojs';
import {AttributeTypes} from '../../_types/attribute';
import attributeSimpleRepo from './attributeSimpleRepo';

describe('AttributeIndexRepo', () => {
    const mockAttribute = {
        id: 'test_attr',
        type: AttributeTypes.SIMPLE
    };

    describe('createValue', () => {
        test('Should create a new index value', async function() {
            const updatedRecordData = {
                _id: 'test_lib/222435651',
                _rev: '_WSywvyC--_',
                _key: 222435651,
                test_attr: 'test_val'
            };

            const updatedValueData = {
                value: 'test_val'
            };

            const mockDbServ = {db: new Database(), execute: global.__mockPromise([updatedRecordData])};

            const attrRepo = attributeSimpleRepo({'core.infra.db.dbService': mockDbServ});

            const createdVal = await attrRepo.createValue('test_lib', 12345, mockAttribute, {
                value: 'test val'
            });

            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/UPDATE/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();

            expect(createdVal).toMatchObject(updatedValueData);
        });
    });

    describe('getValues', () => {
        test('Should return values for index attribute', async function() {
            const queryRes = ['test val', 'other val that should not be returned'];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(queryRes)
            };

            const attrRepo = attributeSimpleRepo({'core.infra.db.dbService': mockDbServ});

            const values = await attrRepo.getValues('test_lib', 123456, mockAttribute);

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();

            expect(values.length).toBe(1);
            expect(values[0]).toMatchObject({
                value: 'test val',
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
                value: null
            };

            const mockDbServ = {db: new Database(), execute: global.__mockPromise([updatedRecordData])};

            const attrRepo = attributeSimpleRepo({'core.infra.db.dbService': mockDbServ});

            const deletedVal = await attrRepo.deleteValue('test_lib', 12345, mockAttribute, {
                value: 'test val'
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();

            expect(deletedVal).toMatchObject(deletedValueData);
        });
    });

    describe('filterQueryPart', () => {
        test('Should return simple filter', () => {
            const attrRepo = attributeSimpleRepo();
            const filter = attrRepo.filterQueryPart('id', 0, '123456');

            expect(filter.query).toMatch(/^FILTER/);
            expect(filter).toMatchSnapshot();
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
            const res = await attrTypeRepo.clearAllValues({id: 'test_attr', type: AttributeTypes.SIMPLE});

            expect(res).toEqual(true);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();
        });
    });
});
