import {ILibraryRepo} from 'infra/library/libraryRepo';
import {IUtils} from 'utils/utils';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {AttributeTypes} from '../../_types/attribute';
import {AdminPermissionsActions, PermissionsRelations} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IPermissionDomain} from '../permission/permissionDomain';
import libraryDomain from './libraryDomain';

describe('LibraryDomain', () => {
    const queryInfos = {userId: 1};
    const mockAttrDomain: Mockify<IAttributeDomain> = {
        getAttributes: global.__mockPromise({
            list: [
                {id: 'id', type: AttributeTypes.SIMPLE},
                {id: 'created_at', type: AttributeTypes.SIMPLE},
                {id: 'created_by', type: AttributeTypes.SIMPLE},
                {id: 'modified_at', type: AttributeTypes.SIMPLE},
                {id: 'modified_by', type: AttributeTypes.SIMPLE},
                {id: 'attr1', type: AttributeTypes.SIMPLE},
                {id: 'attr2', type: AttributeTypes.SIMPLE}
            ],
            totalCount: 0
        })
    };

    describe('getLibraries', () => {
        test('Should return a list of libs', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({list: [{id: 'test'}, {id: 'test2'}], totalCount: 2}),
                getLibraryAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([{id: 'attr1'}, {id: 'attr2'}]))
            };

            const libDomain = libraryDomain(mockLibRepo as ILibraryRepo);
            const lib = await libDomain.getLibraries({}, true);

            expect(mockLibRepo.getLibraries.mock.calls.length).toBe(1);
            expect(mockLibRepo.getLibraryAttributes.mock.calls.length).toBe(2);
            expect(lib.totalCount).toBe(2);

            expect(lib.list[0].attributes).toBeDefined();
        });
    });

    describe('getLibraryProperties', () => {
        test('Should return library properties', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({list: [{id: 'test', system: true}], totalCount: 0})
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

    describe('getLibraryAttributes', () => {
        test('Should return library attributes with all details', async () => {
            const attrs = [
                {
                    id: 'id',
                    format: 'text',
                    label: {en: 'ID'},
                    system: true,
                    type: 'link'
                },
                {
                    id: 'created_at',
                    format: 'numeric',
                    label: {en: 'Creation date'},
                    system: true,
                    type: 'index'
                },
                {
                    id: 'modified_at',
                    format: 'numeric',
                    label: {en: 'Modification date'},
                    system: true,
                    type: 'index'
                }
            ];

            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraryAttributes: global.__mockPromise(attrs),
                getLibraries: global.__mockPromise({list: [{id: 'test', system: true}], totalCount: 0})
            };

            const libDomain = libraryDomain(mockLibRepo as ILibraryRepo);
            const libAttrs = await libDomain.getLibraryAttributes('test');

            expect(mockLibRepo.getLibraryAttributes.mock.calls.length).toBe(1);
            expect(mockLibRepo.getLibraryAttributes).toBeCalledWith('test');
            expect(libAttrs).toEqual(attrs);
        });

        test('Should throw if unknown library', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise([])
            };

            const libDomain = libraryDomain(mockLibRepo as ILibraryRepo);

            await expect(libDomain.getLibraryAttributes('test')).rejects.toThrow();
        });
    });

    describe('saveLibrary', () => {
        const mockUtils: Mockify<IUtils> = {
            validateID: jest.fn().mockReturnValue(true)
        };

        test('Should save a new library', async function() {
            const mockAdminPermDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(true)
            };

            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({list: [], totalCount: 0}),
                createLibrary: global.__mockPromise({id: 'test', system: false}),
                updateLibrary: jest.fn(),
                saveLibraryAttributes: jest.fn()
            };

            const libDomain = libraryDomain(
                mockLibRepo as ILibraryRepo,
                mockAttrDomain as IAttributeDomain,
                mockAdminPermDomain as IPermissionDomain,
                mockUtils as IUtils
            );

            const newLib = await libDomain.saveLibrary({id: 'test'}, queryInfos);

            expect(mockLibRepo.createLibrary.mock.calls.length).toBe(1);
            expect(mockLibRepo.updateLibrary.mock.calls.length).toBe(0);
            expect(mockLibRepo.saveLibraryAttributes.mock.calls.length).toBe(1);

            expect(newLib).toMatchObject({id: 'test', system: false});

            expect(mockAdminPermDomain.getAdminPermission).toBeCalled();
            expect(mockAdminPermDomain.getAdminPermission.mock.calls[0][0]).toBe(
                AdminPermissionsActions.CREATE_LIBRARY
            );
        });

        test('Should update a library', async function() {
            const mockAdminPermDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(true)
            };

            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                createLibrary: jest.fn(),
                updateLibrary: global.__mockPromise({id: 'test', system: false}),
                saveLibraryAttributes: jest.fn()
            };

            const libDomain = libraryDomain(
                mockLibRepo as ILibraryRepo,
                mockAttrDomain as IAttributeDomain,
                mockAdminPermDomain as IPermissionDomain,
                mockUtils as IUtils
            );

            const updatedLib = await libDomain.saveLibrary({id: 'test'}, queryInfos);

            expect(mockLibRepo.createLibrary.mock.calls.length).toBe(0);
            expect(mockLibRepo.updateLibrary.mock.calls.length).toBe(1);
            expect(mockLibRepo.saveLibraryAttributes.mock.calls.length).toBe(0);

            expect(updatedLib).toMatchObject({id: 'test', system: false});

            expect(mockAdminPermDomain.getAdminPermission).toBeCalled();
            expect(mockAdminPermDomain.getAdminPermission.mock.calls[0][0]).toBe(AdminPermissionsActions.EDIT_LIBRARY);
        });

        test('Should update library attributes', async function() {
            const mockAdminPermDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(true)
            };

            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                createLibrary: jest.fn(),
                updateLibrary: global.__mockPromise({id: 'test', system: false}),
                saveLibraryAttributes: jest.fn()
            };

            const libDomain = libraryDomain(
                mockLibRepo as ILibraryRepo,
                mockAttrDomain as IAttributeDomain,
                mockAdminPermDomain as IPermissionDomain,
                mockUtils as IUtils
            );

            const updatedLib = await libDomain.saveLibrary(
                {
                    id: 'test',
                    attributes: [{id: 'attr1', type: AttributeTypes.SIMPLE}, {id: 'attr2', type: AttributeTypes.SIMPLE}]
                },
                queryInfos
            );

            expect(mockLibRepo.updateLibrary.mock.calls.length).toBe(1);
            expect(mockLibRepo.saveLibraryAttributes.mock.calls.length).toBe(1);
            expect(mockLibRepo.saveLibraryAttributes.mock.calls[0][0]).toEqual('test');
            expect(mockLibRepo.saveLibraryAttributes.mock.calls[0][1]).toEqual(['attr1', 'attr2']);

            expect(updatedLib).toMatchObject({id: 'test', system: false});

            expect(mockAdminPermDomain.getAdminPermission).toBeCalled();
            expect(mockAdminPermDomain.getAdminPermission.mock.calls[0][0]).toBe(AdminPermissionsActions.EDIT_LIBRARY);
        });

        test('Should throw if unknown attributes', async function() {
            const mockAdminPermDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(true)
            };

            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                createLibrary: jest.fn(),
                updateLibrary: global.__mockPromise({id: 'test', system: false}),
                saveLibraryAttributes: jest.fn()
            };

            const libDomain = libraryDomain(
                mockLibRepo as ILibraryRepo,
                mockAttrDomain as IAttributeDomain,
                mockAdminPermDomain as IPermissionDomain,
                mockUtils as IUtils
            );

            await expect(
                libDomain.saveLibrary(
                    {
                        id: 'test',
                        attributes: [
                            {id: 'attr3', type: AttributeTypes.SIMPLE},
                            {id: 'attr4', type: AttributeTypes.SIMPLE}
                        ]
                    },
                    queryInfos
                )
            ).rejects.toThrow(ValidationError);

            expect(mockLibRepo.updateLibrary.mock.calls.length).toBe(0);
            expect(mockLibRepo.saveLibraryAttributes.mock.calls.length).toBe(0);
        });

        test('Should throw if unknown trees attributes in permissions conf', async function() {
            const mockAdminPermDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(true)
            };

            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                createLibrary: jest.fn(),
                updateLibrary: global.__mockPromise({id: 'test', system: false}),
                saveLibraryAttributes: jest.fn()
            };

            const libDomain = libraryDomain(
                mockLibRepo as ILibraryRepo,
                mockAttrDomain as IAttributeDomain,
                mockAdminPermDomain as IPermissionDomain,
                mockUtils as IUtils
            );

            await expect(
                libDomain.saveLibrary(
                    {
                        id: 'test',
                        attributes: [{id: 'attr1', type: AttributeTypes.SIMPLE}],
                        permissions_conf: {
                            permissionTreeAttributes: ['unknownTree'],
                            relation: PermissionsRelations.AND
                        }
                    },
                    queryInfos
                )
            ).rejects.toThrow(ValidationError);

            expect(mockLibRepo.updateLibrary.mock.calls.length).toBe(0);
        });

        test('Should throw if attributes in recordIdentity are not binded to library', async function() {
            const mockAdminPermDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(true)
            };

            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                createLibrary: jest.fn(),
                updateLibrary: global.__mockPromise({id: 'test', system: false}),
                saveLibraryAttributes: jest.fn(),
                getLibraryAttributes: global.__mockPromise([{id: 'attr1', type: AttributeTypes.SIMPLE}])
            };

            const libDomain = libraryDomain(
                mockLibRepo as ILibraryRepo,
                mockAttrDomain as IAttributeDomain,
                mockAdminPermDomain as IPermissionDomain,
                mockUtils as IUtils
            );

            await expect(
                libDomain.saveLibrary(
                    {
                        id: 'test',
                        recordIdentityConf: {label: 'unknownAttribute'}
                    },
                    queryInfos
                )
            ).rejects.toThrow(ValidationError);

            expect(mockLibRepo.updateLibrary.mock.calls.length).toBe(0);
        });

        test('Should throw if forbidden action', async function() {
            const mockAdminPermDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(false)
            };

            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                createLibrary: jest.fn(),
                updateLibrary: global.__mockPromise({id: 'test', system: false}),
                saveLibraryAttributes: jest.fn()
            };

            const libDomain = libraryDomain(
                mockLibRepo as ILibraryRepo,
                mockAttrDomain as IAttributeDomain,
                mockAdminPermDomain as IPermissionDomain,
                mockUtils as IUtils
            );

            await expect(libDomain.saveLibrary({id: 'test'}, queryInfos)).rejects.toThrow(PermissionError);
        });

        test('Should throw if invalid ID', async function() {
            const mockAdminPermDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(true)
            };

            const mockUtilsInvalidID: Mockify<IUtils> = {
                validateID: jest.fn().mockReturnValue(false)
            };

            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                createLibrary: jest.fn(),
                updateLibrary: global.__mockPromise({id: 'test', system: false}),
                saveLibraryAttributes: jest.fn()
            };

            const libDomain = libraryDomain(
                mockLibRepo as ILibraryRepo,
                mockAttrDomain as IAttributeDomain,
                mockAdminPermDomain as IPermissionDomain,
                mockUtilsInvalidID as IUtils
            );

            await expect(libDomain.saveLibrary({id: 'test'}, queryInfos)).rejects.toThrow(ValidationError);
        });
    });

    describe('deleteLibrary', () => {
        const libData = {id: 'test_lib', system: false, label: {fr: 'Test'}};

        test('Should delete an library and return deleted library', async function() {
            const mockAdminPermDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(true)
            };

            const mockLibRepo: Mockify<ILibraryRepo> = {deleteLibrary: global.__mockPromise(libData)};
            const libDomain = libraryDomain(
                mockLibRepo as ILibraryRepo,
                null,
                mockAdminPermDomain as IPermissionDomain
            );
            libDomain.getLibraries = global.__mockPromise({list: [libData], totalCount: 1});

            const deleteRes = await libDomain.deleteLibrary(libData.id, queryInfos);

            expect(mockLibRepo.deleteLibrary.mock.calls.length).toBe(1);

            expect(mockAdminPermDomain.getAdminPermission).toBeCalled();
            expect(mockAdminPermDomain.getAdminPermission.mock.calls[0][0]).toBe(
                AdminPermissionsActions.DELETE_LIBRARY
            );
        });

        test('Should throw if unknown library', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {deleteLibrary: global.__mockPromise()};
            const libDomain = libraryDomain(mockLibRepo as ILibraryRepo);
            libDomain.getLibraries = global.__mockPromise([]);

            await expect(libDomain.deleteLibrary(libData.id, queryInfos)).rejects.toThrow();
        });

        test('Should throw if system library', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {deleteLibrary: global.__mockPromise()};
            const libDomain = libraryDomain(mockLibRepo as ILibraryRepo);
            libDomain.getLibraries = global.__mockPromise([{system: true}]);

            await expect(libDomain.deleteLibrary(libData.id, queryInfos)).rejects.toThrow();
        });

        test('Should throw if forbidden action', async function() {
            const mockAdminPermDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(false)
            };

            const mockLibRepo: Mockify<ILibraryRepo> = {deleteLibrary: global.__mockPromise(libData)};
            const libDomain = libraryDomain(
                mockLibRepo as ILibraryRepo,
                null,
                mockAdminPermDomain as IPermissionDomain
            );
            libDomain.getLibraries = global.__mockPromise([libData]);

            await expect(libDomain.deleteLibrary(libData.id, queryInfos)).rejects.toThrow(PermissionError);
        });
    });
});
