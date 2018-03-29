import attributeDomain from './attributeDomain';
import {AttributeTypes, AttributeFormats} from '../_types/attribute';

describe('attributeDomain', () => {
    const mockAttrTypeRepo = {
        createValue: jest.fn(),
        updateValue: jest.fn(),
        deleteValue: jest.fn(),
        getValues: jest.fn(),
        getValueById: global.__mockPromise(null),
        filterQueryPart: jest.fn(),
        clearAllValues: jest.fn()
    };

    describe('getAttributes', () => {
        test('Should return a list of attributes', async function() {
            const mockAttrRepo = {
                getAttributes: global.__mockPromise([{id: 'test'}, {id: 'test2'}])
            };

            const attrDomain = attributeDomain(mockAttrRepo);
            const attr = await attrDomain.getAttributes();

            expect(mockAttrRepo.getAttributes.mock.calls.length).toBe(1);
            expect(attr.length).toBe(2);
        });
    });

    describe('getAttributeProperties', () => {
        test('Should return a list of attributes', async function() {
            const mockAttrRepo = {
                getAttributes: global.__mockPromise([{id: 'test'}])
            };

            const attrDomain = attributeDomain(mockAttrRepo);
            const attr = await attrDomain.getAttributeProperties('test');

            expect(mockAttrRepo.getAttributes.mock.calls.length).toBe(1);
            expect(mockAttrRepo.getAttributes).toBeCalledWith({id: 'test'});
            expect(attr).toMatchObject({id: 'test'});
        });

        test('Should throw if unknown attribute', async function() {
            const mockAttrRepo = {
                getAttributes: global.__mockPromise([])
            };

            const attrDomain = attributeDomain(mockAttrRepo);

            await expect(attrDomain.getAttributeProperties('test')).rejects.toThrow();
        });
    });

    describe('saveAttribute', () => {
        test('Should save a new attribute', async function() {
            const mockAttrRepo = {
                getAttributes: global.__mockPromise([]),
                createAttribute: global.__mockPromise({id: 'test', system: false, type: 'standard', format: 'text'}),
                updateAttribute: jest.fn()
            };

            const attrDomain = attributeDomain(mockAttrRepo);

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
            const mockAttrRepo = {
                getAttributes: global.__mockPromise([{id: 'test', system: false}]),
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise({id: 'test', system: false})
            };

            const attrDomain = attributeDomain(mockAttrRepo);

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
            const mockAttrRepo = {deleteAttribute: global.__mockPromise(attrData)};
            const attrDomain = attributeDomain(mockAttrRepo);
            attrDomain.getAttributes = global.__mockPromise([attrData]);

            const deleteRes = await attrDomain.deleteAttribute(attrData.id);

            expect(mockAttrRepo.deleteAttribute.mock.calls.length).toBe(1);
        });

        test('Should throw if unknown attribute', async function() {
            const mockAttrRepo = {deleteAttribute: global.__mockPromise()};
            const attrDomain = attributeDomain(mockAttrRepo);
            attrDomain.getAttributes = global.__mockPromise([]);

            await expect(attrDomain.deleteAttribute(attrData.id)).rejects.toThrow();
        });

        test('Should throw if system attribute', async function() {
            const mockAttrRepo = {deleteAttribute: global.__mockPromise()};
            const attrDomain = attributeDomain(mockAttrRepo);
            attrDomain.getAttributes = global.__mockPromise([{system: true}]);

            await expect(attrDomain.deleteAttribute(attrData.id)).rejects.toThrow();
        });
    });

    describe('getTypeRepo', () => {
        const mockAttribute = {
            id: 'test_attr',
            type: null
        };

        test('Should return repo by attribute type', () => {
            const mockAttrSimpleRepo = {...mockAttrTypeRepo};
            const mockAttrSimpleLinkRepo = {...mockAttrTypeRepo};
            const mockAttrAdvRepo = {...mockAttrTypeRepo};
            const mockAttrAdvLinkRepo = {...mockAttrTypeRepo};

            const attrDomain = attributeDomain(
                null,
                mockAttrSimpleRepo,
                mockAttrSimpleLinkRepo,
                mockAttrAdvRepo,
                mockAttrAdvLinkRepo
            );

            expect(attrDomain.getTypeRepo({...mockAttribute, type: AttributeTypes.SIMPLE})).toBe(mockAttrSimpleRepo);
            expect(attrDomain.getTypeRepo({...mockAttribute, type: AttributeTypes.SIMPLE_LINK})).toBe(
                mockAttrSimpleLinkRepo
            );
            expect(attrDomain.getTypeRepo({...mockAttribute, type: AttributeTypes.ADVANCED})).toBe(mockAttrAdvRepo);
            expect(attrDomain.getTypeRepo({...mockAttribute, type: AttributeTypes.ADVANCED_LINK})).toBe(
                mockAttrAdvLinkRepo
            );
        });
    });
});
