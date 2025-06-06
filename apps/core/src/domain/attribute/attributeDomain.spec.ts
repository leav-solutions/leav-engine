// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IAdminPermissionDomain} from 'domain/permission/adminPermissionDomain';
import {IVersionProfileDomain} from 'domain/versionProfile/versionProfileDomain';
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {IFormRepo} from 'infra/form/formRepo';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IUtils, ToAny} from 'utils/utils';
import {ILibrary} from '_types/library';
import {IQueryInfos} from '_types/queryInfos';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {ICacheService, ICachesService} from '../../infra/cache/cacheService';
import {ActionsListEvents, ActionsListIOTypes} from '../../_types/actionsList';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import {AdminPermissionsActions} from '../../_types/permissions';
import {mockAttrAdv, mockAttrAdvVersionable, mockAttrSimple, mockAttrTree} from '../../__tests__/mocks/attribute';
import {mockForm} from '../../__tests__/mocks/forms';
import {mockLibrary} from '../../__tests__/mocks/library';
import {IActionsListDomain} from '../actionsList/actionsListDomain';
import attributeDomain, {IAttributeDomainDeps} from './attributeDomain';
import {Mockify} from '@leav/utils';

const mockCacheService: Mockify<ICacheService> = {
    getData: global.__mockPromise([null]),
    storeData: global.__mockPromise(),
    deleteData: global.__mockPromise()
};

const mockCachesService: Mockify<ICachesService> = {
    getCache: jest.fn().mockReturnValue(mockCacheService),
    memoize: jest.fn().mockImplementation(({func}) => func())
};

const mockEventsManager: Mockify<IEventsManagerDomain> = {
    sendDatabaseEvent: global.__mockPromise()
};

const depsBase: ToAny<IAttributeDomainDeps> = {
    config: {},
    'core.infra.attribute': jest.fn(),
    'core.domain.actionsList': jest.fn(),
    'core.domain.permission.admin': jest.fn(),
    'core.domain.helpers.getCoreEntityById': jest.fn(),
    'core.domain.versionProfile': jest.fn(),
    'core.domain.eventsManager': jest.fn(),
    'core.infra.form': jest.fn(),
    'core.infra.library': jest.fn(),
    'core.infra.tree': jest.fn(),
    'core.infra.cache.cacheService': jest.fn(),
    'core.utils': jest.fn()
};

