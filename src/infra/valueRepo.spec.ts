import valueRepo from './valueRepo';
import {Database} from 'arangojs';
import {AttributeTypes} from '../domain/attributeDomain';

describe('ValueRepo', () => {
    describe('saveValue', () => {
        test('Should save an indexed value', async function() {
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
                update: jest.fn().mockReturnValue(Promise.resolve(updatedRecordData)),
                document: jest.fn().mockReturnValue(Promise.resolve(updatedRecordData))
            };

            const mockDb = {collection: jest.fn().mockReturnValue(mockDbCollec)};

            const mockDbServ = {db: mockDb};

            const valRepo = valueRepo(mockDbServ);

            const createdVal = await valRepo.saveValue(
                'test_lib',
                '12345',
                {
                    id: 'test_attr',
                    type: AttributeTypes.INDEX
                },
                {
                    value: 'test val'
                }
            );

            expect(mockDbCollec.update.mock.calls.length).toBe(1);
            expect(mockDbCollec.update).toBeCalledWith({_key: '12345'}, {test_attr: 'test val'});

            expect(createdVal).toMatchObject(updatedValueData);
        });
    });
});
