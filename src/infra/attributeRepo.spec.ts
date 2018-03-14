import attributeRepo from './attributeRepo';
import {Database} from 'arangojs';
import {AttributeTypes, AttributeFormats} from '../domain/attributeDomain';
describe('AttributeRepo', () => {
    describe('getAttribute', () => {
        test('Should return all libs if no filter', async function() {
            const mockDbServ = {db: null, execute: global.__mockPromise([])};
            const mockDbUtils = {cleanup: jest.fn()};
            const attrRepo = attributeRepo(mockDbServ, mockDbUtils);

            const lib = await attrRepo.getAttributes();

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/FOR a IN core_attributes/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/(?!FILTER)/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();
        });

        test('Should filter', async function() {
            const mockDbServ = {db: null, execute: global.__mockPromise([])};
            const mockCleanupRes = {id: 'test_attribute', system: false};
            const mockConvertRes = {_key: 'test_attribute', system: false};
            const mockDbUtils = {
                cleanup: jest.fn().mockReturnValue(mockCleanupRes),
                convertToDoc: jest.fn().mockReturnValue({_key: 'test', system: false})
            };
            const attrRepo = attributeRepo(mockDbServ, mockDbUtils);

            const lib = await attrRepo.getAttributes({id: 'test'});

            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/(FILTER){1}/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();
        });

        test('Should return an empty array if no results', async function() {
            const mockDbServ = {db: null, execute: global.__mockPromise([])};

            const mockCleanupRes = {id: 'test_attribute'};
            const mockDbUtils = {
                cleanup: jest.fn().mockReturnValue(mockCleanupRes),
                convertToDoc: jest.fn().mockReturnValue({_key: 'test'})
            };

            const attrRepo = attributeRepo(mockDbServ, mockDbUtils);

            const libs = await attrRepo.getAttributes({id: 'test'});

            expect(libs).toBeInstanceOf(Array);
            expect(libs.length).toBe(0);
        });

        test('Should format returned values', async function() {
            const mockLibList = [{_key: 'test', _id: 'core_attributes/test', _rev: '_WR0JkDW--_'}];
            const mockDbServ = {db: null, execute: global.__mockPromise(mockLibList)};

            const mockCleanupRes = [{id: 'test', system: false}];
            const mockDbUtils = {
                cleanup: jest.fn().mockReturnValue(mockCleanupRes),
                convertToDoc: jest.fn().mockReturnValue({_key: 'test', system: false})
            };
            const attrRepo = attributeRepo(mockDbServ, mockDbUtils);

            const libs = await attrRepo.getAttributes({id: 'test'});

            expect(mockDbUtils.cleanup.mock.calls.length).toBe(1);
            expect(libs.length).toEqual(1);
            expect(libs[0]).toMatchObject([{id: 'test', system: false}]);
        });
    });

    describe('updateAttribute', () => {
        const docAttrData = {
            _key: 'test_attribute',
            system: true,
            format: 'text',
            type: 'standard',
            label: {fr: 'Test'}
        };

        const attrData = {
            id: 'test_attribute',
            system: true,
            label: {fr: 'Test'},
            format: AttributeFormats.TEXT,
            type: AttributeTypes.STANDARD
        };

        test('Should update an existing attribute', async function() {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([docAttrData])
            };

            const mockCleanupRes = attrData;
            const mockDbUtils = {
                cleanup: jest.fn().mockReturnValue(mockCleanupRes),
                convertToDoc: jest.fn().mockReturnValue(docAttrData)
            };

            const attrRepo = attributeRepo(mockDbServ, mockDbUtils);

            const updatedAttr = await attrRepo.updateAttribute(attrData);
            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/^UPDATE/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();

            expect(updatedAttr).toMatchObject(attrData);
        });
    });

    describe('createAttribute', () => {
        const docAttrData = {_key: 'test_attribute', system: true, format: 'text', type: 'standard'};
        const attrData = {
            id: 'test_attribute',
            system: true,
            label: {fr: 'Test'},
            format: AttributeFormats.TEXT,
            type: AttributeTypes.STANDARD
        };

        test('Should create a new attribute', async function() {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([docAttrData])
            };

            const mockCleanupRes = attrData;
            const mockDbUtils = {
                cleanup: jest.fn().mockReturnValue(mockCleanupRes),
                convertToDoc: jest.fn().mockReturnValue(docAttrData)
            };

            const attrRepo = attributeRepo(mockDbServ, mockDbUtils);

            const createdAttr = await attrRepo.createAttribute(attrData);
            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/^INSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();

            expect(createdAttr).toMatchObject(attrData);
        });
    });

    describe('deleteAttribute', () => {
        const attrData = {
            id: 'test_attribute',
            system: false,
            label: {fr: 'Test'},
            format: 'text',
            type: 'index'
        };

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
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([docAttrData])
            };

            const mockCleanupRes = attrData;
            const mockDbUtils = {
                cleanup: jest.fn().mockReturnValue(attrData),
                convertToDoc: jest.fn().mockReturnValue(docAttrData)
            };

            const attrRepo = attributeRepo(mockDbServ, mockDbUtils);
            attrRepo.getAttributes = global.__mockPromise([attrData]);

            const deleteRes = await attrRepo.deleteAttribute(attrData.id);

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/^REMOVE/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();
        });
    });
});