describe('attributeDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'attributeDomainTest'
    };
    const mockConf = {
        lang: {
            default: 'fr'
        }
    };

    const mockAdminPermDomain = {
        getAdminPermission: global.__mockPromise(true)
    };

    const mockAdminPermDomainForbidden = {
        getAdminPermission: global.__mockPromise(false)
    };

    const mockUtils: Mockify<IUtils> = {
        isIdValid: jest.fn().mockReturnValue(true),
        mergeConcat: jest.fn().mockImplementation(o => o),
        getDefaultActionsList: jest.fn().mockReturnValue({
            [ActionsListEvents.SAVE_VALUE]: [
                {
                    id: 'validateFormat',
                    name: 'Action name',
                    is_system: true
                }
            ]
        }),
        getCoreEntityCacheKey: jest.fn().mockReturnValue('coreEntity:attribute:42'),
        generateExplicitValidationError: jest.fn().mockReturnValue(new ValidationError({test: 'boom'}))
    };

    const mockGetEntityByIdHelper = jest.fn().mockReturnValue(mockAttrSimple);
    const mockGetEntityByIdHelperNoResult = jest.fn().mockReturnValue(null);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAttributes', () => {
        test('Should return a list of attributes', async function () {
            const mockAttrRepo = {
                getAttributes: global.__mockPromise({list: [{id: 'test'}, {id: 'test2'}], totalCount: 0})
            } satisfies Mockify<IAttributeRepo>;

            const attrDomain = attributeDomain({
                ...depsBase,
                'core.infra.attribute': mockAttrRepo,
                config: mockConf
            } as ToAny<IAttributeDomainDeps>);
            const attr = await attrDomain.getAttributes({ctx});

            expect(mockAttrRepo.getAttributes.mock.calls.length).toBe(1);
            expect(attr.list.length).toBe(2);
        });

        test('Should add default sort', async function () {
            const mockAttrRepo = {
                getAttributes: global.__mockPromise({list: [{id: 'test'}, {id: 'test2'}], totalCount: 0})
            } satisfies Mockify<IAttributeRepo>;

            const attrDomain = attributeDomain({
                ...depsBase,
                'core.infra.attribute': mockAttrRepo,
                config: mockConf
            } as ToAny<IAttributeDomainDeps>);
            await attrDomain.getAttributes({ctx});

            expect(mockAttrRepo.getAttributes.mock.calls[0][0].params.sort).toMatchObject({field: 'id', order: 'asc'});
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
                getLibraries: global.__mockPromise({list: [{id: 'test', system: true}], totalCount: 0})
            };

            const mockAttrRepo = {
                getLibraryAttributes: global.__mockPromise(attrs)
            } satisfies Mockify<IAttributeRepo>;

            const attrDomain = attributeDomain({
                ...depsBase,
                'core.infra.library': mockLibRepo,
                'core.infra.attribute': mockAttrRepo,
                'core.infra.cache.cacheService': mockCachesService,
                'core.utils': mockUtils
            } as ToAny<IAttributeDomainDeps>);
            const libAttrs = await attrDomain.getLibraryAttributes('test', ctx);

            expect(mockAttrRepo.getLibraryAttributes.mock.calls.length).toBe(1);
            expect(mockAttrRepo.getLibraryAttributes.mock.calls[0][0].libraryId).toBe('test');
            expect(libAttrs).toEqual(attrs);
        });

        test('Should throw if unknown library', async function () {
            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise([])
            };

            const attrDomain = attributeDomain({
                ...depsBase,
                'core.infra.library': mockLibRepo
            } as ToAny<IAttributeDomainDeps>);

            await expect(attrDomain.getLibraryAttributes('test', ctx)).rejects.toThrow();
        });
    });

    describe('getAttributeLibraries', () => {
        test('Should return libraries linked to attributes', async () => {
            const libraries: ILibrary[] = [
                {
                    id: 'products',
                    label: {en: 'Products', fr: 'Produits'}
                },
                {
                    id: 'categories',
                    label: {en: 'Categories', fr: 'Catégories'}
                }
            ];

            const mockAttributeRepo = {
                getAttributeLibraries: global.__mockPromise(libraries)
            } satisfies Mockify<IAttributeRepo>;

            const attrDomain = attributeDomain({
                ...depsBase,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.infra.attribute': mockAttributeRepo
            } as ToAny<IAttributeDomainDeps>);
            const attributeLibraries = await attrDomain.getAttributeLibraries({attributeId: 'test', ctx});

            expect(mockAttributeRepo.getAttributeLibraries.mock.calls.length).toBe(1);
            expect(mockAttributeRepo.getAttributeLibraries.mock.calls[0][0].attributeId).toBe('test');
            expect(attributeLibraries).toEqual(libraries);
        });

        test('Should throw if unknown library', async function () {
            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise([])
            };

            const attrDomain = attributeDomain({
                ...depsBase,
                'core.infra.library': mockLibRepo
            } as ToAny<IAttributeDomainDeps>);

            await expect(attrDomain.getLibraryAttributes('test', ctx)).rejects.toThrow();
        });
    });

    describe('getLibraryFullTextAttributes', () => {
        test('Should return library full text attributes with all details', async () => {
            const attrs = [
                {
                    id: 'id',
                    format: 'text',
                    label: {en: 'ID'},
                    system: true,
                    type: 'link'
                }
            ];

            const mockAttrRepo = {
                getLibraryFullTextAttributes: global.__mockPromise(attrs)
            } satisfies Mockify<IAttributeRepo>;

            const attrDomain = attributeDomain({
                ...depsBase,
                'core.domain.helpers.getCoreEntityById': jest.fn().mockReturnValue(mockLibrary),
                'core.infra.attribute': mockAttrRepo
            } as ToAny<IAttributeDomainDeps>);
            const libAttrs = await attrDomain.getLibraryFullTextAttributes('test', ctx);

            expect(mockAttrRepo.getLibraryFullTextAttributes.mock.calls.length).toBe(1);
            expect(mockAttrRepo.getLibraryFullTextAttributes.mock.calls[0][0].libraryId).toBe('test');
            expect(libAttrs).toEqual(attrs);
        });

        test('Should throw if unknown library', async function () {
            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise([])
            };

            const attrDomain = attributeDomain({
                ...depsBase,
                'core.infra.library': mockLibRepo
            } as ToAny<IAttributeDomainDeps>);

            await expect(attrDomain.getLibraryFullTextAttributes('test', ctx)).rejects.toThrow();
        });
    });

    describe('getAttributeProperties', () => {
        test('Should return attribute properties', async function () {
            const attrDomain = attributeDomain({
                ...depsBase,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                config: mockConf
            });
            const attr = await attrDomain.getAttributeProperties({id: 'test', ctx});

            expect(attr).toMatchObject(mockAttrSimple);
        });

        test('Should throw if unknown attribute', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: global.__mockPromise({list: [], totalCount: 0})
            };

            const attrDomain = attributeDomain({
                ...depsBase,
                'core.infra.attribute': mockAttrRepo,
                config: mockConf
            } as ToAny<IAttributeDomainDeps>);

            await expect(attrDomain.getAttributeProperties({id: 'test', ctx})).rejects.toThrow();
        });
    });

    describe('saveAttribute', () => {
        const mockALDomain: Mockify<IActionsListDomain> = {
            getAvailableActions: jest.fn().mockReturnValue([
                {
                    id: 'validateFormat',
                    name: 'Validate Format',
                    output_types: ['string', 'number']
                },
                {
                    id: 'toNumber',
                    name: 'To Number',
                    output_types: ['number']
                },
                {
                    id: 'toJSON',
                    name: 'To JSON',
                    output_types: ['string']
                }
            ])
        };

        const getLibrariesUsingAttributeMockWithoutResult = jest.fn().mockResolvedValue([]);
        const getLibrariesUsingAttributeMockWithResult = jest.fn().mockResolvedValue(['library1', 'library2']);

        test('Should save a new attribute', async function () {
            const mockAttrRepo = {
                getAttributes: global.__mockPromise({list: [], totalCount: 0}),
                createAttribute: jest.fn().mockImplementation(attr => Promise.resolve(attr)),
                updateAttribute: jest.fn()
            } satisfies Mockify<IAttributeRepo>;

            const mockLibraryRepo: Mockify<ILibraryRepo> = {
                getLibrariesUsingAttribute: getLibrariesUsingAttributeMockWithoutResult
            };

            const attrDomain = attributeDomain({
                ...depsBase,
                'core.infra.attribute': mockAttrRepo,
                'core.domain.eventsManager': mockEventsManager,
                'core.domain.actionsList': mockALDomain,
                'core.domain.permission.admin': mockAdminPermDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperNoResult,
                'core.infra.cache.cacheService': mockCachesService,
                'core.infra.library': mockLibraryRepo,
                'core.utils': mockUtils,
                config: mockConf
            } as ToAny<IAttributeDomainDeps>);

            attrDomain.getAttributes = global.__mockPromise([{}]);

            const newAttr = await attrDomain.saveAttribute({
                attrData: {
                    id: 'test',
                    type: AttributeTypes.ADVANCED,
                    format: AttributeFormats.TEXT,
                    label: {fr: 'Test'}
                },
                ctx
            });

            expect(mockAttrRepo.createAttribute.mock.calls.length).toBe(1);
            expect(mockAttrRepo.updateAttribute.mock.calls.length).toBe(0);
            expect(mockAdminPermDomain.getAdminPermission).toHaveBeenCalled();
            expect(mockAdminPermDomain.getAdminPermission.mock.calls[0][0].action).toBe(
                AdminPermissionsActions.CREATE_ATTRIBUTE
            );

            expect(newAttr).toMatchObject({
                attrData: {
                    actions_list: {saveValue: [{is_system: true, id: 'validateFormat'}]},
                    format: 'text',
                    id: 'test',
                    type: 'advanced'
                },
                ctx
            });
        });

        test('Should throw a validation error if the attribute:id is forbidden', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                createAttribute: jest.fn().mockImplementation(attr => Promise.resolve(attr)),
                updateAttribute: jest.fn()
            };

            const attrDomain = attributeDomain({
                ...depsBase,
                'core.infra.attribute': mockAttrRepo,
                'core.domain.eventsManager': mockEventsManager,
                'core.domain.actionsList': mockALDomain,
                'core.domain.permission.admin': mockAdminPermDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperNoResult,
                'core.utils': mockUtils,
                config: mockConf
            } as ToAny<IAttributeDomainDeps>);

            attrDomain.getAttributes = global.__mockPromise([{}]);

            await expect(
                attrDomain.saveAttribute({
                    attrData: {
                        id: 'whoAmI',
                        type: AttributeTypes.SIMPLE,
                        format: AttributeFormats.TEXT,
                        label: {fr: 'quiJeSuis', en: 'whoAmI'}
                    },
                    ctx
                })
            ).rejects.toThrow(ValidationError);

            await expect(
                attrDomain.saveAttribute({
                    attrData: {
                        id: 'property',
                        type: AttributeTypes.SIMPLE,
                        format: AttributeFormats.TEXT,
                        label: {fr: 'propriété', en: 'property'}
                    },
                    ctx
                })
            ).rejects.toThrow(ValidationError);
        });

        test('Should update an attribute', async function () {
            const mockAttrRepo = {
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise({id: 'test', system: false})
            } satisfies Mockify<IAttributeRepo>;

            const mockLibraryRepo: Mockify<ILibraryRepo> = {
                getLibrariesUsingAttribute: getLibrariesUsingAttributeMockWithoutResult
            };

            const attrDomain = attributeDomain({
                ...depsBase,
                'core.infra.attribute': mockAttrRepo,
                'core.domain.actionsList': mockALDomain,
                'core.domain.permission.admin': mockAdminPermDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.domain.eventsManager': mockEventsManager,
                'core.utils': mockUtils,
                'core.infra.cache.cacheService': mockCachesService,
                'core.infra.library': mockLibraryRepo,
                config: mockConf
            } as ToAny<IAttributeDomainDeps>);

            attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

            const updatedLib = await attrDomain.saveAttribute({
                attrData: {
                    id: 'test',
                    type: AttributeTypes.ADVANCED,
                    format: AttributeFormats.TEXT,
                    actions_list: {saveValue: [{is_system: true, id: 'validateFormat', name: 'Validate Format'}]},
                    label: {fr: 'Test'}
                },
                ctx
            });

            expect(mockCacheService.deleteData).toHaveBeenCalled();
            expect(mockAttrRepo.createAttribute.mock.calls.length).toBe(0);
            expect(mockAttrRepo.updateAttribute.mock.calls.length).toBe(1);
            expect(mockAdminPermDomain.getAdminPermission).toHaveBeenCalled();
            expect(mockAdminPermDomain.getAdminPermission.mock.calls[0][0].action).toBe(
                AdminPermissionsActions.EDIT_ATTRIBUTE
            );
            expect(updatedLib).toMatchObject({id: 'test', system: false});
        });

        test('Should clear library attributes cache when updating an attribute', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise({id: 'test', system: false})
            };

            const mockLibraryRepo: Mockify<ILibraryRepo> = {
                getLibrariesUsingAttribute: getLibrariesUsingAttributeMockWithResult
            };

            const attrDomain = attributeDomain({
                ...depsBase,
                'core.infra.attribute': mockAttrRepo,
                'core.domain.actionsList': mockALDomain,
                'core.domain.permission.admin': mockAdminPermDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.domain.eventsManager': mockEventsManager,
                'core.utils': mockUtils,
                'core.infra.cache.cacheService': mockCachesService,
                'core.infra.library': mockLibraryRepo,
                config: mockConf
            } as ToAny<IAttributeDomainDeps>);

            attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

            await attrDomain.saveAttribute({
                attrData: {
                    id: 'test',
                    type: AttributeTypes.ADVANCED,
                    format: AttributeFormats.TEXT,
                    actions_list: {
                        saveValue: [{is_system: true, id: 'validateFormat', name: 'Validate Format'}]
                    },
                    label: {fr: 'Test'}
                },
                ctx
            });

            expect(mockCacheService.deleteData).toHaveBeenCalledTimes(3); // 1 for the attribute, 2 for libraries using attribute
        });

        test('Should read data from DB for fields not specified in save', async function () {
            const attrData = {...mockAttrAdvVersionable};

            const mockAttrRepo = {
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise(attrData)
            } satisfies Mockify<IAttributeRepo>;

            const mockLibraryRepo: Mockify<ILibraryRepo> = {
                getLibrariesUsingAttribute: getLibrariesUsingAttributeMockWithoutResult
            };

            const attrDomain = attributeDomain({
                ...depsBase,
                'core.infra.attribute': mockAttrRepo,
                'core.domain.actionsList': mockALDomain,
                'core.domain.permission.admin': mockAdminPermDomain,
                'core.domain.helpers.getCoreEntityById': jest.fn().mockReturnValue(attrData),
                'core.domain.eventsManager': mockEventsManager,
                'core.infra.cache.cacheService': mockCachesService,
                'core.infra.library': mockLibraryRepo,

                'core.utils': mockUtils,
                config: mockConf
            } as ToAny<IAttributeDomainDeps>);

            attrDomain.getAttributes = global.__mockPromise([attrData]);

            await attrDomain.saveAttribute({
                attrData: {
                    id: mockAttrAdvVersionable.id,
                    type: AttributeTypes.ADVANCED,
                    format: AttributeFormats.NUMERIC,
                    versions_conf: undefined
                },
                ctx
            });

            expect(mockAttrRepo.updateAttribute.mock.calls[0][0]).toMatchObject({
                attrData: {
                    _key: '',
                    id: 'advanced_attribute',
                    label: {
                        fr: 'Mon Attribut',
                        en: 'My Attribute'
                    },
                    type: 'advanced',
                    format: 'numeric'
                },
                ctx
            });
        });

        test('When saving actions list, keep saved system actions', async () => {
            const attrData = {
                ...mockAttrAdv,
                actions_list: {
                    [ActionsListEvents.SAVE_VALUE]: [
                        {id: 'validateFormat', name: 'Validate Format', is_system: true},
                        {id: 'toNumber', name: 'To Number', is_system: false}
                    ],
                    [ActionsListEvents.GET_VALUE]: [{id: 'toNumber', name: 'To Number', is_system: true}],
                    [ActionsListEvents.DELETE_VALUE]: []
                }
            };

            const mockAttrRepo = {
                getAttributes: global.__mockPromise({
                    list: [attrData],
                    totalCount: 1
                }),
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise(attrData)
            } satisfies Mockify<IAttributeRepo>;

            const mockLibraryRepo: Mockify<ILibraryRepo> = {
                getLibrariesUsingAttribute: getLibrariesUsingAttributeMockWithoutResult
            };

            const attrDomain = attributeDomain({
                ...depsBase,
                'core.infra.attribute': mockAttrRepo,
                'core.domain.actionsList': mockALDomain,
                'core.domain.permission.admin': mockAdminPermDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.domain.eventsManager': mockEventsManager,
                'core.infra.cache.cacheService': mockCachesService,
                'core.infra.library': mockLibraryRepo,
                'core.utils': mockUtils,
                config: mockConf
            } as ToAny<IAttributeDomainDeps>);

            attrDomain.getAttributes = global.__mockPromise([attrData]);

            const updatedAttr = await attrDomain.saveAttribute({
                attrData: {
                    id: mockAttrAdvVersionable.id,
                    type: AttributeTypes.ADVANCED,
                    format: AttributeFormats.NUMERIC,
                    actions_list: {
                        [ActionsListEvents.SAVE_VALUE]: [
                            {id: 'toJSON', name: 'To JSON'},
                            {
                                id: 'validateFormat',
                                is_system: true,
                                name: 'Validate Format',
                                params: [{name: 'myParam', value: 'param_value'}]
                            }
                        ],
                        [ActionsListEvents.GET_VALUE]: [{id: 'toNumber', is_system: true, name: 'To Number'}],
                        [ActionsListEvents.DELETE_VALUE]: []
                    }
                },
                ctx
            });

            expect(mockAttrRepo.updateAttribute.mock.calls[0][0].attrData.actions_list).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [
                    {id: 'toJSON', name: 'To JSON', is_system: false},
                    {
                        id: 'validateFormat',
                        is_system: true,
                        name: 'Validate Format',
                        params: [{name: 'myParam', value: 'param_value'}]
                    }
                ],
                [ActionsListEvents.GET_VALUE]: [{id: 'toNumber', is_system: true, name: 'To Number'}],
                [ActionsListEvents.DELETE_VALUE]: []
            });
        });

        test('Should throw if actions list type is invalid', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise({id: 'test', system: false})
            };

            const attrDomain = attributeDomain({
                ...depsBase,
                'core.infra.attribute': mockAttrRepo,
                'core.domain.actionsList': mockALDomain,
                'core.domain.permission.admin': mockAdminPermDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.utils': mockUtils,
                config: mockConf
            } as ToAny<IAttributeDomainDeps>);

            attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

            const attrToSave = {
                id: 'test',
                type: AttributeTypes.ADVANCED,
                actions_list: {
                    saveValue: [
                        {is_system: true, id: 'validateFormat', name: 'Validate Format'},
                        {is_system: false, id: 'toNumber', name: 'To Number'}
                    ]
                },
                label: {fr: 'Test'}
            };

            await expect(attrDomain.saveAttribute({attrData: attrToSave, ctx})).rejects.toThrow(ValidationError);
        });

        test('Should throw if invalid ID', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise({id: 'test', system: false})
            };

            const attrDomain = attributeDomain({
                ...depsBase,
                'core.infra.attribute': mockAttrRepo,
                'core.domain.actionsList': mockALDomain,
                'core.domain.permission.admin': mockAdminPermDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.utils': mockUtils,
                config: mockConf
            } as ToAny<IAttributeDomainDeps>);

            attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

            const attrToSave = {
                id: 'test',
                type: AttributeTypes.ADVANCED,
                actions_list: {saveValue: [{is_system: true, id: 'toJSON', name: 'To JSON'}]},
                label: {fr: 'Test'}
            };

            await expect(attrDomain.saveAttribute({attrData: attrToSave, ctx})).rejects.toThrow(ValidationError);
        });

        test('Should throw if system action list is missing', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise({id: 'test', system: false})
            };

            const attrDomain = attributeDomain({
                ...depsBase,
                'core.infra.attribute': mockAttrRepo,
                'core.domain.actionsList': mockALDomain,
                'core.domain.permission.admin': mockAdminPermDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.utils': mockUtils,
                config: mockConf
            } as ToAny<IAttributeDomainDeps>);

            attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

            const attrToSave = {
                id: 'test',
                type: AttributeTypes.ADVANCED,
                format: AttributeFormats.TEXT,
                label: {fr: 'Test'},
                actions_list: {saveValue: [{is_system: true, id: 'toJSON', name: 'To JSON'}]}
            };

            await expect(attrDomain.saveAttribute({attrData: attrToSave, ctx})).rejects.toThrow(ValidationError);
        });

        test('Should throw if forbidden action', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                createAttribute: jest.fn(),
                updateAttribute: global.__mockPromise({id: 'test', system: false})
            };

            const attrDomain = attributeDomain({
                ...depsBase,
                'core.infra.attribute': mockAttrRepo,
                'core.domain.actionsList': mockALDomain,
                'core.domain.permission.admin': mockAdminPermDomainForbidden,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.utils': mockUtils,
                config: mockConf
            } as ToAny<IAttributeDomainDeps>);

            attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

            const attrToSave = {
                id: 'test',
                type: AttributeTypes.ADVANCED,
                format: AttributeFormats.TEXT,
                actions_list: {saveValue: [{is_system: true, id: 'toJSON', name: 'To JSON'}]},
                label: {fr: 'Test'}
            };
            await expect(attrDomain.saveAttribute({attrData: attrToSave, ctx})).rejects.toThrow(PermissionError);
        });

        test('Should throw if multiple values on simple or simple link attribute', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                createAttribute: jest.fn(),
                updateAttribute: jest.fn()
            };

            const attrDomain = attributeDomain({
                ...depsBase,
                'core.infra.attribute': mockAttrRepo,
                'core.domain.permission.admin': mockAdminPermDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.utils': mockUtils,
                config: mockConf
            } as ToAny<IAttributeDomainDeps>);

            attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

            const attrToSaveSimple = {
                id: 'test',
                type: AttributeTypes.SIMPLE,
                label: {fr: 'Test'},
                multiple_values: true
            };
            await expect(attrDomain.saveAttribute({attrData: attrToSaveSimple, ctx})).rejects.toThrow(ValidationError);

            const attrToSaveSimpleLink = {
                id: 'test',
                type: AttributeTypes.SIMPLE_LINK,
                label: {fr: 'Test'},
                multiple_values: true
            };
            await expect(attrDomain.saveAttribute({attrData: attrToSaveSimpleLink, ctx})).rejects.toThrow(
                ValidationError
            );
        });

        test('Should throw if using invalid profile on versions conf', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                getAttributes: jest.fn().mockImplementation(filters => {
                    const list = filters.type === AttributeTypes.TREE ? [mockAttrTree] : [];
                    return Promise.resolve({list, totalCount: list.length});
                }),
                createAttribute: jest.fn().mockImplementation(attr => Promise.resolve(attr)),
                updateAttribute: jest.fn()
            };

            const mockVersionProfileDomain: Mockify<IVersionProfileDomain> = {
                getVersionProfiles: jest.fn().mockImplementation(() => Promise.resolve({list: []}))
            };

            const mockTreeRepo: Mockify<ITreeRepo> = {
                getTrees: global.__mockPromise({list: [], totalCount: 0})
            };

            const attrDomain = attributeDomain({
                ...depsBase,
                'core.infra.attribute': mockAttrRepo,
                'core.domain.actionsList': mockALDomain,
                'core.domain.permission.admin': mockAdminPermDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.domain.versionProfile': mockVersionProfileDomain,
                'core.utils': mockUtils,
                'core.infra.tree': mockTreeRepo,
                config: mockConf
            } as ToAny<IAttributeDomainDeps>);

            attrDomain.getAttributes = global.__mockPromise([{}]);

            await expect(attrDomain.saveAttribute({attrData: mockAttrAdvVersionable, ctx})).rejects.toThrow(
                ValidationError
            );
        });

        test('Check required fields at creation', async () => {
            const mockTreeRepo: Mockify<ITreeRepo> = {
                getTrees: global.__mockPromise({list: [], totalCount: 0})
            };

            const attrDomain = attributeDomain({
                ...depsBase,
                'core.domain.actionsList': mockALDomain,
                'core.domain.permission.admin': mockAdminPermDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperNoResult,
                'core.utils': mockUtils,
                'core.infra.tree': mockTreeRepo,
                config: mockConf
            } as ToAny<IAttributeDomainDeps>);

            const attrWithNoType: Partial<IAttribute> = {
                id: 'test_attr',
                format: AttributeFormats.TEXT,
                label: {fr: 'Test'}
            };
            await expect(attrDomain.saveAttribute({attrData: attrWithNoType as IAttribute, ctx})).rejects.toThrow(
                ValidationError
            );

            const attrWithNoFormat: Partial<IAttribute> = {
                id: 'test_attr',
                type: AttributeTypes.SIMPLE,
                label: {fr: 'Test'}
            };
            await expect(attrDomain.saveAttribute({attrData: attrWithNoFormat as IAttribute, ctx})).rejects.toThrow(
                ValidationError
            );

            const attrWithNoLabel: Partial<IAttribute> = {
                id: 'test_attr',
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.TEXT,
                label: {en: 'Test'}
            };
            await expect(attrDomain.saveAttribute({attrData: attrWithNoLabel as IAttribute, ctx})).rejects.toThrow(
                ValidationError
            );

            const attrWithNoLinkedLibrary: Partial<IAttribute> = {
                id: 'test_attr',
                type: AttributeTypes.SIMPLE_LINK,
                label: {fr: 'Test'}
            };
            await expect(
                attrDomain.saveAttribute({attrData: attrWithNoLinkedLibrary as IAttribute, ctx})
            ).rejects.toThrow(ValidationError);

            const attrWithNoLinkedTree: Partial<IAttribute> = {
                id: 'test_attr',
                type: AttributeTypes.TREE,
                label: {fr: 'Test'}
            };
            await expect(attrDomain.saveAttribute({attrData: attrWithNoLinkedTree as IAttribute, ctx})).rejects.toThrow(
                ValidationError
            );
        });

        describe('Metadata', () => {
            test('Should throw if saving metadata on simple attribute', async () => {
                const attrDomain = attributeDomain({
                    ...depsBase,
                    'core.domain.permission.admin': mockAdminPermDomain,
                    'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                    'core.utils': mockUtils,
                    config: mockConf
                } as ToAny<IAttributeDomainDeps>);

                attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

                await expect(
                    attrDomain.saveAttribute({
                        attrData: {
                            ...mockAttrSimple,
                            id: 'metadata_attribute',
                            metadata_fields: ['some_simple_attribute']
                        },
                        ctx
                    })
                ).rejects.toThrow(ValidationError);
            });

            test('Should throw if invalid metadata attribute', async () => {
                const mockAttrRepo: Mockify<IAttributeRepo> = {
                    getAttributes: jest
                        .fn()
                        .mockImplementation(({params: {filters}, ctx: ct}) =>
                            filters.id === 'metadata_attribute'
                                ? {list: [{...mockAttrAdv, id: 'metadata_attribute'}]}
                                : {list: []}
                        )
                };

                const mockGetEntityByIdHelperForMetadata = jest
                    .fn()
                    .mockImplementation((type, id) =>
                        id === 'metadata_attribute' ? {...mockAttrAdv, id: 'metadata_attribute'} : null
                    );

                const attrDomain = attributeDomain({
                    ...depsBase,
                    'core.domain.permission.admin': mockAdminPermDomain,
                    'core.domain.actionsList': mockALDomain,
                    'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelperForMetadata,
                    'core.infra.attribute': mockAttrRepo,
                    'core.utils': mockUtils,
                    config: mockConf
                } as ToAny<IAttributeDomainDeps>);

                attrDomain.getAttributes = global.__mockPromise([{id: 'test'}]);

                await expect(
                    attrDomain.saveAttribute({
                        attrData: {
                            ...mockAttrAdv,
                            id: 'metadata_attribute',
                            metadata_fields: ['some_invalid_attribute']
                        },
                        ctx
                    })
                ).rejects.toThrow(ValidationError);
            });
        });
    });

    describe('deleteAttribute', () => {
        const attrData = {id: 'test_attribute', system: false, label: {fr: 'Test'}, format: 'text', type: 'index'};

        test('Should delete an attribute and return deleted attribute', async function () {
            const mockAttrRepo = {
                deleteAttribute: global.__mockPromise(attrData),
                getAttributes: global.__mockPromise({list: []})
            } satisfies Mockify<IAttributeRepo>;

            const mockFormRepo: Mockify<IFormRepo> = {
                getForms: global.__mockPromise({list: [mockForm]}),
                updateForm: global.__mockPromise()
            };

            const attrDomain = attributeDomain({
                ...depsBase,
                'core.infra.attribute': mockAttrRepo,
                'core.domain.permission.admin': mockAdminPermDomain,
                'core.domain.eventsManager': mockEventsManager,
                'core.infra.cache.cacheService': mockCachesService,
                'core.infra.form': mockFormRepo,
                'core.utils': mockUtils
            } as ToAny<IAttributeDomainDeps>);

            attrDomain.getAttributes = global.__mockPromise({list: [attrData], totalCount: 1});

            await attrDomain.deleteAttribute({id: attrData.id, ctx});

            expect(mockAttrRepo.deleteAttribute.mock.calls.length).toBe(1);
            expect(mockAdminPermDomain.getAdminPermission).toHaveBeenCalled();
            expect(mockAdminPermDomain.getAdminPermission.mock.calls[0][0].action).toBe(
                AdminPermissionsActions.DELETE_ATTRIBUTE
            );
        });

        test('Should throw if unknown attribute', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {deleteAttribute: global.__mockPromise()};
            const attrDomain = attributeDomain({
                ...depsBase,
                'core.infra.attribute': mockAttrRepo
            } as ToAny<IAttributeDomainDeps>);
            attrDomain.getAttributes = global.__mockPromise([]);

            await expect(attrDomain.deleteAttribute({id: attrData.id, ctx})).rejects.toThrow();
        });

        test('Should throw if system attribute', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {deleteAttribute: global.__mockPromise()};
            const attrDomain = attributeDomain({
                ...depsBase,
                'core.infra.attribute': mockAttrRepo
            } as ToAny<IAttributeDomainDeps>);
            attrDomain.getAttributes = global.__mockPromise({list: [{system: true}], totalCount: 1});

            await expect(attrDomain.deleteAttribute({id: attrData.id, ctx})).rejects.toThrow();
        });

        test('Should throw if forbidden action', async function () {
            const mockAttrRepo: Mockify<IAttributeRepo> = {deleteAttribute: global.__mockPromise()};
            const attrDomain = attributeDomain({
                ...depsBase,
                'core.infra.attribute': mockAttrRepo,
                'core.domain.permission.admin': mockAdminPermDomainForbidden
            } as ToAny<IAttributeDomainDeps>);
            attrDomain.getAttributes = global.__mockPromise({list: [], totalCount: 0});

            await expect(attrDomain.deleteAttribute({id: attrData.id, ctx})).rejects.toThrow(PermissionError);
        });

        test('Should throw if attribute is used in metadata of another attribute', async () => {
            const mockAttrRepo: Mockify<IAttributeRepo> = {
                deleteAttribute: global.__mockPromise(attrData),
                getAttributes: global.__mockPromise({list: [{mockAttrAdv}]})
            };

            const attrDomain = attributeDomain({
                ...depsBase,
                'core.domain.permission.admin': mockAdminPermDomain,
                'core.infra.attribute': mockAttrRepo,
                'core.infra.cache.cacheService': mockCachesService,
                'core.utils': mockUtils
            } as ToAny<IAttributeDomainDeps>);

            attrDomain.getAttributes = global.__mockPromise({list: [attrData], totalCount: 1});

            await expect(attrDomain.deleteAttribute({id: attrData.id, ctx})).rejects.toThrow(ValidationError);
        });
    });

    describe('getInputType', () => {
        const attrDomain = attributeDomain(depsBase);
        test('Return input type by format', async () => {
            expect(
                attrDomain.getInputTypes({attrData: {...mockAttrSimple, format: AttributeFormats.TEXT}, ctx})
            ).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.STRING],
                [ActionsListEvents.GET_VALUE]: [ActionsListIOTypes.STRING],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.STRING]
            });
            expect(
                attrDomain.getInputTypes({attrData: {...mockAttrSimple, format: AttributeFormats.DATE}, ctx})
            ).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.NUMBER],
                [ActionsListEvents.GET_VALUE]: [ActionsListIOTypes.NUMBER],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.NUMBER]
            });
            expect(
                attrDomain.getInputTypes({attrData: {...mockAttrSimple, format: AttributeFormats.ENCRYPTED}, ctx})
            ).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.STRING],
                [ActionsListEvents.GET_VALUE]: [ActionsListIOTypes.STRING],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.STRING]
            });

            expect(
                attrDomain.getInputTypes({attrData: {...mockAttrSimple, format: AttributeFormats.NUMERIC}, ctx})
            ).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.NUMBER],
                [ActionsListEvents.GET_VALUE]: [ActionsListIOTypes.NUMBER],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.NUMBER]
            });

            expect(
                attrDomain.getInputTypes({attrData: {...mockAttrSimple, format: AttributeFormats.BOOLEAN}, ctx})
            ).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.BOOLEAN],
                [ActionsListEvents.GET_VALUE]: [ActionsListIOTypes.BOOLEAN],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.BOOLEAN]
            });

            expect(
                attrDomain.getInputTypes({attrData: {...mockAttrSimple, format: AttributeFormats.EXTENDED}, ctx})
            ).toEqual(
                {
                    [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.STRING],
                    [ActionsListEvents.GET_VALUE]: [ActionsListIOTypes.STRING],
                    [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.STRING]
                } // json
            );
        });
    });

    describe('getOutputType', () => {
        const attrDomain = attributeDomain(depsBase);
        test('Return output type by format', async () => {
            expect(
                attrDomain.getOutputTypes({attrData: {...mockAttrSimple, format: AttributeFormats.TEXT}, ctx})
            ).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.STRING],
                [ActionsListEvents.GET_VALUE]: [
                    ActionsListIOTypes.STRING,
                    ActionsListIOTypes.NUMBER,
                    ActionsListIOTypes.OBJECT,
                    ActionsListIOTypes.BOOLEAN
                ],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.STRING]
            });
            expect(
                attrDomain.getOutputTypes({attrData: {...mockAttrSimple, format: AttributeFormats.DATE}, ctx})
            ).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.NUMBER],
                [ActionsListEvents.GET_VALUE]: [
                    ActionsListIOTypes.STRING,
                    ActionsListIOTypes.NUMBER,
                    ActionsListIOTypes.OBJECT,
                    ActionsListIOTypes.BOOLEAN
                ],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.NUMBER]
            });
            expect(
                attrDomain.getOutputTypes({attrData: {...mockAttrSimple, format: AttributeFormats.ENCRYPTED}, ctx})
            ).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.STRING],
                [ActionsListEvents.GET_VALUE]: [
                    ActionsListIOTypes.STRING,
                    ActionsListIOTypes.NUMBER,
                    ActionsListIOTypes.OBJECT,
                    ActionsListIOTypes.BOOLEAN
                ],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.STRING]
            });

            expect(
                attrDomain.getOutputTypes({attrData: {...mockAttrSimple, format: AttributeFormats.NUMERIC}, ctx})
            ).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.NUMBER],
                [ActionsListEvents.GET_VALUE]: [
                    ActionsListIOTypes.STRING,
                    ActionsListIOTypes.NUMBER,
                    ActionsListIOTypes.OBJECT,
                    ActionsListIOTypes.BOOLEAN
                ],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.NUMBER]
            });

            expect(
                attrDomain.getOutputTypes({attrData: {...mockAttrSimple, format: AttributeFormats.BOOLEAN}, ctx})
            ).toEqual({
                [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.BOOLEAN],
                [ActionsListEvents.GET_VALUE]: [
                    ActionsListIOTypes.STRING,
                    ActionsListIOTypes.NUMBER,
                    ActionsListIOTypes.OBJECT,
                    ActionsListIOTypes.BOOLEAN
                ],
                [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.BOOLEAN]
            });

            expect(
                attrDomain.getOutputTypes({attrData: {...mockAttrSimple, format: AttributeFormats.EXTENDED}, ctx})
            ).toEqual(
                {
                    [ActionsListEvents.SAVE_VALUE]: [ActionsListIOTypes.OBJECT],
                    [ActionsListEvents.GET_VALUE]: [
                        ActionsListIOTypes.STRING,
                        ActionsListIOTypes.NUMBER,
                        ActionsListIOTypes.OBJECT,
                        ActionsListIOTypes.BOOLEAN
                    ],
                    [ActionsListEvents.DELETE_VALUE]: [ActionsListIOTypes.OBJECT]
                } // json
            );
        });
    });
});
