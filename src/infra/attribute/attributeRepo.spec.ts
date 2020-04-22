import {Database} from 'arangojs';
import {IDbUtils} from 'infra/db/dbUtils';
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';
import attributeRepo from '../attribute/attributeRepo';
import {IValueRepo} from '../value/valueRepo';
import {IQueryInfos} from '_types/queryInfos';

describe('AttributeRepo', () => {
    const ctx: IQueryInfos = {
        userId: 0,
        queryId: 'attributeRepoTest'
    };
    describe('getAttribute', () => {
        test('Get all attributes', async function() {
            const mockDbServ = {db: null, execute: global.__mockPromise([])};
            const mockDbUtils: Mockify<IDbUtils> = {
                findCoreEntity: global.__mockPromise([
                    {
                        id: 'label',
                        system: false,
                        label: {
                            fr: 'label'
                        }
                    }
                ])
            };

            const repo = attributeRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const trees = await repo.getAttributes({ctx});

            expect(mockDbUtils.findCoreEntity.mock.calls.length).toBe(1);
            expect(trees).toEqual([
                {
                    id: 'label',
                    system: false,
                    label: {
                        fr: 'label'
                    }
                }
            ]);
        });
    });

    describe('updateAttribute', () => {
        const docAttrData = {
            _key: 'test_attribute',
            system: true,
            format: 'text',
            type: 'standard',
            label: {fr: 'Test'},
            multiple_values: false
        };

        const attrData = {
            id: 'test_attribute',
            system: true,
            label: {fr: 'Test'},
            format: AttributeFormats.TEXT,
            type: AttributeTypes.ADVANCED,
            multiple_values: false
        };

        test('Should update an existing attribute', async function() {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([docAttrData])
            };

            const mockCleanupRes = attrData;
            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue(mockCleanupRes),
                convertToDoc: jest.fn().mockReturnValue(docAttrData)
            };

            const attrRepo = attributeRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const updatedAttr = await attrRepo.updateAttribute({attrData, ctx});
            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^UPDATE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(updatedAttr).toMatchObject(attrData);
        });
    });

    describe('createAttribute', () => {
        const docAttrData = {
            _key: 'test_attribute',
            system: true,
            format: 'text',
            type: 'standard',
            label: {fr: 'Test'},
            multiple_values: false
        };
        const attrData = {
            id: 'test_attribute',
            system: true,
            label: {fr: 'Test'},
            format: AttributeFormats.TEXT,
            type: AttributeTypes.ADVANCED,
            multiple_values: false
        };

        test('Should create a new attribute', async function() {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([docAttrData])
            };

            const mockCleanupRes = attrData;
            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue(mockCleanupRes),
                convertToDoc: jest.fn().mockReturnValue(docAttrData)
            };

            const attrRepo = attributeRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const createdAttr = await attrRepo.createAttribute({attrData, ctx});
            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/^INSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(createdAttr).toMatchObject(attrData);
        });
    });

    describe('deleteAttribute', () => {
        const attrData = {
            id: 'test_attribute',
            system: false,
            label: {fr: 'Test'},
            format: AttributeFormats.TEXT,
            type: AttributeTypes.SIMPLE
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
                execute: jest
                    .fn()
                    .mockReturnValueOnce([])
                    .mockReturnValueOnce(Promise.resolve([docAttrData]))
            };

            const mockCleanupRes = attrData;
            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue(attrData),
                convertToDoc: jest.fn().mockReturnValue(docAttrData)
            };

            const mockValueRepo: Mockify<IValueRepo> = {
                clearAllValues: jest.fn()
            };

            const attrRepo = attributeRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
                'core.infra.value': mockValueRepo as IValueRepo
            });
            attrRepo.getAttributes = global.__mockPromise([attrData]);

            const deleteRes = await attrRepo.deleteAttribute({attrData, ctx});

            expect(mockDbServ.execute.mock.calls.length).toBe(2);

            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(typeof mockDbServ.execute.mock.calls[1][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatch(/^REMOVE/);
            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[1][0].query.bindVars).toMatchSnapshot();
        });
    });
});
