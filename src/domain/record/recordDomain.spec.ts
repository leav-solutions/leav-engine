import {IActionsListDomain} from 'domain/actionsList/actionsListDomain';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {IRecordRepo} from 'infra/record/recordRepo';
import {isArray} from 'util';
import {IRecord} from '_types/record';
import {IValue} from '_types/value';
import {ActionsListEvents} from '../../_types/actionsList';
import {AttributeTypes} from '../../_types/attribute';
import {IRecordPermissionDomain} from '../permission/recordPermissionDomain';
import recordDomain from './recordDomain';

describe('RecordDomain', () => {
    const mockRecordPermDomain: Mockify<IRecordPermissionDomain> = {
        getRecordPermission: global.__mockPromise(true)
    };

    describe('createRecord', () => {
        test('Should create a new record', async function() {
            const createdRecordData = {id: 222435651, library: 'test', created_at: 1519303348, modified_at: 1519303348};
            const recRepo: Mockify<IRecordRepo> = {createRecord: global.__mockPromise(createdRecordData)};

            const recDomain = recordDomain({
                'core.infra.record': recRepo as IRecordRepo,
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain
            });

            const createdRecord = await recDomain.createRecord('test', {userId: 1});
            expect(recRepo.createRecord.mock.calls.length).toBe(1);
            expect(Number.isInteger(recRepo.createRecord.mock.calls[0][1].created_at)).toBe(true);
            expect(Number.isInteger(recRepo.createRecord.mock.calls[0][1].modified_at)).toBe(true);
            expect(recRepo.createRecord.mock.calls[0][1].created_by).toBe(1);
            expect(recRepo.createRecord.mock.calls[0][1].modified_by).toBe(1);

            expect(createdRecord).toMatchObject(createdRecordData);
        });
    });

    describe('updateRecord', () => {
        test('Should update a record', async function() {
            const updatedRecordData = {id: 222435651, library: 'test', created_at: 1519303348, modified_at: 987654321};
            const recRepo: Mockify<IRecordRepo> = {updateRecord: global.__mockPromise(updatedRecordData)};

            const recDomain = recordDomain({
                'core.infra.record': recRepo as IRecordRepo,
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain
            });

            const updatedRecord = await recDomain.updateRecord(
                'test',
                {id: 222435651, modified_at: 987654321},
                {userId: 1}
            );

            expect(recRepo.updateRecord.mock.calls.length).toBe(1);
            expect(Number.isInteger(recRepo.updateRecord.mock.calls[0][1].modified_at)).toBe(true);

            expect(updatedRecord).toMatchObject(updatedRecordData);
        });
    });

    describe('deleteRecord', () => {
        const recordData = {id: 222435651, library: 'test', created_at: 1519303348, modified_at: 1519303348};

        test('Should delete an record and return deleted record', async function() {
            const recRepo: Mockify<IRecordRepo> = {deleteRecord: global.__mockPromise(recordData)};
            const recordPermDomain: Mockify<IRecordPermissionDomain> = {
                getRecordPermission: global.__mockPromise(true)
            };
            const recDomain = recordDomain({
                'core.infra.record': recRepo as IRecordRepo,
                'core.domain.permission.recordPermission': recordPermDomain as IRecordPermissionDomain
            });

            const deleteRes = await recDomain.deleteRecord('test', recordData.id, {userId: 1});

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

            const findRes = await recDomain.find({library: 'test_lib'});

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

    describe('getRecordIdentity', () => {
        test('Return record identity', async () => {
            const record = {
                id: 222536283,
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
                            value: 'http://fake-image.com/'
                        }
                    ]
                ])
            };

            const recDomain = recordDomain({
                'core.domain.value': mockValDomain as IValueDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain
            });

            const res = await recDomain.getRecordIdentity(record);

            expect(res.id).toBe(222536283);
            expect(res.library).toMatchObject(libData);
            expect(res.label).toBe('Label Value');
            expect(res.color).toBe('#123456');
            expect(res.preview).toBe('http://fake-image.com/');
        });

        test('Return minimum identity if no config', async () => {
            const record = {
                id: 222536283,
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

            const res = await recDomain.getRecordIdentity(record);

            expect(res.id).toBe(222536283);
            expect(res.library).toMatchObject(libData);
            expect(res.label).toBe(null);
            expect(res.color).toBe(null);
            expect(res.preview).toBe(null);
        });
    });

    describe('getRecordFieldValue', () => {
        const mockRecord: IRecord = {
            id: 12345,
            library: 'test_lib',
            created_at: 2119477320,
            created_by: 42
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

            const value = await recDomain.getRecordFieldValue('test_lib', mockRecord, 'created_at');

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

            const value = await recDomain.getRecordFieldValue('test_lib', mockRecord, 'label');

            expect(isArray(value)).toBe(true);
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

            const value = await recDomain.getRecordFieldValue('test_lib', mockRecord, 'created_at');

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

            const value = await recDomain.getRecordFieldValue('test_lib', mockRecord, 'created_by');

            expect((value as IValue).value.id).toBe(42);
            expect((value as IValue).value.library).toBe('users');
        });
    });
});
