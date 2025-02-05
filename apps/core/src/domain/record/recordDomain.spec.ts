// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorTypes} from '@leav/utils';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IValidateHelper} from 'domain/helpers/validate';
import {ILibraryPermissionDomain} from 'domain/permission/libraryPermissionDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {i18n} from 'i18next';
import {ICachesService} from 'infra/cache/cacheService';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {IRecordRepo} from 'infra/record/recordRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IUtils, ToAny} from 'utils/utils';
import * as Config from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {IStandardValue, IValue} from '_types/value';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {getPreviewUrl} from '../../utils/preview/preview';
import {ActionsListEvents} from '../../_types/actionsList';
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';
import {LibraryBehavior} from '../../_types/library';
import {AttributeCondition, IRecord, Operator} from '../../_types/record';
import {
    dateRangeAttributeMock,
    mockAttrAdvLink,
    mockAttrSimple,
    mockAttrSimpleLink,
    mockAttrTree
} from '../../__tests__/mocks/attribute';
import {mockLibrary, mockLibraryFiles} from '../../__tests__/mocks/library';
import {mockRecord} from '../../__tests__/mocks/record';
import {mockCtx} from '../../__tests__/mocks/shared';
import {mockTranslatorWithOptions} from '../../__tests__/mocks/translator';
import {mockTree} from '../../__tests__/mocks/tree';
import {mockStandardValue} from '../../__tests__/mocks/value';
import {IRecordPermissionDomain} from '../permission/recordPermissionDomain';
import recordDomain, {IRecordDomainDeps} from './recordDomain';

const eventsManagerMockConfig: Mockify<Config.IEventsManager> = {
    routingKeys: {data_events: 'test.data.events', pubsub_events: 'test.pubsub.events'}
};

const mockConfig: Mockify<Config.IConfig> = {
    eventsManager: eventsManagerMockConfig as Config.IEventsManager,
    files: {
        rootPaths: 'files1:/files',
        originalsPathPrefix: 'originals'
    }
};

const depsBase: ToAny<IRecordDomainDeps> = {
    config: {},
    'core.infra.record': jest.fn(),
    'core.domain.attribute': jest.fn(),
    'core.domain.value': jest.fn(),
    'core.domain.permission.record': jest.fn(),
    'core.domain.permission.library': jest.fn(),
    'core.domain.helpers.getCoreEntityById': jest.fn(),
    'core.domain.helpers.validate': jest.fn(),
    'core.domain.record.helpers.sendRecordUpdateEvent': jest.fn(),
    'core.infra.library': jest.fn(),
    'core.infra.tree': jest.fn(),
    'core.infra.value': jest.fn(),
    'core.domain.eventsManager': jest.fn(),
    'core.infra.cache.cacheService': jest.fn(),
    'core.utils': jest.fn(),
    'core.infra.form': jest.fn(),
    translator: {}
};

