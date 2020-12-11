// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAppPermissionDomain} from 'domain/permission/appPermissionDomain';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {AttributeTypes} from '../../_types/attribute';
import {LibraryBehavior} from '../../_types/library';
import {AppPermissionsActions, PermissionsRelations} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import libraryDomain from './libraryDomain';
import getDefaultAttributes from '../../utils/helpers/getLibraryDefaultAttributes';
import * as Config from '_types/config';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IRecordDomain} from 'domain/record/recordDomain';

const eventsManagerMockConfig: Mockify<Config.IEventsManager> = {routingKeys: {events: 'test.database.event'}};

const mockConfig: Mockify<Config.IConfig> = {
    eventsManager: eventsManagerMockConfig as Config.IEventsManager
};

describe('LibraryDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'libraryDomainTest'
    };

    const mockAppPermDomain: Mockify<IAppPermissionDomain> = {
        getAppPermission: global.__mockPromise(true)
    };

    const mockAppPermForbiddenDomain: Mockify<IAppPermissionDomain> = {
        getAppPermission: global.__mockPromise(false)
    };

    const mockTreeRepo: Mockify<ITreeRepo> = {
        createTree: jest.fn(),
        deleteTree: jest.fn()
    };

    beforeEach(() => jest.clearAllMocks());

    describe('getLibraries', () => {
        test('Should return a list of libs', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({list: [{id: 'test'}, {id: 'test2'}], totalCount: 2})
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getLibraryAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([{id: 'attr1'}, {id: 'attr2'}])),
                getLibraryFullTextAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([{id: 'attr1'}]))
            };

            const libDomain = libraryDomain({
                'core.infra.library': mockLibRepo as ILibraryRepo,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain
            });

            const lib = await libDomain.getLibraries({
                params: {withCount: true},
                ctx
            });

            expect(mockLibRepo.getLibraries.mock.calls.length).toBe(1);
            expect(mockAttrDomain.getLibraryAttributes.mock.calls.length).toBe(2);
            expect(mockAttrDomain.getLibraryFullTextAttributes.mock.calls.length).toBe(2);
            expect(lib.totalCount).toBe(2);

            expect(lib.list[0].attributes).toBeDefined();
        });

        test('Should add default sort', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({list: [{id: 'test'}, {id: 'test2'}], totalCount: 2})
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getLibraryAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([{id: 'attr1'}, {id: 'attr2'}])),
                getLibraryFullTextAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([{id: 'attr1'}]))
            };

            const libDomain = libraryDomain({
                'core.infra.library': mockLibRepo as ILibraryRepo,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain
            });

            const lib = await libDomain.getLibraries({params: {withCount: true}, ctx});
            expect(mockLibRepo.getLibraries.mock.calls[0][0].params.sort).toMatchObject({field: 'id', order: 'asc'});
        });
    });

    describe('getLibraryProperties', () => {
        test('Should return library properties', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({list: [{id: 'test', system: true}], totalCount: 0})
            };

            const libDomain = libraryDomain({'core.infra.library': mockLibRepo as ILibraryRepo});
            const lib = await libDomain.getLibraryProperties('test', ctx);

            expect(mockLibRepo.getLibraries.mock.calls.length).toBe(1);
            expect(mockLibRepo.getLibraries).toBeCalledWith({
                params: {filters: {id: 'test'}, strictFilters: true},
                ctx: expect.anything()
            });
            expect(lib).toMatchObject({id: 'test', system: true});
        });

        test('Should throw if unknown library', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise([])
            };
            const libDomain = libraryDomain({'core.infra.library': mockLibRepo as ILibraryRepo});

            await expect(libDomain.getLibraryProperties('test', ctx)).rejects.toThrow();
        });
    });

    describe('saveLibrary', () => {
        const mockUtils: Mockify<IUtils> = {
            validateID: jest.fn().mockReturnValue(true),
            getLibraryTreeId: jest.fn().mockReturnValue({})
        };

        describe('Create library', () => {
            test('Should save a new library', async function() {
                const mockLibRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromise({list: [], totalCount: 0}),
                    createLibrary: global.__mockPromise({id: 'test', system: false}),
                    updateLibrary: jest.fn(),
                    saveLibraryAttributes: jest.fn(),
                    saveLibraryFullTextAttributes: jest.fn()
                };

                const mockEventsManager: Mockify<IEventsManagerDomain> = {
                    send: global.__mockPromise()
                };

                const mockAttrDomain: Mockify<IAttributeDomain> = {
                    getAttributes: global.__mockPromise({
                        list: [
                            {id: 'id', type: AttributeTypes.SIMPLE},
                            {id: 'created_at', type: AttributeTypes.SIMPLE},
                            {id: 'created_by', type: AttributeTypes.SIMPLE},
                            {id: 'modified_at', type: AttributeTypes.SIMPLE},
                            {id: 'modified_by', type: AttributeTypes.SIMPLE},
                            {id: 'active', type: AttributeTypes.SIMPLE},
                            {id: 'attr1', type: AttributeTypes.SIMPLE},
                            {id: 'attr2', type: AttributeTypes.SIMPLE},
                            {id: 'root_key', type: AttributeTypes.SIMPLE},
                            {id: 'is_directory', type: AttributeTypes.SIMPLE},
                            {id: 'file_path', type: AttributeTypes.SIMPLE}
                        ],
                        totalCount: 0
                    }),
                    getLibraryAttributes: jest
                        .fn()
                        .mockReturnValueOnce(Promise.resolve([{id: 'attr1'}, {id: 'attr2'}])),
                    getLibraryFullTextAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([{id: 'attr1'}]))
                };

                const libDomain = libraryDomain({
                    config: mockConfig as Config.IConfig,
                    'core.infra.library': mockLibRepo as ILibraryRepo,
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                    'core.utils': mockUtils as IUtils
                });

                const newLib = await libDomain.saveLibrary(
                    {
                        id: 'test',
                        attributes: [
                            {id: 'attr1', type: AttributeTypes.SIMPLE},
                            {id: 'attr2', type: AttributeTypes.SIMPLE}
                        ],
                        fullTextAttributes: [{id: 'id', type: AttributeTypes.SIMPLE}]
                    },
                    ctx
                );

                expect(mockLibRepo.createLibrary.mock.calls.length).toBe(1);
                expect(mockLibRepo.updateLibrary.mock.calls.length).toBe(0);
                expect(mockLibRepo.saveLibraryAttributes.mock.calls.length).toBe(1);
                expect(mockLibRepo.saveLibraryAttributes.mock.calls[0][0].attributes.includes('attr1')).toBe(true);
                expect(mockLibRepo.saveLibraryAttributes.mock.calls[0][0].attributes.includes('attr2')).toBe(true);

                expect(mockLibRepo.saveLibraryFullTextAttributes.mock.calls.length).toBe(1);
                expect(
                    mockLibRepo.saveLibraryFullTextAttributes.mock.calls[0][0].fullTextAttributes.includes('id')
                ).toBe(true);

                expect(newLib).toMatchObject({id: 'test', system: false});

                expect(mockAppPermDomain.getAppPermission).toBeCalled();
                expect(mockAppPermDomain.getAppPermission.mock.calls[0][0].action).toBe(
                    AppPermissionsActions.CREATE_LIBRARY
                );
            });

            test('Should throw if invalid ID', async function() {
                const mockUtilsInvalidID: Mockify<IUtils> = {
                    validateID: jest.fn().mockReturnValue(false)
                };

                const mockLibRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                    createLibrary: jest.fn(),
                    updateLibrary: global.__mockPromise({id: 'test', system: false}),
                    saveLibraryAttributes: jest.fn()
                };

                const mockEventsManager: Mockify<IEventsManagerDomain> = {
                    send: global.__mockPromise()
                };

                const mockAttrDomain: Mockify<IAttributeDomain> = {
                    getLibraryAttributes: jest
                        .fn()
                        .mockReturnValueOnce(Promise.resolve([{id: 'attr1'}, {id: 'attr2'}])),
                    getLibraryFullTextAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([{id: 'attr1'}]))
                };

                const libDomain = libraryDomain({
                    config: mockConfig as Config.IConfig,
                    'core.infra.library': mockLibRepo as ILibraryRepo,
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                    'core.utils': mockUtilsInvalidID as IUtils
                });

                await expect(libDomain.saveLibrary({id: 'test'}, ctx)).rejects.toThrow(ValidationError);
            });

            test('Save behavior specific attributes', async () => {
                const mockLibRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromise({list: [], totalCount: 0}),
                    createLibrary: global.__mockPromise({id: 'test', system: false}),
                    updateLibrary: jest.fn(),
                    saveLibraryAttributes: jest.fn(),
                    saveLibraryFullTextAttributes: jest.fn()
                };

                const mockEventsManager: Mockify<IEventsManagerDomain> = {
                    send: global.__mockPromise()
                };

                const mockAttrDomain: Mockify<IAttributeDomain> = {
                    getAttributes: global.__mockPromise({
                        list: [
                            {id: 'id', type: AttributeTypes.SIMPLE},
                            {id: 'created_at', type: AttributeTypes.SIMPLE},
                            {id: 'created_by', type: AttributeTypes.SIMPLE},
                            {id: 'modified_at', type: AttributeTypes.SIMPLE},
                            {id: 'modified_by', type: AttributeTypes.SIMPLE},
                            {id: 'active', type: AttributeTypes.SIMPLE},
                            {id: 'attr1', type: AttributeTypes.SIMPLE},
                            {id: 'attr2', type: AttributeTypes.SIMPLE},
                            {id: 'root_key', type: AttributeTypes.SIMPLE},
                            {id: 'is_directory', type: AttributeTypes.SIMPLE},
                            {id: 'file_path', type: AttributeTypes.SIMPLE}
                        ],
                        totalCount: 0
                    }),
                    getLibraryAttributes: jest
                        .fn()
                        .mockReturnValueOnce(Promise.resolve([{id: 'attr1'}, {id: 'attr2'}])),
                    getLibraryFullTextAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([{id: 'attr1'}]))
                };

                const libDomain = libraryDomain({
                    config: mockConfig as Config.IConfig,
                    'core.infra.library': mockLibRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                    'core.utils': mockUtils as IUtils,
                    'core.infra.tree': mockTreeRepo as ITreeRepo
                });

                await libDomain.saveLibrary(
                    {
                        id: 'test',
                        behavior: LibraryBehavior.FILES
                    },
                    ctx
                );
                expect(mockLibRepo.saveLibraryAttributes.mock.calls[0][0].attributes.includes('is_directory')).toBe(
                    true
                );
            });

            test('For FILES library, create linked tree', async () => {
                const mockLibRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromise({list: [], totalCount: 0}),
                    createLibrary: global.__mockPromise({id: 'test', system: false, behavior: LibraryBehavior.FILES}),
                    updateLibrary: jest.fn(),
                    saveLibraryAttributes: jest.fn(),
                    saveLibraryFullTextAttributes: jest.fn()
                };

                const mockEventsManager: Mockify<IEventsManagerDomain> = {
                    send: global.__mockPromise()
                };

                const mockAttrDomain: Mockify<IAttributeDomain> = {
                    getAttributes: global.__mockPromise({
                        list: [
                            {id: 'id', type: AttributeTypes.SIMPLE},
                            {id: 'created_at', type: AttributeTypes.SIMPLE},
                            {id: 'created_by', type: AttributeTypes.SIMPLE},
                            {id: 'modified_at', type: AttributeTypes.SIMPLE},
                            {id: 'modified_by', type: AttributeTypes.SIMPLE},
                            {id: 'active', type: AttributeTypes.SIMPLE},
                            {id: 'attr1', type: AttributeTypes.SIMPLE},
                            {id: 'attr2', type: AttributeTypes.SIMPLE},
                            {id: 'root_key', type: AttributeTypes.SIMPLE},
                            {id: 'is_directory', type: AttributeTypes.SIMPLE},
                            {id: 'file_path', type: AttributeTypes.SIMPLE}
                        ],
                        totalCount: 0
                    }),
                    getLibraryAttributes: jest
                        .fn()
                        .mockReturnValueOnce(Promise.resolve([{id: 'attr1'}, {id: 'attr2'}])),
                    getLibraryFullTextAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([{id: 'attr1'}]))
                };

                const libDomain = libraryDomain({
                    config: mockConfig as Config.IConfig,
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.infra.library': mockLibRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                    'core.utils': mockUtils as IUtils,
                    'core.infra.tree': mockTreeRepo as ITreeRepo
                });

                await libDomain.saveLibrary(
                    {
                        id: 'test',
                        behavior: LibraryBehavior.FILES
                    },
                    ctx
                );

                expect(mockTreeRepo.createTree).toBeCalled();
            });
        });

        describe('Update library', () => {
            test('Should update a library', async function() {
                const mockLibRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                    createLibrary: jest.fn(),
                    updateLibrary: global.__mockPromise({id: 'test', system: false}),
                    saveLibraryAttributes: jest.fn(),
                    saveLibraryFullTextAttributes: jest.fn()
                };

                const mockEventsManager: Mockify<IEventsManagerDomain> = {
                    send: global.__mockPromise()
                };

                const mockAttrDomain: Mockify<IAttributeDomain> = {
                    getAttributes: global.__mockPromise({
                        list: [
                            {id: 'id', type: AttributeTypes.SIMPLE},
                            {id: 'created_at', type: AttributeTypes.SIMPLE},
                            {id: 'created_by', type: AttributeTypes.SIMPLE},
                            {id: 'modified_at', type: AttributeTypes.SIMPLE},
                            {id: 'modified_by', type: AttributeTypes.SIMPLE},
                            {id: 'active', type: AttributeTypes.SIMPLE},
                            {id: 'attr1', type: AttributeTypes.SIMPLE},
                            {id: 'attr2', type: AttributeTypes.SIMPLE},
                            {id: 'root_key', type: AttributeTypes.SIMPLE},
                            {id: 'is_directory', type: AttributeTypes.SIMPLE},
                            {id: 'file_path', type: AttributeTypes.SIMPLE}
                        ],
                        totalCount: 0
                    }),
                    getLibraryAttributes: jest
                        .fn()
                        .mockReturnValueOnce(Promise.resolve([{id: 'attr1'}, {id: 'attr2'}])),
                    getLibraryFullTextAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([{id: 'attr1'}]))
                };

                const libDomain = libraryDomain({
                    config: mockConfig as Config.IConfig,
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.infra.library': mockLibRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                    'core.utils': mockUtils as IUtils
                });

                const updatedLib = await libDomain.saveLibrary({id: 'test'}, ctx);

                expect(mockLibRepo.createLibrary.mock.calls.length).toBe(0);
                expect(mockLibRepo.updateLibrary.mock.calls.length).toBe(1);
                expect(mockLibRepo.saveLibraryAttributes.mock.calls.length).toBe(1);

                expect(updatedLib).toMatchObject({id: 'test', system: false});

                expect(mockAppPermDomain.getAppPermission).toBeCalled();
                expect(mockAppPermDomain.getAppPermission.mock.calls[0][0].action).toBe(
                    AppPermissionsActions.EDIT_LIBRARY
                );
            });

            test('Should update library attributes', async function() {
                const mockLibRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                    createLibrary: jest.fn(),
                    updateLibrary: global.__mockPromise({id: 'test', system: false}),
                    saveLibraryAttributes: jest.fn(),
                    saveLibraryFullTextAttributes: jest.fn()
                };

                const mockEventsManager: Mockify<IEventsManagerDomain> = {
                    send: global.__mockPromise()
                };

                const mockAttrDomain: Mockify<IAttributeDomain> = {
                    getAttributes: global.__mockPromise({
                        list: [
                            {id: 'id', type: AttributeTypes.SIMPLE},
                            {id: 'created_at', type: AttributeTypes.SIMPLE},
                            {id: 'created_by', type: AttributeTypes.SIMPLE},
                            {id: 'modified_at', type: AttributeTypes.SIMPLE},
                            {id: 'modified_by', type: AttributeTypes.SIMPLE},
                            {id: 'active', type: AttributeTypes.SIMPLE},
                            {id: 'attr1', type: AttributeTypes.SIMPLE},
                            {id: 'attr2', type: AttributeTypes.SIMPLE},
                            {id: 'root_key', type: AttributeTypes.SIMPLE},
                            {id: 'is_directory', type: AttributeTypes.SIMPLE},
                            {id: 'file_path', type: AttributeTypes.SIMPLE}
                        ],
                        totalCount: 0
                    }),
                    getLibraryAttributes: jest
                        .fn()
                        .mockReturnValueOnce(Promise.resolve([{id: 'attr1'}, {id: 'attr2'}])),
                    getLibraryFullTextAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([{id: 'attr1'}]))
                };

                const libDomain = libraryDomain({
                    config: mockConfig as Config.IConfig,
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.infra.library': mockLibRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                    'core.utils': mockUtils as IUtils
                });

                const updatedLib = await libDomain.saveLibrary(
                    {
                        id: 'test',
                        attributes: [
                            {id: 'attr1', type: AttributeTypes.SIMPLE},
                            {id: 'attr2', type: AttributeTypes.SIMPLE}
                        ]
                    },
                    ctx
                );

                const defaultAttributes = getDefaultAttributes(updatedLib.behavior, updatedLib.id);

                expect(mockLibRepo.updateLibrary.mock.calls.length).toBe(1);
                expect(mockLibRepo.saveLibraryAttributes.mock.calls.length).toBe(1);
                expect(mockLibRepo.saveLibraryAttributes.mock.calls[0][0].libId).toEqual('test');
                expect(mockLibRepo.saveLibraryAttributes.mock.calls[0][0].attributes).toEqual(
                    defaultAttributes.concat(['attr1', 'attr2'])
                );

                expect(updatedLib).toMatchObject({id: 'test', system: false});

                expect(mockAppPermDomain.getAppPermission).toBeCalled();
                expect(mockAppPermDomain.getAppPermission.mock.calls[0][0].action).toBe(
                    AppPermissionsActions.EDIT_LIBRARY
                );
            });

            test('Should throw if unknown attributes', async function() {
                const mockLibRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                    createLibrary: jest.fn(),
                    updateLibrary: global.__mockPromise({id: 'test', system: false}),
                    saveLibraryAttributes: jest.fn(),
                    saveLibraryFullTextAttributes: jest.fn()
                };

                const mockEventsManager: Mockify<IEventsManagerDomain> = {
                    send: global.__mockPromise()
                };

                const mockAttrDomain: Mockify<IAttributeDomain> = {
                    getAttributes: global.__mockPromise({
                        list: [
                            {id: 'id', type: AttributeTypes.SIMPLE},
                            {id: 'created_at', type: AttributeTypes.SIMPLE},
                            {id: 'created_by', type: AttributeTypes.SIMPLE},
                            {id: 'modified_at', type: AttributeTypes.SIMPLE},
                            {id: 'modified_by', type: AttributeTypes.SIMPLE},
                            {id: 'active', type: AttributeTypes.SIMPLE},
                            {id: 'attr1', type: AttributeTypes.SIMPLE},
                            {id: 'attr2', type: AttributeTypes.SIMPLE},
                            {id: 'root_key', type: AttributeTypes.SIMPLE},
                            {id: 'is_directory', type: AttributeTypes.SIMPLE},
                            {id: 'file_path', type: AttributeTypes.SIMPLE}
                        ],
                        totalCount: 0
                    }),
                    getLibraryAttributes: jest
                        .fn()
                        .mockReturnValueOnce(Promise.resolve([{id: 'attr1'}, {id: 'attr2'}])),
                    getLibraryFullTextAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([{id: 'attr1'}]))
                };

                const libDomain = libraryDomain({
                    config: mockConfig as Config.IConfig,
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.infra.library': mockLibRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                    'core.utils': mockUtils as IUtils
                });

                await expect(
                    libDomain.saveLibrary(
                        {
                            id: 'test',
                            attributes: [
                                {id: 'attr3', type: AttributeTypes.SIMPLE},
                                {id: 'attr4', type: AttributeTypes.SIMPLE}
                            ]
                        },
                        ctx
                    )
                ).rejects.toThrow(ValidationError);

                expect(mockLibRepo.updateLibrary.mock.calls.length).toBe(0);
                expect(mockLibRepo.saveLibraryAttributes.mock.calls.length).toBe(0);
            });

            test('Should throw if unknown trees attributes in permissions conf', async function() {
                const mockLibRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                    createLibrary: jest.fn(),
                    updateLibrary: global.__mockPromise({id: 'test', system: false}),
                    saveLibraryAttributes: jest.fn()
                };

                const mockEventsManager: Mockify<IEventsManagerDomain> = {
                    send: global.__mockPromise()
                };

                const mockAttrDomain: Mockify<IAttributeDomain> = {
                    getAttributes: global.__mockPromise({
                        list: [
                            {id: 'id', type: AttributeTypes.SIMPLE},
                            {id: 'created_at', type: AttributeTypes.SIMPLE},
                            {id: 'created_by', type: AttributeTypes.SIMPLE},
                            {id: 'modified_at', type: AttributeTypes.SIMPLE},
                            {id: 'modified_by', type: AttributeTypes.SIMPLE},
                            {id: 'active', type: AttributeTypes.SIMPLE},
                            {id: 'attr1', type: AttributeTypes.SIMPLE},
                            {id: 'attr2', type: AttributeTypes.SIMPLE},
                            {id: 'root_key', type: AttributeTypes.SIMPLE},
                            {id: 'is_directory', type: AttributeTypes.SIMPLE},
                            {id: 'file_path', type: AttributeTypes.SIMPLE}
                        ],
                        totalCount: 0
                    }),
                    getLibraryAttributes: jest
                        .fn()
                        .mockReturnValueOnce(Promise.resolve([{id: 'attr1'}, {id: 'attr2'}])),
                    getLibraryFullTextAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([{id: 'attr1'}]))
                };

                const libDomain = libraryDomain({
                    config: mockConfig as Config.IConfig,
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.infra.library': mockLibRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                    'core.utils': mockUtils as IUtils
                });

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
                        ctx
                    )
                ).rejects.toThrow(ValidationError);

                expect(mockLibRepo.updateLibrary.mock.calls.length).toBe(0);
            });

            test('Should throw if attributes in recordIdentity are not binded to library', async function() {
                const mockLibRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                    createLibrary: jest.fn(),
                    updateLibrary: global.__mockPromise({id: 'test', system: false}),
                    saveLibraryAttributes: jest.fn()
                };

                const mockEventsManager: Mockify<IEventsManagerDomain> = {
                    send: global.__mockPromise()
                };

                const mockAttrDomain: Mockify<IAttributeDomain> = {
                    getAttributes: global.__mockPromise({
                        list: [
                            {id: 'id', type: AttributeTypes.SIMPLE},
                            {id: 'created_at', type: AttributeTypes.SIMPLE},
                            {id: 'created_by', type: AttributeTypes.SIMPLE},
                            {id: 'modified_at', type: AttributeTypes.SIMPLE},
                            {id: 'modified_by', type: AttributeTypes.SIMPLE},
                            {id: 'active', type: AttributeTypes.SIMPLE},
                            {id: 'attr1', type: AttributeTypes.SIMPLE},
                            {id: 'attr2', type: AttributeTypes.SIMPLE},
                            {id: 'root_key', type: AttributeTypes.SIMPLE},
                            {id: 'is_directory', type: AttributeTypes.SIMPLE},
                            {id: 'file_path', type: AttributeTypes.SIMPLE}
                        ],
                        totalCount: 0
                    }),
                    getLibraryAttributes: jest
                        .fn()
                        .mockReturnValueOnce(Promise.resolve([{id: 'attr1'}, {id: 'attr2'}])),
                    getLibraryFullTextAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([{id: 'attr1'}]))
                };

                const libDomain = libraryDomain({
                    config: mockConfig as Config.IConfig,
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.infra.library': mockLibRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                    'core.utils': mockUtils as IUtils
                });

                await expect(
                    libDomain.saveLibrary(
                        {
                            id: 'test',
                            recordIdentityConf: {label: 'unknownAttribute'}
                        },
                        ctx
                    )
                ).rejects.toThrow(ValidationError);

                expect(mockLibRepo.updateLibrary.mock.calls.length).toBe(0);
            });

            test('Should throw if forbidden action', async function() {
                const mockLibRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                    createLibrary: jest.fn(),
                    updateLibrary: global.__mockPromise({id: 'test', system: false}),
                    saveLibraryAttributes: jest.fn()
                };

                const mockEventsManager: Mockify<IEventsManagerDomain> = {
                    send: global.__mockPromise()
                };

                const mockAttrDomain: Mockify<IAttributeDomain> = {
                    getLibraryAttributes: jest
                        .fn()
                        .mockReturnValueOnce(Promise.resolve([{id: 'attr1'}, {id: 'attr2'}])),
                    getLibraryFullTextAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([{id: 'attr1'}]))
                };

                const libDomain = libraryDomain({
                    'core.infra.library': mockLibRepo as ILibraryRepo,
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.domain.permission.app': mockAppPermForbiddenDomain as IAppPermissionDomain,
                    'core.utils': mockUtils as IUtils
                });

                await expect(libDomain.saveLibrary({id: 'test'}, ctx)).rejects.toThrow(PermissionError);
            });

            test('Should not save behavior on existing library', async () => {
                const mockLibRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 0}),
                    createLibrary: jest.fn(),
                    updateLibrary: global.__mockPromise({id: 'test', system: false}),
                    saveLibraryAttributes: jest.fn(),
                    saveLibraryFullTextAttributes: jest.fn()
                };

                const mockEventsManager: Mockify<IEventsManagerDomain> = {
                    send: global.__mockPromise()
                };

                const mockAttrDomain: Mockify<IAttributeDomain> = {
                    getAttributes: global.__mockPromise({
                        list: [
                            {id: 'id', type: AttributeTypes.SIMPLE},
                            {id: 'created_at', type: AttributeTypes.SIMPLE},
                            {id: 'created_by', type: AttributeTypes.SIMPLE},
                            {id: 'modified_at', type: AttributeTypes.SIMPLE},
                            {id: 'modified_by', type: AttributeTypes.SIMPLE},
                            {id: 'active', type: AttributeTypes.SIMPLE},
                            {id: 'attr1', type: AttributeTypes.SIMPLE},
                            {id: 'attr2', type: AttributeTypes.SIMPLE},
                            {id: 'root_key', type: AttributeTypes.SIMPLE},
                            {id: 'is_directory', type: AttributeTypes.SIMPLE},
                            {id: 'file_path', type: AttributeTypes.SIMPLE}
                        ],
                        totalCount: 0
                    }),
                    getLibraryAttributes: jest
                        .fn()
                        .mockReturnValueOnce(Promise.resolve([{id: 'attr1'}, {id: 'attr2'}])),
                    getLibraryFullTextAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([{id: 'attr1'}]))
                };

                const libDomain = libraryDomain({
                    config: mockConfig as Config.IConfig,
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.infra.library': mockLibRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                    'core.utils': mockUtils as IUtils
                });

                await libDomain.saveLibrary({id: 'test'}, ctx);

                expect(mockLibRepo.updateLibrary.mock.calls[0][0].behavior).toBeUndefined();
            });
        });
    });

    describe('deleteLibrary', () => {
        const libData = {id: 'test_lib', system: false, label: {fr: 'Test'}};

        test('Should delete an library and return deleted library', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {deleteLibrary: global.__mockPromise(libData)};
            const mockEventsManager: Mockify<IEventsManagerDomain> = {
                send: global.__mockPromise()
            };

            const mockRecordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({totalCount: 0, list: []})
            };

            const libDomain = libraryDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.infra.library': mockLibRepo as ILibraryRepo,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain
            });

            libDomain.getLibraries = global.__mockPromise({list: [libData], totalCount: 1});

            await libDomain.deleteLibrary(libData.id, ctx);

            expect(mockLibRepo.deleteLibrary.mock.calls.length).toBe(1);

            expect(mockAppPermDomain.getAppPermission).toBeCalled();
            expect(mockAppPermDomain.getAppPermission.mock.calls[0][0].action).toBe(
                AppPermissionsActions.DELETE_LIBRARY
            );
        });

        test('Should throw if unknown library', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {deleteLibrary: global.__mockPromise()};
            const mockEventsManager: Mockify<IEventsManagerDomain> = {
                send: global.__mockPromise()
            };

            const libDomain = libraryDomain({
                config: mockConfig as Config.IConfig,
                'core.infra.library': mockLibRepo as ILibraryRepo,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain
            });

            libDomain.getLibraries = global.__mockPromise([]);

            await expect(libDomain.deleteLibrary(libData.id, ctx)).rejects.toThrow();
        });

        test('Should throw if system library', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {deleteLibrary: global.__mockPromise()};
            const mockEventsManager: Mockify<IEventsManagerDomain> = {
                send: global.__mockPromise()
            };

            const libDomain = libraryDomain({
                config: mockConfig as Config.IConfig,
                'core.infra.library': mockLibRepo as ILibraryRepo,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain
            });
            libDomain.getLibraries = global.__mockPromise([{system: true}]);

            await expect(libDomain.deleteLibrary(libData.id, ctx)).rejects.toThrow();
        });

        test('Should throw if forbidden action', async function() {
            const mockEventsManager: Mockify<IEventsManagerDomain> = {
                send: global.__mockPromise()
            };
            const mockLibRepo: Mockify<ILibraryRepo> = {deleteLibrary: global.__mockPromise(libData)};
            const libDomain = libraryDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.infra.library': mockLibRepo as ILibraryRepo,
                'core.domain.permission.app': mockAppPermForbiddenDomain as IAppPermissionDomain
            });

            libDomain.getLibraries = global.__mockPromise([libData]);

            await expect(libDomain.deleteLibrary(libData.id, ctx)).rejects.toThrow(PermissionError);
        });

        test('When deleting a files library, delete linked tree', async () => {
            const mockUtils: Mockify<IUtils> = {
                getLibraryTreeId: jest.fn().mockReturnValue({})
            };
            const mockEventsManager: Mockify<IEventsManagerDomain> = {
                send: global.__mockPromise()
            };
            const mockLibRepo: Mockify<ILibraryRepo> = {deleteLibrary: global.__mockPromise(libData)};

            const mockRecordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({totalCount: 0, list: []})
            };

            const libDomain = libraryDomain({
                config: mockConfig as Config.IConfig,
                'core.infra.library': mockLibRepo as ILibraryRepo,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.utils': mockUtils as IUtils
            });
            libDomain.getLibraries = global.__mockPromise({
                list: [
                    {
                        ...libData,
                        behavior: LibraryBehavior.FILES
                    }
                ],
                totalCount: 1
            });

            await libDomain.deleteLibrary(libData.id, ctx);

            expect(mockTreeRepo.deleteTree).toBeCalled();
        });
    });
});
