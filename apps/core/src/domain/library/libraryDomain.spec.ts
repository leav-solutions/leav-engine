// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IValidateHelper} from 'domain/helpers/validate';
import {IAdminPermissionDomain} from 'domain/permission/adminPermissionDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {i18n} from 'i18next';
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IUtils} from 'utils/utils';
import * as Config from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {systemPreviewsSettings} from '../../domain/filesManager/_constants';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {ICacheService, ICachesService} from '../../infra/cache/cacheService';
import getDefaultAttributes from '../../utils/helpers/getLibraryDefaultAttributes';
import {AttributeTypes} from '../../_types/attribute';
import {ILibrary, LibraryBehavior} from '../../_types/library';
import {AdminPermissionsActions, PermissionsRelations} from '../../_types/permissions';
import {mockAttrSimple} from '../../__tests__/mocks/attribute';
import {mockLibrary} from '../../__tests__/mocks/library';
import {IAttributeDomain} from '../attribute/attributeDomain';
import libraryDomain from './libraryDomain';
import {deleteAssociatedValues} from './helpers';
import {IDeleteAssociatedValuesHelper} from './helpers/deleteAssociatedValues';
import {IUpdateAssociatedFormsHelper} from './helpers/updateAssociatedForms';

const eventsManagerMockConfig: Mockify<Config.IEventsManager> = {
    routingKeys: {data_events: 'test.data.events', pubsub_events: 'test.pubsub.events'}
};

const mockConfig: Mockify<Config.IConfig> = {
    eventsManager: eventsManagerMockConfig as Config.IEventsManager,
    lang: {
        available: ['fr', 'en'],
        default: 'fr'
    }
};

const mockTranslator: Mockify<i18n> = {
    t: jest.fn((key: string) => {
        return key;
    })
};

const mockCacheService: Mockify<ICacheService> = {
    getData: global.__mockPromise([null]),
    storeData: global.__mockPromise(),
    deleteData: global.__mockPromise()
};

const mockCachesService: Mockify<ICachesService> = {
    getCache: jest.fn().mockReturnValue(mockCacheService)
};

