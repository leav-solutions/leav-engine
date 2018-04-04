import recordRepo, {IRecordRepo} from 'infra/recordRepo';
import recordDomain from './recordDomain';
import {label} from 'joi';
import {AttributeTypes} from '../_types/attribute';

const mockRecordRepo: IRecordRepo = {
    createRecord: null,
    deleteRecord: null,
    find: null
};

const mockValueRepo = {
    createValue: jest.fn(),
    updateValue: jest.fn(),
    deleteValue: jest.fn(),
    getValues: jest.fn(),
    getValueById: global.__mockPromise(null),
    clearAllValues: jest.fn()
};

describe('RecordDomain', () => {
    describe('createRecord', () => {
        test('Should create a new record', async function() {
            const createdRecordData = {id: 222435651, library: 'test', created_at: 1519303348, modified_at: 1519303348};
            const recRepo = {...mockRecordRepo, createRecord: global.__mockPromise(createdRecordData)};

            const recDomain = recordDomain(recRepo, null);

            const createdRecord = await recDomain.createRecord('test');
            expect(recRepo.createRecord.mock.calls.length).toBe(1);
            expect(Number.isInteger(recRepo.createRecord.mock.calls[0][1].created_at)).toBe(true);
            expect(Number.isInteger(recRepo.createRecord.mock.calls[0][1].modified_at)).toBe(true);

            expect(createdRecord).toMatchObject(createdRecordData);
        });
    });

    describe('deleteRecord', () => {
        const recordData = {id: 222435651, library: 'test', created_at: 1519303348, modified_at: 1519303348};

        test('Should delete an record and return deleted record', async function() {
            const recRepo = {...mockRecordRepo, deleteRecord: global.__mockPromise(recordData)};
            const recDomain = recordDomain(recRepo, null);

            const deleteRes = await recDomain.deleteRecord('test', recordData.id);

            expect(recRepo.deleteRecord.mock.calls.length).toBe(1);
        });

        // TODO: handle unknown record?
        // test('Should throw if unknown record', async function() {
        //     const mockLibRepo = {deleteRecord: global.__mockPromise(recordData)};
        //     const recDomain = recordDomain(mockLibRepo);

        //     await expect(recDomain.deleteRecord(recordData.id)).rejects.toThrow();
        // });
    });

    describe('find', () => {
        test('Should find records', async function() {
            const mockRes = [
                {
                    id: '222536515',
                    created_at: 1520931648,
                    modified_at: 1520931648,
                    ean: '9876543219999999'
                }
            ];

            const recRepo = {...mockRecordRepo, find: global.__mockPromise(mockRes)};

            const recDomain = recordDomain(recRepo, null);

            const findRes = await recDomain.find('test_lib');

            expect(recRepo.find.mock.calls.length).toBe(1);
            expect(findRes).toEqual([
                {
                    id: '222536515',
                    created_at: 1520931648,
                    modified_at: 1520931648,
                    ean: '9876543219999999'
                }
            ]);
        });
    });

    describe('populateRecordFields', () => {
        test('Should populate record fields', async function() {
            const record = {
                id: 222536283,
                created_at: 1520931427,
                modified_at: 1520931427,
                ean: '9876543219999999',
                visual_simple: '222713677'
            };

            const recRepo = {...mockRecordRepo};

            const mockValRepo = {
                ...mockValueRepo,
                getValues: global.__mockPromise([
                    {
                        id: '222827150',
                        value: 'MyLabel'
                    }
                ])
            };

            const mockAttributeDomain = {
                getAttributeProperties: jest.fn().mockImplementation(attribute => {
                    let type;
                    switch (attribute) {
                        case 'id':
                            type = AttributeTypes.SIMPLE;
                            break;
                        case 'label':
                            type = AttributeTypes.ADVANCED;
                            break;
                    }

                    return Promise.resolve({id: attribute, type});
                })
            };

            const recDomain = recordDomain(recRepo, mockAttributeDomain, mockValRepo);

            const findRes = await recDomain.populateRecordFields('test_lib', record, [
                {
                    name: 'label',
                    fields: [{name: 'id', fields: [], arguments: []}, {name: 'value', fields: [], arguments: []}],
                    arguments: []
                }
            ]);

            expect(mockValRepo.getValues).toBeCalledWith('test_lib', 222536283, {
                id: 'label',
                type: AttributeTypes.ADVANCED
            });
            expect(findRes).toEqual({
                ...record,
                label: {
                    id: '222827150',
                    value: 'MyLabel'
                }
            });
        });

        test('Should populate record fields recursively', async function() {
            const record = {
                id: 222536283,
                created_at: 1520931427,
                modified_at: 1520931427,
                ean: '9876543219999999',
                visual_simple: '222713677'
            };

            const recRepo = {...mockRecordRepo};

            const mockValRepo = {
                ...mockValueRepo,
                getValues: jest
                    .fn()
                    .mockReturnValueOnce([
                        {
                            id: null,
                            value: {
                                id: '222827150',
                                library: 'linked_library'
                            }
                        }
                    ])
                    .mockReturnValueOnce([
                        {
                            id: '222827150',
                            value: 'MyLabel'
                        }
                    ])
            };

            const mockAttributeDomain = {
                getAttributeProperties: jest.fn().mockImplementation(attribute => {
                    let type;
                    switch (attribute) {
                        case 'id':
                            type = AttributeTypes.SIMPLE;
                            break;
                        case 'label':
                            type = AttributeTypes.ADVANCED;
                            break;
                        case 'linkedElem':
                            type = AttributeTypes.SIMPLE_LINK;
                            break;
                    }

                    return Promise.resolve({id: attribute, type});
                })
            };

            const recDomain = recordDomain(recRepo, mockAttributeDomain, mockValRepo);

            const findRes = await recDomain.populateRecordFields('test_lib', record, [
                {name: 'id', fields: [], arguments: []},
                {
                    name: 'linkedElem',
                    fields: [
                        {name: 'id', fields: [], arguments: []},
                        {
                            name: 'value',
                            fields: [
                                {name: 'id', fields: [], arguments: []},
                                {
                                    name: 'label',
                                    fields: [
                                        {name: 'id', fields: [], arguments: []},
                                        {name: 'value', fields: [], arguments: []}
                                    ],
                                    arguments: []
                                }
                            ],
                            arguments: []
                        }
                    ],
                    arguments: []
                }
            ]);

            expect(mockValRepo.getValues).toBeCalledWith('test_lib', 222536283, {
                id: 'linkedElem',
                type: AttributeTypes.SIMPLE_LINK
            });
            expect(findRes).toEqual({
                ...record,
                linkedElem: {
                    id: null,
                    value: {
                        id: '222827150',
                        library: 'linked_library',
                        label: {
                            id: '222827150',
                            value: 'MyLabel'
                        }
                    }
                }
            });
        });
    });
});
