import {IActionsListDomain} from 'domain/actionsList/actionsListDomain';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {IRecordRepo} from 'infra/record/recordRepo';
import {IQueryInfos} from '_types/queryInfos';
import {IRecord} from '_types/record';
import {IValue} from '_types/value';
import {getPreviewUrl} from '../../utils/preview/preview';
import {ActionsListEvents} from '../../_types/actionsList';
import {AttributeTypes} from '../../_types/attribute';
import {IRecordPermissionDomain} from '../permission/recordPermissionDomain';
import recordDomain from './recordDomain';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import * as Config from '_types/config';

const indexationManagerMockConfig: Mockify<Config.IIndexationManager> = {routingKeys: {events: 'indexation.event'}};

const mockConfig: Mockify<Config.IConfig> = {
    indexationManager: indexationManagerMockConfig as Config.IIndexationManager
};

describe('RecordDomain', () => {
    const mockRecordPermDomain: Mockify<IRecordPermissionDomain> = {
        getRecordPermission: global.__mockPromise(true)
    };
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'recordDomainTest'
    };

    describe('createRecord', () => {
        test('Should create a new record', async function() {
            const createdRecordData = {
                id: '222435651',
                library: 'test',
                created_at: 1519303348,
                modified_at: 1519303348
            };
            const recRepo: Mockify<IRecordRepo> = {createRecord: global.__mockPromise(createdRecordData)};

            const mockLibDomain: Mockify<ILibraryDomain> = {
                getLibraryFullTextAttributes: global.__mockPromise([])
            };

            const mockEventsManager: Mockify<IEventsManagerDomain> = {
                send: global.__mockPromise()
            };

            const recDomain = recordDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.record': recRepo as IRecordRepo,
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain
            });

            const createdRecord = await recDomain.createRecord('test', ctx);
            expect(recRepo.createRecord.mock.calls.length).toBe(1);
            expect(typeof recRepo.createRecord.mock.calls[0][0]).toBe('object');
            expect(Number.isInteger(recRepo.createRecord.mock.calls[0][0].recordData.created_at)).toBe(true);
            expect(Number.isInteger(recRepo.createRecord.mock.calls[0][0].recordData.modified_at)).toBe(true);
            expect(recRepo.createRecord.mock.calls[0][0].recordData.created_by).toBe('1');
            expect(recRepo.createRecord.mock.calls[0][0].recordData.modified_by).toBe('1');

            expect(createdRecord).toMatchObject(createdRecordData);
        });
    });

    describe('updateRecord', () => {
        test('Should update a record', async function() {
            const updatedRecordData = {
                id: '222435651',
                library: 'test',
                created_at: 1519303348,
                modified_at: 987654321
            };
            const recRepo: Mockify<IRecordRepo> = {updateRecord: global.__mockPromise(updatedRecordData)};

            const recDomain = recordDomain({
                'core.infra.record': recRepo as IRecordRepo,
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain
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

        test('Should delete an record and return deleted record', async function() {
            const recRepo: Mockify<IRecordRepo> = {
                deleteRecord: global.__mockPromise(recordData)
            };
            const recordPermDomain: Mockify<IRecordPermissionDomain> = {
                getRecordPermission: global.__mockPromise(true)
            };
            const libDomain: Mockify<ILibraryDomain> = {
                getLibraries: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 1}),
                getLibraryFullTextAttributes: global.__mockPromise([])
            };
            const mockEventsManager: Mockify<IEventsManagerDomain> = {
                send: global.__mockPromise()
            };

            const recDomain = recordDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.infra.record': recRepo as IRecordRepo,
                'core.domain.library': libDomain as ILibraryDomain,
                'core.domain.permission.recordPermission': recordPermDomain as IRecordPermissionDomain
            });

            await recDomain.deleteRecord({library: 'test', id: recordData.id, ctx});

            expect(recRepo.deleteRecord.mock.calls.length).toBe(1);
        });

        // TODO: handle unknown record?
        // test('Should throw if unknown record', async function() {
        //     const mockLibRepo = {deleteRecord: global.__mockPromise(recordData)};
        //     const recDomain = recordDomain(mockLibRepo);

        //     await expect(recDomain.deleteRecord(recordData.id)).rejects.toThrow();
        // });
    });

    describe('find', () => {
        test('Should find records', async function() {
            const mockRes = [
                {
                    id: '222536515',
                    created_at: 1520931648,
                    modified_at: 1520931648,
                    ean: '9876543219999999'
                }
            ];

            const recRepo: Mockify<IRecordRepo> = {find: global.__mockPromise(mockRes)};

            const recDomain = recordDomain({'core.infra.record': recRepo as IRecordRepo});

            const findRes = await recDomain.find({params: {library: 'test_lib'}, ctx});

            expect(recRepo.find.mock.calls.length).toBe(1);
            expect(findRes).toEqual([
                {
                    id: '222536515',
                    created_at: 1520931648,
                    modified_at: 1520931648,
                    ean: '9876543219999999'
                }
            ]);
        });
    });

    describe('search', () => {
        test('Should search records', async function() {
            const mockRes = {
                totalCount: 1,
                list: [
                    {
                        id: 1,
                        library: 'test_lib'
                    }
                ]
            };

            const recRepo: Mockify<IRecordRepo> = {search: global.__mockPromise(mockRes)};
            const libDomain: Mockify<ILibraryDomain> = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib', system: false}], totalCount: 1})
            };

            const recDomain = recordDomain({
                'core.infra.record': recRepo as IRecordRepo,
                'core.domain.library': libDomain as ILibraryDomain
            });

            const findRes = await recDomain.search({library: 'test_lib', query: 'text', ctx});

            expect(recRepo.search.mock.calls.length).toBe(1);
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

            const mockLibDomain: Mockify<ILibraryDomain> = {
                getLibraryProperties: global.__mockPromise(libData)
            };

            const mockValDomain: Mockify<IValueDomain> = {
                getValues: global.__mockPromiseMultiple([
                    [
                        {
                            value: 'Label Value'
                        }
                    ],
                    [
                        {
                            value: '#123456'
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
                'core.domain.value': mockValDomain as IValueDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain
            });

            const res = await recDomain.getRecordIdentity(record, ctx);

            expect(res.id).toBe('222536283');
            expect(res.library).toMatchObject(libData);
            expect(res.label).toBe('Label Value');
            expect(res.color).toBe('#123456');
            expect(res.preview).toEqual({
                small: getPreviewUrl() + 'small_fake-image',
                medium: getPreviewUrl() + 'medium_fake-image',
                big: getPreviewUrl() + 'big_fake-image'
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

            const mockLibDomain: Mockify<ILibraryDomain> = {
                getLibraryProperties: global.__mockPromise(libData)
            };

            const mockValDomain: Mockify<IValueDomain> = {
                getValues: jest.fn()
            };

            const recDomain = recordDomain({
                'core.domain.value': mockValDomain as IValueDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain
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
        const mockRecord: IRecord = {
            id: '12345',
            library: 'test_lib',
            created_at: 2119477320,
            created_by: '42'
        };

        test('Return a value present on record', async () => {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({
                    id: 'created_at',
                    type: AttributeTypes.SIMPLE,
                    multiple_values: false
                })
            };
            const recDomain = recordDomain({'core.domain.attribute': mockAttrDomain as IAttributeDomain});

            const value = await recDomain.getRecordFieldValue({
                library: 'test_lib',
                record: mockRecord,
                attributeId: 'created_at',
                ctx
            });

            expect(Array.isArray(value)).toBe(false);
            expect((value as IValue).value).toBe(2119477320);
        });

        test('Return a value not present on record', async () => {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({
                    id: 'label',
                    type: AttributeTypes.ADVANCED,
                    multiple_values: true
                })
            };

            const mockValDomain: Mockify<IValueDomain> = {
                getValues: global.__mockPromise([
                    {
                        id_value: 12345,
                        value: 'MyLabel'
                    }
                ])
            };
            const recDomain = recordDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.value': mockValDomain as IValueDomain
            });

            const value = await recDomain.getRecordFieldValue({
                library: 'test_lib',
                record: mockRecord,
                attributeId: 'label',
                ctx
            });

            expect(Array.isArray(value)).toBe(true);
            expect(value[0].value).toBe('MyLabel');
        });

        test('Return a formatted value', async () => {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({
                    id: 'created_at',
                    type: AttributeTypes.SIMPLE,
                    multiple_values: false,
                    actions_list: {
                        [ActionsListEvents.GET_VALUE]: [{name: 'formatDate', params: [{format: 'D/M/YY HH:mm'}]}]
                    }
                })
            };

            const mockALDomain: Mockify<IActionsListDomain> = {
                runActionsList: global.__mockPromise({value: '1/3/37 00:42'})
            };
            const recDomain = recordDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.actionsList': mockALDomain as IActionsListDomain
            });

            const value = await recDomain.getRecordFieldValue({
                library: 'test_lib',
                record: mockRecord,
                attributeId: 'created_at',
                ctx
            });

            expect((value as IValue).value).toBe('1/3/37 00:42');
            expect((value as IValue).raw_value).toBe(2119477320);
        });

        test('Return a link value', async () => {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({
                    id: 'created_by',
                    type: AttributeTypes.SIMPLE_LINK,
                    linked_library: 'users',
                    multiple_values: false
                })
            };
            const recDomain = recordDomain({'core.domain.attribute': mockAttrDomain as IAttributeDomain});

            const value = await recDomain.getRecordFieldValue({
                library: 'test_lib',
                record: mockRecord,
                attributeId: 'created_by',
                ctx
            });

            expect((value as IValue).value.id).toBe('42');
            expect((value as IValue).value.library).toBe('users');
        });

        test('If force array, return an array', async () => {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({
                    id: 'created_at',
                    type: AttributeTypes.SIMPLE,
                    multiple_values: false
                })
            };
            const recDomain = recordDomain({'core.domain.attribute': mockAttrDomain as IAttributeDomain});

            const value = await recDomain.getRecordFieldValue({
                library: 'test_lib',
                record: mockRecord,
                attributeId: 'created_at',
                options: {forceArray: true},
                ctx
            });

            expect(Array.isArray(value)).toBe(true);
            expect((value as IValue)[0].value).toBe(2119477320);
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

            const mockValueDomain: Mockify<IValueDomain> = {
                saveValue: global.__mockPromise({value: false})
            };

            const recDomain = recordDomain({'core.domain.value': mockValueDomain as IValueDomain});

            const recordAfter = await recDomain.deactivateRecord(record, ctx);

            expect(mockValueDomain.saveValue).toBeCalled();
            expect(typeof mockValueDomain.saveValue.mock.calls[0][0]).toBe('object');
            expect(mockValueDomain.saveValue.mock.calls[0][0].attribute).toBe('active');
            expect(mockValueDomain.saveValue.mock.calls[0][0].value.value).toBe(false);
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

            const mockValueDomain: Mockify<IValueDomain> = {
                saveValue: global.__mockPromise({value: true})
            };

            const recDomain = recordDomain({'core.domain.value': mockValueDomain as IValueDomain});

            const recordAfter = await recDomain.activateRecord(record, ctx);

            expect(mockValueDomain.saveValue).toBeCalled();
            expect(typeof mockValueDomain.saveValue.mock.calls[0][0]).toBe('object');
            expect(mockValueDomain.saveValue.mock.calls[0][0].attribute).toBe('active');
            expect(mockValueDomain.saveValue.mock.calls[0][0].value.value).toBe(true);

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

            const mockValueDomain: Mockify<IValueDomain> = {
                saveValue: global.__mockPromise({value: false})
            };

            const recDomain = recordDomain({'core.domain.value': mockValueDomain as IValueDomain});

            const recordAfter = await recDomain.deactivateRecord(record, {userId: '1'});

            expect(mockValueDomain.saveValue).toBeCalled();
            expect(mockValueDomain.saveValue.mock.calls[0][0].attribute).toBe('active');
            expect(mockValueDomain.saveValue.mock.calls[0][0].value.value).toBe(false);
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

            const mockValueDomain: Mockify<IValueDomain> = {
                saveValue: global.__mockPromise({value: true})
            };

            const recDomain = recordDomain({'core.domain.value': mockValueDomain as IValueDomain});

            const recordAfter = await recDomain.activateRecord(record, {userId: '1'});

            expect(mockValueDomain.saveValue).toBeCalled();
            expect(mockValueDomain.saveValue.mock.calls[0][0].attribute).toBe('active');
            expect(mockValueDomain.saveValue.mock.calls[0][0].value.value).toBe(true);
            expect(recordAfter.active).toBe(true);
        });
    });
});
