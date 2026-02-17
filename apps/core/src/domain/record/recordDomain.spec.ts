// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Errors} from '../../_types/errors';
import {type IAttributeDomain} from 'domain/attribute/attributeDomain';
import {type IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {type IValidateHelper} from 'domain/helpers/validate';
import {type ILibraryPermissionDomain} from 'domain/permission/libraryPermissionDomain';
import {type IValueDomain} from 'domain/value/valueDomain';
import {type i18n} from 'i18next';
import {type ICachesService} from 'infra/cache/cacheService';
import {type ILibraryRepo} from 'infra/library/libraryRepo';
import {type IRecordRepo} from 'infra/record/recordRepo';
import {type ITreeRepo} from 'infra/tree/treeRepo';
import {type IValueRepo} from 'infra/value/valueRepo';
import {type IUtils, type ToAny} from 'utils/utils';
import type * as Config from '_types/config';
import {type IQueryInfos} from '_types/queryInfos';
import {LibraryBehavior} from '../../_types/library';
import {AttributeCondition, Operator} from '../../_types/record';
import {
    dateRangeAttributeMock,
    mockAttrAdvLink,
    mockAttrSimple,
    mockUniqueAttrSimple,
} from '../../__tests__/mocks/attribute';
import {mockLibrary, mockLibraryFiles} from '../../__tests__/mocks/library';
import {mockRecord} from '../../__tests__/mocks/record';
import {mockCtx} from '../../__tests__/mocks/shared';
import {mockTranslatorWithOptions} from '../../__tests__/mocks/translator';
import {mockTree} from '../../__tests__/mocks/tree';
import {mockStandardValue} from '../../__tests__/mocks/value';
import {type IRecordPermissionDomain} from '../permission/recordPermissionDomain';
import recordDomain, {ATTRIBUTE_ACTIVE, type IRecordDomainDeps} from './recordDomain';
import {type ICreateRecordValueError} from './_types';
import {createRecord as createRecordHelper, deleteRecord as deleteRecordHelper} from './helpers';
import {type IFormRepo} from 'infra/form/formRepo';
import mockLogger from '../../__tests__/mockers/logger';

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

const depsBase: ToAny<IRecordDomainDeps> = {
    config: {},
    'core.infra.record': jest.fn(),
    'core.domain.attribute': jest.fn(),
    'core.domain.value': jest.fn(),
    'core.domain.permission.record': jest.fn(),
    'core.domain.helpers.getCoreEntityById': jest.fn(),
    'core.domain.helpers.validate': jest.fn(),
    'core.domain.record.helpers.createRecord': jest.fn(),
    'core.domain.record.helpers.deleteRecord': jest.fn(),
    'core.domain.record.helpers.sendRecordUpdateEvent': jest.fn(),
    'core.domain.tree.helpers.elementAncestors': jest.fn(),
    'core.domain.eventsManager': jest.fn(),
    'core.infra.cache.cacheService': jest.fn(),
    'core.utils.logger': mockLogger,
    'core.utils': jest.fn(),
    'core.infra.form': jest.fn(),
    translator: {},
    'core.domain.record.helpers.findRecords': jest.fn(),
};

describe('RecordDomain', () => {
    const mockRecordPermDomain: Mockify<IRecordPermissionDomain> = {
        getRecordPermission: global.__mockPromise(true),
    };

    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'recordDomainTest',
        lang: 'fr',
    };

    const mockEventsManager: Mockify<IEventsManagerDomain> = {
        sendDatabaseEvent: global.__mockPromise(),
    };

    const mockValidateHelper: Mockify<IValidateHelper> = {
        validateLibrary: jest.fn().mockImplementation(libraryId => ({
            ...mockLibrary,
            behavior: libraryId === 'files' ? LibraryBehavior.FILES : LibraryBehavior.STANDARD,
            recordIdentityConf: {
                label: 'library_label',
                color: 'library_color',
                preview: 'library_preview',
                subLabel: 'library_subLabel',
            },
        })),
    };

    const mockSendRecordUpdateEventHelper = jest.fn();

    const mockUtils: Mockify<IUtils> = {
        translateError: jest.fn().mockReturnValue('mock error'),
        getRecordsCacheKey: jest.fn().mockReturnValue('cache_key'),
        getCoreEntityCacheKey: jest.fn().mockReturnValue('cache_key'),
        getPreviewsAttributeName: jest.fn().mockReturnValue('previews'),
        getPreviewUrl: jest.fn().mockImplementation(url => `/preview/${url}`),
        isLinkAttribute: jest.fn().mockReturnValue(false),
        isTreeAttribute: jest.fn().mockReturnValue(false),
    };

    const mockCacheService: Mockify<ICachesService> = {
        memoize: jest.fn().mockImplementation(({func}) => func()),
        getCache: jest.fn().mockReturnValue({
            deleteData: jest.fn(),
        }),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('createEmptyRecord', () => {
        test('Should create a new empty record', async function () {
            const createdRecordData = {
                id: '222435651',
                library: 'test',
                created_at: 1519303348,
                modified_at: 1519303348,
            };
            const mockRecRepo = {createRecord: global.__mockPromise(createdRecordData)} satisfies Mockify<IRecordRepo>;

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getLibraryFullTextAttributes: global.__mockPromise([]),
            };

            const mockLibraryPermissionDomain: Mockify<ILibraryPermissionDomain> = {
                getLibraryPermission: global.__mockPromise(true),
            };

            const recDomain = recordDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.record': mockRecRepo as IRecordRepo,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.record.helpers.createRecord': createRecordHelper({
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                    'core.infra.record': mockRecRepo as IRecordRepo,
                }),
            });

            const createdEmptyRecord = await recDomain.createEmptyRecord({library: 'test', ctx});

            expect(mockRecRepo.createRecord.mock.calls.length).toBe(1);
            expect(typeof mockRecRepo.createRecord.mock.calls[0][0]).toBe('object');
            expect(Number.isInteger(mockRecRepo.createRecord.mock.calls[0][0].recordData.created_at)).toBe(true);
            expect(Number.isInteger(mockRecRepo.createRecord.mock.calls[0][0].recordData.modified_at)).toBe(true);
            expect(mockRecRepo.createRecord.mock.calls[0][0].recordData.created_by).toBe('1');
            expect(mockRecRepo.createRecord.mock.calls[0][0].recordData.modified_by).toBe('1');

            expect(createdEmptyRecord).toMatchObject(createdRecordData);
        });
    });
    describe('Activate new record', () => {
        test('Should activate a new record', async function () {
            const createdRecordData = {
                id: '222435651',
                library: 'test',
            };
            const mockRecRepo = {
                createRecord: global.__mockPromise(createdRecordData),
                updateRecord: global.__mockPromise({new: createdRecordData}),
            } satisfies Mockify<IRecordRepo>;
            const formRepo = {getForms: global.__mockPromise({list: []})} satisfies Mockify<IFormRepo>;

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getLibraryFullTextAttributes: global.__mockPromise([]),
                getLibraryAttributes: global.__mockPromise([]),
            };

            const mockValueDomain: Mockify<IValueDomain> = {
                saveValue: global.__mockPromise([{payload: true}]),
            };

            const mockLibraryPermissionDomain: Mockify<ILibraryPermissionDomain> = {
                getLibraryPermission: global.__mockPromise(true),
            };

            const recDomain = recordDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.record': mockRecRepo as IRecordRepo,
                'core.infra.form': formRepo as IFormRepo,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.value': mockValueDomain as IValueDomain,
                'core.domain.record.helpers.createRecord': createRecordHelper({
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                    'core.infra.record': mockRecRepo as IRecordRepo,
                }),
            });

            const createdEmptyRecord = await recDomain.createEmptyRecord({library: 'test', ctx});
            const activatedRecord = await recDomain.activateNewRecord({
                library: 'test',
                recordId: createdEmptyRecord.id,
                ctx,
            });

            expect(mockRecRepo.createRecord.mock.calls.length).toBe(1);
            expect(typeof mockRecRepo.createRecord.mock.calls[0][0]).toBe('object');
            expect(Number.isInteger(mockRecRepo.createRecord.mock.calls[0][0].recordData.created_at)).toBe(true);
            expect(Number.isInteger(mockRecRepo.createRecord.mock.calls[0][0].recordData.modified_at)).toBe(true);
            expect(mockRecRepo.createRecord.mock.calls[0][0].recordData.created_by).toBe('1');
            expect(mockRecRepo.createRecord.mock.calls[0][0].recordData.modified_by).toBe('1');

            expect(activatedRecord.record).toMatchObject(createdRecordData);
            expect(activatedRecord.valuesErrors).toEqual(null);
        });
        test('Should not activate a new record if required field is missing', async function () {
            const createdRecordData = {
                id: '222435651',
                library: 'test',
            };
            const mockRecRepo = {
                createRecord: global.__mockPromise(createdRecordData),
                updateRecord: global.__mockPromise({new: createdRecordData}),
            } satisfies Mockify<IRecordRepo>;
            const formRepo = {getForms: global.__mockPromise({list: []})} satisfies Mockify<IFormRepo>;

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getLibraryFullTextAttributes: global.__mockPromise([]),
                getLibraryAttributes: global.__mockPromise([{id: 'some_attribute', required: true}]),
            };

            const mockLibraryPermissionDomain: Mockify<ILibraryPermissionDomain> = {
                getLibraryPermission: global.__mockPromise(true),
            };

            const mockValueDomain: Mockify<IValueDomain> = {
                saveValue: global.__mockPromise([{payload: true}]),
                getRecordFieldValue: jest.fn(),
            };

            const recDomain = recordDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.record': mockRecRepo as IRecordRepo,
                'core.infra.form': formRepo as IFormRepo,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.value': mockValueDomain as IValueDomain,
                'core.domain.record.helpers.createRecord': createRecordHelper({
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                    'core.infra.record': mockRecRepo as IRecordRepo,
                }),
                'core.utils': mockUtils as IUtils,
            });

            const createdEmptyRecord = await recDomain.createEmptyRecord({library: 'test', ctx});
            const activatedRecord = await recDomain.activateNewRecord({
                library: 'test',
                recordId: createdEmptyRecord.id,
                ctx,
            });

            expect(mockRecRepo.createRecord.mock.calls.length).toBe(1);
            expect(typeof mockRecRepo.createRecord.mock.calls[0][0]).toBe('object');
            expect(Number.isInteger(mockRecRepo.createRecord.mock.calls[0][0].recordData.created_at)).toBe(true);
            expect(Number.isInteger(mockRecRepo.createRecord.mock.calls[0][0].recordData.modified_at)).toBe(true);
            expect(mockRecRepo.createRecord.mock.calls[0][0].recordData.created_by).toBe('1');
            expect(mockRecRepo.createRecord.mock.calls[0][0].recordData.modified_by).toBe('1');

            expect(activatedRecord.record).toBe(null);
            expect(activatedRecord.valuesErrors[0]).toMatchObject({
                attribute: 'some_attribute',
                type: Errors.REQUIRED_ATTRIBUTE,
                message: 'mock error',
            });
        });
    });
    describe('createRecord', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        test('Should create a new record', async function () {
            const createdRecordData = {
                id: '222536515',
                library: 'test',
            };
            const mockRecRepo = {
                createRecord: global.__mockPromise(createdRecordData),
                updateRecord: global.__mockPromise({new: createdRecordData}),
                find: global.__mockPromise({
                    totalCount: 1,
                    list: [createdRecordData],
                }),
            } satisfies Mockify<IRecordRepo>;

            const formRepo = {getForms: global.__mockPromise({list: []})} satisfies Mockify<IFormRepo>;

            const mockValueDomain = {
                saveValue: global.__mockPromise([{payload: true}]),
                saveValueBatch: global.__mockPromise([]),
            } satisfies Mockify<IValueDomain>;

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockUniqueAttrSimple),
                getLibraryAttributes: global.__mockPromise([mockUniqueAttrSimple]),
            };

            const mockLibraryPermissionDomain: Mockify<ILibraryPermissionDomain> = {
                getLibraryPermission: global.__mockPromise(true),
            };

            const recDomain = recordDomain({
                ...depsBase,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.value': mockValueDomain as IValueDomain,
                'core.infra.record': mockRecRepo as IRecordRepo,
                'core.infra.form': formRepo as IFormRepo,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.record.helpers.createRecord': createRecordHelper({
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                    'core.infra.record': mockRecRepo as IRecordRepo,
                }),
            });
            jest.spyOn(recDomain, 'activateNewRecord');

            const createdRecord = await recDomain.createRecord({library: 'test', ctx});

            expect(mockRecRepo.createRecord).toHaveBeenCalledTimes(1);
            expect(Number.isInteger(mockRecRepo.createRecord.mock.calls[0][0].recordData.created_at)).toBe(true);
            expect(Number.isInteger(mockRecRepo.createRecord.mock.calls[0][0].recordData.modified_at)).toBe(true);
            expect(mockRecRepo.createRecord.mock.calls[0][0].recordData.created_by).toBe('1');
            expect(mockRecRepo.createRecord.mock.calls[0][0].recordData.modified_by).toBe('1');
            expect(mockValueDomain.saveValueBatch).toHaveBeenCalledTimes(1);
            expect(recDomain.activateNewRecord).toHaveBeenCalled();

            expect(createdRecord.record).toMatchObject(createdRecordData);
            expect(createdRecord.valuesErrors).toBe(null);
        });

        test('Should create a new record and save its values', async function () {
            const createdRecordData = {
                id: '222435651',
                library: 'test',
                created_at: 1519303348,
                modified_at: 1519303348,
            };
            const mockRecRepo: Mockify<IRecordRepo> = {
                createRecord: global.__mockPromise(createdRecordData),
                updateRecord: global.__mockPromise({new: createdRecordData}),
                find: global.__mockPromise({
                    totalCount: 1,
                    list: [createdRecordData],
                }),
            };

            const formRepo = {getForms: global.__mockPromise({list: []})} satisfies Mockify<IFormRepo>;

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getLibraryFullTextAttributes: global.__mockPromise([]),
                getAttributeProperties: global.__mockPromise(mockAttrSimple),
                getLibraryAttributes: global.__mockPromise([mockUniqueAttrSimple]),
            };

            const mockLibraryPermissionDomain: Mockify<ILibraryPermissionDomain> = {
                getLibraryPermission: global.__mockPromise(true),
            };

            const mockValueDomain: Mockify<IValueDomain> = {
                saveValue: global.__mockPromise([{payload: true}]),
                saveValueBatch: global.__mockPromise({values: [], errors: null}),
            };

            const recDomain = recordDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.domain.value': mockValueDomain as IValueDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.infra.record': mockRecRepo as IRecordRepo,
                'core.infra.form': formRepo as IFormRepo,
                'core.domain.record.helpers.createRecord': createRecordHelper({
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                    'core.infra.record': mockRecRepo as IRecordRepo,
                }),
                'core.utils': mockUtils as IUtils,
            });
            jest.spyOn(recDomain, 'activateNewRecord');

            const createdRecord = await recDomain.createRecord({
                library: 'test',
                values: [
                    {
                        attribute: 'some_attribute',
                        payload: 'some_value',
                    },
                ],
                ctx,
            });

            expect(mockRecRepo.createRecord).toHaveBeenCalled();
            expect(mockValueDomain.saveValueBatch).toHaveBeenCalled();
            expect(recDomain.activateNewRecord).toHaveBeenCalled();
            expect(createdRecord.valuesErrors).toBe(null);
        });

        test('Should return errors if creating a new record with bad values', async () => {
            const createdRecordData = {
                id: '222435651',
                library: 'test',
                created_at: 1519303348,
                modified_at: 1519303348,
            };

            const mockRecRepo: Mockify<IRecordRepo> = {
                createRecord: global.__mockPromise(createdRecordData),
                deleteRecord: global.__mockPromise(createdRecordData),
                find: global.__mockPromise({
                    totalCount: 1,
                    list: [createdRecordData],
                }),
            };

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getLibraryFullTextAttributes: global.__mockPromise([]),
                getAttributeProperties: global.__mockPromise(mockAttrSimple),
            };

            const mockLibraryPermissionDomain: Mockify<ILibraryPermissionDomain> = {
                getLibraryPermission: global.__mockPromise(true),
            };

            const mockValueDomain: Mockify<IValueDomain> = {
                saveValueBatch: global.__mockPromise({errors: [{message: 'bad values'}]}),
            };

            const recDomain = recordDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.domain.value': mockValueDomain as IValueDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.infra.record': mockRecRepo as IRecordRepo,
                'core.utils': mockUtils as IUtils,
                'core.domain.record.helpers.createRecord': createRecordHelper({
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                    'core.infra.record': mockRecRepo as IRecordRepo,
                }),
            });
            jest.spyOn(recDomain, 'activateNewRecord');
            jest.spyOn(recDomain, 'deleteRecord');

            const res = await recDomain.createRecord({
                library: 'test',
                values: [
                    {
                        attribute: 'some_attribute',
                        payload: 'some_value',
                    },
                    {
                        attribute: 'other_attribute',
                        payload: 'some other value',
                    },
                ],
                ctx,
            });

            expect(mockRecRepo.createRecord).toHaveBeenCalledTimes(1);
            expect(mockValueDomain.saveValueBatch).toHaveBeenCalledTimes(1);
            expect(recDomain.activateNewRecord).toHaveBeenCalledTimes(0);
            expect(recDomain.deleteRecord).toHaveBeenCalledTimes(1);
            expect(res.record).toBe(null);
            expect(res.valuesErrors).toHaveLength(1);
            expect(res.valuesErrors).toEqual([
                {attribute: undefined, message: 'bad values', type: undefined},
            ] as ICreateRecordValueError[]);
        });
    });

    describe('updateRecord', () => {
        test('Should update a record', async function () {
            const updatedRecordData = {
                id: '222435651',
                library: 'test',
                created_at: 1519303348,
                modified_at: 987654321,
            };
            const recRepo = {
                updateRecord: global.__mockPromise({old: updatedRecordData, new: updatedRecordData}),
            } satisfies Mockify<IRecordRepo>;

            const recDomain = recordDomain({
                ...depsBase,
                'core.infra.record': recRepo as IRecordRepo,
                'core.infra.cache.cacheService': mockCacheService as ICachesService,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdateEventHelper,
                'core.utils': mockUtils as IUtils,
            });

            const updatedRecord = await recDomain.updateRecord({
                library: 'test',
                recordData: {id: '222435651', modified_at: 987654321},
                ctx,
            });

            expect(recRepo.updateRecord.mock.calls.length).toBe(1);
            expect(typeof recRepo.updateRecord.mock.calls[0][0]).toBe('object');
            expect(Number.isInteger(recRepo.updateRecord.mock.calls[0][0].recordData.modified_at)).toBe(true);

            expect(updatedRecord).toMatchObject(updatedRecordData);
        });
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

            const mockValDomain: Mockify<IValueDomain> = {
                getValues: global.__mockPromiseMultiple([
                    [
                        {
                            payload: 'Label Value',
                        },
                    ],
                    [
                        {
                            payload: '#123456',
                        },
                    ],
                ]),
                getRecordFieldValue: jest.fn().mockImplementation(({attributeId}) =>
                    Promise.resolve([
                        attributeId === 'previews'
                            ? {
                                  raw_payload: {
                                      small: 'small_fake-image',
                                      medium: 'medium_fake-image',
                                      big: 'big_fake-image',
                                  },
                              }
                            : {
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
                    ]),
                ),
            };

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: jest
                    .fn()
                    .mockImplementation(({id}) =>
                        id === 'preview_attr' ? {...mockAttrAdvLink, linked_library: 'files'} : mockAttrSimple,
                    ),
            };

            const mockGetEntityByIdHelper = jest.fn().mockReturnValue(libData);

            const mockUtilsRecordIdentity: Mockify<IUtils> = {
                ...mockUtils,
                getPreviewsAttributeName: jest.fn().mockReturnValue('previews'),
                isLinkAttribute: jest.fn().mockReturnValue(false),
                isTreeAttribute: jest.fn().mockReturnValue(false),
            };

            const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                validateLibrary: jest.fn().mockImplementation(libraryId => {
                    if (libraryId === 'test_lib') {
                        return libData;
                    }
                    if (libraryId === 'files') {
                        return fileLibData;
                    }
                    return null;
                }),
            };

            const recDomain = recordDomain({
                ...depsBase,
                'core.domain.value': mockValDomain as IValueDomain,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                'core.infra.cache.cacheService': mockCacheService as ICachesService,
                'core.utils': mockUtilsRecordIdentity as IUtils,
                config: mockConfig as Config.IConfig,
            });

            const res = await recDomain.getRecordIdentity(record, ctx);

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

                const mockValDomain: Mockify<IValueDomain> = {
                    getValues: global.__mockPromiseMultiple([
                        [
                            {
                                payload: null,
                            },
                            {
                                payload: 'Inherited Label Value',
                                isInherited: true,
                            },
                        ],
                    ]),
                    getRecordFieldValue: jest.fn().mockImplementation(({attributeId}) =>
                        Promise.resolve([
                            attributeId === 'previews'
                                ? {
                                      raw_payload: {
                                          small: 'small_fake-image',
                                          medium: 'medium_fake-image',
                                          big: 'big_fake-image',
                                      },
                                  }
                                : {
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
                        ]),
                    ),
                };

                const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                    validateLibrary: jest.fn().mockReturnValue(libData),
                };

                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromise(mockAttrSimple),
                };

                const recDomain = recordDomain({
                    ...depsBase,
                    'core.domain.value': mockValDomain as IValueDomain,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                    'core.infra.cache.cacheService': mockCacheService as ICachesService,
                    'core.utils': mockUtils as IUtils,
                    config: mockConfig as Config.IConfig,
                });

                const res = await recDomain.getRecordIdentity(record, ctx);

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

                const mockValDomain: Mockify<IValueDomain> = {
                    getValues: global.__mockPromiseMultiple([
                        [
                            {
                                payload: 'Override Label Value',
                                isInherited: false,
                            },
                            {
                                payload: 'Inherited Label Value',
                                isInherited: true,
                            },
                        ],
                    ]),
                    getRecordFieldValue: jest.fn().mockImplementation(({attributeId}) =>
                        Promise.resolve([
                            attributeId === 'previews'
                                ? {
                                      raw_payload: {
                                          small: 'small_fake-image',
                                          medium: 'medium_fake-image',
                                          big: 'big_fake-image',
                                      },
                                  }
                                : {
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
                        ]),
                    ),
                };

                const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                    validateLibrary: jest.fn().mockReturnValue(libData),
                };

                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromise(mockAttrSimple),
                };

                const recDomain = recordDomain({
                    ...depsBase,
                    'core.domain.value': mockValDomain as IValueDomain,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                    'core.infra.cache.cacheService': mockCacheService as ICachesService,
                    'core.utils': mockUtils as IUtils,
                    config: mockConfig as Config.IConfig,
                });

                const res = await recDomain.getRecordIdentity(record, ctx);

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

                const mockValDomain: Mockify<IValueDomain> = {
                    getValues: global.__mockPromiseMultiple([
                        [
                            {
                                payload: null,
                            },
                            {
                                payload: 'Inherited SubLabel Value',
                                isInherited: true,
                            },
                        ],
                    ]),
                    getRecordFieldValue: jest.fn().mockImplementation(({attributeId}) =>
                        Promise.resolve([
                            attributeId === 'previews'
                                ? {
                                      raw_payload: {
                                          small: 'small_fake-image',
                                          medium: 'medium_fake-image',
                                          big: 'big_fake-image',
                                      },
                                  }
                                : {
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
                        ]),
                    ),
                };

                const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                    validateLibrary: jest.fn().mockReturnValue(libData),
                };

                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromise(mockAttrSimple),
                };

                const recDomain = recordDomain({
                    ...depsBase,
                    'core.domain.value': mockValDomain as IValueDomain,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                    'core.infra.cache.cacheService': mockCacheService as ICachesService,
                    'core.utils': mockUtils as IUtils,
                    config: mockConfig as Config.IConfig,
                });

                const res = await recDomain.getRecordIdentity(record, ctx);

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

                const mockValDomain: Mockify<IValueDomain> = {
                    getValues: global.__mockPromiseMultiple([
                        [
                            {
                                payload: 'Override SubLabel Value',
                                isInherited: false,
                            },
                            {
                                payload: 'Inherited SubLabel Value',
                                isInherited: true,
                            },
                        ],
                    ]),
                    getRecordFieldValue: jest.fn().mockImplementation(({attributeId}) =>
                        Promise.resolve([
                            attributeId === 'previews'
                                ? {
                                      raw_payload: {
                                          small: 'small_fake-image',
                                          medium: 'medium_fake-image',
                                          big: 'big_fake-image',
                                      },
                                  }
                                : {
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
                        ]),
                    ),
                };

                const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                    validateLibrary: jest.fn().mockReturnValue(libData),
                };

                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromise(mockAttrSimple),
                };

                const recDomain = recordDomain({
                    ...depsBase,
                    'core.domain.value': mockValDomain as IValueDomain,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                    'core.infra.cache.cacheService': mockCacheService as ICachesService,
                    'core.utils': mockUtils as IUtils,
                    config: mockConfig as Config.IConfig,
                });

                const res = await recDomain.getRecordIdentity(record, ctx);

                expect(res.id).toBe('222536283');
                expect(res.library).toMatchObject(libData);
                expect(await res.getSubLabel()).toBe('Override SubLabel Value');
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

                const mockValDomain: Mockify<IValueDomain> = {
                    getValues: global.__mockPromiseMultiple([
                        [
                            {
                                payload: null,
                            },
                            {
                                payload: '#ff0000',
                                isInherited: true,
                            },
                        ],
                    ]),
                    getRecordFieldValue: jest.fn().mockImplementation(({attributeId}) =>
                        Promise.resolve([
                            attributeId === 'previews'
                                ? {
                                      raw_payload: {
                                          small: 'small_fake-image',
                                          medium: 'medium_fake-image',
                                          big: 'big_fake-image',
                                      },
                                  }
                                : {
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
                        ]),
                    ),
                };

                const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                    validateLibrary: jest.fn().mockReturnValue(libData),
                };

                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromise(mockAttrSimple),
                };

                const recDomain = recordDomain({
                    ...depsBase,
                    'core.domain.value': mockValDomain as IValueDomain,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                    'core.infra.cache.cacheService': mockCacheService as ICachesService,
                    'core.utils': mockUtils as IUtils,
                    config: mockConfig as Config.IConfig,
                });

                const res = await recDomain.getRecordIdentity(record, ctx);

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

                const mockValDomain: Mockify<IValueDomain> = {
                    getValues: global.__mockPromiseMultiple([
                        [
                            {
                                payload: '#ffff00',
                                isInherited: false,
                            },
                            {
                                payload: '#ff0000',
                                isInherited: true,
                            },
                        ],
                    ]),
                    getRecordFieldValue: jest.fn().mockImplementation(({attributeId}) =>
                        Promise.resolve([
                            attributeId === 'previews'
                                ? {
                                      raw_payload: {
                                          small: 'small_fake-image',
                                          medium: 'medium_fake-image',
                                          big: 'big_fake-image',
                                      },
                                  }
                                : {
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
                        ]),
                    ),
                };

                const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                    validateLibrary: jest.fn().mockReturnValue(libData),
                };

                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromise(mockAttrSimple),
                };

                const recDomain = recordDomain({
                    ...depsBase,
                    'core.domain.value': mockValDomain as IValueDomain,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                    'core.infra.cache.cacheService': mockCacheService as ICachesService,
                    'core.utils': mockUtils as IUtils,
                    config: mockConfig as Config.IConfig,
                });

                const res = await recDomain.getRecordIdentity(record, ctx);

                expect(res.id).toBe('222536283');
                expect(res.library).toMatchObject(libData);
                expect(await res.getColor()).toBe('#ffff00');
            });
        });

        describe('Record entity date range attribute', () => {
            const checkDateRangeAttribute = (conf: 'label' | 'subLabel'): void => {
                let mockGetCoreEntityById;
                let mockLibraryRepo: Mockify<ILibraryRepo>;
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
                    mockGetCoreEntityById = jest.fn().mockReturnValue(libData);

                    mockLibraryRepo = {
                        getLibraries: global.__mockPromise({totalCount: 1, list: [mockLibraryFiles]}),
                    };

                    mockAttributeDomain = {
                        getAttributeProperties: global.__mockPromise(dateRangeAttributeMock),
                    };
                });

                it('should return a string when date range attribute is present and not null', async () => {
                    const mockValDomain: Mockify<IValueDomain> = {
                        getValues: global.__mockPromiseMultiple([
                            [
                                {
                                    payload: {from: '2024-02-16T10:59:52+00:00', to: '2024-02-18T10:59:52+00:00'},
                                },
                            ],
                        ]),
                        getRecordFieldValue: global.__mockPromise([
                            {
                                ...mockStandardValue,
                                payload: mockRecord,
                            },
                        ]),
                    };

                    const recDomain = recordDomain({
                        ...depsBase,
                        'core.domain.value': mockValDomain as IValueDomain,
                        'core.domain.helpers.getCoreEntityById': mockGetCoreEntityById,
                        'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                        'core.utils': mockUtils as IUtils,
                        'core.infra.cache.cacheService': mockCacheService as ICachesService,
                        'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                        config: mockConfig as Config.IConfig,
                        translator: mockTranslatorWithOptions as i18n,
                    });

                    const res = await recDomain.getRecordIdentity(recordWithDateRange, ctx);

                    expect(res).not.toBe(null);
                    const labelOrSubLabel = conf === 'label' ? await res.getLabel() : await res.getSubLabel();
                    expect(labelOrSubLabel).toBeDefined();
                    expect(mockTranslatorWithOptions.t).toBeCalledWith('labels.date_range', {
                        from: '2024-02-16T10:59:52+00:00',
                        to: '2024-02-18T10:59:52+00:00',
                        lng: 'fr',
                        interpolation: {escapeValue: false},
                    });
                });

                it('should return null when date range attribute is present but null', async () => {
                    const mockValDomain: Mockify<IValueDomain> = {
                        getValues: global.__mockPromiseMultiple([
                            [
                                {
                                    value: null,
                                },
                            ],
                        ]),
                    };

                    const recDomain = recordDomain({
                        ...depsBase,
                        'core.domain.value': mockValDomain as IValueDomain,
                        'core.domain.helpers.getCoreEntityById': mockGetCoreEntityById,
                        'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                        'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                        'core.utils': mockUtils as IUtils,
                        'core.infra.cache.cacheService': mockCacheService as ICachesService,
                        config: mockConfig as Config.IConfig,
                        translator: mockTranslatorWithOptions as i18n,
                    });

                    recDomain.getRecordFieldValue = global.__mockPromise([
                        {
                            ...mockStandardValue,
                            value: mockRecord,
                        },
                    ]);

                    const res = await recDomain.getRecordIdentity(recordWithDateRange, ctx);

                    const labelOrSubLabel = conf === 'label' ? await res.getLabel() : await res.getSubLabel();
                    expect(labelOrSubLabel).toBeNull();

                    expect(mockTranslatorWithOptions.t).toBeCalledTimes(0);
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

            const mockValDomain: Mockify<IValueDomain> = {
                getValues: jest.fn(),
            };

            const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                validateLibrary: jest.fn().mockReturnValue(libData),
            };

            const recDomain = recordDomain({
                ...depsBase,
                'core.domain.value': mockValDomain as IValueDomain,
                'core.utils': mockUtils as IUtils,
                'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                'core.infra.cache.cacheService': mockCacheService as ICachesService,
            });

            const res = await recDomain.getRecordIdentity(record, ctx);

            expect(res.id).toBe('222536283');
            expect(res.library).toMatchObject(libData);
            expect(await res.getLabel?.()).toBeFalsy();
            expect(await res.getColor?.()).toBeFalsy();
            expect(await res.getPreview?.()).toBeFalsy();
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

                const mockValDomain: Mockify<IValueDomain> = {
                    getValues: jest.fn().mockImplementation(({attribute}) => {
                        if (attribute === 'parent_link_attr') {
                            return Promise.resolve([{payload: parentRecord}]);
                        }
                        if (attribute === 'label_attr') {
                            return Promise.resolve([{payload: 'Parent Label'}]);
                        }
                        return Promise.resolve([]);
                    }),
                };

                const mockGetEntityByIdHelper = jest.fn().mockImplementation((type, id) => {
                    if (id === 'test_lib') {
                        return libData;
                    }
                    if (id === 'parent_lib') {
                        return parentLibData;
                    }
                    return null;
                });

                const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                    validateLibrary: jest.fn().mockImplementation(libraryId => {
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

                const recDomain = recordDomain({
                    ...depsBase,
                    'core.domain.value': mockValDomain as IValueDomain,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                    'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                    'core.infra.cache.cacheService': mockCacheService as ICachesService,
                    'core.utils': mockUtils as IUtils,
                    config: mockConfig as Config.IConfig,
                });

                const res = await recDomain.getRecordIdentity(record, ctx);

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

                const mockValDomain: Mockify<IValueDomain> = {
                    getValues: jest.fn().mockImplementation(({library, attribute}) => {
                        if (library === 'child_lib' && attribute === 'parent_link_attr') {
                            return Promise.resolve([{payload: parentRecord}]);
                        }
                        if (library === 'parent_lib' && attribute === 'grandparent_link_attr') {
                            return Promise.resolve([{payload: grandParentRecord}]);
                        }
                        if (library === 'parent_lib' && attribute === 'label_attr') {
                            return Promise.resolve([{payload: 'Parent Label'}]);
                        }
                        if (library === 'grandparent_lib' && attribute === 'label_attr') {
                            return Promise.resolve([{payload: 'GrandParent Label'}]);
                        }
                        return Promise.resolve([]);
                    }),
                };

                const mockGetEntityByIdHelper = jest.fn().mockImplementation((type, id) => {
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
                    validateLibrary: jest.fn().mockImplementation(libraryId => {
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

                const recDomain = recordDomain({
                    ...depsBase,
                    'core.domain.value': mockValDomain as IValueDomain,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                    'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                    'core.infra.cache.cacheService': mockCacheService as ICachesService,
                    'core.utils': mockUtils as IUtils,
                    config: mockConfig as Config.IConfig,
                });

                const res = await recDomain.getRecordIdentity(record, ctx);

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

                const mockValDomain: Mockify<IValueDomain> = {
                    getValues: jest.fn(),
                };

                const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                    validateLibrary: jest.fn().mockReturnValue(libData),
                };

                const recDomain = recordDomain({
                    ...depsBase,
                    'core.domain.value': mockValDomain as IValueDomain,
                    'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                    'core.infra.cache.cacheService': mockCacheService as ICachesService,
                    'core.utils': mockUtils as IUtils,
                });

                const res = await recDomain.getRecordIdentity(record, ctx);

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

                const mockValDomain: Mockify<IValueDomain> = {
                    getValues: jest.fn().mockImplementation(({attribute}) => {
                        if (attribute === 'parent_link_attr') {
                            return Promise.resolve([]);
                        }
                        return Promise.resolve([]);
                    }),
                };

                const mockGetEntityByIdHelper = jest.fn().mockReturnValue(libData);

                const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                    validateLibrary: jest.fn().mockReturnValue(libData),
                };

                const recDomain = recordDomain({
                    ...depsBase,
                    'core.domain.value': mockValDomain as IValueDomain,
                    'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                    'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                    'core.infra.cache.cacheService': mockCacheService as ICachesService,
                    'core.utils': mockUtils as IUtils,
                });

                const res = await recDomain.getRecordIdentity(record, ctx);

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

                const mockValDomain: Mockify<IValueDomain> = {
                    getValues: jest.fn().mockImplementation(({attribute}) => {
                        if (attribute === 'parent_link_attr') {
                            return Promise.resolve([{payload: parentRecord}]);
                        }
                        if (attribute === 'label_attr') {
                            return Promise.resolve([{payload: null}]);
                        }
                        return Promise.resolve([]);
                    }),
                };

                const mockGetEntityByIdHelper = jest.fn().mockImplementation((type, id) => {
                    if (id === 'test_lib') {
                        return libData;
                    }
                    if (id === 'parent_lib') {
                        return parentLibData;
                    }
                    return null;
                });

                const mockValidateHelperLocal: Mockify<IValidateHelper> = {
                    validateLibrary: jest.fn().mockImplementation(libraryId => {
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

                const recDomain = recordDomain({
                    ...depsBase,
                    'core.domain.value': mockValDomain as IValueDomain,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                    'core.domain.helpers.validate': mockValidateHelperLocal as IValidateHelper,
                    'core.infra.cache.cacheService': mockCacheService as ICachesService,
                    'core.utils': mockUtils as IUtils,
                    config: mockConfig as Config.IConfig,
                });

                const res = await recDomain.getRecordIdentity(record, ctx);

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

    describe('Deactivate record', () => {
        test('Set active to false on record', async () => {
            const record = {
                id: '222536283',
                library: 'test_lib',
                created_at: 1520931427,
                modified_at: 1520931427,
                active: true,
            };

            const mockValueDomain = {
                saveValue: global.__mockPromise([{payload: false}]),
            } satisfies Mockify<IValueDomain>;

            const recDomain = recordDomain({...depsBase, 'core.domain.value': mockValueDomain as IValueDomain});

            const recordAfter = await recDomain.deactivateRecord(record, ctx);

            expect(mockValueDomain.saveValue).toBeCalled();
            expect(typeof mockValueDomain.saveValue.mock.calls[0][0]).toBe('object');
            expect(mockValueDomain.saveValue.mock.calls[0][0].attribute).toBe(ATTRIBUTE_ACTIVE);
            expect(mockValueDomain.saveValue.mock.calls[0][0].value.payload).toBe(false);
            expect(recordAfter.active).toBe(false);
        });
    });

    describe('Activate record', () => {
        test('Set active to true on record', async () => {
            const record = {
                id: '222536283',
                library: 'test_lib',
                created_at: 1520931427,
                modified_at: 1520931427,
                active: false,
            };

            const mockValueDomain = {
                saveValue: global.__mockPromise([{payload: true}]),
            } satisfies Mockify<IValueDomain>;

            const recDomain = recordDomain({...depsBase, 'core.domain.value': mockValueDomain as IValueDomain});

            const recordAfter = await recDomain.activateRecord(record, ctx);

            expect(mockValueDomain.saveValue).toBeCalled();
            expect(typeof mockValueDomain.saveValue.mock.calls[0][0]).toBe('object');
            expect(mockValueDomain.saveValue.mock.calls[0][0].attribute).toBe(ATTRIBUTE_ACTIVE);
            expect(mockValueDomain.saveValue.mock.calls[0][0].value.payload).toBe(true);

            expect(recordAfter.active).toBe(true);
        });
    });

    describe('Deactivate record', () => {
        test('Set active to false on record', async () => {
            const record = {
                id: '222536283',
                library: 'test_lib',
                created_at: 1520931427,
                modified_at: 1520931427,
                active: true,
            };

            const mockValueDomain = {
                saveValue: global.__mockPromise([{payload: false}]),
            } satisfies Mockify<IValueDomain>;

            const recDomain = recordDomain({...depsBase, 'core.domain.value': mockValueDomain as IValueDomain});

            const recordAfter = await recDomain.deactivateRecord(record, {userId: '1'});

            expect(mockValueDomain.saveValue).toBeCalled();
            expect(mockValueDomain.saveValue.mock.calls[0][0].attribute).toBe(ATTRIBUTE_ACTIVE);
            expect(mockValueDomain.saveValue.mock.calls[0][0].value.payload).toBe(false);
            expect(recordAfter.active).toBe(false);
        });
    });

    describe('Activate record', () => {
        test('Set active to true on record', async () => {
            const record = {
                id: '222536283',
                library: 'test_lib',
                created_at: 1520931427,
                modified_at: 1520931427,
                active: false,
            };

            const mockValueDomain = {
                saveValue: global.__mockPromise([{payload: true}]),
            } satisfies Mockify<IValueDomain>;

            const recDomain = recordDomain({...depsBase, 'core.domain.value': mockValueDomain as IValueDomain});

            const recordAfter = await recDomain.activateRecord(record, {userId: '1'});

            expect(mockValueDomain.saveValue).toBeCalled();
            expect(mockValueDomain.saveValue.mock.calls[0][0].attribute).toBe(ATTRIBUTE_ACTIVE);
            expect(mockValueDomain.saveValue.mock.calls[0][0].value.payload).toBe(true);
            expect(recordAfter.active).toBe(true);
        });
    });

    describe('deactivateRecordsBatch', () => {
        test('Deactivate records from a list of records ids', async () => {
            const mockRecordPermissionDomain: Mockify<IRecordPermissionDomain> = {
                getRecordPermission: global.__mockPromise(true),
            };

            const domain = recordDomain({
                ...depsBase,
                'core.domain.permission.record': mockRecordPermissionDomain as IRecordPermissionDomain,
            });

            domain.find = jest.fn();
            domain.deactivateRecord = jest.fn().mockImplementation(() => Promise.resolve(mockRecord));

            const records = await domain.deactivateRecordsBatch({
                libraryId: 'test_lib',
                recordsIds: ['1', '2', '3'],
                ctx: mockCtx,
            });

            expect(domain.deactivateRecord).toBeCalledTimes(3);
            expect(domain.find).not.toBeCalled();
            expect(records).toEqual([mockRecord, mockRecord, mockRecord]);
        });

        test('Deactivate records from filters', async () => {
            const mockRecordPermissionDomain: Mockify<IRecordPermissionDomain> = {
                getRecordPermission: global.__mockPromise(true),
            };

            const domain = recordDomain({
                ...depsBase,
                'core.domain.permission.record': mockRecordPermissionDomain as IRecordPermissionDomain,
                'core.domain.record.helpers.findRecords': jest
                    .fn()
                    .mockImplementation(() => Promise.resolve({list: [mockRecord, mockRecord, mockRecord]})),
            });

            domain.deactivateRecord = jest.fn().mockImplementation(() => Promise.resolve(mockRecord));

            const records = await domain.deactivateRecordsBatch({
                libraryId: 'test_lib',
                filters: [
                    {
                        field: 'label',
                        condition: AttributeCondition.EQUAL,
                        value: 'foo',
                    },
                    {
                        operator: Operator.OR,
                    },
                    {
                        field: 'label',
                        condition: AttributeCondition.EQUAL,
                        value: 'bar',
                    },
                ],
                ctx: mockCtx,
            });

            expect(domain.find).toBeCalled();
            expect(domain.deactivateRecord).toBeCalledTimes(3);
            expect(records).toEqual([mockRecord, mockRecord, mockRecord]);
        });

        test('Do not deactivate records without permission', async () => {
            const mockRecordPermissionDomain: Mockify<IRecordPermissionDomain> = {
                getRecordPermission: global.__mockPromiseMultiple([true, true, false]),
            };

            const domain = recordDomain({
                ...depsBase,
                'core.domain.permission.record': mockRecordPermissionDomain as IRecordPermissionDomain,
            });
            domain.find = jest.fn();
            domain.deactivateRecord = jest.fn().mockImplementation(() => Promise.resolve(mockRecord));

            const records = await domain.deactivateRecordsBatch({
                libraryId: 'test_lib',
                recordsIds: ['1', '2', '3'],
                ctx: mockCtx,
            });

            expect(domain.deactivateRecord).toBeCalledTimes(2);
            expect(domain.find).not.toBeCalled();
            expect(records).toEqual([mockRecord, mockRecord]);
        });
    });

    describe('purgeInactiveRecords', () => {
        test('Delete all inactive records', async () => {
            const domain = recordDomain({
                ...depsBase,
                'core.domain.record.helpers.findRecords': jest
                    .fn()
                    .mockImplementation(() => Promise.resolve({list: [mockRecord, mockRecord]})),
            });

            domain.deleteRecord = jest.fn().mockImplementation(() => Promise.resolve());

            await domain.purgeInactiveRecords({libraryId: 'test_lib', ctx: mockCtx});

            expect(domain.deleteRecord).toBeCalledTimes(2);
        });
    });

    describe('purgeRecord', () => {
        test('Purge a record if inactive', async () => {
            const mockRecRepo = {getRecord: global.__mockPromise({active: false})} satisfies Mockify<IRecordRepo>;
            const domain = recordDomain({...depsBase, 'core.infra.record': mockRecRepo as IRecordRepo});
            domain.deleteRecord = jest.fn().mockImplementation(() => Promise.resolve());

            await domain.purgeRecord({libraryId: 'test_lib', recordId: '12345', ctx: mockCtx});

            expect(mockRecRepo.getRecord).toHaveBeenCalled();
            expect(domain.deleteRecord).toHaveBeenCalled();
        });
        test('Do not purge a record if active', async () => {
            const mockRecRepo = {getRecord: global.__mockPromise({active: true})} satisfies Mockify<IRecordRepo>;
            const domain = recordDomain({...depsBase, 'core.infra.record': mockRecRepo as IRecordRepo});
            domain.deleteRecord = jest.fn().mockImplementation(() => Promise.resolve());

            await domain.purgeRecord({libraryId: 'test_lib', recordId: '12345', ctx: mockCtx});

            expect(mockRecRepo.getRecord).toHaveBeenCalled();
            expect(domain.deleteRecord).not.toHaveBeenCalled();
        });
    });
});