describe('RecordDomain', () => {
    const mockRecordPermDomain: Mockify<IRecordPermissionDomain> = {
        getRecordPermission: global.__mockPromise(true)
    };
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'recordDomainTest',
        lang: 'fr'
    };

    const mockEventsManager: Mockify<IEventsManagerDomain> = {
        sendDatabaseEvent: global.__mockPromise()
    };

    const mockValidateHelper: Mockify<IValidateHelper> = {
        validateLibrary: jest.fn().mockImplementation(libraryId => ({
            ...mockLibrary,
            behavior: libraryId === 'files' ? LibraryBehavior.FILES : LibraryBehavior.STANDARD,
            recordIdentityConf: {
                label: 'library_label',
                color: 'library_color',
                preview: 'library_preview',
                subLabel: 'library_subLabel'
            }
        }))
    };

    const mockSendRecordUpdateEventHelper = jest.fn();

    const mockUtils: Mockify<IUtils> = {
        translateError: jest.fn().mockReturnValue('mock error'),
        getRecordsCacheKey: jest.fn().mockReturnValue('cache_key'),
        getCoreEntityCacheKey: jest.fn().mockReturnValue('cache_key'),
        getPreviewsAttributeName: jest.fn().mockReturnValue('previews'),
        isLinkAttribute: jest.fn().mockReturnValue(false),
        isTreeAttribute: jest.fn().mockReturnValue(false)
    };

    const mockCacheService: Mockify<ICachesService> = {
        memoize: jest.fn().mockImplementation(({func}) => func()),
        getCache: jest.fn().mockReturnValue({
            deleteData: jest.fn()
        })
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createRecord', () => {
        test('Should create a new record', async function () {
            const createdRecordData = {
                id: '222435651',
                library: 'test',
                created_at: 1519303348,
                modified_at: 1519303348
            };
            const recRepo = {createRecord: global.__mockPromise(createdRecordData)} satisfies Mockify<IRecordRepo>;

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getLibraryFullTextAttributes: global.__mockPromise([])
            };

            const mockLibraryPermissionDomain: Mockify<ILibraryPermissionDomain> = {
                getLibraryPermission: global.__mockPromise(true)
            };

            const recDomain = recordDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.record': recRepo as IRecordRepo,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain
            });

            const createdRecord = await recDomain.createRecord({library: 'test', ctx});

            expect(recRepo.createRecord.mock.calls.length).toBe(1);
            expect(typeof recRepo.createRecord.mock.calls[0][0]).toBe('object');
            expect(Number.isInteger(recRepo.createRecord.mock.calls[0][0].recordData.created_at)).toBe(true);
            expect(Number.isInteger(recRepo.createRecord.mock.calls[0][0].recordData.modified_at)).toBe(true);
            expect(recRepo.createRecord.mock.calls[0][0].recordData.created_by).toBe('1');
            expect(recRepo.createRecord.mock.calls[0][0].recordData.modified_by).toBe('1');

            expect(createdRecord.record).toMatchObject(createdRecordData);
            expect(createdRecord.valuesErrors).toBe(null);
        });

        test('Should create a new record and save its values', async function () {
            const createdRecordData = {
                id: '222435651',
                library: 'test',
                created_at: 1519303348,
                modified_at: 1519303348
            };
            const recRepo: Mockify<IRecordRepo> = {createRecord: global.__mockPromise(createdRecordData)};

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getLibraryFullTextAttributes: global.__mockPromise([]),
                getAttributeProperties: global.__mockPromise(mockAttrSimple)
            };

            const mockLibraryPermissionDomain: Mockify<ILibraryPermissionDomain> = {
                getLibraryPermission: global.__mockPromise(true)
            };

            const mockValueDomain: Mockify<IValueDomain> = {
                saveValueBatch: global.__mockPromise({values: [], errors: null}),
                runActionsList: global.__mockPromise()
            };

            const recDomain = recordDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.domain.value': mockValueDomain as IValueDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                'core.infra.record': recRepo as IRecordRepo
            });

            const createdRecord = await recDomain.createRecord({
                library: 'test',
                values: [
                    {
                        attribute: 'some_attribute',
                        payload: 'some_value'
                    }
                ],
                ctx
            });
            expect(recRepo.createRecord).toBeCalled();
            expect(mockValueDomain.runActionsList).toBeCalled();
            expect(mockValueDomain.saveValueBatch).toBeCalled();
            expect(createdRecord.valuesErrors).toBe(null);
        });

        test('Should return errors if creating a new record with bad values', async () => {
            const createdRecordData = {
                id: '222435651',
                library: 'test',
                created_at: 1519303348,
                modified_at: 1519303348
            };
            const recRepo: Mockify<IRecordRepo> = {createRecord: global.__mockPromise(createdRecordData)};

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getLibraryFullTextAttributes: global.__mockPromise([]),
                getAttributeProperties: global.__mockPromise(mockAttrSimple)
            };

            const mockLibraryPermissionDomain: Mockify<ILibraryPermissionDomain> = {
                getLibraryPermission: global.__mockPromise(true)
            };

            const mockValueDomain: Mockify<IValueDomain> = {
                saveValueBatch: global.__mockPromise(),
                runActionsList: jest
                    .fn()
                    .mockRejectedValueOnce(
                        new ValidationError({some_attribute: 'invalid value'}, 'mock error', false, {
                            attributeId: 'some_attribute',
                            values: [
                                {
                                    id_value: 'fake_value1',
                                    value: 'some_value'
                                }
                            ]
                        })
                    )
                    .mockRejectedValueOnce(
                        new ValidationError({other_attribute: 'invalid value'}, 'mock error', false, {
                            attributeId: 'other_attribute',
                            values: [
                                {
                                    id_value: 'fake_value2',
                                    value: 'some other value'
                                }
                            ]
                        })
                    )
            };

            const recDomain = recordDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.domain.value': mockValueDomain as IValueDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                'core.infra.record': recRepo as IRecordRepo,
                'core.utils': mockUtils as IUtils
            });

            // Assert that create record throw an exception with two fields: some_attribute and other_attribute
            const res = await recDomain.createRecord({
                library: 'test',
                values: [
                    {
                        attribute: 'some_attribute',
                        id_value: 'fake_value1',
                        payload: 'some_value'
                    },
                    {
                        attribute: 'other_attribute',
                        id_value: 'fake_value2',
                        payload: 'some other value'
                    }
                ],
                ctx
            });

            expect(mockValueDomain.runActionsList).toBeCalled();
            expect(recRepo.createRecord).not.toBeCalled();
            expect(mockValueDomain.saveValueBatch).not.toBeCalled();

            expect(res.record).toBe(null);
            expect(res.valuesErrors).toHaveLength(2);
            expect(res.valuesErrors).toEqual([
                {
                    attributeId: 'some_attribute',
                    type: ErrorTypes.VALIDATION_ERROR,
                    message: 'mock error',
                    id_value: 'fake_value1',
                    input: 'some_value'
                },
                {
                    attributeId: 'other_attribute',
                    type: ErrorTypes.VALIDATION_ERROR,
                    message: 'mock error',
                    id_value: 'fake_value2',
                    input: 'some other value'
                }
            ]);
        });
    });

    describe('updateRecord', () => {
        test('Should update a record', async function () {
            const updatedRecordData = {
                id: '222435651',
                library: 'test',
                created_at: 1519303348,
                modified_at: 987654321
            };
            const recRepo = {
                updateRecord: global.__mockPromise({old: updatedRecordData, new: updatedRecordData})
            } satisfies Mockify<IRecordRepo>;

            const recDomain = recordDomain({
                ...depsBase,
                'core.infra.record': recRepo as IRecordRepo,
                'core.infra.cache.cacheService': mockCacheService as ICachesService,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdateEventHelper,
                'core.utils': mockUtils as IUtils
            });

            const updatedRecord = await recDomain.updateRecord({
                library: 'test',
                recordData: {id: '222435651', modified_at: 987654321},
                ctx
            });

            expect(recRepo.updateRecord.mock.calls.length).toBe(1);
            expect(typeof recRepo.updateRecord.mock.calls[0][0]).toBe('object');
            expect(Number.isInteger(recRepo.updateRecord.mock.calls[0][0].recordData.modified_at)).toBe(true);

            expect(updatedRecord).toMatchObject(updatedRecordData);
        });
    });

    describe('deleteRecord', () => {
        const recordData = {id: '222435651', library: 'test', created_at: 1519303348, modified_at: 1519303348};

        test('Should delete an record and return deleted record', async function () {
            const recRepo = {
                deleteRecord: global.__mockPromise(recordData)
            } satisfies Mockify<IRecordRepo>;

            const recordPermDomain: Mockify<IRecordPermissionDomain> = {
                getRecordPermission: global.__mockPromise(true)
            };
            const libRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 1})
            };

            const attrDomain: Mockify<IAttributeDomain> = {
                getAttributes: global.__mockPromise({totalCount: 0, list: []})
            };

            const mockValueRepo: Mockify<IValueRepo> = {
                deleteAllValuesByRecord: global.__mockPromise()
            };

            const mockTreeRepo: Mockify<ITreeRepo> = {
                getTrees: global.__mockPromise({totalCount: 0, list: [mockTree]}),
                getNodesByRecord: global.__mockPromise(['1', '2', '3']),
                deleteElement: jest.fn()
            };

            const recDomain = recordDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.infra.record': recRepo as IRecordRepo,
                'core.infra.library': libRepo as ILibraryRepo,
                'core.infra.value': mockValueRepo as IValueRepo,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.attribute': attrDomain as IAttributeDomain,
                'core.domain.permission.record': recordPermDomain as IRecordPermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper
            });

            await recDomain.deleteRecord({library: 'test', id: recordData.id, ctx});

            expect(recRepo.deleteRecord.mock.calls.length).toBe(1);
            expect(mockValueRepo.deleteAllValuesByRecord).toBeCalled();
            expect(mockTreeRepo.getTrees).toBeCalled();
            expect(mockTreeRepo.getNodesByRecord).toBeCalled();
            expect(mockTreeRepo.deleteElement).toBeCalledTimes(3);
        });

        // TODO: handle unknown record?
        // test('Should throw if unknown record', async function() {
        //     const mockLibRepo = {deleteRecord: global.__mockPromise(recordData)};
        //     const recDomain = recordDomain(mockLibRepo);

        //     await expect(recDomain.deleteRecord(recordData.id)).rejects.toThrow();
        // });
    });

    describe('find', () => {
        const mockRes = {
            totalCount: 1,
            list: [
                {
                    id: '222536515',
                    created_at: 1520931648,
                    modified_at: 1520931648,
                    ean: '9876543219999999'
                }
            ]
        };

        const mockLibraryPermissionDomain: Mockify<ILibraryPermissionDomain> = {
            getLibraryPermission: global.__mockPromise(true)
        };

        test('Should find records', async function () {
            const recRepo = {find: global.__mockPromise(mockRes)} satisfies Mockify<IRecordRepo>;

            const recDomain = recordDomain({
                ...depsBase,
                'core.infra.record': recRepo as IRecordRepo,
                'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper
            });

            const findRes = await recDomain.find({params: {library: 'test_lib'}, ctx});

            expect(recRepo.find.mock.calls.length).toBe(1);
            expect(findRes.list).toEqual([
                {
                    id: '222536515',
                    created_at: 1520931648,
                    modified_at: 1520931648,
                    ean: '9876543219999999'
                }
            ]);
        });

        test('Find with a filter via extended attribute', async () => {
            const recRepo = {find: global.__mockPromise(mockRes)} satisfies Mockify<IRecordRepo>;
            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({
                    ...mockAttrSimple,
                    id: 'extended_attribute',
                    format: AttributeFormats.EXTENDED
                })
            };

            const recDomain = recordDomain({
                ...depsBase,
                'core.infra.record': recRepo as IRecordRepo,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper
            });

            await recDomain.find({
                params: {
                    library: 'test_lib',
                    filters: [
                        {
                            field: 'extended_attribute.sub_field.other_sub_field',
                            condition: AttributeCondition.CONTAINS,
                            value: 'some_filter'
                        }
                    ]
                },
                ctx
            });

            expect(recRepo.find.mock.calls.length).toBe(1);
            const {filters: recRepoFilters} = recRepo.find.mock.calls[0][0];
            expect(recRepoFilters[0].attributes.length).toBe(3);
            expect(recRepoFilters[0].attributes[0].id).toBe('extended_attribute');
            expect(recRepoFilters[0].attributes[1].id).toBe('sub_field');
            expect(recRepoFilters[0].attributes[2].id).toBe('other_sub_field');
        });

        test('If user cannot access library, return permission error', async () => {
            const recRepo: Mockify<IRecordRepo> = {find: global.__mockPromise(mockRes)};
            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({
                    ...mockAttrSimple,
                    id: 'extended_attribute',
                    format: AttributeFormats.EXTENDED
                })
            };

            const mockLibraryPermissionDomainForbidden: Mockify<ILibraryPermissionDomain> = {
                getLibraryPermission: global.__mockPromise(false)
            };

            const recDomain = recordDomain({
                ...depsBase,
                'core.infra.record': recRepo as IRecordRepo,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.domain.permission.library': mockLibraryPermissionDomainForbidden as ILibraryPermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper
            });

            await expect(recDomain.find({params: {library: 'test_lib'}, ctx})).rejects.toThrow(PermissionError);
        });

        describe('Link attribute', () => {
            test('Find with a filter via link attribute', async () => {
                const recRepo = {find: global.__mockPromise(mockRes)} satisfies Mockify<IRecordRepo>;
                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromiseMultiple([
                        {
                            ...mockAttrSimpleLink,
                            id: 'link_attribute'
                        },
                        {
                            ...mockAttrSimple,
                            id: 'sub_attribute'
                        }
                    ]),
                    getLibraryAttributes: global.__mockPromise([
                        {
                            ...mockAttrSimple,
                            id: 'sub_attribute'
                        }
                    ])
                };

                const recDomain = recordDomain({
                    ...depsBase,
                    'core.infra.record': recRepo as IRecordRepo,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper
                });

                await recDomain.find({
                    params: {
                        library: 'test_lib',
                        filters: [
                            {
                                field: 'link_attribute.sub_attribute',
                                condition: AttributeCondition.CONTAINS,
                                value: 'some_filter'
                            }
                        ]
                    },
                    ctx
                });

                expect(recRepo.find.mock.calls.length).toBe(1);
                const {filters: recRepoFilters} = recRepo.find.mock.calls[0][0];
                expect(recRepoFilters[0].attributes.length).toBe(2);
                expect(recRepoFilters[0].attributes[0].id).toBe('link_attribute');
                expect(recRepoFilters[0].attributes[1].id).toBe('sub_attribute');
            });

            test('If child attribute is not specified, search on linked library label', async () => {
                const recRepo = {find: global.__mockPromise(mockRes)} satisfies Mockify<IRecordRepo>;
                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromiseMultiple([
                        {
                            ...mockAttrSimpleLink,
                            id: 'link_attribute'
                        },
                        {
                            ...mockAttrSimple,
                            id: 'library_label'
                        }
                    ]),
                    getLibraryAttributes: global.__mockPromise([
                        {
                            ...mockAttrSimple,
                            id: 'library_label'
                        }
                    ])
                };

                const mockLibraryRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromiseMultiple([
                        {
                            list: [
                                {
                                    ...mockLibrary,
                                    id: 'lib1',
                                    recordIdentityConf: {
                                        label: 'library_label'
                                    }
                                }
                            ]
                        }
                    ])
                };

                const recDomain = recordDomain({
                    ...depsBase,
                    'core.infra.record': recRepo as IRecordRepo,
                    'core.infra.library': mockLibraryRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper
                });

                await recDomain.find({
                    params: {
                        library: 'test_lib',
                        filters: [
                            {
                                field: 'link_attribute',
                                condition: AttributeCondition.CONTAINS,
                                value: 'some_filter'
                            }
                        ]
                    },
                    ctx
                });

                expect(recRepo.find.mock.calls.length).toBe(1);
                const {filters: recRepoFilters} = recRepo.find.mock.calls[0][0];
                expect(recRepoFilters[0].attributes.length).toBe(2);
                expect(recRepoFilters[0].attributes[0].id).toBe('link_attribute');
                expect(recRepoFilters[0].attributes[1].id).toBe('library_label');
            });

            test('If child attribute is a link, search on label', async () => {
                const recRepo = {find: global.__mockPromise(mockRes)} satisfies Mockify<IRecordRepo>;
                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromiseMultiple([
                        {
                            ...mockAttrSimpleLink,
                            id: 'link_attribute'
                        },
                        {
                            ...mockAttrAdvLink,
                            id: 'child_link_attribute'
                        },
                        {
                            ...mockAttrSimple,
                            id: 'child_library_label'
                        }
                    ]),
                    getLibraryAttributes: global.__mockPromise([
                        {
                            ...mockAttrSimple,
                            id: 'child_link_attribute'
                        }
                    ])
                };

                const mockLibraryRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromiseMultiple([
                        {
                            list: [
                                {
                                    ...mockLibrary,
                                    id: 'lib1',
                                    recordIdentityConf: {
                                        label: 'child_link_attribute'
                                    }
                                }
                            ]
                        },
                        {
                            list: [
                                {
                                    ...mockLibrary,
                                    id: 'lib1',
                                    recordIdentityConf: {
                                        label: 'child_library_label'
                                    }
                                }
                            ]
                        }
                    ])
                };

                const recDomain = recordDomain({
                    ...depsBase,
                    'core.infra.record': recRepo as IRecordRepo,
                    'core.infra.library': mockLibraryRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper
                });

                await recDomain.find({
                    params: {
                        library: 'test_lib',
                        filters: [
                            {
                                field: 'link_attribute.child_link_attribute',
                                condition: AttributeCondition.CONTAINS,
                                value: 'some_filter'
                            }
                        ]
                    },
                    ctx
                });

                expect(recRepo.find.mock.calls.length).toBe(1);
                const {filters: recRepoFilters} = recRepo.find.mock.calls[0][0];
                expect(recRepoFilters[0].attributes.length).toBe(3);
                expect(recRepoFilters[0].attributes[0].id).toBe('link_attribute');
                expect(recRepoFilters[0].attributes[1].id).toBe('child_link_attribute');
                expect(recRepoFilters[0].attributes[2].id).toBe('child_library_label');
            });
        });

        describe('Tree attribute', () => {
            test('Find with a filter via tree attribute', async () => {
                const recRepo = {find: global.__mockPromise(mockRes)} satisfies Mockify<IRecordRepo>;
                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromiseMultiple([
                        {
                            ...mockAttrTree,
                            id: 'tree_attribute'
                        },
                        {
                            ...mockAttrSimple,
                            id: 'sub_attribute'
                        }
                    ]),
                    getLibraryAttributes: global.__mockPromise([
                        {
                            ...mockAttrSimple,
                            id: 'sub_attribute'
                        }
                    ])
                };

                const recDomain = recordDomain({
                    ...depsBase,
                    'core.infra.record': recRepo as IRecordRepo,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper
                });

                await recDomain.find({
                    params: {
                        library: 'test_lib',
                        filters: [
                            {
                                field: 'tree_attribute.some_lib.sub_attribute',
                                condition: AttributeCondition.CONTAINS,
                                value: 'some_filter'
                            }
                        ]
                    },
                    ctx
                });

                expect(recRepo.find.mock.calls.length).toBe(1);
                const {filters: recRepoFilters} = recRepo.find.mock.calls[0][0];
                expect(recRepoFilters[0].attributes.length).toBe(2);
                expect(recRepoFilters[0].attributes[0].id).toBe('tree_attribute');
                expect(recRepoFilters[0].attributes[1].id).toBe('sub_attribute');
            });

            test('If child attribute is not specified, search on library label', async () => {
                const recRepo = {find: global.__mockPromise(mockRes)} satisfies Mockify<IRecordRepo>;

                const mockLibraryRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromiseMultiple([
                        {
                            list: [
                                {
                                    ...mockLibrary,
                                    id: 'lib1',
                                    recordIdentityConf: {
                                        label: 'first_label_attribute'
                                    }
                                }
                            ]
                        }
                    ])
                };

                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromiseMultiple([
                        {
                            ...mockAttrTree,
                            id: 'tree_attribute'
                        },
                        {
                            ...mockAttrSimple,
                            id: 'first_label_attribute'
                        }
                    ]),
                    getLibraryAttributes: global.__mockPromise([
                        {
                            ...mockAttrSimple,
                            id: 'sub_attribute'
                        }
                    ])
                };

                const recDomain = recordDomain({
                    ...depsBase,
                    'core.infra.record': recRepo as IRecordRepo,
                    'core.infra.library': mockLibraryRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper
                });

                await recDomain.find({
                    params: {
                        library: 'test_lib',
                        filters: [
                            {
                                field: 'tree_attribute.lib1',
                                condition: AttributeCondition.CONTAINS,
                                value: 'some_filter'
                            }
                        ]
                    },
                    ctx
                });

                expect(recRepo.find.mock.calls.length).toBe(1);

                const {filters: recRepoFilters} = recRepo.find.mock.calls[0][0];
                expect(recRepoFilters[0].attributes.length).toBe(2);
                expect(recRepoFilters[0].attributes[0].id).toBe('tree_attribute');
                expect(recRepoFilters[0].attributes[1].id).toBe('first_label_attribute');
            });

            test('If library is not specified, search on label of each tree libraries', async () => {
                const recRepo = {find: global.__mockPromise(mockRes)} satisfies Mockify<IRecordRepo>;

                const mockLibraryRepo: Mockify<ILibraryRepo> = {
                    getLibraries: jest.fn().mockImplementation(({params}) =>
                        Promise.resolve(
                            params.filters.id === 'lib1'
                                ? {
                                      list: [
                                          {
                                              ...mockLibrary,
                                              id: 'lib1',
                                              recordIdentityConf: {
                                                  label: 'first_label_attribute'
                                              }
                                          }
                                      ]
                                  }
                                : {
                                      list: [
                                          {
                                              ...mockLibrary,
                                              id: 'lib2',
                                              recordIdentityConf: {
                                                  label: 'second_label_attribute'
                                              }
                                          }
                                      ]
                                  }
                        )
                    )
                };

                const mockTreeRepo: Mockify<ITreeRepo> = {
                    getTrees: global.__mockPromise({
                        list: [
                            {
                                ...mockTree,
                                id: 'my_tree'
                            }
                        ]
                    })
                };

                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromiseMultiple([
                        {
                            ...mockAttrTree,
                            id: 'tree_attribute'
                        },
                        {
                            ...mockAttrSimple,
                            id: 'first_label_attribute'
                        },
                        {
                            ...mockAttrSimple,
                            id: 'second_label_attribute'
                        }
                    ]),
                    getLibraryAttributes: global.__mockPromise([
                        {
                            ...mockAttrSimple,
                            id: 'sub_attribute'
                        }
                    ])
                };

                const recDomain = recordDomain({
                    ...depsBase,
                    'core.infra.record': recRepo as IRecordRepo,
                    'core.infra.library': mockLibraryRepo as ILibraryRepo,
                    'core.infra.tree': mockTreeRepo as ITreeRepo,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper
                });

                await recDomain.find({
                    params: {
                        library: 'test_lib',
                        filters: [
                            {
                                field: 'tree_attribute',
                                condition: AttributeCondition.CONTAINS,
                                value: 'some_filter'
                            }
                        ]
                    },
                    ctx
                });

                expect(recRepo.find.mock.calls.length).toBe(1);

                const {filters: recRepoFilters} = recRepo.find.mock.calls[0][0];
                expect(recRepoFilters[0].attributes.length).toBe(3);
                expect(recRepoFilters[0].attributes[0].id).toBe('tree_attribute');
                expect(recRepoFilters[0].attributes[1].id).toBe('first_label_attribute');
                expect(recRepoFilters[0].attributes[2].id).toBe('second_label_attribute');
            });
        });

        test('Should search records', async function () {
            const mockSearchRes = {
                totalCount: 1,
                list: [
                    {
                        id: 1,
                        library: 'test_lib'
                    }
                ]
            };

            const recRepo: Mockify<IRecordRepo> = {
                find: global.__mockPromise(mockSearchRes)
            };

            const libRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib', system: false}], totalCount: 1})
            };

            const attributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({
                    id: 'id',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.TEXT
                }),
                getLibraryFullTextAttributes: global.__mockPromise(['id'])
            };

            const recDomain = recordDomain({
                ...depsBase,
                'core.domain.attribute': attributeDomain as IAttributeDomain,
                'core.infra.record': recRepo as IRecordRepo,
                'core.infra.library': libRepo as ILibraryRepo,
                'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper
            });

            const findRes = await recDomain.find({
                params: {
                    library: 'test_lib',
                    fulltextSearch: 'text'
                },
                ctx
            });

            expect(findRes).toEqual({
                totalCount: 1,
                list: [
                    {
                        id: 1,
                        library: 'test_lib'
                    }
                ]
            });
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
                visual_simple: '222713677'
            };

            const libData = {
                id: 'test_lib',
                recordIdentityConf: {
                    label: 'label_attr',
                    color: 'color_attr',
                    preview: 'preview_attr'
                }
            };

            const mockValDomain: Mockify<IValueDomain> = {
                getValues: global.__mockPromiseMultiple([
                    [
                        {
                            payload: 'Label Value'
                        }
                    ],
                    [
                        {
                            payload: '#123456'
                        }
                    ]
                ])
            };

            const mockLibraryRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({totalCount: 1, list: [mockLibraryFiles]})
            };

            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: jest
                    .fn()
                    .mockImplementation(({id}) =>
                        id === 'preview_attr' ? {...mockAttrAdvLink, linked_library: 'files'} : mockAttrSimple
                    )
            };

            const mockGetEntityByIdHelper = jest.fn().mockReturnValue(libData);

            const mockUtilsRecordIdentity: Mockify<IUtils> = {
                ...mockUtils,
                getPreviewsAttributeName: jest.fn().mockReturnValue('previews'),
                isLinkAttribute: jest.fn().mockReturnValue(false),
                isTreeAttribute: jest.fn().mockReturnValue(false)
            };

            const recDomain = recordDomain({
                ...depsBase,
                'core.domain.value': mockValDomain as IValueDomain,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.infra.library': mockLibraryRepo as ILibraryRepo,
                'core.infra.cache.cacheService': mockCacheService as ICachesService,
                'core.utils': mockUtilsRecordIdentity as IUtils,
                config: mockConfig as Config.IConfig
            });

            recDomain.getRecordFieldValue = jest.fn().mockImplementation(({attributeId}) =>
                Promise.resolve([
                    attributeId === 'previews'
                        ? {
                              raw_payload: {
                                  small: 'small_fake-image',
                                  medium: 'medium_fake-image',
                                  big: 'big_fake-image'
                              }
                          }
                        : {
                              ...mockStandardValue,
                              payload: {
                                  ...mockRecord,
                                  previews: {
                                      small: 'small_fake-image',
                                      medium: 'medium_fake-image',
                                      big: 'big_fake-image'
                                  }
                              }
                          }
                ])
            );

            const res = await recDomain.getRecordIdentity(record, ctx);

            expect(res.id).toBe('222536283');
            expect(res.library).toMatchObject(libData);
            expect(res.label).toBe('Label Value');
            expect(res.color).toBe('#123456');
            expect(res.preview).toEqual({
                big: getPreviewUrl() + 'big_fake-image',
                small: getPreviewUrl() + 'small_fake-image',
                medium: getPreviewUrl() + 'medium_fake-image',
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
                        small: 'small_fake-image'
                    }
                }
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
                    visual_simple: '222713677'
                };

                const libData = {
                    id: 'test_lib',
                    recordIdentityConf: {
                        label: 'label_attr',
                        preview: 'preview_attr'
                    }
                };

                const mockValDomain: Mockify<IValueDomain> = {
                    getValues: global.__mockPromiseMultiple([
                        [
                            {
                                payload: null
                            },
                            {
                                payload: 'Inherited Label Value',
                                isInherited: true
                            }
                        ]
                    ])
                };

                const mockLibraryRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromise({totalCount: 1, list: [mockLibraryFiles]})
                };

                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromise(mockAttrSimple)
                };

                const mockGetEntityByIdHelper = jest.fn().mockReturnValue(libData);

                const recDomain = recordDomain({
                    ...depsBase,
                    'core.domain.value': mockValDomain as IValueDomain,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                    'core.infra.library': mockLibraryRepo as ILibraryRepo,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.infra.cache.cacheService': mockCacheService as ICachesService,
                    'core.utils': mockUtils as IUtils,
                    config: mockConfig as Config.IConfig
                });

                recDomain.getRecordFieldValue = jest.fn().mockImplementation(({attributeId}) =>
                    Promise.resolve([
                        attributeId === 'previews'
                            ? {
                                  raw_payload: {
                                      small: 'small_fake-image',
                                      medium: 'medium_fake-image',
                                      big: 'big_fake-image'
                                  }
                              }
                            : {
                                  ...mockStandardValue,
                                  payload: {
                                      ...mockRecord,
                                      previews: {
                                          small: 'small_fake-image',
                                          medium: 'medium_fake-image',
                                          big: 'big_fake-image'
                                      }
                                  }
                              }
                    ])
                );

                const res = await recDomain.getRecordIdentity(record, ctx);

                expect(res.id).toBe('222536283');
                expect(res.library).toMatchObject(libData);
                expect(res.label).toBe('Inherited Label Value');
            });

            test('Return record identity with override label', async () => {
                const record = {
                    id: '222536283',
                    library: 'test_lib',
                    created_at: 1520931427,
                    modified_at: 1520931427,
                    ean: '9876543219999999',
                    visual_simple: '222713677'
                };

                const libData = {
                    id: 'test_lib',
                    recordIdentityConf: {
                        label: 'label_attr',
                        preview: 'preview_attr'
                    }
                };

                const mockValDomain: Mockify<IValueDomain> = {
                    getValues: global.__mockPromiseMultiple([
                        [
                            {
                                payload: 'Override Label Value',
                                isInherited: false
                            },
                            {
                                payload: 'Inherited Label Value',
                                isInherited: true
                            }
                        ]
                    ])
                };

                const mockLibraryRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromise({totalCount: 1, list: [mockLibraryFiles]})
                };

                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromise(mockAttrSimple)
                };

                const mockGetEntityByIdHelper = jest.fn().mockReturnValue(libData);

                const recDomain = recordDomain({
                    ...depsBase,
                    'core.domain.value': mockValDomain as IValueDomain,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                    'core.infra.library': mockLibraryRepo as ILibraryRepo,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.infra.cache.cacheService': mockCacheService as ICachesService,
                    'core.utils': mockUtils as IUtils,
                    config: mockConfig as Config.IConfig
                });

                recDomain.getRecordFieldValue = jest.fn().mockImplementation(({attributeId}) =>
                    Promise.resolve([
                        attributeId === 'previews'
                            ? {
                                  raw_payload: {
                                      small: 'small_fake-image',
                                      medium: 'medium_fake-image',
                                      big: 'big_fake-image'
                                  }
                              }
                            : {
                                  ...mockStandardValue,
                                  payload: {
                                      ...mockRecord,
                                      previews: {
                                          small: 'small_fake-image',
                                          medium: 'medium_fake-image',
                                          big: 'big_fake-image'
                                      }
                                  }
                              }
                    ])
                );

                const res = await recDomain.getRecordIdentity(record, ctx);

                expect(res.id).toBe('222536283');
                expect(res.library).toMatchObject(libData);
                expect(res.label).toBe('Override Label Value');
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
                    visual_simple: '222713677'
                };

                const libData = {
                    id: 'test_lib',
                    recordIdentityConf: {
                        subLabel: 'subLabel_attr',
                        preview: 'preview_attr'
                    }
                };

                const mockValDomain: Mockify<IValueDomain> = {
                    getValues: global.__mockPromiseMultiple([
                        [
                            {
                                payload: null
                            },
                            {
                                payload: 'Inherited SubLabel Value',
                                isInherited: true
                            }
                        ]
                    ])
                };

                const mockLibraryRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromise({totalCount: 1, list: [mockLibraryFiles]})
                };

                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromise(mockAttrSimple)
                };

                const mockGetEntityByIdHelper = jest.fn().mockReturnValue(libData);

                const recDomain = recordDomain({
                    ...depsBase,
                    'core.domain.value': mockValDomain as IValueDomain,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                    'core.infra.library': mockLibraryRepo as ILibraryRepo,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.infra.cache.cacheService': mockCacheService as ICachesService,
                    'core.utils': mockUtils as IUtils,
                    config: mockConfig as Config.IConfig
                });

                recDomain.getRecordFieldValue = jest.fn().mockImplementation(({attributeId}) =>
                    Promise.resolve([
                        attributeId === 'previews'
                            ? {
                                  raw_payload: {
                                      small: 'small_fake-image',
                                      medium: 'medium_fake-image',
                                      big: 'big_fake-image'
                                  }
                              }
                            : {
                                  ...mockStandardValue,
                                  payload: {
                                      ...mockRecord,
                                      previews: {
                                          small: 'small_fake-image',
                                          medium: 'medium_fake-image',
                                          big: 'big_fake-image'
                                      }
                                  }
                              }
                    ])
                );

                const res = await recDomain.getRecordIdentity(record, ctx);

                expect(res.id).toBe('222536283');
                expect(res.library).toMatchObject(libData);
                expect(res.subLabel).toBe('Inherited SubLabel Value');
            });

            test('Return record identity with override sublabel', async () => {
                const record = {
                    id: '222536283',
                    library: 'test_lib',
                    created_at: 1520931427,
                    modified_at: 1520931427,
                    ean: '9876543219999999',
                    visual_simple: '222713677'
                };

                const libData = {
                    id: 'test_lib',
                    recordIdentityConf: {
                        subLabel: 'subLabel_attr',
                        preview: 'preview_attr'
                    }
                };

                const mockValDomain: Mockify<IValueDomain> = {
                    getValues: global.__mockPromiseMultiple([
                        [
                            {
                                payload: 'Override SubLabel Value',
                                isInherited: false
                            },
                            {
                                payload: 'Inherited SubLabel Value',
                                isInherited: true
                            }
                        ]
                    ])
                };

                const mockLibraryRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromise({totalCount: 1, list: [mockLibraryFiles]})
                };

                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromise(mockAttrSimple)
                };

                const mockGetEntityByIdHelper = jest.fn().mockReturnValue(libData);

                const recDomain = recordDomain({
                    ...depsBase,
                    'core.domain.value': mockValDomain as IValueDomain,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                    'core.infra.library': mockLibraryRepo as ILibraryRepo,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.infra.cache.cacheService': mockCacheService as ICachesService,
                    'core.utils': mockUtils as IUtils,
                    config: mockConfig as Config.IConfig
                });

                recDomain.getRecordFieldValue = jest.fn().mockImplementation(({attributeId}) =>
                    Promise.resolve([
                        attributeId === 'previews'
                            ? {
                                  raw_payload: {
                                      small: 'small_fake-image',
                                      medium: 'medium_fake-image',
                                      big: 'big_fake-image'
                                  }
                              }
                            : {
                                  ...mockStandardValue,
                                  payload: {
                                      ...mockRecord,
                                      previews: {
                                          small: 'small_fake-image',
                                          medium: 'medium_fake-image',
                                          big: 'big_fake-image'
                                      }
                                  }
                              }
                    ])
                );

                const res = await recDomain.getRecordIdentity(record, ctx);

                expect(res.id).toBe('222536283');
                expect(res.library).toMatchObject(libData);
                expect(res.subLabel).toBe('Override SubLabel Value');
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
                    visual_simple: '222713677'
                };

                const libData = {
                    id: 'test_lib',
                    recordIdentityConf: {
                        color: 'color_attr',
                        preview: 'preview_attr'
                    }
                };

                const mockValDomain: Mockify<IValueDomain> = {
                    getValues: global.__mockPromiseMultiple([
                        [
                            {
                                payload: null
                            },
                            {
                                payload: '#ff0000',
                                isInherited: true
                            }
                        ]
                    ])
                };

                const mockLibraryRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromise({totalCount: 1, list: [mockLibraryFiles]})
                };

                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromise(mockAttrSimple)
                };

                const mockGetEntityByIdHelper = jest.fn().mockReturnValue(libData);

                const recDomain = recordDomain({
                    ...depsBase,
                    'core.domain.value': mockValDomain as IValueDomain,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                    'core.infra.library': mockLibraryRepo as ILibraryRepo,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.infra.cache.cacheService': mockCacheService as ICachesService,
                    'core.utils': mockUtils as IUtils,
                    config: mockConfig as Config.IConfig
                });

                recDomain.getRecordFieldValue = jest.fn().mockImplementation(({attributeId}) =>
                    Promise.resolve([
                        attributeId === 'previews'
                            ? {
                                  raw_payload: {
                                      small: 'small_fake-image',
                                      medium: 'medium_fake-image',
                                      big: 'big_fake-image'
                                  }
                              }
                            : {
                                  ...mockStandardValue,
                                  payload: {
                                      ...mockRecord,
                                      previews: {
                                          small: 'small_fake-image',
                                          medium: 'medium_fake-image',
                                          big: 'big_fake-image'
                                      }
                                  }
                              }
                    ])
                );

                const res = await recDomain.getRecordIdentity(record, ctx);

                expect(res.id).toBe('222536283');
                expect(res.library).toMatchObject(libData);
                expect(res.color).toBe('#ff0000');
            });

            test('Return record identity with override color', async () => {
                const record = {
                    id: '222536283',
                    library: 'test_lib',
                    created_at: 1520931427,
                    modified_at: 1520931427,
                    ean: '9876543219999999',
                    visual_simple: '222713677'
                };

                const libData = {
                    id: 'test_lib',
                    recordIdentityConf: {
                        color: 'color_attr',
                        preview: 'preview_attr'
                    }
                };

                const mockValDomain: Mockify<IValueDomain> = {
                    getValues: global.__mockPromiseMultiple([
                        [
                            {
                                payload: '#ffff00',
                                isInherited: false
                            },
                            {
                                payload: '#ff0000',
                                isInherited: true
                            }
                        ]
                    ])
                };

                const mockLibraryRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromise({totalCount: 1, list: [mockLibraryFiles]})
                };

                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromise(mockAttrSimple)
                };

                const mockGetEntityByIdHelper = jest.fn().mockReturnValue(libData);

                const recDomain = recordDomain({
                    ...depsBase,
                    'core.domain.value': mockValDomain as IValueDomain,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                    'core.infra.library': mockLibraryRepo as ILibraryRepo,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.infra.cache.cacheService': mockCacheService as ICachesService,
                    'core.utils': mockUtils as IUtils,
                    config: mockConfig as Config.IConfig
                });

                recDomain.getRecordFieldValue = jest.fn().mockImplementation(({attributeId}) =>
                    Promise.resolve([
                        attributeId === 'previews'
                            ? {
                                  raw_payload: {
                                      small: 'small_fake-image',
                                      medium: 'medium_fake-image',
                                      big: 'big_fake-image'
                                  }
                              }
                            : {
                                  ...mockStandardValue,
                                  payload: {
                                      ...mockRecord,
                                      previews: {
                                          small: 'small_fake-image',
                                          medium: 'medium_fake-image',
                                          big: 'big_fake-image'
                                      }
                                  }
                              }
                    ])
                );

                const res = await recDomain.getRecordIdentity(record, ctx);

                expect(res.id).toBe('222536283');
                expect(res.library).toMatchObject(libData);
                expect(res.color).toBe('#ffff00');
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
                    visual_simple: '222713677'
                };

                const libData = {
                    recordIdentityConf: {
                        [conf]: 'unused_content',
                        preview: 'preview_attr'
                    }
                };

                beforeEach(() => {
                    mockGetCoreEntityById = jest.fn().mockReturnValue(libData);

                    mockLibraryRepo = {
                        getLibraries: global.__mockPromise({totalCount: 1, list: [mockLibraryFiles]})
                    };

                    mockAttributeDomain = {
                        getAttributeProperties: global.__mockPromise(dateRangeAttributeMock)
                    };
                });

                it('should return a string when date range attribute is present and not null', async () => {
                    const mockValDomain: Mockify<IValueDomain> = {
                        getValues: global.__mockPromiseMultiple([
                            [
                                {
                                    payload: {from: '2024-02-16T10:59:52+00:00', to: '2024-02-18T10:59:52+00:00'}
                                }
                            ],
                            [
                                {
                                    payload: {
                                        small: 'small_fake-image',
                                        medium: 'medium_fake-image',
                                        big: 'big_fake-image'
                                    }
                                }
                            ]
                        ])
                    };

                    const recDomain = recordDomain({
                        ...depsBase,
                        'core.domain.value': mockValDomain as IValueDomain,
                        'core.domain.helpers.getCoreEntityById': mockGetCoreEntityById,
                        'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                        'core.utils': mockUtils as IUtils,
                        'core.infra.library': mockLibraryRepo as ILibraryRepo,
                        'core.infra.cache.cacheService': mockCacheService as ICachesService,
                        'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                        config: mockConfig as Config.IConfig,
                        translator: mockTranslatorWithOptions as i18n
                    });

                    recDomain.getRecordFieldValue = global.__mockPromise([
                        {
                            ...mockStandardValue,
                            payload: {
                                ...mockRecord,
                                previews: {
                                    small: 'small_fake-image',
                                    medium: 'medium_fake-image',
                                    big: 'big_fake-image'
                                }
                            }
                        }
                    ]);

                    const res = await recDomain.getRecordIdentity(recordWithDateRange, ctx);

                    expect(mockTranslatorWithOptions.t).toBeCalledWith('labels.date_range', {
                        from: '2024-02-16T10:59:52+00:00',
                        to: '2024-02-18T10:59:52+00:00',
                        lng: 'fr',
                        interpolation: {escapeValue: false}
                    });
                    expect(res).not.toBe(null);
                });

                it('should return null when date range attribute is present but null', async () => {
                    const mockValDomain: Mockify<IValueDomain> = {
                        getValues: global.__mockPromiseMultiple([
                            [
                                {
                                    value: null
                                }
                            ],
                            [
                                {
                                    value: {
                                        small: 'small_fake-image',
                                        medium: 'medium_fake-image',
                                        big: 'big_fake-image'
                                    }
                                }
                            ]
                        ])
                    };

                    const recDomain = recordDomain({
                        ...depsBase,
                        'core.domain.value': mockValDomain as IValueDomain,
                        'core.domain.helpers.getCoreEntityById': mockGetCoreEntityById,
                        'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                        'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                        'core.utils': mockUtils as IUtils,
                        'core.infra.library': mockLibraryRepo as ILibraryRepo,
                        'core.infra.cache.cacheService': mockCacheService as ICachesService,
                        config: mockConfig as Config.IConfig,
                        translator: mockTranslatorWithOptions as i18n
                    });

                    recDomain.getRecordFieldValue = global.__mockPromise([
                        {
                            ...mockStandardValue,
                            value: {
                                ...mockRecord,
                                previews: {
                                    small: 'small_fake-image',
                                    medium: 'medium_fake-image',
                                    big: 'big_fake-image'
                                }
                            }
                        }
                    ]);

                    const res = await recDomain.getRecordIdentity(recordWithDateRange, ctx);

                    expect(mockTranslatorWithOptions.t).toBeCalledTimes(0);
                    expect(res.subLabel).toBe(null);
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
                visual_simple: '222713677'
            };

            const libData = {
                id: 'test_lib'
            };

            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({totalCount: 1, list: [libData]})
            };

            const mockValDomain: Mockify<IValueDomain> = {
                getValues: jest.fn()
            };
            const mockGetEntityByIdHelper = jest.fn().mockReturnValue(libData);

            const recDomain = recordDomain({
                ...depsBase,
                'core.domain.value': mockValDomain as IValueDomain,
                'core.domain.helpers.getCoreEntityById': mockGetEntityByIdHelper,
                'core.infra.library': mockLibRepo as ILibraryRepo,
                'core.utils': mockUtils as IUtils,
                'core.infra.cache.cacheService': mockCacheService as ICachesService
            });

            const res = await recDomain.getRecordIdentity(record, ctx);

            expect(res.id).toBe('222536283');
            expect(res.library).toMatchObject(libData);
            expect(res.label).toBe(null);
            expect(res.color).toBe(null);
            expect(res.preview).toBe(null);
        });
    });

    describe('getRecordFieldValue', () => {
        const mockRecordWithValues: IRecord = {
            ...mockRecord,
            id: '12345',
            library: 'test_lib',
            created_at: 2119477320,
            created_by: '42'
        };

        const mockValueDomainFormatValue: Mockify<IValueDomain> = {
            formatValue: jest.fn(({value, library}) => Promise.resolve(value)),
            runActionsList: jest.fn(() => Promise.resolve([{payload: 2119477320}]))
        };

        const mockAttributeDomainCommon: Mockify<IAttributeDomain> = {
            getLibraryAttributes: global.__mockPromise([
                {
                    ...mockAttrSimpleLink,
                    id: 'created_at'
                },
                {
                    ...mockAttrSimple,
                    id: 'label'
                },
                {
                    ...mockAttrSimpleLink,
                    id: 'created_by'
                }
            ])
        };

        test('Return a value present on record', async () => {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                ...mockAttributeDomainCommon,
                getAttributeProperties: global.__mockPromise({
                    id: 'created_at',
                    type: AttributeTypes.SIMPLE,
                    multiple_values: false
                })
            };

            const recDomain = recordDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.value': mockValueDomainFormatValue as IValueDomain
            });

            const values = (await recDomain.getRecordFieldValue({
                library: 'test_lib',
                record: mockRecordWithValues,
                attributeId: 'created_at',
                ctx
            })) as IValue[];

            expect(Array.isArray(values)).toBe(true);
            expect(values[0].payload).toBe(mockRecordWithValues.created_at);
        });

        test('Return a value not present on record', async () => {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                ...mockAttributeDomainCommon,
                getAttributeProperties: global.__mockPromise({
                    id: 'label',
                    type: AttributeTypes.ADVANCED,
                    multiple_values: true
                })
            };

            const mockValDomain: Mockify<IValueDomain> = {
                ...mockValueDomainFormatValue,
                getValues: global.__mockPromise([
                    {
                        id_value: 12345,
                        payload: 'MyLabel'
                    }
                ])
            };
            const recDomain = recordDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.value': mockValDomain as IValueDomain
            });

            const values = await recDomain.getRecordFieldValue({
                library: 'test_lib',
                record: mockRecordWithValues,
                attributeId: 'label',
                ctx
            });

            expect(Array.isArray(values)).toBe(true);
            expect(values[0].payload).toBe('MyLabel');
        });

        test('Return a formatted value', async () => {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                ...mockAttributeDomainCommon,
                getAttributeProperties: global.__mockPromise({
                    id: 'created_at',
                    type: AttributeTypes.SIMPLE,
                    multiple_values: false,
                    actions_list: {
                        [ActionsListEvents.GET_VALUE]: [{name: 'formatDate', params: [{format: 'D/M/YY HH:mm'}]}]
                    }
                })
            };

            const mockValueDomainFormatValueDate: Mockify<IValueDomain> = {
                formatValue: jest.fn(({value}) =>
                    Promise.resolve({...value, raw_payload: 2119477320, payload: '1/3/37 00:42'})
                ),
                runActionsList: jest.fn(() => Promise.resolve([{payload: '1/3/37 00:42', raw_payload: 2119477320}]))
            };

            const recDomain = recordDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.value': mockValueDomainFormatValueDate as IValueDomain
            });

            const values = (await recDomain.getRecordFieldValue({
                library: 'test_lib',
                record: mockRecordWithValues,
                attributeId: 'created_at',
                ctx
            })) as IStandardValue[];

            expect(values[0].payload).toBe('1/3/37 00:42');
            expect(values[0].raw_payload).toBe(2119477320);
        });

        test('Return a link value', async () => {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                ...mockAttributeDomainCommon,
                getAttributeProperties: global.__mockPromise({
                    id: 'created_by',
                    type: AttributeTypes.SIMPLE_LINK,
                    linked_library: 'users',
                    multiple_values: false
                })
            };

            const mockValueDomainFormatValueLink: Mockify<IValueDomain> = {
                formatValue: jest.fn(({value, library}) =>
                    Promise.resolve({payload: {...mockRecord, id: mockRecordWithValues.created_by, library: 'users'}})
                ),
                runActionsList: jest.fn((_, value) => Promise.resolve([value]))
            };

            const recDomain = recordDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.value': mockValueDomainFormatValueLink as IValueDomain
            });

            const values = (await recDomain.getRecordFieldValue({
                library: 'test_lib',
                record: mockRecordWithValues,
                attributeId: 'created_by',
                ctx
            })) as IValue[];

            expect(values[0].payload.id).toBe('42');
            expect(values[0].payload.library).toBe('users');
        });

        test('If force array, return an array', async () => {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                ...mockAttributeDomainCommon,
                getAttributeProperties: global.__mockPromise({
                    id: 'created_at',
                    type: AttributeTypes.SIMPLE,
                    multiple_values: false
                })
            };
            const recDomain = recordDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.value': mockValueDomainFormatValue as IValueDomain
            });

            const values = (await recDomain.getRecordFieldValue({
                library: 'test_lib',
                record: mockRecordWithValues,
                attributeId: 'created_at',
                options: {forceArray: true},
                ctx
            })) as IValue[];

            expect(Array.isArray(values)).toBe(true);
            expect(values[0].payload).toBe(2119477320);
        });
    });

    describe('Deactivate record', () => {
        test('Set active to false on record', async () => {
            const record = {
                id: '222536283',
                library: 'test_lib',
                created_at: 1520931427,
                modified_at: 1520931427,
                active: true
            };

            const mockValueDomain = {
                saveValue: global.__mockPromise([{payload: false}])
            } satisfies Mockify<IValueDomain>;

            const recDomain = recordDomain({...depsBase, 'core.domain.value': mockValueDomain as IValueDomain});

            const recordAfter = await recDomain.deactivateRecord(record, ctx);

            expect(mockValueDomain.saveValue).toBeCalled();
            expect(typeof mockValueDomain.saveValue.mock.calls[0][0]).toBe('object');
            expect(mockValueDomain.saveValue.mock.calls[0][0].attribute).toBe('active');
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
                active: false
            };

            const mockValueDomain = {
                saveValue: global.__mockPromise([{payload: true}])
            } satisfies Mockify<IValueDomain>;

            const recDomain = recordDomain({...depsBase, 'core.domain.value': mockValueDomain as IValueDomain});

            const recordAfter = await recDomain.activateRecord(record, ctx);

            expect(mockValueDomain.saveValue).toBeCalled();
            expect(typeof mockValueDomain.saveValue.mock.calls[0][0]).toBe('object');
            expect(mockValueDomain.saveValue.mock.calls[0][0].attribute).toBe('active');
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
                active: true
            };

            const mockValueDomain = {
                saveValue: global.__mockPromise([{payload: false}])
            } satisfies Mockify<IValueDomain>;

            const recDomain = recordDomain({...depsBase, 'core.domain.value': mockValueDomain as IValueDomain});

            const recordAfter = await recDomain.deactivateRecord(record, {userId: '1'});

            expect(mockValueDomain.saveValue).toBeCalled();
            expect(mockValueDomain.saveValue.mock.calls[0][0].attribute).toBe('active');
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
                active: false
            };

            const mockValueDomain = {
                saveValue: global.__mockPromise([{payload: true}])
            } satisfies Mockify<IValueDomain>;

            const recDomain = recordDomain({...depsBase, 'core.domain.value': mockValueDomain as IValueDomain});

            const recordAfter = await recDomain.activateRecord(record, {userId: '1'});

            expect(mockValueDomain.saveValue).toBeCalled();
            expect(mockValueDomain.saveValue.mock.calls[0][0].attribute).toBe('active');
            expect(mockValueDomain.saveValue.mock.calls[0][0].value.payload).toBe(true);
            expect(recordAfter.active).toBe(true);
        });
    });

    describe('deactivateRecordsBatch', () => {
        test('Deactivate records from a list of records ids', async () => {
            const domain = recordDomain(depsBase);
            domain.find = jest.fn();
            domain.deactivateRecord = jest.fn().mockImplementation(() => Promise.resolve(mockRecord));

            const records = await domain.deactivateRecordsBatch({
                libraryId: 'test_lib',
                recordsIds: ['1', '2', '3'],
                ctx: mockCtx
            });

            expect(domain.deactivateRecord).toBeCalledTimes(3);
            expect(domain.find).not.toBeCalled();
            expect(records).toEqual([mockRecord, mockRecord, mockRecord]);
        });

        test('Deactivate records from filters', async () => {
            const domain = recordDomain(depsBase);
            domain.find = jest
                .fn()
                .mockImplementation(() => Promise.resolve({list: [mockRecord, mockRecord, mockRecord]}));
            domain.deactivateRecord = jest.fn().mockImplementation(() => Promise.resolve(mockRecord));

            const records = await domain.deactivateRecordsBatch({
                libraryId: 'test_lib',
                filters: [
                    {
                        field: 'label',
                        condition: AttributeCondition.EQUAL,
                        value: 'foo'
                    },
                    {
                        operator: Operator.OR
                    },
                    {
                        field: 'label',
                        condition: AttributeCondition.EQUAL,
                        value: 'bar'
                    }
                ],
                ctx: mockCtx
            });

            expect(domain.find).toBeCalled();
            expect(domain.deactivateRecord).toBeCalledTimes(3);
            expect(records).toEqual([mockRecord, mockRecord, mockRecord]);
        });
    });

    describe('purgeInactiveRecords', () => {
        test('Delete all inactive records', async () => {
            const domain = recordDomain(depsBase);
            domain.find = jest.fn().mockImplementation(() => Promise.resolve({list: [mockRecord, mockRecord]}));
            domain.deleteRecord = jest.fn().mockImplementation(() => Promise.resolve());

            await domain.purgeInactiveRecords({libraryId: 'test_lib', ctx: mockCtx});

            expect(domain.deleteRecord).toBeCalledTimes(2);
        });
    });
});
