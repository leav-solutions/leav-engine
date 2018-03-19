import attributeDomain from './attributeDomain';
import valueDomain from './valueDomain';
import {AttributeTypes} from '../_types/attribute';

describe('ValueDomain', () => {
    const mockAttrTypeRepo = {
        createValue: jest.fn(),
        updateValue: jest.fn(),
        deleteValue: jest.fn(),
        getValues: jest.fn(),
        getValueById: global.__mockPromise(null)
    };

    describe('saveValue', () => {
        test('Should save an indexed value', async function() {
            const savedValueData = {value: 'test val', attribute: 'test_attr'};
            const mockAttrDomain = {
                getAttributeProperties: global.__mockPromise({id: 'test_attr', type: AttributeTypes.SIMPLE})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const mockAttrIndexRepo = {
                ...mockAttrTypeRepo,
                createValue: global.__mockPromise(savedValueData)
            };

            const mockAttrStdRepo = {...mockAttrTypeRepo};
            const mockAttrLinkRepo = {...mockAttrTypeRepo};

            const valDomain = valueDomain(
                mockAttrDomain,
                mockLibDomain,
                mockAttrIndexRepo,
                mockAttrStdRepo,
                mockAttrLinkRepo
            );

            const savedValue = await valDomain.saveValue('test_lib', 12345, 'test_attr', {value: 'test val'});

            expect(mockAttrIndexRepo.createValue.mock.calls.length).toBe(1);
            expect(mockAttrStdRepo.createValue.mock.calls.length).toBe(0);
            expect(mockAttrLinkRepo.createValue.mock.calls.length).toBe(0);
            expect(savedValue).toMatchObject(savedValueData);
        });

        test('Should save a new standard value', async function() {
            const savedValueData = {
                id: '1337',
                value: 'test val',
                attribute: 'test_attr',
                modified_at: 123456,
                created_at: 123456
            };
            const mockAttrDomain = {
                getAttributeProperties: global.__mockPromise({id: 'test_attr', type: AttributeTypes.ADVANCED})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const mockAttrStdRepo = {...mockAttrTypeRepo, createValue: global.__mockPromise(savedValueData)};
            const mockAttrIndexRepo = {...mockAttrTypeRepo};
            const mockAttrLinkRepo = {...mockAttrTypeRepo};

            const valDomain = valueDomain(
                mockAttrDomain,
                mockLibDomain,
                mockAttrIndexRepo,
                mockAttrStdRepo,
                mockAttrLinkRepo
            );

            const savedValue = await valDomain.saveValue('test_lib', 12345, 'test_attr', {value: 'test val'});

            expect(mockAttrIndexRepo.createValue.mock.calls.length).toBe(0);
            expect(mockAttrStdRepo.createValue.mock.calls.length).toBe(1);
            expect(mockAttrStdRepo.updateValue.mock.calls.length).toBe(0);
            expect(mockAttrLinkRepo.createValue.mock.calls.length).toBe(0);

            expect(mockAttrStdRepo.createValue.mock.calls[0][3].modified_at).toBeDefined();
            expect(mockAttrStdRepo.createValue.mock.calls[0][3].created_at).toBeDefined();

            expect(savedValue).toMatchObject(savedValueData);
            expect(savedValue.id).toBeTruthy();
            expect(savedValue.attribute).toBeTruthy();
            expect(savedValue.modified_at).toBeTruthy();
            expect(savedValue.created_at).toBeTruthy();
        });

        test('Should update a standard value', async function() {
            const savedValueData = {
                id: '1337',
                value: 'test val',
                attribute: 'test_attr',
                modified_at: 123456,
                created_at: 123456
            };
            const mockAttrDomain = {
                getAttributeProperties: global.__mockPromise({id: 'test_attr', type: AttributeTypes.ADVANCED})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const mockAttrStdRepo = {
                ...mockAttrTypeRepo,
                updateValue: global.__mockPromise(savedValueData),
                getValueById: global.__mockPromise({
                    id: 12345
                })
            };
            const mockAttrIndexRepo = {...mockAttrTypeRepo};
            const mockAttrLinkRepo = {...mockAttrTypeRepo};

            const valDomain = valueDomain(
                mockAttrDomain,
                mockLibDomain,
                mockAttrIndexRepo,
                mockAttrStdRepo,
                mockAttrLinkRepo
            );

            const savedValue = await valDomain.saveValue('test_lib', 12345, 'test_attr', {
                id: 12345,
                value: 'test val'
            });

            expect(mockAttrIndexRepo.createValue.mock.calls.length).toBe(0);
            expect(mockAttrStdRepo.createValue.mock.calls.length).toBe(0);
            expect(mockAttrStdRepo.updateValue.mock.calls.length).toBe(1);
            expect(mockAttrLinkRepo.createValue.mock.calls.length).toBe(0);

            expect(mockAttrStdRepo.updateValue.mock.calls[0][3].modified_at).toBeDefined();
            expect(mockAttrStdRepo.updateValue.mock.calls[0][3].created_at).toBeUndefined();

            expect(savedValue).toMatchObject(savedValueData);
            expect(savedValue.id).toBeTruthy();
            expect(savedValue.attribute).toBeTruthy();
            expect(savedValue.modified_at).toBeTruthy();
            expect(savedValue.created_at).toBeTruthy();
        });

        test('Should throw if unknown attribute', async function() {
            const mockAttrDomain = {
                getAttributeProperties: jest.fn().mockReturnValue(Promise.reject('Unknown attribute'))
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const mockAttrStdRepo = {...mockAttrTypeRepo};
            const mockAttrIndexRepo = {...mockAttrTypeRepo};
            const mockAttrLinkRepo = {...mockAttrTypeRepo};

            const valDomain = valueDomain(
                mockAttrDomain,
                mockLibDomain,
                mockAttrIndexRepo,
                mockAttrStdRepo,
                mockAttrLinkRepo
            );

            await expect(valDomain.saveValue('test_lib', 12345, 'test_attr', {value: 'test val'})).rejects.toThrow();
        });

        test('Should throw if unknown library', async function() {
            const mockAttrDomain = {
                getAttributes: global.__mockPromise([{id: 'test_attr'}])
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([])
            };

            const mockAttrStdRepo = {...mockAttrTypeRepo};
            const mockAttrIndexRepo = {...mockAttrTypeRepo};
            const mockAttrLinkRepo = {...mockAttrTypeRepo};

            const valDomain = valueDomain(
                mockAttrDomain,
                mockLibDomain,
                mockAttrIndexRepo,
                mockAttrStdRepo,
                mockAttrLinkRepo
            );

            await expect(valDomain.saveValue('test_lib', 12345, 'test_attr', {value: 'test val'})).rejects.toThrow();
        });

        test('Should throw if unknown value', async function() {
            const mockAttrDomain = {
                getAttributeProperties: global.__mockPromise({id: 'test_attr', type: AttributeTypes.ADVANCED})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const mockAttrStdRepo = {...mockAttrTypeRepo};
            const mockAttrIndexRepo = {...mockAttrTypeRepo};
            const mockAttrLinkRepo = {...mockAttrTypeRepo};

            const valDomain = valueDomain(
                mockAttrDomain,
                mockLibDomain,
                mockAttrIndexRepo,
                mockAttrStdRepo,
                mockAttrLinkRepo
            );

            await expect(
                valDomain.saveValue('test_lib', 12345, 'test_attr', {
                    id: 12345,
                    value: 'test val'
                })
            ).rejects.toThrow();
        });
    });
});
