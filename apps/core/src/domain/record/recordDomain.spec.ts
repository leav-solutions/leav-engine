// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Errors, ErrorTypes} from '../../_types/errors';
import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type IEventsManagerDomain} from '../eventsManager/eventsManagerDomain';
import {type IValidateHelper} from '../helpers/validate';
import {type ILibraryPermissionDomain} from '../permission/libraryPermissionDomain';
import {type IValueDomain} from '../value/valueDomain';
import {type ICachesService} from '../../infra/cache/cacheService';
import {type IRecordRepo} from '../../infra/record/recordRepo';
import {type IUtils, type ToAny} from '../../utils/utils';
import type * as Config from '../../_types/config';
import {type IQueryInfos} from '../../_types/queryInfos';
import {LibraryBehavior} from '../../_types/library';
import {AttributeCondition, Operator} from '../../_types/record';
import {mockAttrSimple, mockUniqueAttrSimple} from '../../__tests__/mocks/attribute';
import {mockLibrary} from '../../__tests__/mocks/library';
import {mockRecord} from '../../__tests__/mocks/record';
import {mockCtx} from '../../__tests__/mocks/shared';
import {type IRecordPermissionDomain} from '../permission/recordPermissionDomain';
import recordDomain, {ATTRIBUTE_ACTIVE, type IRecordDomainDeps} from './recordDomain';
import {createRecord as createRecordHelper} from './helpers';
import {type IFormRepo} from '../../infra/form/formRepo';
import mockLogger from '../../__tests__/mockers/logger';
import {type ICreateRecordValueError} from './_types';

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
    'core.infra.record': jest.fn(),
    'core.domain.record.helpers.getRecordIdentity': jest.fn(),
    'core.domain.attribute': jest.fn(),
    'core.domain.value': jest.fn(),
    'core.domain.permission.record': jest.fn(),
    'core.domain.record.helpers.createRecord': jest.fn(),
    'core.domain.record.helpers.deleteRecord': jest.fn(),
    'core.domain.record.helpers.sendRecordUpdateEvent': jest.fn(),
    'core.domain.eventsManager': jest.fn(),
    'core.infra.cache.cacheService': jest.fn(),
    'core.utils.logger': mockLogger,
    'core.utils': jest.fn(),
    'core.infra.form': jest.fn(),
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
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
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
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
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

        test('Should return errors if no library permission', async () => {
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
                getLibraryPermission: global.__mockPromise(false),
            };

            const mockValueDomain: Mockify<IValueDomain> = {
                saveValueBatch: global.__mockPromise({errors: [{message: 'bad values'}]}),
            };

            const recDomain = recordDomain({
                ...depsBase,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
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

            expect(mockRecRepo.createRecord).not.toHaveBeenCalled();
            expect(mockValueDomain.saveValueBatch).not.toHaveBeenCalled();
            expect(recDomain.activateNewRecord).not.toHaveBeenCalled();
            expect(recDomain.deleteRecord).not.toHaveBeenCalled();
            expect(res.record).toBe(null);
            expect(res.valuesErrors).toHaveLength(1);
            expect(res.valuesErrors).toEqual([
                {
                    attribute: null,
                    library: 'test',
                    message: 'Action forbidden',
                    type: ErrorTypes.PERMISSION_ERROR,
                },
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
