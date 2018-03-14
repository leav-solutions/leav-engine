import attributeDomain from './attributeDomain';
import valueDomain from './valueDomain';

describe('ValueDomain', () => {
    describe('saveValue', () => {
        test('Should save an indexed value', async function() {
            const savedValueData = {value: 'test val'};
            const mockAttrDomain = {
                getAttributeProperties: global.__mockPromise({id: 'test_attr', type: 'index'})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const mockValueRepo = {
                saveValue: global.__mockPromise(savedValueData)
            };

            const valDomain = valueDomain(mockAttrDomain, mockLibDomain, mockValueRepo);

            const savedValue = await valDomain.saveValue('test_lib', '12345', 'test_attr', {value: 'test val'});

            expect(mockValueRepo.saveValue.mock.calls.length).toBe(1);

            expect(savedValue).toMatchObject(savedValueData);
        });

        test('Should throw if unknown attribute', async function() {
            const mockAttrDomain = {
                getAttributeProperties: jest.fn().mockReturnValue(Promise.reject('Unknown attribute'))
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([{id: 'test_lib'}])
            };

            const mockValueRepo = {
                saveValue: global.__mockPromise()
            };

            const valDomain = valueDomain(mockAttrDomain, mockLibDomain, mockValueRepo);

            await expect(valDomain.saveValue('test_lib', '12345', 'test_attr', {value: 'test val'})).rejects.toThrow();
        });

        test('Should throw if unknown library', async function() {
            const mockAttrDomain = {
                getAttributes: global.__mockPromise([{id: 'test_attr'}])
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise([])
            };

            const mockValueRepo = {
                saveValue: global.__mockPromise()
            };

            const valDomain = valueDomain(mockAttrDomain, mockLibDomain, mockValueRepo);

            await expect(valDomain.saveValue('test_lib', '12345', 'test_attr', {value: 'test val'})).rejects.toThrow();
        });
    });
});
