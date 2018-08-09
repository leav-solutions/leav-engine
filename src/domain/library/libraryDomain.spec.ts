import {AttributeTypes} from '../../_types/attribute';
import ValidationError from '../../errors/ValidationError';
import {IAttributeDomain} from '../attribute/attributeDomain';
import libraryDomain from './libraryDomain';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {PermissionsRelations} from '../../_types/permissions';

describe('LibraryDomain', () => {
    const mockAttrDomain: Mockify<IAttributeDomain> = {
        getAttributes: global.__mockPromise([
            {id: 'id', type: AttributeTypes.SIMPLE},
            {id: 'created_at', type: AttributeTypes.SIMPLE},
            {id: 'created_by', type: AttributeTypes.SIMPLE},
            {id: 'modified_at', type: AttributeTypes.SIMPLE},
            {id: 'modified_by', type: AttributeTypes.SIMPLE},
            {id: 'attr1', type: AttributeTypes.SIMPLE},
            {id: 'attr2', type: AttributeTypes.SIMPLE}
        ])
    };

    describe('getLibraries', () => {
        test('Should return a list of libs', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise([{id: 'test'}, {id: 'test2'}]),
                getLibraryAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([{id: 'attr1'}, {id: 'attr2'}]))
            };

            const libDomain = libraryDomain(mockLibRepo as ILibraryRepo);
            const lib = await libDomain.getLibraries();

            expect(mockLibRepo.getLibraries.mock.calls.length).toBe(1);
            expect(mockLibRepo.getLibraryAttributes.mock.calls.length).toBe(2);
            expect(lib.length).toBe(2);

            expect(lib[0].attributes).toBeDefined();
        });
    });

    describe('getLibraryProperties', () => {
        test('Should return library properties', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise([{id: 'test', system: true}])
            };

            const libDomain = libraryDomain(mockLibRepo as ILibraryRepo);
            const lib = await libDomain.getLibraryProperties('test');

            expect(mockLibRepo.getLibraries.mock.calls.length).toBe(1);
            expect(mockLibRepo.getLibraries).toBeCalledWith({id: 'test'});
            expect(lib).toMatchObject({id: 'test', system: true});
        });

        test('Should throw if unknown library', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise([])
            };

            const libDomain = libraryDomain(mockLibRepo as ILibraryRepo);

            await expect(libDomain.getLibraryProperties('test')).rejects.toThrow();
        });
    });

    describe('saveLibrary', () => {
        test('Should save a new library', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise([]),
                createLibrary: global.__mockPromise({id: 'test', system: false}),
                updateLibrary: jest.fn(),
                saveLibraryAttributes: jest.fn()
            };

            const libDomain = libraryDomain(mockLibRepo as ILibraryRepo, mockAttrDomain as IAttributeDomain);

            const newLib = await libDomain.saveLibrary({id: 'test'});

            expect(mockLibRepo.createLibrary.mock.calls.length).toBe(1);
            expect(mockLibRepo.updateLibrary.mock.calls.length).toBe(0);
            expect(mockLibRepo.saveLibraryAttributes.mock.calls.length).toBe(1);

            expect(newLib).toMatchObject({id: 'test', system: false});
        });

        test('Should update a library', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise([{id: 'test', system: false}]),
                createLibrary: jest.fn(),
                updateLibrary: global.__mockPromise({id: 'test', system: false}),
                saveLibraryAttributes: jest.fn()
            };

            const libDomain = libraryDomain(mockLibRepo as ILibraryRepo, mockAttrDomain as IAttributeDomain);

            const updatedLib = await libDomain.saveLibrary({id: 'test'});

            expect(mockLibRepo.createLibrary.mock.calls.length).toBe(0);
            expect(mockLibRepo.updateLibrary.mock.calls.length).toBe(1);
            expect(mockLibRepo.saveLibraryAttributes.mock.calls.length).toBe(0);

            expect(updatedLib).toMatchObject({id: 'test', system: false});
        });

        test('Should update library attributes', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise([{id: 'test', system: false}]),
                createLibrary: jest.fn(),
                updateLibrary: global.__mockPromise({id: 'test', system: false}),
                saveLibraryAttributes: jest.fn()
            };

            const libDomain = libraryDomain(mockLibRepo as ILibraryRepo, mockAttrDomain as IAttributeDomain);

            const updatedLib = await libDomain.saveLibrary({
                id: 'test',
                attributes: [{id: 'attr1', type: AttributeTypes.SIMPLE}, {id: 'attr2', type: AttributeTypes.SIMPLE}]
            });

            expect(mockLibRepo.updateLibrary.mock.calls.length).toBe(1);
            expect(mockLibRepo.saveLibraryAttributes.mock.calls.length).toBe(1);
            expect(mockLibRepo.saveLibraryAttributes.mock.calls[0][0]).toEqual('test');
            expect(mockLibRepo.saveLibraryAttributes.mock.calls[0][1]).toEqual(['attr1', 'attr2']);

            expect(updatedLib).toMatchObject({id: 'test', system: false});
        });

        test('Should throw if unknown attributes', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise([{id: 'test', system: false}]),
                createLibrary: jest.fn(),
                updateLibrary: global.__mockPromise({id: 'test', system: false}),
                saveLibraryAttributes: jest.fn()
            };

            const libDomain = libraryDomain(mockLibRepo as ILibraryRepo, mockAttrDomain as IAttributeDomain);

            await expect(
                libDomain.saveLibrary({
                    id: 'test',
                    attributes: [{id: 'attr3', type: AttributeTypes.SIMPLE}, {id: 'attr4', type: AttributeTypes.SIMPLE}]
                })
            ).rejects.toThrow(ValidationError);

            expect(mockLibRepo.updateLibrary.mock.calls.length).toBe(0);
            expect(mockLibRepo.saveLibraryAttributes.mock.calls.length).toBe(0);
        });

        test('Should throw if unknown trees in permissions conf', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise([{id: 'test', system: false}]),
                createLibrary: jest.fn(),
                updateLibrary: global.__mockPromise({id: 'test', system: false}),
                saveLibraryAttributes: jest.fn()
            };

            const mockTreeRepo: Mockify<ITreeRepo> = {
                getTrees: global.__mockPromise([])
            };

            const libDomain = libraryDomain(
                mockLibRepo as ILibraryRepo,
                mockAttrDomain as IAttributeDomain,
                mockTreeRepo as ITreeRepo
            );

            await expect(
                libDomain.saveLibrary({
                    id: 'test',
                    attributes: [{id: 'attr1', type: AttributeTypes.SIMPLE}],
                    permissionsConf: {trees: ['unknownTree'], relation: PermissionsRelations.AND}
                })
            ).rejects.toThrow(ValidationError);

            expect(mockLibRepo.updateLibrary.mock.calls.length).toBe(0);
        });
    });

    describe('deleteLibrary', () => {
        const libData = {id: 'test_lib', system: false, label: {fr: 'Test'}};

        test('Should delete an library and return deleted library', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {deleteLibrary: global.__mockPromise(libData)};
            const libDomain = libraryDomain(mockLibRepo as ILibraryRepo);
            libDomain.getLibraries = global.__mockPromise([libData]);

            const deleteRes = await libDomain.deleteLibrary(libData.id);

            expect(mockLibRepo.deleteLibrary.mock.calls.length).toBe(1);
        });

        test('Should throw if unknown library', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {deleteLibrary: global.__mockPromise()};
            const libDomain = libraryDomain(mockLibRepo as ILibraryRepo);
            libDomain.getLibraries = global.__mockPromise([]);

            await expect(libDomain.deleteLibrary(libData.id)).rejects.toThrow();
        });

        test('Should throw if system library', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {deleteLibrary: global.__mockPromise()};
            const libDomain = libraryDomain(mockLibRepo as ILibraryRepo);
            libDomain.getLibraries = global.__mockPromise([{system: true}]);

            await expect(libDomain.deleteLibrary(libData.id)).rejects.toThrow();
        });
    });
});
