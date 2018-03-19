import attributeSimpleRepo from './attributeSimpleRepo';
import {AttributeTypes} from '../../_types/attribute';
import {Database} from 'arangojs';

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

            const mockDbCollec = {
                update: global.__mockPromise(updatedRecordData),
                document: global.__mockPromise(updatedRecordData)
            };

            const mockDb = {collection: jest.fn().mockReturnValue(mockDbCollec)};

            const mockDbServ = {db: mockDb};

            const attrRepo = attributeSimpleRepo(mockDbServ);

            const createdVal = await attrRepo.createValue('test_lib', 12345, mockAttribute, {
                value: 'test val'
            });

            expect(mockDbCollec.update.mock.calls.length).toBe(1);
            expect(mockDbCollec.update).toBeCalledWith({_key: 12345}, {test_attr: 'test val'});

            expect(createdVal).toMatchObject(updatedValueData);
        });
    });

    describe('getValues', () => {
        test('Should return values for index attribute', async function() {
            const queryRes = ['test val'];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(queryRes)
            };

            const attrRepo = attributeSimpleRepo(mockDbServ);

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
});
