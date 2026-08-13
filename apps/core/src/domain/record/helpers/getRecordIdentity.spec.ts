import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type IValidateHelper} from '../../helpers/validate';
import {type i18n} from 'i18next';
import {type ICachesService} from '../../../infra/cache/cacheService';
import {type IUtils, type ToAny} from '../../../utils/utils';
import type * as Config from '../../../_types/config';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {LibraryBehavior} from '../../../_types/library';
import {dateRangeAttributeMock, mockAttrSimple} from '../../../__tests__/mocks/attribute';
import {mockRecord} from '../../../__tests__/mocks/record';
import {mockTranslatorWithOptions} from '../../../__tests__/mocks/translator';
import {mockStandardValue} from '../../../__tests__/mocks/value';
import getRecordIdentityFactory, {type GetRecordIdentityHelper} from './getRecordIdentity';
import {type GetRecordFieldValueHelper} from '../../value/helpers/getRecordFieldValue';

const eventsManagerMockConfig: Mockify<Config.IEventsManager> = {
    routingKeys: {data_events: 'test.data.events', pubsub_events: 'test.pubsub.events'},
};

const mockConfig: Mockify<Config.IConfig> = {
    eventsManager: eventsManagerMockConfig as Config.IEventsManager,
    files: {
        rootPaths: 'files1:/files',
        originalsPathPrefix: 'originals',
    },
};

const ctx: IQueryInfos = {
    userId: '1',
    queryId: 'getRecordIdentityTest',
    lang: 'fr',
};

const mockUtils: Mockify<IUtils> = {
    translateError: vi.fn().mockReturnValue('mock error'),
    getRecordsCacheKey: vi.fn().mockReturnValue('cache_key'),
    getCoreEntityCacheKey: vi.fn().mockReturnValue('cache_key'),
    getPreviewsAttributeName: vi.fn().mockReturnValue('previews'),
    getPreviewUrl: vi.fn().mockImplementation(url => `/preview/${url}`),
    isLinkAttribute: vi.fn().mockReturnValue(false),
    isTreeAttribute: vi.fn().mockReturnValue(false),
};

const mockCacheService: Mockify<ICachesService> = {
    memoize: vi.fn().mockImplementation(({func}) => func()),
    getCache: vi.fn().mockReturnValue({
        deleteData: vi.fn(),
    }),
};

const mockValidateHelper: Mockify<IValidateHelper> = {
    validateLibrary: vi.fn().mockImplementation(libraryId => ({
        id: libraryId,
        behavior: libraryId === 'files' ? LibraryBehavior.FILES : LibraryBehavior.STANDARD,
        recordIdentityConf: {
            label: 'library_label',
            color: 'library_color',
            preview: 'library_preview',
            subLabel: 'library_subLabel',
        },
    })),
};

beforeEach(() => {
    vi.clearAllMocks();
});

const makeHelper = (
    overrides: Partial<ToAny<Parameters<typeof getRecordIdentityFactory>[0]>> = {},
): GetRecordIdentityHelper =>
    getRecordIdentityFactory({
        config: {} as Config.IConfig,
        'core.domain.attribute': vi.fn() as unknown as IAttributeDomain,
        'core.domain.value.helpers.getRecordFieldValue': vi.fn() as unknown as GetRecordFieldValueHelper,
        'core.domain.helpers.validate': vi.fn() as unknown as IValidateHelper,
        'core.domain.helpers.getCoreEntityById': vi.fn(),
        'core.domain.tree.helpers.elementAncestors': vi.fn() as any,
        'core.domain.record.helpers.findRecords': vi.fn() as any,
        'core.infra.cache.cacheService': mockCacheService as ICachesService,
        'core.utils': mockUtils as IUtils,
        translator: {} as i18n,
        ...overrides,
    });

