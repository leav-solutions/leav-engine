import attributeDomain, {IAttributeDomain} from './attributeDomain';
import valueDomain from './valueDomain';
import {AttributeTypes} from '../_types/attribute';
import {IAttributeTypeRepo} from 'infra/attributeTypesRepo';
import {IRecordRepo} from 'infra/recordRepo';
import {IValueRepo} from 'infra/valueRepo';
import {ILibraryDomain} from './libraryDomain';

describe('ValueDomain', () => {
    const mockRecordRepo: Mockify<IRecordRepo> = {
        updateRecord: jest.fn()
    };

    describe('saveValue', () => {
        test('Should save an indexed value', async function() {
            const savedValueData = {value: 'test val', attribute: 'test_attr'};

            const mockValRepo = {
                createValue: global.__mockPromise(savedValueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({id: 'test_attr', type: AttributeTypes.SIMPLE})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo,
                mockRecordRepo as IRecordRepo
            );

            const savedValue = await valDomain.saveValue('test_lib', 12345, 'test_attr', {value: 'test val'});

            expect(mockValRepo.createValue.mock.calls.length).toBe(1);
            expect(savedValue).toMatchObject(savedValueData);
        });

        test('Should save a new standard value', async function() {
            const savedValueData = {
                id_value: '1337',
                value: 'test val',
                attribute: 'test_attr',
                modified_at: 123456,
                created_at: 123456
            };

            const mockValRepo = {
                createValue: global.__mockPromise(savedValueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({id: 'test_attr', type: AttributeTypes.ADVANCED})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo,
                mockRecordRepo as IRecordRepo
            );

            const savedValue = await valDomain.saveValue('test_lib', 12345, 'test_attr', {value: 'test val'});

            expect(mockValRepo.createValue.mock.calls.length).toBe(1);
            expect(mockValRepo.createValue.mock.calls[0][3].modified_at).toBeDefined();
            expect(mockValRepo.createValue.mock.calls[0][3].created_at).toBeDefined();

            expect(savedValue).toMatchObject(savedValueData);
            expect(savedValue.id_value).toBeTruthy();
            expect(savedValue.attribute).toBeTruthy();
            expect(savedValue.modified_at).toBeTruthy();
            expect(savedValue.created_at).toBeTruthy();
        });

        test('Should update a standard value', async function() {
            const savedValueData = {
                id_value: '1337',
                value: 'test val',
                attribute: 'test_attr',
                modified_at: 123456,
                created_at: 123456
            };

            const mockValRepo = {
                updateValue: global.__mockPromise(savedValueData),
                getValueById: global.__mockPromise({
                    id_value: 12345
                })
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({id: 'test_attr', type: AttributeTypes.ADVANCED})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo,
                mockRecordRepo as IRecordRepo
            );

            const savedValue = await valDomain.saveValue('test_lib', 12345, 'test_attr', {
                id_value: 12345,
                value: 'test val'
            });

            expect(mockValRepo.updateValue.mock.calls.length).toBe(1);
            expect(mockValRepo.updateValue.mock.calls[0][3].modified_at).toBeDefined();
            expect(mockValRepo.updateValue.mock.calls[0][3].created_at).toBeUndefined();

            expect(savedValue).toMatchObject(savedValueData);
            expect(savedValue.id_value).toBeTruthy();
            expect(savedValue.attribute).toBeTruthy();
            expect(savedValue.modified_at).toBeTruthy();
            expect(savedValue.created_at).toBeTruthy();
        });

        test('Should throw if unknown attribute', async function() {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: jest.fn().mockReturnValue(Promise.reject('Unknown attribute'))
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const mockValRepo = {};

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo
            );

            await expect(valDomain.saveValue('test_lib', 12345, 'test_attr', {value: 'test val'})).rejects.toThrow();
        });

        test('Should throw if unknown library', async function() {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributes: global.__mockPromise([{id: 'test_attr'}])
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([])
            };

            const mockValRepo = {};

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo
            );

            await expect(valDomain.saveValue('test_lib', 12345, 'test_attr', {value: 'test val'})).rejects.toThrow();
        });

        test('Should throw if unknown value', async function() {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({id: 'test_attr', type: AttributeTypes.ADVANCED})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const mockValRepo = {};

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo
            );

            await expect(
                valDomain.saveValue('test_lib', 12345, 'test_attr', {
                    id_value: 12345,
                    value: 'test val'
                })
            ).rejects.toThrow();
        });

        test('Should update record modif date', async function() {
            const savedValueData = {value: 'test val', attribute: 'test_attr'};

            const mockValRepo = {
                createValue: global.__mockPromise(savedValueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({id: 'test_attr', type: AttributeTypes.SIMPLE})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const mockRecRepo = {updateRecord: global.__mockPromise({})};

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo,
                mockRecRepo as IRecordRepo
            );

            const savedValue = await valDomain.saveValue('test_lib', 12345, 'test_attr', {value: 'test val'});

            expect(mockRecRepo.updateRecord).toBeCalled();
            expect(mockRecRepo.updateRecord.mock.calls[0][1].modified_at).toBeDefined();
            expect(Number.isInteger(mockRecRepo.updateRecord.mock.calls[0][1].modified_at)).toBe(true);

            expect(savedValue).toMatchObject(savedValueData);
        });
    });

    describe('deleteValue', () => {
        test('Should delete a value', async function() {
            const deletedValueData = {value: 'test val', attribute: 'test_attr'};

            const mockValRepo = {
                deleteValue: global.__mockPromise(deletedValueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({id: 'test_attr', type: AttributeTypes.SIMPLE})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const valDomain = valueDomain(
                mockAttrDomain as IAttributeDomain,
                mockLibDomain as ILibraryDomain,
                mockValRepo as IValueRepo,
                mockRecordRepo as IRecordRepo
            );

            const deletedValue = await valDomain.deleteValue('test_lib', 12345, 'test_attr', {value: 'test val'});

            expect(mockValRepo.deleteValue.mock.calls.length).toBe(1);
            expect(deletedValue).toMatchObject(deletedValueData);
        });

        test('Should throw if unknown attribute', async function() {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: jest.fn().mockReturnValue(Promise.reject('Unknown attribute'))
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const valDomain = valueDomain(mockAttrDomain as IAttributeDomain, mockLibDomain as ILibraryDomain);

            await expect(valDomain.saveValue('test_lib', 12345, 'test_attr', {value: 'test val'})).rejects.toThrow();
        });

        test('Should throw if unknown library', async function() {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributes: global.__mockPromise([{id: 'test_attr'}])
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([])
            };

            const valDomain = valueDomain(mockAttrDomain as IAttributeDomain, mockLibDomain as ILibraryDomain);

            await expect(valDomain.saveValue('test_lib', 12345, 'test_attr', {value: 'test val'})).rejects.toThrow();
        });

        test('Should throw if unknown value', async function() {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({id: 'test_attr', type: AttributeTypes.ADVANCED})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const valDomain = valueDomain(mockAttrDomain as IAttributeDomain, mockLibDomain as ILibraryDomain);

            await expect(
                valDomain.saveValue('test_lib', 12345, 'test_attr', {
                    id_value: 12345,
                    value: 'test val'
                })
            ).rejects.toThrow();
        });
    });
});
