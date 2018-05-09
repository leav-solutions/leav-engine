import {IAttributeRepo} from 'infra/attributeRepo';
import {AttributeFormats, AttributeTypes} from '../_types/attribute';
import attributeDomain from './attributeDomain';

describe('attributeDomain', () => {
    describe('getAttributes', () => {
        test('Should return a list of attributes', async function() {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise([{id: 'test'}, {id: 'test2'}])
            };

            const attrDomain = attributeDomain(mockAttrRepo as IAttributeRepo);
            const attr = await attrDomain.getAttributes();

            expect(mockAttrRepo.getAttributes.mock.calls.length).toBe(1);
            expect(attr.length).toBe(2);
        });
    });

    describe('getAttributeProperties', () => {
        test('Should return a list of attributes', async function() {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise([{id: 'test'}])
            };

            const attrDomain = attributeDomain(mockAttrRepo as IAttributeRepo);
            const attr = await attrDomain.getAttributeProperties('test');

            expect(mockAttrRepo.getAttributes.mock.calls.length).toBe(1);
            expect(mockAttrRepo.getAttributes).toBeCalledWith({id: 'test'});
            expect(attr).toMatchObject({id: 'test'});
        });

        test('Should throw if unknown attribute', async function() {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise([])
            };

            const attrDomain = attributeDomain(mockAttrRepo as IAttributeRepo);

            await expect(attrDomain.getAttributeProperties('test')).rejects.toThrow();
        });
    });

    describe('saveAttribute', () => {
        test('Should save a new attribute', async function() {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise([]),
                createAttribute: global.__mockPromise({id: 'test', system: false, type: 'standard', format: 'text'}),
                updateAttribute: jest.fn()
            };

            const attrDomain = attributeDomain(mockAttrRepo as IAttributeRepo);

            attrDomain.getAttributes = global.__mockPromise([{}]);

            const newLib = await attrDomain.saveAttribute({
                id: 'test',
                type: AttributeTypes.ADVANCED,
                format: AttributeFormats.TEXT
            });

            expect(mockAttrRepo.createAttribute.mock.calls.length).toBe(1);
            expect(mockAttrRepo.updateAttribute.mock.calls.length).toBe(0);

            expect(newLib).toMatchObject({id: 'test', system: false});
        });

        test('Should update an attribute', async function() {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise([{id: 'test', system: false}]),
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise({id: 'test', system: false})
            };

            const attrDomain = attributeDomain(mockAttrRepo as IAttributeRepo);

            attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

            const updatedLib = await attrDomain.saveAttribute({id: 'test', type: AttributeTypes.ADVANCED});

            expect(mockAttrRepo.createAttribute.mock.calls.length).toBe(0);
            expect(mockAttrRepo.updateAttribute.mock.calls.length).toBe(1);

            expect(updatedLib).toMatchObject({id: 'test', system: false});
        });
    });

    describe('deleteAttribute', () => {
        const attrData = {id: 'test_attribute', system: false, label: {fr: 'Test'}, format: 'text', type: 'index'};

        test('Should delete an attribute and return deleted attribute', async function() {
            const mockAttrRepo: Mockify<IAttributeRepo> = {deleteAttribute: global.__mockPromise(attrData)};
            const attrDomain = attributeDomain(mockAttrRepo as IAttributeRepo);
            attrDomain.getAttributes = global.__mockPromise([attrData]);

            const deleteRes = await attrDomain.deleteAttribute(attrData.id);

            expect(mockAttrRepo.deleteAttribute.mock.calls.length).toBe(1);
        });

        test('Should throw if unknown attribute', async function() {
            const mockAttrRepo: Mockify<IAttributeRepo> = {deleteAttribute: global.__mockPromise()};
            const attrDomain = attributeDomain(mockAttrRepo as IAttributeRepo);
            attrDomain.getAttributes = global.__mockPromise([]);

            await expect(attrDomain.deleteAttribute(attrData.id)).rejects.toThrow();
        });

        test('Should throw if system attribute', async function() {
            const mockAttrRepo: Mockify<IAttributeRepo> = {deleteAttribute: global.__mockPromise()};
            const attrDomain = attributeDomain(mockAttrRepo as IAttributeRepo);
            attrDomain.getAttributes = global.__mockPromise([{system: true}]);

            await expect(attrDomain.deleteAttribute(attrData.id)).rejects.toThrow();
        });
    });
});
