import attributeDomain, {AttributeTypes, AttributeFormats} from './attributeDomain';

describe('attributeDomain', () => {
    describe('getAttributes', () => {
        test('Should return a list of attributes', async function() {
            const mockAttrRepo = {
                getAttributes: jest.fn().mockReturnValue(Promise.resolve([{id: 'test'}, {id: 'test2'}]))
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
                getAttributes: jest.fn().mockReturnValue(Promise.resolve([{id: 'test'}]))
            };

            const attrDomain = attributeDomain(mockAttrRepo);
            const attr = await attrDomain.getAttributeProperties('test');

            expect(mockAttrRepo.getAttributes.mock.calls.length).toBe(1);
            expect(mockAttrRepo.getAttributes).toBeCalledWith({id: 'test'});
            expect(attr).toMatchObject({id: 'test'});
        });

        test('Should throw if unknown attribute', async function() {
            const mockAttrRepo = {
                getAttributes: jest.fn().mockReturnValue(Promise.resolve([]))
            };

            const attrDomain = attributeDomain(mockAttrRepo);

            await expect(attrDomain.getAttributeProperties('test')).rejects.toThrow();
        });
    });

    describe('saveAttribute', () => {
        test('Should save a new library', async function() {
            const mockAttrRepo = {
                getAttributes: jest.fn().mockReturnValue(Promise.resolve([])),
                createAttribute: jest
                    .fn()
                    .mockReturnValue(Promise.resolve({id: 'test', system: false, type: 'standard', format: 'text'})),
                updateAttribute: jest.fn()
            };

            const attrDomain = attributeDomain(mockAttrRepo);

            attrDomain.getAttributes = jest.fn().mockReturnValue(Promise.resolve([{}]));

            const newLib = await attrDomain.saveAttribute({
                id: 'test',
                type: AttributeTypes.STANDARD,
                format: AttributeFormats.TEXT
            });

            expect(mockAttrRepo.createAttribute.mock.calls.length).toBe(1);
            expect(mockAttrRepo.updateAttribute.mock.calls.length).toBe(0);

            expect(newLib).toMatchObject({id: 'test', system: false});
        });

        test('Should update an attribute', async function() {
            const mockAttrRepo = {
                getAttributes: jest.fn().mockReturnValue(Promise.resolve([{id: 'test', system: false}])),
                createAttribute: jest.fn(),
                updateAttribute: jest.fn().mockReturnValue(Promise.resolve({id: 'test', system: false}))
            };

            const attrDomain = attributeDomain(mockAttrRepo);

            attrDomain.getAttributes = jest.fn().mockReturnValue(Promise.resolve([{id: 'test'}]));

            const updatedLib = await attrDomain.saveAttribute({id: 'test', type: AttributeTypes.STANDARD});

            expect(mockAttrRepo.createAttribute.mock.calls.length).toBe(0);
            expect(mockAttrRepo.updateAttribute.mock.calls.length).toBe(1);

            expect(updatedLib).toMatchObject({id: 'test', system: false});
        });
    });

    describe('deleteAttribute', () => {
        const attrData = {id: 'test_attribute', system: false, label: {fr: 'Test'}, format: 'text', type: 'index'};

        const docAttrData = {
            _key: 'test_attribute',
            _id: 'core_attributes/test_attribute',
            _rev: '_WSgDYea--_',
            format: 'numeric',
            label: {en: 'Test', fr: 'Test'},
            system: false,
            type: 'index'
        };

        test('Should delete an attribute and return deleted attribute', async function() {
            const mockAttrRepo = {deleteAttribute: jest.fn().mockReturnValue(Promise.resolve(attrData))};
            const attrDomain = attributeDomain(mockAttrRepo);
            attrDomain.getAttributes = jest.fn().mockReturnValue(Promise.resolve([attrData]));

            const deleteRes = await attrDomain.deleteAttribute(attrData.id);

            expect(mockAttrRepo.deleteAttribute.mock.calls.length).toBe(1);
        });

        test('Should throw if unknown attribute', async function() {
            const mockAttrRepo = {deleteAttribute: jest.fn().mockReturnValue(Promise.resolve())};
            const attrDomain = attributeDomain(mockAttrRepo);
            attrDomain.getAttributes = jest.fn().mockReturnValue(Promise.resolve([]));

            await expect(attrDomain.deleteAttribute(attrData.id)).rejects.toThrow();
        });

        test('Should throw if system attribute', async function() {
            const mockAttrRepo = {deleteAttribute: jest.fn().mockReturnValue(Promise.resolve())};
            const attrDomain = attributeDomain(mockAttrRepo);
            attrDomain.getAttributes = jest.fn().mockReturnValue(Promise.resolve([{system: true}]));

            await expect(attrDomain.deleteAttribute(attrData.id)).rejects.toThrow();
        });
    });
});