describe('getRecordIdentity', () => {
    test('Return record identity', async () => {
        const record = {
            id: '222536283',
            library: 'test_lib',
            created_at: 1520931427,
            modified_at: 1520931427,
            ean: '9876543219999999',
            visual_simple: '222713677',
        };

        const libData = {
            id: 'test_lib',
            recordIdentityConf: {
                label: 'label_attr',
                color: 'color_attr',
                preview: 'preview_attr',
            },
        };

        const fileLibData = {
            id: 'files',
            behavior: LibraryBehavior.FILES,
            recordIdentityConf: {
                label: 'label_attr',
            },
        };

        const mockGetRecordFieldValueHelper: GetRecordFieldValueHelper = vi
            .fn()
            .mockImplementation(({attributePath: attributeId}) => {
                if (attributeId === 'label_attr') {
                    return Promise.resolve([{payload: 'Label Value'}]);
                }
                if (attributeId === 'color_attr') {
                    return Promise.resolve([{payload: '#123456'}]);
                }
                if (attributeId === 'preview_attr') {
                    return Promise.resolve([
                        {
                            ...mockStandardValue,
                            payload: {
                                ...mockRecord,
                                previews: {
                                    small: 'small_fake-image',
                                    medium: 'medium_fake-image',
                                    big: 'big_fake-image',
                                },
                            },
                        },
                    ]);
                }
                if (attributeId === 'previews') {
                    return Promise.resolve([
                        {
                            raw_payload: {
                                small: 'small_fake-image',
                                medium: 'medium_fake-image',
                                big: 'big_fake-image',
                            },
                        },
                    ]);
                }
                return Promise.resolve([]);
            });

        const mockAttributeDomain: Mockify<IAttributeDomain> = {
            getAttributeProperties: vi
                .fn()
                .mockImplementation(({id}) => (id === 'preview_attr' ? {linked_library: 'files'} : mockAttrSimple)),
        };

        const mockGetEntityByIdHelper = vi.fn().mockReturnValue(libData);

        const mockUtilsRecordIdentity: Mockify<IUtils> = {
            ...mockUtils,
            getPreviewsAttributeName: vi.fn().mockReturnValue('previews'),
            isLinkAttribute: vi.fn().mockReturnValue(false),
            isTreeAttribute: vi.fn().mockReturnValue(false),
        };

        const mockValidateHelperLocal: Mockify<IValidateHelper> = {
            validateLibrary: vi.fn().mockImplementation(libraryId => {
                if (libraryId === 'test_lib') {
                    return libData;
                }
                if (libraryId === 'files') {
                    return fileLibData;
                }
                return null;
            }),
        };

        const helper = makeHelper({
            'core.domain.value.helpers.getRecordFieldValue': mockGetRecordFieldValueHelper,
            'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
            'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
            'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
            'core.utils': mockUtilsRecordIdentity as IUtils,
            config: mockConfig as Config.IConfig,
        });

        const res = await helper(record, ctx);

        expect(res.id).toBe('222536283');
        expect(res.library).toMatchObject(libData);
        expect(await res.getLabel()).toBe('Label Value');
        expect(await res.getColor()).toBe('#123456');
        expect(await res.getPreview()).toEqual({
            big: '/preview/big_fake-image',
            small: '/preview/small_fake-image',
            medium: '/preview/medium_fake-image',
            original: '/originals/my_lib/123456',
            file: {
                active: true,
                created_at: 1234567890,
                created_by: '1',
                id: '123456',
                library: 'my_lib',
                modified_at: 1234567890,
                modified_by: '1',
                previews: {
                    big: 'big_fake-image',
                    medium: 'medium_fake-image',
                    small: 'small_fake-image',
                },
            },
        });
    });

    describe('Record entity with inherited label', () => {
        test('Return record identity with inherited label', async () => {
            const record = {
                id: '222536283',
                library: 'test_lib',
                created_at: 1520931427,
                modified_at: 1520931427,
                ean: '9876543219999999',
                visual_simple: '222713677',
            };

            const libData = {
                id: 'test_lib',
                recordIdentityConf: {
                    label: 'label_attr',
                    preview: 'preview_attr',
                },
            };

            const mockGetRecordFieldValueHelper: GetRecordFieldValueHelper = vi.fn().mockImplementation(
                vi.fn().mockImplementation(({attributePath: attributeId}) => {
                    if (attributeId === 'label_attr') {
                        return Promise.resolve([
                            {payload: null},
                            {payload: 'Inherited Label Value', isInherited: true},
                        ]);
                    }
                    return Promise.resolve([]);
                }),
            );

            const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                validateLibrary: vi.fn().mockReturnValue(libData),
            };

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrSimple),
            };

            const helper = makeHelper({
                'core.domain.value.helpers.getRecordFieldValue': mockGetRecordFieldValueHelper,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                'core.utils': mockUtils as IUtils,
                config: mockConfig as Config.IConfig,
            });

            const res = await helper(record, ctx);

            expect(res.id).toBe('222536283');
            expect(res.library).toMatchObject(libData);
            expect(await res.getLabel()).toBe('Inherited Label Value');
        });

        test('Return record identity with override label', async () => {
            const record = {
                id: '222536283',
                library: 'test_lib',
                created_at: 1520931427,
                modified_at: 1520931427,
                ean: '9876543219999999',
                visual_simple: '222713677',
            };

            const libData = {
                id: 'test_lib',
                recordIdentityConf: {
                    label: 'label_attr',
                    preview: 'preview_attr',
                },
            };

            const mockGetRecordFieldValueHelper: GetRecordFieldValueHelper = vi.fn().mockImplementation(
                vi.fn().mockImplementation(({attributePath: attributeId}) => {
                    if (attributeId === 'label_attr') {
                        return Promise.resolve([
                            {payload: 'Override Label Value', isInherited: false},
                            {payload: 'Inherited Label Value', isInherited: true},
                        ]);
                    }
                    return Promise.resolve([]);
                }),
            );

            const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                validateLibrary: vi.fn().mockReturnValue(libData),
            };

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrSimple),
            };

            const helper = makeHelper({
                'core.domain.value.helpers.getRecordFieldValue': mockGetRecordFieldValueHelper,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                'core.utils': mockUtils as IUtils,
                config: mockConfig as Config.IConfig,
            });

            const res = await helper(record, ctx);

            expect(res.id).toBe('222536283');
            expect(res.library).toMatchObject(libData);
            expect(await res.getLabel()).toBe('Override Label Value');
        });
    });

    describe('Record entity with inherited subLabel', () => {
        test('Return record identity with inherited subLabel', async () => {
            const record = {
                id: '222536283',
                library: 'test_lib',
                created_at: 1520931427,
                modified_at: 1520931427,
                ean: '9876543219999999',
                visual_simple: '222713677',
            };

            const libData = {
                id: 'test_lib',
                recordIdentityConf: {
                    subLabel: 'subLabel_attr',
                    preview: 'preview_attr',
                },
            };

            const mockGetRecordFieldValueHelper: GetRecordFieldValueHelper = vi.fn().mockImplementation(
                vi.fn().mockImplementation(({attributePath: attributeId}) => {
                    if (attributeId === 'subLabel_attr') {
                        return Promise.resolve([
                            {payload: null},
                            {payload: 'Inherited SubLabel Value', isInherited: true},
                        ]);
                    }
                    return Promise.resolve([]);
                }),
            );

            const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                validateLibrary: vi.fn().mockReturnValue(libData),
            };

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrSimple),
            };

            const helper = makeHelper({
                'core.domain.value.helpers.getRecordFieldValue': mockGetRecordFieldValueHelper,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                'core.utils': mockUtils as IUtils,
                config: mockConfig as Config.IConfig,
            });

            const res = await helper(record, ctx);

            expect(res.id).toBe('222536283');
            expect(res.library).toMatchObject(libData);
            expect(await res.getSubLabel()).toBe('Inherited SubLabel Value');
        });

        test('Return record identity with override sublabel', async () => {
            const record = {
                id: '222536283',
                library: 'test_lib',
                created_at: 1520931427,
                modified_at: 1520931427,
                ean: '9876543219999999',
                visual_simple: '222713677',
            };

            const libData = {
                id: 'test_lib',
                recordIdentityConf: {
                    subLabel: 'subLabel_attr',
                    preview: 'preview_attr',
                },
            };

            const mockGetRecordFieldValueHelper: GetRecordFieldValueHelper = vi.fn().mockImplementation(
                vi.fn().mockImplementation(({attributePath: attributeId}) => {
                    if (attributeId === 'subLabel_attr') {
                        return Promise.resolve([
                            {payload: 'Override SubLabel Value', isInherited: false},
                            {payload: 'Inherited SubLabel Value', isInherited: true},
                        ]);
                    }
                    return Promise.resolve([]);
                }),
            );

            const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                validateLibrary: vi.fn().mockReturnValue(libData),
            };

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrSimple),
            };

            const helper = makeHelper({
                'core.domain.value.helpers.getRecordFieldValue': mockGetRecordFieldValueHelper,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                'core.utils': mockUtils as IUtils,
                config: mockConfig as Config.IConfig,
            });

            const res = await helper(record, ctx);

            expect(res.id).toBe('222536283');
            expect(res.library).toMatchObject(libData);
            expect(await res.getSubLabel()).toBe('Override SubLabel Value');
        });

        test('Return record id directly when subLabel is configured as "id"', async () => {
            const record = {
                id: '222536283',
                library: 'test_lib',
                created_at: 1520931427,
                modified_at: 1520931427,
            };

            const libData = {
                id: 'test_lib',
                recordIdentityConf: {
                    subLabel: 'id',
                },
            };

            const mockGetRecordFieldValueHelper: GetRecordFieldValueHelper = vi.fn().mockImplementation(vi.fn());

            const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                validateLibrary: vi.fn().mockReturnValue(libData),
            };

            const helper = makeHelper({
                'core.domain.value.helpers.getRecordFieldValue': mockGetRecordFieldValueHelper,
                'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                'core.utils': mockUtils as IUtils,
                config: mockConfig as Config.IConfig,
            });

            const res = await helper(record, ctx);

            expect(await res.getSubLabel()).toBe('222536283');
            expect(mockGetRecordFieldValueHelper).not.toHaveBeenCalled();
        });
    });

    describe('Record entity with inherited color', () => {
        test('Return record identity with inherited color', async () => {
            const record = {
                id: '222536283',
                library: 'test_lib',
                created_at: 1520931427,
                modified_at: 1520931427,
                ean: '9876543219999999',
                visual_simple: '222713677',
            };

            const libData = {
                id: 'test_lib',
                recordIdentityConf: {
                    color: 'color_attr',
                    preview: 'preview_attr',
                },
            };

            const mockGetRecordFieldValueHelper: GetRecordFieldValueHelper = vi.fn().mockImplementation(
                vi.fn().mockImplementation(({attributePath: attributeId}) => {
                    if (attributeId === 'color_attr') {
                        return Promise.resolve([{payload: null}, {payload: '#ff0000', isInherited: true}]);
                    }
                    return Promise.resolve([]);
                }),
            );

            const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                validateLibrary: vi.fn().mockReturnValue(libData),
            };

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrSimple),
            };

            const helper = makeHelper({
                'core.domain.value.helpers.getRecordFieldValue': mockGetRecordFieldValueHelper,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                'core.utils': mockUtils as IUtils,
                config: mockConfig as Config.IConfig,
            });

            const res = await helper(record, ctx);

            expect(res.id).toBe('222536283');
            expect(res.library).toMatchObject(libData);
            expect(await res.getColor()).toBe('#ff0000');
        });

        test('Return record identity with override color', async () => {
            const record = {
                id: '222536283',
                library: 'test_lib',
                created_at: 1520931427,
                modified_at: 1520931427,
                ean: '9876543219999999',
                visual_simple: '222713677',
            };

            const libData = {
                id: 'test_lib',
                recordIdentityConf: {
                    color: 'color_attr',
                    preview: 'preview_attr',
                },
            };

            const mockGetRecordFieldValueHelper: GetRecordFieldValueHelper = vi.fn().mockImplementation(
                vi.fn().mockImplementation(({attributePath: attributeId}) => {
                    if (attributeId === 'color_attr') {
                        return Promise.resolve([
                            {payload: '#ffff00', isInherited: false},
                            {payload: '#ff0000', isInherited: true},
                        ]);
                    }
                    return Promise.resolve([]);
                }),
            );

            const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                validateLibrary: vi.fn().mockReturnValue(libData),
            };

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrSimple),
            };

            const helper = makeHelper({
                'core.domain.value.helpers.getRecordFieldValue': mockGetRecordFieldValueHelper,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                'core.utils': mockUtils as IUtils,
                config: mockConfig as Config.IConfig,
            });

            const res = await helper(record, ctx);

            expect(res.id).toBe('222536283');
            expect(res.library).toMatchObject(libData);
            expect(await res.getColor()).toBe('#ffff00');
        });
    });

    describe('Record entity date range attribute', () => {
        const checkDateRangeAttribute = (conf: 'label' | 'subLabel'): void => {
            let mockGetCoreEntityById;
            let mockAttributeDomain: Mockify<IAttributeDomain>;

            const recordWithDateRange = {
                id: '222536283',
                library: 'test_lib',
                created_at: 1520931427,
                modified_at: 1520931427,
                ean: '9876543219999999',
                visual_simple: '222713677',
            };

            const libData = {
                recordIdentityConf: {
                    [conf]: 'unused_content',
                    preview: 'preview_attr',
                },
            };

            beforeEach(() => {
                mockGetCoreEntityById = vi.fn().mockReturnValue(libData);

                mockAttributeDomain = {
                    getAttributeProperties: global.__mockPromise(dateRangeAttributeMock),
                };
            });

            it('should return a string when date range attribute is present and not null', async () => {
                const mockGetRecordFieldValueHelper: GetRecordFieldValueHelper = vi
                    .fn()
                    .mockImplementation(({attributePath: attributeId}) => {
                        if (attributeId === 'unused_content') {
                            return Promise.resolve([
                                {
                                    payload: {from: '2024-02-16T10:59:52+00:00', to: '2024-02-18T10:59:52+00:00'},
                                },
                            ]);
                        }
                        return Promise.resolve([]);
                    });

                const mockValidateHelperDateRange: Mockify<IValidateHelper> = {
                    validateLibrary: vi.fn().mockReturnValue(libData),
                };

                const helper = makeHelper({
                    'core.domain.value.helpers.getRecordFieldValue': mockGetRecordFieldValueHelper,
                    'core.domain.helpers.getCoreEntityById': mockGetCoreEntityById,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.utils': mockUtils as IUtils,
                    'core.domain.helpers.validate': mockValidateHelperDateRange as IValidateHelper,
                    config: mockConfig as Config.IConfig,
                    translator: mockTranslatorWithOptions as i18n,
                });

                const res = await helper(recordWithDateRange, ctx);

                expect(res).not.toBe(null);
                const labelOrSubLabel = conf === 'label' ? await res.getLabel() : await res.getSubLabel();
                expect(labelOrSubLabel).toBeDefined();
                expect(mockTranslatorWithOptions.t).toHaveBeenCalledWith('labels.date_range', {
                    from: '2024-02-16T10:59:52+00:00',
                    to: '2024-02-18T10:59:52+00:00',
                    lng: 'fr',
                    interpolation: {escapeValue: false},
                });
            });

            it('should return null when date range attribute is present but null', async () => {
                const mockGetRecordFieldValueHelper: GetRecordFieldValueHelper = vi
                    .fn()
                    .mockImplementation(({attributePath: attributeId}) => {
                        if (attributeId === 'unused_content') {
                            return Promise.resolve([{value: null}]);
                        }
                        if (attributeId === 'preview_attr') {
                            return Promise.resolve([
                                {
                                    ...mockStandardValue,
                                    value: mockRecord,
                                },
                            ]);
                        }
                        return Promise.resolve([]);
                    });

                const helper = makeHelper({
                    'core.domain.value.helpers.getRecordFieldValue': mockGetRecordFieldValueHelper,
                    'core.domain.helpers.getCoreEntityById': mockGetCoreEntityById,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.utils': mockUtils as IUtils,
                    config: mockConfig as Config.IConfig,
                    translator: mockTranslatorWithOptions as i18n,
                });

                const res = await helper(recordWithDateRange, ctx);

                const labelOrSubLabel = conf === 'label' ? await res.getLabel() : await res.getSubLabel();
                expect(labelOrSubLabel).toBeNull();

                expect(mockTranslatorWithOptions.t).toHaveBeenCalledTimes(0);
            });
        };

        describe('Date range on label', () => {
            checkDateRangeAttribute('label');
        });

        describe('Date range on sublabel', () => {
            checkDateRangeAttribute('subLabel');
        });
    });

    test('Return minimum identity if no config', async () => {
        const record = {
            id: '222536283',
            library: 'test_lib',
            created_at: 1520931427,
            modified_at: 1520931427,
            ean: '9876543219999999',
            visual_simple: '222713677',
        };

        const libData = {
            id: 'test_lib',
        };

        const mockGetRecordFieldValueHelper: GetRecordFieldValueHelper = vi.fn();

        const mockValidateHelperLocal: Mockify<IValidateHelper> = {
            validateLibrary: vi.fn().mockReturnValue(libData),
        };

        const helper = makeHelper({
            'core.domain.value.helpers.getRecordFieldValue': mockGetRecordFieldValueHelper,
            'core.utils': mockUtils as IUtils,
            'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
        });

        const res = await helper(record, ctx);

        expect(res.id).toBe('222536283');
        expect(res.library).toMatchObject(libData);
        expect(await res.getLabel?.()).toBeFalsy();
        expect(await res.getColor?.()).toBeFalsy();
        expect(await res.getPreview?.()).toBeFalsy();
    });

    describe('Permission denial', () => {
        test('Return null for label/color/subLabel when ACCESS_ATTRIBUTE is denied', async () => {
            const record = {
                id: '222536283',
                library: 'test_lib',
                created_at: 1520931427,
                modified_at: 1520931427,
            };

            const libData = {
                id: 'test_lib',
                recordIdentityConf: {
                    label: 'label_attr',
                    color: 'color_attr',
                    subLabel: 'subLabel_attr',
                },
            };

            const mockGetRecordFieldValueHelper: GetRecordFieldValueHelper = vi.fn().mockImplementation(() =>
                // Simulates ACCESS_ATTRIBUTE denied — returns empty array silently
                Promise.resolve([]),
            );

            const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                validateLibrary: vi.fn().mockReturnValue(libData),
            };

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrSimple),
            };

            const helper = makeHelper({
                'core.domain.value.helpers.getRecordFieldValue': mockGetRecordFieldValueHelper,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                'core.utils': mockUtils as IUtils,
                config: mockConfig as Config.IConfig,
            });

            const res = await helper(record, ctx);

            expect(await res.getLabel()).toBeNull();
            expect(await res.getColor()).toBeNull();
            expect(await res.getSubLabel()).toBeNull();
        });
    });

    describe('Record entity with parentContext', () => {
        test('Return record identity with parent context', async () => {
            const record = {
                id: '222536283',
                library: 'test_lib',
                created_at: 1520931427,
                modified_at: 1520931427,
            };

            const parentRecord = {
                id: '111111111',
                library: 'parent_lib',
            };

            const libData = {
                id: 'test_lib',
                recordIdentityConf: {
                    parentContext: 'parent_link_attr',
                    label: 'label_attr',
                },
            };

            const parentLibData = {
                id: 'parent_lib',
                recordIdentityConf: {
                    label: 'label_attr',
                },
            };

            const mockGetRecordFieldValueHelper: GetRecordFieldValueHelper = vi.fn().mockImplementation(
                vi.fn().mockImplementation(({attributePath: attributeId}) => {
                    if (attributeId === 'parent_link_attr') {
                        return Promise.resolve([{payload: parentRecord}]);
                    }
                    if (attributeId === 'label_attr') {
                        return Promise.resolve([{payload: 'Parent Label'}]);
                    }
                    return Promise.resolve([]);
                }),
            );

            const mockGetEntityByIdHelper = vi.fn().mockImplementation((_type, id) => {
                if (id === 'test_lib') {
                    return libData;
                }
                if (id === 'parent_lib') {
                    return parentLibData;
                }
                return null;
            });

            const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                validateLibrary: vi.fn().mockImplementation(libraryId => {
                    if (libraryId === 'test_lib') {
                        return libData;
                    }
                    if (libraryId === 'parent_lib') {
                        return parentLibData;
                    }
                    return null;
                }),
            };

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrSimple),
            };

            const helper = makeHelper({
                'core.domain.value.helpers.getRecordFieldValue': mockGetRecordFieldValueHelper,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                'core.utils': mockUtils as IUtils,
                config: mockConfig as Config.IConfig,
            });

            const res = await helper(record, ctx);

            expect(res.id).toBe('222536283');
            expect(res.getParentContext).toBeDefined();
            const parentContext = await res.getParentContext();
            expect(parentContext).toHaveLength(1);
            expect(parentContext[0].id).toBe('111111111');
            expect(parentContext[0].library).toEqual(parentLibData);
            expect(await parentContext[0].getLabel()).toBe('Parent Label');
        });

        test('Return record identity with nested parent context', async () => {
            const record = {
                id: '333333333',
                library: 'child_lib',
            };

            const parentRecord = {
                id: '222222222',
                library: 'parent_lib',
            };

            const grandParentRecord = {
                id: '111111111',
                library: 'grandparent_lib',
            };

            const childLibData = {
                id: 'child_lib',
                recordIdentityConf: {
                    parentContext: 'parent_link_attr',
                    label: 'label_attr',
                },
            };

            const parentLibData = {
                id: 'parent_lib',
                recordIdentityConf: {
                    parentContext: 'grandparent_link_attr',
                    label: 'label_attr',
                },
            };

            const grandParentLibData = {
                id: 'grandparent_lib',
                recordIdentityConf: {
                    label: 'label_attr',
                },
            };

            const mockGetRecordFieldValueHelper: GetRecordFieldValueHelper = vi.fn().mockImplementation(
                vi.fn().mockImplementation(({library, attributePath: attributeId}) => {
                    if (library === 'child_lib' && attributeId === 'parent_link_attr') {
                        return Promise.resolve([{payload: parentRecord}]);
                    }
                    if (library === 'parent_lib' && attributeId === 'grandparent_link_attr') {
                        return Promise.resolve([{payload: grandParentRecord}]);
                    }
                    if (library === 'parent_lib' && attributeId === 'label_attr') {
                        return Promise.resolve([{payload: 'Parent Label'}]);
                    }
                    if (library === 'grandparent_lib' && attributeId === 'label_attr') {
                        return Promise.resolve([{payload: 'GrandParent Label'}]);
                    }
                    return Promise.resolve([]);
                }),
            );

            const mockGetEntityByIdHelper = vi.fn().mockImplementation((_type, id) => {
                if (id === 'child_lib') {
                    return childLibData;
                }
                if (id === 'parent_lib') {
                    return parentLibData;
                }
                if (id === 'grandparent_lib') {
                    return grandParentLibData;
                }
                return null;
            });

            const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                validateLibrary: vi.fn().mockImplementation(libraryId => {
                    if (libraryId === 'child_lib') {
                        return childLibData;
                    }
                    if (libraryId === 'parent_lib') {
                        return parentLibData;
                    }
                    if (libraryId === 'grandparent_lib') {
                        return grandParentLibData;
                    }
                    return null;
                }),
            };

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrSimple),
            };

            const helper = makeHelper({
                'core.domain.value.helpers.getRecordFieldValue': mockGetRecordFieldValueHelper,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                'core.utils': mockUtils as IUtils,
                config: mockConfig as Config.IConfig,
            });

            const res = await helper(record, ctx);

            expect(res.getParentContext).toBeDefined();
            const parentContext = await res.getParentContext();
            expect(parentContext).toHaveLength(2);
            // Index 0 is the direct parent, index 1 is the grandparent, etc.
            expect(parentContext[0].id).toBe('222222222');
            expect(parentContext[0].library).toEqual(parentLibData);
            expect(await parentContext[0].getLabel()).toBe('Parent Label');
            expect(parentContext[1].id).toBe('111111111');
            expect(parentContext[1].library).toEqual(grandParentLibData);
            expect(await parentContext[1].getLabel()).toBe('GrandParent Label');
        });

        test('Return null when no parentContext is configured', async () => {
            const record = {
                id: '222536283',
                library: 'test_lib',
            };

            const libData = {
                id: 'test_lib',
                recordIdentityConf: {
                    label: 'label_attr',
                },
            };

            const mockGetRecordFieldValueHelper: GetRecordFieldValueHelper = vi.fn();

            const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                validateLibrary: vi.fn().mockReturnValue(libData),
            };

            const helper = makeHelper({
                'core.domain.value.helpers.getRecordFieldValue': mockGetRecordFieldValueHelper,
                'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                'core.utils': mockUtils as IUtils,
            });

            const res = await helper(record, ctx);

            expect(res.getParentContext).toBeNull();
        });

        test('Return null when parentContext attribute has no value', async () => {
            const record = {
                id: '222536283',
                library: 'test_lib',
            };

            const libData = {
                id: 'test_lib',
                recordIdentityConf: {
                    parentContext: 'parent_link_attr',
                    label: 'label_attr',
                },
            };

            const mockGetRecordFieldValueHelper: GetRecordFieldValueHelper = vi
                .fn()
                .mockImplementation(vi.fn().mockResolvedValue([]));

            const mockGetEntityByIdHelper = vi.fn().mockReturnValue(libData);

            const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                validateLibrary: vi.fn().mockReturnValue(libData),
            };

            const helper = makeHelper({
                'core.domain.value.helpers.getRecordFieldValue': mockGetRecordFieldValueHelper,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                'core.utils': mockUtils as IUtils,
            });

            const res = await helper(record, ctx);

            expect(res.getParentContext).toBeDefined();
            const parentContext = await res.getParentContext();
            expect(parentContext).toBeNull();
        });

        test('Use record id as label when parent record has no label', async () => {
            const record = {
                id: '222536283',
                library: 'test_lib',
            };

            const parentRecord = {
                id: '111111111',
                library: 'parent_lib',
            };

            const libData = {
                id: 'test_lib',
                recordIdentityConf: {
                    parentContext: 'parent_link_attr',
                    label: 'label_attr',
                },
            };

            const parentLibData = {
                id: 'parent_lib',
                recordIdentityConf: {
                    label: 'label_attr',
                },
            };

            const mockGetRecordFieldValueHelper: GetRecordFieldValueHelper = vi.fn().mockImplementation(
                vi.fn().mockImplementation(({attributePath: attributeId}) => {
                    if (attributeId === 'parent_link_attr') {
                        return Promise.resolve([{payload: parentRecord}]);
                    }
                    if (attributeId === 'label_attr') {
                        return Promise.resolve([{payload: null}]);
                    }
                    return Promise.resolve([]);
                }),
            );

            const mockGetEntityByIdHelper = vi.fn().mockImplementation((_type, id) => {
                if (id === 'test_lib') {
                    return libData;
                }
                if (id === 'parent_lib') {
                    return parentLibData;
                }
                return null;
            });

            const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                validateLibrary: vi.fn().mockImplementation(libraryId => {
                    if (libraryId === 'test_lib') {
                        return libData;
                    }
                    if (libraryId === 'parent_lib') {
                        return parentLibData;
                    }
                    return null;
                }),
            };

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrSimple),
            };

            const helper = makeHelper({
                'core.domain.value.helpers.getRecordFieldValue': mockGetRecordFieldValueHelper,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                'core.utils': mockUtils as IUtils,
                config: mockConfig as Config.IConfig,
            });

            const res = await helper(record, ctx);

            expect(res.getParentContext).toBeDefined();
            const parentContext = await res.getParentContext();
            expect(parentContext).toHaveLength(1);
            expect(parentContext[0].id).toBe('111111111');
            expect(parentContext[0].library).toEqual(parentLibData);
            expect(parentContext[0].getLabel).toBeDefined();
            const parentLabel = await parentContext[0].getLabel();
            expect(parentLabel).toBeNull();
        });
    });
});