describe('LibraryDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'libraryDomainTest'
    };

    const mockAdminPermDomain: Mockify<IAdminPermissionDomain> = {
        getAdminPermission: global.__mockPromise(true)
    };

    const mockAdminPermForbiddenDomain: Mockify<IAdminPermissionDomain> = {
        getAdminPermission: global.__mockPromise(false)
    };

    const mockTreeRepo: Mockify<ITreeRepo> = {
        createTree: jest.fn(),
        deleteTree: jest.fn()
    };

    const mockValidateHelper: Mockify<IValidateHelper> = {
        validateView: global.__mockPromise(true)
    };

    const mockValidateHelperBadView: Mockify<IValidateHelper> = {
        validateView: global.__mockPromise(false)
    };

    const mockGetEntityByIdHelper = jest.fn().mockReturnValue(mockLibrary);
    const mockGetEntityByIdHelperNoResult = jest.fn().mockReturnValue(null);

    const mockUtils: Mockify<IUtils> = {
        isIdValid: jest.fn().mockReturnValue(true),
        getLibraryTreeId: jest.fn().mockReturnValue({}),
        getCoreEntityCacheKey: jest.fn().mockReturnValue('coreEntity:library:42'),
        getDirectoriesLibraryId: jest.fn().mockReturnValue('files_directories'),
        getPreviewsAttributeName: jest.fn().mockReturnValue('previews'),
        getPreviewsStatusAttributeName: jest.fn().mockReturnValue('previews_status'),
        getPreviewAttributesSettings: jest.fn().mockReturnValue(systemPreviewsSettings),
        getDefaultActionsList: jest.fn().mockReturnValue([])
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
            const libDomain = libraryDomain({
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper
            });
            const lib = await libDomain.getLibraryProperties('test', ctx);

            expect(lib).toMatchObject(mockLibrary);
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
        describe('Create library', () => {
            test('Should throw if invalid ID', async function() {
                const mockUtilsInvalidID: Mockify<IUtils> = {
                    isIdValid: jest.fn().mockReturnValue(false)
                };

                const mockLibRepo: Mockify<ILibraryRepo> = {
                    createLibrary: jest.fn(),
                    updateLibrary: global.__mockPromise({id: 'test', system: false}),
                    saveLibraryAttributes: jest.fn()
                };

                const mockEventsManager: Mockify<IEventsManagerDomain> = {
                    sendDatabaseEvent: global.__mockPromise()
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
                    'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperNoResult,
                    'core.utils': mockUtilsInvalidID as IUtils
                });

                await expect(libDomain.saveLibrary({id: 'test'}, ctx)).rejects.toThrow(ValidationError);
            });

            test('Save behavior specific attributes', async () => {
                const mockLibRepo: Mockify<ILibraryRepo> = {
                    createLibrary: global.__mockPromise({id: 'test', system: false}),
                    updateLibrary: jest.fn(),
                    saveLibraryAttributes: jest.fn(),
                    saveLibraryFullTextAttributes: jest.fn()
                };

                const mockEventsManager: Mockify<IEventsManagerDomain> = {
                    sendDatabaseEvent: global.__mockPromise()
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
                            {id: 'file_path', type: AttributeTypes.SIMPLE},
                            {id: 'file_name', type: AttributeTypes.SIMPLE},
                            {id: 'inode', type: AttributeTypes.SIMPLE},
                            {id: 'test_previews', type: AttributeTypes.SIMPLE},
                            {id: 'test_previews_status', type: AttributeTypes.SIMPLE},
                            {id: 'hash', type: AttributeTypes.SIMPLE}
                        ],
                        totalCount: 0
                    }),
                    getLibraryAttributes: jest
                        .fn()
                        .mockReturnValueOnce(Promise.resolve([{id: 'attr1'}, {id: 'attr2'}])),
                    getLibraryFullTextAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([{id: 'attr1'}]))
                };

                const libDomain = libraryDomain({
                    'core.infra.library': mockLibRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperNoResult,
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
                expect(mockLibRepo.saveLibraryAttributes.mock.calls[0][0].attributes.includes('file_path')).toBe(true);
            });

            describe('Files library', () => {
                test('Add previews settings on create', async function() {
                    const mockLibRepo: Mockify<ILibraryRepo> = {
                        createLibrary: global.__mockPromise({id: 'test', system: false}),
                        updateLibrary: jest.fn(),
                        saveLibraryAttributes: jest.fn(),
                        saveLibraryFullTextAttributes: jest.fn()
                    };

                    const mockEventsManager: Mockify<IEventsManagerDomain> = {
                        sendDatabaseEvent: global.__mockPromise()
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
                                {id: 'root_key', type: AttributeTypes.SIMPLE},
                                {id: 'file_path', type: AttributeTypes.SIMPLE},
                                {id: 'file_name', type: AttributeTypes.SIMPLE},
                                {id: 'inode', type: AttributeTypes.SIMPLE},
                                {id: 'test_files_lib_previews', type: AttributeTypes.SIMPLE},
                                {id: 'test_files_lib_previews_status', type: AttributeTypes.SIMPLE},
                                {id: 'hash', type: AttributeTypes.SIMPLE}
                            ],
                            totalCount: 0
                        }),
                        getLibraryAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([])),
                        getLibraryFullTextAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([]))
                    };

                    const libDomain = libraryDomain({
                        'core.infra.library': mockLibRepo as ILibraryRepo,
                        'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                        'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                        'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                        'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                        'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperNoResult,
                        'core.utils': mockUtils as IUtils
                    });

                    await libDomain.saveLibrary(
                        {
                            id: 'test_files_lib',
                            behavior: LibraryBehavior.FILES
                        },
                        ctx
                    );

                    expect(mockLibRepo.createLibrary.mock.calls[0][0].libData.previewsSettings).toEqual(
                        systemPreviewsSettings
                    );
                });

                test('Should save a new library with custom previews settings', async function() {
                    const mockLibRepo: Mockify<ILibraryRepo> = {
                        createLibrary: global.__mockPromise({id: 'test', system: false}),
                        updateLibrary: jest.fn(),
                        saveLibraryAttributes: jest.fn(),
                        saveLibraryFullTextAttributes: jest.fn()
                    };

                    const mockEventsManager: Mockify<IEventsManagerDomain> = {
                        sendDatabaseEvent: global.__mockPromise()
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
                                {id: 'root_key', type: AttributeTypes.SIMPLE},
                                {id: 'file_path', type: AttributeTypes.SIMPLE},
                                {id: 'file_name', type: AttributeTypes.SIMPLE},
                                {id: 'inode', type: AttributeTypes.SIMPLE},
                                {id: 'test_files_lib_previews', type: AttributeTypes.SIMPLE},
                                {id: 'test_files_lib_previews_status', type: AttributeTypes.SIMPLE},
                                {id: 'hash', type: AttributeTypes.SIMPLE}
                            ],
                            totalCount: 0
                        }),
                        getLibraryAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([])),
                        getLibraryFullTextAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([]))
                    };

                    const libDomain = libraryDomain({
                        'core.infra.library': mockLibRepo as ILibraryRepo,
                        'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                        'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                        'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                        'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                        'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperNoResult,
                        'core.utils': mockUtils as IUtils
                    });

                    const previewsSettings: ILibrary['previewsSettings'] = [
                        {
                            label: {fr: 'test'},
                            description: {fr: 'test'},
                            system: false,
                            versions: {
                                background: '#123456',
                                density: 42,
                                sizes: [
                                    {
                                        name: 'my_size',
                                        size: 1337
                                    }
                                ]
                            }
                        }
                    ];

                    await libDomain.saveLibrary(
                        {
                            id: 'test_files_lib',
                            behavior: LibraryBehavior.FILES,
                            previewsSettings
                        },
                        ctx
                    );

                    expect(mockLibRepo.createLibrary.mock.calls[0][0].libData.previewsSettings).toEqual([
                        ...systemPreviewsSettings,
                        ...previewsSettings
                    ]);
                });

                test('Should throw if a size name is already used', async function() {
                    const mockLibRepo: Mockify<ILibraryRepo> = {
                        createLibrary: global.__mockPromise({id: 'test', system: false}),
                        updateLibrary: jest.fn(),
                        saveLibraryAttributes: jest.fn(),
                        saveLibraryFullTextAttributes: jest.fn()
                    };

                    const mockEventsManager: Mockify<IEventsManagerDomain> = {
                        sendDatabaseEvent: global.__mockPromise()
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
                                {id: 'root_key', type: AttributeTypes.SIMPLE},
                                {id: 'file_path', type: AttributeTypes.SIMPLE},
                                {id: 'file_name', type: AttributeTypes.SIMPLE},
                                {id: 'inode', type: AttributeTypes.SIMPLE},
                                {id: 'test_previews', type: AttributeTypes.SIMPLE},
                                {id: 'test_previews_status', type: AttributeTypes.SIMPLE},
                                {id: 'hash', type: AttributeTypes.SIMPLE}
                            ],
                            totalCount: 0
                        }),
                        getLibraryAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([])),
                        getLibraryFullTextAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([]))
                    };

                    const libDomain = libraryDomain({
                        'core.infra.library': mockLibRepo as ILibraryRepo,
                        'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                        'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                        'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                        'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                        'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperNoResult,
                        'core.utils': mockUtils as IUtils
                    });

                    const previewsSettings: ILibrary['previewsSettings'] = [
                        {
                            label: {fr: 'test'},
                            description: {fr: 'test'},
                            system: false,
                            versions: {
                                background: '#123456',
                                density: 42,
                                sizes: [
                                    {
                                        name: 'huge',
                                        size: 1337
                                    }
                                ]
                            }
                        }
                    ];

                    await expect(() =>
                        libDomain.saveLibrary(
                            {
                                id: 'test_files_lib',
                                behavior: LibraryBehavior.FILES,
                                previewsSettings
                            },
                            ctx
                        )
                    ).rejects.toThrow(ValidationError);
                });

                test('Create linked tree on library create', async () => {
                    const mockLibRepo: Mockify<ILibraryRepo> = {
                        createLibrary: global.__mockPromise({
                            id: 'test',
                            system: false,
                            behavior: LibraryBehavior.FILES
                        }),
                        updateLibrary: jest.fn(),
                        saveLibraryAttributes: jest.fn(),
                        saveLibraryFullTextAttributes: jest.fn()
                    };

                    const mockAttributeRepo: Mockify<IAttributeRepo> = {
                        createAttribute: global.__mockPromise(mockAttrSimple)
                    };

                    const mockEventsManager: Mockify<IEventsManagerDomain> = {
                        sendDatabaseEvent: global.__mockPromise()
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
                                {id: 'file_path', type: AttributeTypes.SIMPLE},
                                {id: 'file_name', type: AttributeTypes.SIMPLE},
                                {id: 'inode', type: AttributeTypes.SIMPLE},
                                {id: 'test_previews', type: AttributeTypes.SIMPLE},
                                {id: 'test_previews_status', type: AttributeTypes.SIMPLE},
                                {id: 'hash', type: AttributeTypes.SIMPLE}
                            ],
                            totalCount: 0
                        }),
                        getLibraryAttributes: jest
                            .fn()
                            .mockReturnValueOnce(Promise.resolve([{id: 'attr1'}, {id: 'attr2'}])),
                        getLibraryFullTextAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([{id: 'attr1'}]))
                    };

                    const libDomain = libraryDomain({
                        'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                        'core.infra.library': mockLibRepo as ILibraryRepo,
                        'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                        'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                        'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                        'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperNoResult,
                        'core.utils': mockUtils as IUtils,
                        'core.infra.tree': mockTreeRepo as ITreeRepo,
                        'core.infra.attribute': mockAttributeRepo as IAttributeRepo,
                        config: mockConfig as Config.IConfig,
                        translator: mockTranslator as i18n
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
        });

        describe('Update library', () => {
            test('Should update a library', async function() {
                const mockLibRepo: Mockify<ILibraryRepo> = {
                    createLibrary: jest.fn(),
                    updateLibrary: global.__mockPromise({id: 'test', system: false}),
                    saveLibraryAttributes: jest.fn(),
                    saveLibraryFullTextAttributes: jest.fn()
                };

                const mockEventsManager: Mockify<IEventsManagerDomain> = {
                    sendDatabaseEvent: global.__mockPromise()
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
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.infra.library': mockLibRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.infra.cache.cacheService': mockCachesService as ICachesService,
                    'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                    'core.utils': mockUtils as IUtils
                });

                const updatedLib = await libDomain.saveLibrary({id: 'test'}, ctx);

                expect(mockCacheService.deleteData).toBeCalled();
                expect(mockLibRepo.createLibrary.mock.calls.length).toBe(0);
                expect(mockLibRepo.updateLibrary.mock.calls.length).toBe(1);
                expect(mockLibRepo.saveLibraryAttributes.mock.calls.length).toBe(1);

                expect(updatedLib).toMatchObject({id: 'test', system: false});

                expect(mockAdminPermDomain.getAdminPermission).toBeCalled();
                expect(mockAdminPermDomain.getAdminPermission.mock.calls[0][0].action).toBe(
                    AdminPermissionsActions.EDIT_LIBRARY
                );
            });

            test('Should update library attributes', async function() {
                const mockLibRepo: Mockify<ILibraryRepo> = {
                    createLibrary: jest.fn(),
                    updateLibrary: global.__mockPromise({id: 'test', system: false}),
                    saveLibraryAttributes: jest.fn(),
                    saveLibraryFullTextAttributes: jest.fn()
                };

                const mockEventsManager: Mockify<IEventsManagerDomain> = {
                    sendDatabaseEvent: global.__mockPromise()
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
                            {id: 'file_path', type: AttributeTypes.SIMPLE}
                        ],
                        totalCount: 0
                    }),
                    getLibraryAttributes: global.__mockPromise([{id: 'attr1'}]),
                    getLibraryFullTextAttributes: global.__mockPromise([{id: 'attr1'}])
                };

                const mockDeleteAssociatedValues: Mockify<IDeleteAssociatedValuesHelper> = {
                    deleteAssociatedValues: global.__mockPromise()
                };

                const mockUpdateAssociatedForms: Mockify<IUpdateAssociatedFormsHelper> = {
                    updateAssociatedForms: global.__mockPromise()
                };

                const libDomain = libraryDomain({
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.infra.library': mockLibRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.infra.cache.cacheService': mockCachesService as ICachesService,
                    'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                    'core.domain.library.helpers.deleteAssociatedValues': mockDeleteAssociatedValues as IDeleteAssociatedValuesHelper,
                    'core.domain.library.helpers.updateAssociatedForms': mockUpdateAssociatedForms as IUpdateAssociatedFormsHelper,
                    'core.utils': mockUtils as IUtils
                });

                const updatedLib = await libDomain.saveLibrary(
                    {
                        id: 'test',
                        attributes: [{id: 'attr2', type: AttributeTypes.SIMPLE}]
                    },
                    ctx
                );

                const defaultAttributes = getDefaultAttributes(updatedLib.behavior, updatedLib.id);

                expect(mockCacheService.deleteData).toBeCalledTimes(1); // Entity cache clear
                expect(mockLibRepo.updateLibrary.mock.calls.length).toBe(1);
                expect(mockLibRepo.saveLibraryAttributes.mock.calls.length).toBe(1);
                expect(mockLibRepo.saveLibraryAttributes.mock.calls[0][0].libId).toEqual('test');
                expect(mockLibRepo.saveLibraryAttributes.mock.calls[0][0].attributes).toEqual(
                    defaultAttributes.concat(['attr2'])
                );
                expect(mockLibRepo.saveLibraryFullTextAttributes.mock.calls[0][0].fullTextAttributes).toEqual([]);

                expect(updatedLib).toMatchObject({id: 'test', system: false});

                expect(mockAdminPermDomain.getAdminPermission).toBeCalled();
                expect(mockAdminPermDomain.getAdminPermission.mock.calls[0][0].action).toBe(
                    AdminPermissionsActions.EDIT_LIBRARY
                );
            });

            test('Should throw if unknown attributes', async function() {
                const mockLibRepo: Mockify<ILibraryRepo> = {
                    createLibrary: jest.fn(),
                    updateLibrary: global.__mockPromise({id: 'test', system: false}),
                    saveLibraryAttributes: jest.fn(),
                    saveLibraryFullTextAttributes: jest.fn()
                };

                const mockEventsManager: Mockify<IEventsManagerDomain> = {
                    sendDatabaseEvent: global.__mockPromise()
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
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.infra.library': mockLibRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
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
                    createLibrary: jest.fn(),
                    updateLibrary: global.__mockPromise({id: 'test', system: false}),
                    saveLibraryAttributes: jest.fn()
                };

                const mockEventsManager: Mockify<IEventsManagerDomain> = {
                    sendDatabaseEvent: global.__mockPromise()
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
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.infra.library': mockLibRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
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
                    sendDatabaseEvent: global.__mockPromise()
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
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.infra.library': mockLibRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
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
                    sendDatabaseEvent: global.__mockPromise()
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
                    'core.domain.permission.admin': mockAdminPermForbiddenDomain as IAdminPermissionDomain,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                    'core.utils': mockUtils as IUtils
                });

                await expect(libDomain.saveLibrary({id: 'test'}, ctx)).rejects.toThrow(PermissionError);
            });

            test('Should throw if unknown default view', async function() {
                const mockLibRepo: Mockify<ILibraryRepo> = {
                    createLibrary: jest.fn(),
                    updateLibrary: global.__mockPromise({id: 'test', system: false}),
                    saveLibraryAttributes: jest.fn(),
                    saveLibraryFullTextAttributes: jest.fn()
                };

                const mockEventsManager: Mockify<IEventsManagerDomain> = {
                    sendDatabaseEvent: global.__mockPromise()
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
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.infra.library': mockLibRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                    'core.domain.helpers.validate': mockValidateHelperBadView as IValidateHelper,
                    'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                    'core.utils': mockUtils as IUtils
                });

                await expect(libDomain.saveLibrary({id: 'test', defaultView: 'bad_view'}, ctx)).rejects.toThrow(
                    ValidationError
                );
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
                    sendDatabaseEvent: global.__mockPromise()
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
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.infra.library': mockLibRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                    'core.infra.cache.cacheService': mockCachesService as ICachesService,
                    'core.utils': mockUtils as IUtils
                });

                await libDomain.saveLibrary({id: 'test'}, ctx);

                expect(mockLibRepo.updateLibrary.mock.calls[0][0].behavior).toBeUndefined();
            });
        });
    });

    describe('deleteLibrary', () => {
        const mockRunPreDelete = jest.fn();

        const libData = {id: 'test_lib', system: false, label: {fr: 'Test'}};

        test('Should delete a library and return deleted library', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {deleteLibrary: global.__mockPromise(libData)};
            const mockEventsManager: Mockify<IEventsManagerDomain> = {
                sendDatabaseEvent: global.__mockPromise()
            };

            const mockRecordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({totalCount: 0, list: []})
            };

            const libDomain = libraryDomain({
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.infra.library': mockLibRepo as ILibraryRepo,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.domain.library.helpers.runPreDelete': mockRunPreDelete,
                'core.infra.cache.cacheService': mockCachesService as ICachesService,
                'core.utils': mockUtils as IUtils
            });

            libDomain.getLibraries = global.__mockPromise({list: [libData], totalCount: 1});

            await libDomain.deleteLibrary(libData.id, ctx);

            expect(mockLibRepo.deleteLibrary.mock.calls.length).toBe(1);

            expect(mockRunPreDelete).toBeCalled();
            expect(mockAdminPermDomain.getAdminPermission).toBeCalled();
            expect(mockAdminPermDomain.getAdminPermission.mock.calls[0][0].action).toBe(
                AdminPermissionsActions.DELETE_LIBRARY
            );
        });

        test('Should throw if unknown library', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {deleteLibrary: global.__mockPromise()};
            const mockEventsManager: Mockify<IEventsManagerDomain> = {
                sendDatabaseEvent: global.__mockPromise()
            };

            const libDomain = libraryDomain({
                'core.domain.library.helpers.runPreDelete': mockRunPreDelete,
                'core.infra.library': mockLibRepo as ILibraryRepo,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain
            });

            libDomain.getLibraries = global.__mockPromise([]);

            expect(mockRunPreDelete).not.toBeCalled();
            await expect(libDomain.deleteLibrary(libData.id, ctx)).rejects.toThrow();
        });

        test('Should throw if system library', async function() {
            const mockLibRepo: Mockify<ILibraryRepo> = {deleteLibrary: global.__mockPromise()};
            const mockEventsManager: Mockify<IEventsManagerDomain> = {
                sendDatabaseEvent: global.__mockPromise()
            };

            const libDomain = libraryDomain({
                'core.infra.library': mockLibRepo as ILibraryRepo,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain
            });
            libDomain.getLibraries = global.__mockPromise([{system: true}]);

            await expect(libDomain.deleteLibrary(libData.id, ctx)).rejects.toThrow();
        });

        test('Should throw if forbidden action', async function() {
            const mockEventsManager: Mockify<IEventsManagerDomain> = {
                sendDatabaseEvent: global.__mockPromise()
            };
            const mockLibRepo: Mockify<ILibraryRepo> = {deleteLibrary: global.__mockPromise(libData)};
            const libDomain = libraryDomain({
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.infra.library': mockLibRepo as ILibraryRepo,
                'core.domain.permission.admin': mockAdminPermForbiddenDomain as IAdminPermissionDomain
            });

            libDomain.getLibraries = global.__mockPromise([libData]);

            await expect(libDomain.deleteLibrary(libData.id, ctx)).rejects.toThrow(PermissionError);
        });

        test('When deleting a files library, delete linked tree', async () => {
            const mockEventsManager: Mockify<IEventsManagerDomain> = {
                sendDatabaseEvent: global.__mockPromise()
            };
            const mockLibRepo: Mockify<ILibraryRepo> = {deleteLibrary: global.__mockPromise(libData)};

            const mockRecordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({totalCount: 0, list: []})
            };

            const mockGetEntityByIdHelperFilesLibrary = jest.fn().mockReturnValue({
                ...mockLibrary,
                behavior: LibraryBehavior.FILES
            });

            const libDomain = libraryDomain({
                'core.infra.library': mockLibRepo as ILibraryRepo,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperFilesLibrary,
                'core.domain.library.helpers.runPreDelete': mockRunPreDelete,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.infra.cache.cacheService': mockCachesService as ICachesService,
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

            expect(mockRunPreDelete).toBeCalled();
        });
    });
});
