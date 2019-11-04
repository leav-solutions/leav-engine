import {Database} from 'arangojs';
import {AttributeTypes} from '../../_types/attribute';
import {IAttributeRepo} from '../attribute/attributeRepo';
import {IDbUtils} from '../db/dbUtils';
import libraryRepo from './libraryRepo';

describe('LibraryRepo', () => {
    describe('getLibrary', () => {
        test('Should return all libs if no filter', async function() {
            const mockDbServ = {db: null, execute: global.__mockPromise([])};
            const mockDbUtils: Mockify<IDbUtils> = {
                findCoreEntity: global.__mockPromise([
                    {
                        id: 'users',
                        system: false,
                        label: {
                            fr: 'users'
                        }
                    }
                ])
            };

            const repo = libraryRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const trees = await repo.getLibraries();

            expect(mockDbUtils.findCoreEntity.mock.calls.length).toBe(1);
            expect(trees).toEqual([
                {
                    id: 'users',
                    system: false,
                    label: {
                        fr: 'users'
                    }
                }
            ]);
        });
    });

    describe('createLibrary', () => {
        const docLibData = {
            _key: 'test_library',
            system: true,
            attributes: [{id: 'id', type: AttributeTypes.SIMPLE}, {id: 'created_by', type: AttributeTypes.SIMPLE}]
        };
        const libData = {
            id: 'test_library',
            system: true,
            attributes: [{id: 'id', type: AttributeTypes.SIMPLE}, {id: 'created_by', type: AttributeTypes.SIMPLE}]
        };
        test('Should insert a library and create a new collection', async function() {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([docLibData]),
                createCollection: global.__mockPromise()
            };

            const mockCleanupRes = libData;
            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue(mockCleanupRes),
                convertToDoc: jest.fn().mockReturnValue(docLibData)
            };

            const libRepo = libraryRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const createdLib = await libRepo.createLibrary(libData);
            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(mockDbServ.createCollection.mock.calls.length).toBe(1);

            // First call is to insert library
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/^INSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();

            expect(createdLib).toMatchObject(libData);
        });
    });

    describe('updateLibrary', () => {
        const docLibData = {_key: 'test_library', system: true};
        const libData = {id: 'test_library', system: true};
        test('Should update library', async function() {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([docLibData])
            };

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue(libData),
                convertToDoc: jest.fn().mockReturnValue(docLibData)
            };

            const libRepo = libraryRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const updatedLib = await libRepo.updateLibrary(libData);

            expect(mockDbServ.execute.mock.calls.length).toBe(1);

            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/^UPDATE/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();

            expect(updatedLib).toMatchObject(libData);
        });
    });

    describe('deleteLibrary', () => {
        const libData = {id: 'test_lib', system: false, label: {fr: 'Test'}};

        const docLibData = {
            _key: 'test_lib',
            _id: 'core_libraries/test_lib',
            _rev: '_WSgDYea--_',
            label: {en: 'Test', fr: 'Test'},
            system: false
        };

        test('Should delete a library and return deleted library', async function() {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({
                    list: [{id: 'attr1', type: AttributeTypes.SIMPLE}, {id: 'attr2', type: AttributeTypes.SIMPLE}],
                    totalCount: 0
                }),
                deleteAttribute: global.__mockPromise({})
            };

            const mockDbServ = {
                db: new Database(),
                dropCollection: global.__mockPromise(),
                execute: global.__mockPromiseMultiple([[], [docLibData]])
            };

            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest.fn().mockReturnValue(libData),
                convertToDoc: jest.fn().mockReturnValue(docLibData)
            };

            const libRepo = libraryRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
                'core.infra.attribute': mockAttrRepo as IAttributeRepo
            });
            libRepo.getLibraries = global.__mockPromise([libData]);

            await libRepo.deleteLibrary(libData.id);

            expect(mockAttrRepo.getAttributes.mock.calls.length).toBe(1);
            expect(mockAttrRepo.deleteAttribute.mock.calls.length).toBe(2);

            expect(mockDbServ.dropCollection.mock.calls.length).toBe(1);
            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/^REMOVE/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();
        });
    });

    describe('saveLibraryAttributes', () => {
        test('Should link attributes to a library and return linked attributes', async function() {
            const mockQueryRes = [
                {
                    _key: '222400216',
                    _id: 'core_edge_libraries_attributes/222400216',
                    _from: 'core_libraries/users',
                    _to: 'core_attributes/id',
                    _rev: '_WSse-um--_'
                },
                {
                    _key: '222400220',
                    _id: 'core_edge_libraries_attributes/222400220',
                    _from: 'core_libraries/users',
                    _to: 'core_attributes/my_attr',
                    _rev: '_WSse-um--B'
                }
            ];
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(mockQueryRes)
            };

            const libRepo = libraryRepo({'core.infra.db.dbService': mockDbServ});
            libRepo.getLibraryAttributes = global.__mockPromise([
                {
                    id: 'id',
                    format: 'text',
                    label: {en: 'ID'},
                    system: true,
                    type: 'link'
                },
                {
                    id: 'other_attr',
                    format: 'numeric',
                    label: {en: 'Attr'},
                    system: false,
                    type: 'index'
                },
                {
                    id: 'created_at',
                    format: 'numeric',
                    label: {en: 'Modification date'},
                    system: true,
                    type: 'index'
                }
            ]);

            const createdAttrs = await libRepo.saveLibraryAttributes('users', ['id', 'my_attr']);
            expect(mockDbServ.execute.mock.calls.length).toBe(2);

            // First call is to delete unused attributes
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/FOR attr/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/REMOVE/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();

            // Second call is to save new attributes
            expect(typeof mockDbServ.execute.mock.calls[1][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[1][0].query).toMatch(/FOR attr/);
            expect(mockDbServ.execute.mock.calls[1][0].query).toMatch(/UPSERT/);
            expect(mockDbServ.execute.mock.calls[1][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[1][0].bindVars).toMatchSnapshot();

            expect(createdAttrs).toEqual(['id', 'my_attr']);
        });
    });

    describe('getLibraryAttributes', () => {
        test('Should get library attributes through graph query', async function() {
            const mockQueryRes = [
                {
                    _key: 'modified_by',
                    _id: 'core_attributes/modified_by',
                    _rev: '_WSfp4UC--_',
                    format: 'text',
                    label: {en: 'Modified by', fr: 'Modifié par'},
                    system: true,
                    type: 'link'
                },
                {
                    _key: 'modified_at',
                    _id: 'core_attributes/modified_at',
                    _rev: '_WSfp4UG--_',
                    format: 'numeric',
                    label: {en: 'Modification date', fr: 'Date de modification'},
                    system: true,
                    type: 'index'
                }
            ];
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(mockQueryRes)
            };

            const mockCleanupRes = [
                {
                    id: 'modified_by',
                    format: 'text',
                    label: {en: 'Modified by', fr: 'Modifié par'},
                    system: true,
                    type: 'link'
                },
                {
                    id: 'modified_at',
                    format: 'numeric',
                    label: {en: 'Modification date', fr: 'Date de modification'},
                    system: true,
                    type: 'index'
                }
            ];
            const mockDbUtils: Mockify<IDbUtils> = {
                cleanup: jest
                    .fn()
                    .mockReturnValueOnce(mockCleanupRes[0])
                    .mockReturnValueOnce(mockCleanupRes[1])
            };

            const libRepo = libraryRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils
            });

            const libAttrs = await libRepo.getLibraryAttributes('users');
            expect(mockDbServ.execute.mock.calls.length).toBe(1);

            // First call is to insert library
            expect(mockDbServ.execute.mock.calls[0][0]).toMatch(/IN 1 OUTBOUND/);
            expect(mockDbServ.execute.mock.calls[0][0]).toMatchSnapshot();

            expect(libAttrs).toEqual(mockCleanupRes);
        });
    });
});
