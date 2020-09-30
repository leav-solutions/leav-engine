import {IRecordRepo} from 'infra/record/recordRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import {IValue, IValueVersion} from '_types/value';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {ActionsListEvents} from '../../_types/actionsList';
import {AttributeTypes} from '../../_types/attribute';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {Errors} from '../../_types/errors';
import {
    mockAttrAdv,
    mockAttrAdvLink,
    mockAttrAdvVersionable,
    mockAttrAdvVersionableSimple,
    mockAttrAdvWithMetadata,
    mockAttrSimple,
    mockAttrTree
} from '../../__tests__/mocks/attribute';
import {mockTree} from '../../__tests__/mocks/tree';
import {IActionsListDomain} from '../actionsList/actionsListDomain';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {ILibraryDomain} from '../library/libraryDomain';
import {IAttributePermissionDomain} from '../permission/attributePermissionDomain';
import {IRecordPermissionDomain} from '../permission/recordPermissionDomain';
import valueDomain from './valueDomain';
import * as Config from '_types/config';

describe('ValueDomain', () => {
    const indexationManagerMockConfig: Mockify<Config.IIndexationManager> = {routingKeys: {events: 'indexation.event'}};

    const mockConfig: Mockify<Config.IConfig> = {
        indexationManager: indexationManagerMockConfig as Config.IIndexationManager
    };

    const mockRecordRepo: Mockify<IRecordRepo> = {
        updateRecord: jest.fn(),
        find: global.__mockPromise({totalCount: 1, list: [{id: 54321}]})
    };

    const mockActionsListDomain: Mockify<IActionsListDomain> = {
        runActionsList: jest.fn().mockImplementation((_, val) => Promise.resolve(val))
    };

    const mockRecordPermDomain: Mockify<IRecordPermissionDomain> = {
        getRecordPermission: global.__mockPromise(true)
    };

    const mockAttrPermDomain: Mockify<IAttributePermissionDomain> = {
        getAttributePermission: global.__mockPromise(true)
    };

    const mockEventsManagerDomain: Mockify<IEventsManagerDomain> = {
        send: jest.fn()
    };

    const mockAttribute = {
        id: 'test_attr',
        actions_list: {
            saveValue: [{name: 'validate'}]
        },
        type: AttributeTypes.SIMPLE
    };

    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'valueDomainTest'
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('saveValue', () => {
        const mockTreeRepo: Mockify<ITreeRepo> = {
            isElementPresent: global.__mockPromise(true),
            getTrees: global.__mockPromise({list: [mockTree], totalCount: 0})
        };

        test('Should save an indexed value', async function() {
            const savedValueData = {value: 'test val', attribute: 'test_attr'};

            const mockValRepo = {
                createValue: global.__mockPromise(savedValueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.SIMPLE})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const valDomain = valueDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain
            });

            const savedValue = await valDomain.saveValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {value: 'test val'},
                ctx
            });

            expect(mockValRepo.createValue.mock.calls.length).toBe(1);
            expect(mockActionsListDomain.runActionsList.mock.calls.length).toBe(1);
            expect(savedValue).toMatchObject(savedValueData);
        });

        test('Should save a new standard value', async function() {
            const savedValueData = {
                id_value: '1337',
                value: 'test val',
                attribute: 'test_attr',
                modified_at: 123456,
                created_at: 123456
            };

            const mockValRepo = {
                createValue: global.__mockPromise(savedValueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.ADVANCED})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const valDomain = valueDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain
            });

            const savedValue = await valDomain.saveValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {value: 'test val'},
                ctx
            });

            expect(mockValRepo.createValue.mock.calls.length).toBe(1);
            expect(mockValRepo.createValue.mock.calls[0][0].value.modified_at).toBeDefined();
            expect(mockValRepo.createValue.mock.calls[0][0].value.created_at).toBeDefined();

            expect(savedValue).toMatchObject(savedValueData);
            expect(savedValue.id_value).toBeTruthy();
            expect(savedValue.attribute).toBeTruthy();
            expect(savedValue.modified_at).toBeTruthy();
            expect(savedValue.created_at).toBeTruthy();
        });

        test('Should update a standard value', async function() {
            const savedValueData = {
                id_value: '1337',
                value: 'test val',
                attribute: 'test_attr',
                modified_at: 123456,
                created_at: 123456
            };

            const mockValRepo = {
                updateValue: global.__mockPromise(savedValueData),
                getValueById: global.__mockPromise({
                    id_value: '12345'
                })
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.ADVANCED})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const valDomain = valueDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain
            });

            const savedValue = await valDomain.saveValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {
                    id_value: '12345',
                    value: 'test val'
                },
                ctx
            });

            expect(mockValRepo.updateValue.mock.calls.length).toBe(1);
            expect(mockValRepo.updateValue.mock.calls[0][0].value.modified_at).toBeDefined();
            expect(mockValRepo.updateValue.mock.calls[0][0].value.created_at).toBeUndefined();

            expect(savedValue).toMatchObject(savedValueData);
            expect(savedValue.id_value).toBeTruthy();
            expect(savedValue.attribute).toBeTruthy();
            expect(savedValue.modified_at).toBeTruthy();
            expect(savedValue.created_at).toBeTruthy();
        });

        test('Should throw if unknown attribute', async function() {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: jest.fn().mockImplementationOnce(id => {
                    throw new ValidationError({id: Errors.UNKNOWN_ATTRIBUTE});
                })
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const mockValRepo = {};

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            await expect(
                valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    value: {value: 'test val'},
                    ctx
                })
            ).rejects.toThrow();
        });

        test('Should throw if unknown library', async function() {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributes: global.__mockPromise({list: [{id: 'test_attr'}], totalCount: 1})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [], totalCount: 0}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const mockValRepo = {};

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            await expect(
                valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    value: {value: 'test val'},
                    ctx
                })
            ).rejects.toThrow();
        });

        test('Should throw if unknown value', async function() {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.ADVANCED})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const mockValRepo = {};

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            await expect(
                valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    value: {
                        id_value: '12345',
                        value: 'test val'
                    },
                    ctx
                })
            ).rejects.toThrow();
        });

        test('Should update record modif date and user', async function() {
            const savedValueData = {value: 'test val', attribute: 'test_attr'};

            const mockValRepo = {
                createValue: global.__mockPromise(savedValueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.SIMPLE})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const mockRecRepo = {
                updateRecord: global.__mockPromise({}),
                find: global.__mockPromise({totalCount: 1, list: [{id: '54321'}]})
            };

            const valDomain = valueDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain
            });

            const savedValue = await valDomain.saveValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {value: 'test val'},
                ctx
            });

            expect(mockRecRepo.updateRecord).toBeCalled();
            expect(mockRecRepo.updateRecord.mock.calls[0][0].recordData.modified_at).toBeDefined();
            expect(Number.isInteger(mockRecRepo.updateRecord.mock.calls[0][0].recordData.modified_at)).toBe(true);
            expect(mockRecRepo.updateRecord.mock.calls[0][0].recordData.modified_by).toBe('1');

            expect(savedValue).toMatchObject(savedValueData);
        });

        test('Should save a versioned value', async () => {
            const savedValueData: IValue = {
                id_value: '1337',
                value: 'test val',
                attribute: 'advanced_attribute',
                modified_at: 123456,
                created_at: 123456,
                version: {
                    my_tree: {
                        id: '1',
                        library: 'test_lib'
                    }
                }
            };

            const mockValRepo = {
                createValue: global.__mockPromise(savedValueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrAdvVersionable)
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const valDomain = valueDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain
            });

            const savedValue = await valDomain.saveValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {
                    value: 'test val',
                    version: {
                        my_tree: {
                            id: '1',
                            library: 'test_lib'
                        }
                    }
                },
                ctx
            });

            expect(mockValRepo.createValue.mock.calls.length).toBe(1);
            expect(mockValRepo.createValue.mock.calls[0][0].value.version).toBeDefined();
            expect(savedValue.version).toBeTruthy();
        });

        test('Should ignore version when saving version on a non versionable attribute', async () => {
            const mockValRepo = {
                createValue: global.__mockPromise({})
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrAdv)
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const valDomain = valueDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain
            });

            const savedValue = await valDomain.saveValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {
                    value: 'test val',
                    version: {
                        my_tree: {
                            id: '1',
                            library: 'test_lib'
                        }
                    }
                },
                ctx
            });

            expect(savedValue.version).toBeUndefined();
        });

        test('Should throw if unknown record', async () => {
            const savedValueData = {
                id_value: '1337',
                value: '123465',
                attribute: mockAttrAdvLink.id,
                modified_at: 123456,
                created_at: 123456
            };

            const mockValRepo = {
                createValue: global.__mockPromise(savedValueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttrSimple})
            };

            const mockRecordRepoNotfound: Mockify<IRecordRepo> = {
                find: global.__mockPromise({totalCount: 0, list: []})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepoNotfound as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            await expect(
                valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    value: {value: 'test val'},
                    ctx
                })
            ).rejects.toThrow(ValidationError);
        });

        test('Should throw if version is incorrect: unknown tree', async () => {
            const mockValRepo = {
                createValue: global.__mockPromise({})
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrAdvVersionable)
            };

            const mockTreeRepoNoTree: Mockify<ITreeRepo> = {
                getTrees: global.__mockPromise({list: [], totalCount: 0})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain,
                'core.infra.tree': mockTreeRepoNoTree as ITreeRepo
            });

            await expect(
                valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    value: {
                        value: 'test val',
                        version: {
                            my_tree: {
                                id: '1',
                                library: 'test_lib'
                            }
                        }
                    },
                    ctx
                })
            ).rejects.toThrow(ValidationError);
        });

        test('Should throw if version is incorrect: bad tree node', async () => {
            const mockValRepo = {
                createValue: global.__mockPromise({})
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrAdvVersionable)
            };

            const mockTreeRepoNotPresent: Mockify<ITreeRepo> = {
                ...mockTreeRepo,
                isElementPresent: global.__mockPromise(false)
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain,
                'core.infra.tree': mockTreeRepoNotPresent as ITreeRepo
            });

            await expect(
                valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    value: {
                        value: 'test val',
                        version: {
                            my_tree: {
                                id: '1',
                                library: 'test_lib'
                            }
                        }
                    },
                    ctx
                })
            ).rejects.toThrow(ValidationError);
        });

        test("Should throw if linked record doesn't exist", async () => {
            const savedValueData = {
                id_value: '1337',
                value: '123465',
                attribute: mockAttrAdvLink.id,
                modified_at: 123456,
                created_at: 123456
            };

            const mockValRepo = {
                createValue: global.__mockPromise(savedValueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttrAdvLink})
            };

            const mockRecordRepoNotfound: Mockify<IRecordRepo> = {
                find: global.__mockPromise({totalCount: 0, list: []})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepoNotfound as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            await expect(
                valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    value: {value: 'test val'},
                    ctx
                })
            ).rejects.toThrow(ValidationError);
        });

        test('Should throw if linked record not in tree', async () => {
            const savedValueData = {
                id_value: '1337',
                value: 'lib1/123456',
                attribute: mockAttrTree.id,
                modified_at: 123456,
                created_at: 123456
            };

            const mockValRepo: Mockify<IValueRepo> = {};

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttrTree})
            };

            const mockRecordRepoWithFind: Mockify<IRecordRepo> = {
                find: global.__mockPromise({totalCount: 1, list: [{id: '123456'}]})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const mockTreeRepoNotPresent: Mockify<ITreeRepo> = {
                isElementPresent: global.__mockPromise(false),
                getTrees: global.__mockPromise({list: [mockTree], totalCount: 1})
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepoWithFind as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain,
                'core.infra.tree': mockTreeRepoNotPresent as ITreeRepo
            });

            await expect(
                valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: mockAttrTree.id,
                    value: {value: 'lib1/123456'},
                    ctx
                })
            ).rejects.toThrow(ValidationError);
        });

        describe('Metadata', () => {
            test('Save metadata on value', async () => {
                const savedValueData = {
                    id_value: '1337',
                    value: 'test val',
                    attribute: 'advanced_attribute_with_meta',
                    modified_at: 123456,
                    created_at: 123456,
                    metadata: {
                        meta_attribute: 'metadata value'
                    }
                };

                const mockValRepo = {
                    createValue: global.__mockPromise(savedValueData)
                };

                const mockAttrDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromise({...mockAttrAdvWithMetadata})
                };

                const mockLibDomain = {
                    getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1}),
                    getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
                };

                const valDomain = valueDomain({
                    config: mockConfig as Config.IConfig,
                    'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.domain.library': mockLibDomain as ILibraryDomain,
                    'core.infra.value': mockValRepo as IValueRepo,
                    'core.infra.record': mockRecordRepo as IRecordRepo,
                    'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                    'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                    'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain,
                    'core.infra.tree': mockTreeRepo as ITreeRepo
                });

                const savedValue = await valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'advanced_attribute_with_meta',
                    value: {value: 'test val', metadata: {meta_attribute: 'metadata value'}},
                    ctx
                });

                expect(mockValRepo.createValue.mock.calls.length).toBe(1);
                expect(mockValRepo.createValue.mock.calls[0][0].value.metadata).toMatchObject({
                    meta_attribute: 'metadata value'
                });

                expect(savedValue).toMatchObject(savedValueData);
                expect(savedValue.metadata).toMatchObject({
                    meta_attribute: 'metadata value'
                });
            });

            test("Should throw if metadata doesn't match attribute settings", async () => {
                const savedValueData = {
                    id_value: '1337',
                    value: 'test val',
                    attribute: 'advanced_attribute',
                    modified_at: 123456,
                    created_at: 123456,
                    metadata: {
                        meta_attribute: 'metadata value'
                    }
                };

                const mockValRepo = {
                    createValue: global.__mockPromise(savedValueData)
                };

                const mockAttrDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromise({...mockAttrAdv})
                };

                const mockLibDomain = {
                    getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1}),
                    getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
                };

                const valDomain = valueDomain({
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.domain.library': mockLibDomain as ILibraryDomain,
                    'core.infra.value': mockValRepo as IValueRepo,
                    'core.infra.record': mockRecordRepo as IRecordRepo,
                    'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                    'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                    'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain,
                    'core.infra.tree': mockTreeRepo as ITreeRepo
                });

                const saveVal = valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'advanced_attribute_with_meta',
                    value: {value: 'test val', metadata: {meta_attribute: 'metadata value'}},
                    ctx
                });

                await expect(saveVal).rejects.toThrow(ValidationError);
                await expect(saveVal).rejects.toHaveProperty('fields.metadata');
            });

            test('Should throw if no permission to edit metadata field', async () => {
                const savedValueData = {
                    id_value: '1337',
                    value: 'test val',
                    attribute: 'advanced_attribute',
                    modified_at: 123456,
                    created_at: 123456,
                    metadata: {
                        meta_attribute: 'metadata value'
                    }
                };

                const mockValRepo = {
                    createValue: global.__mockPromise(savedValueData)
                };

                const mockAttrDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromise({...mockAttrAdv})
                };

                const mockLibDomain = {
                    getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1}),
                    getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
                };

                const mockAttrPermForbidDom: Mockify<IAttributePermissionDomain> = {
                    getAttributePermission: jest
                        .fn()
                        .mockImplementation((a, u, attrId) =>
                            Promise.resolve(attrId === 'meta_attribute' ? false : true)
                        )
                };
                const valDomain = valueDomain({
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.domain.library': mockLibDomain as ILibraryDomain,
                    'core.infra.value': mockValRepo as IValueRepo,
                    'core.infra.record': mockRecordRepo as IRecordRepo,
                    'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                    'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                    'core.domain.permission.attributePermission': mockAttrPermForbidDom as IAttributePermissionDomain,
                    'core.infra.tree': mockTreeRepo as ITreeRepo
                });

                const saveVal = valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'advanced_attribute_with_meta',
                    value: {value: 'test val', metadata: {meta_attribute: 'metadata value'}},
                    ctx
                });

                await expect(saveVal).rejects.toThrow(PermissionError);
                await expect(saveVal).rejects.toHaveProperty('fields.metadata');
            });

            test('Should run actions list on metadata values', async () => {
                const attrWithMetadataId = 'advanced_attribute_with_meta';
                const savedValueData = {
                    id_value: '1337',
                    value: 'test val',
                    attribute: attrWithMetadataId,
                    modified_at: 123456,
                    created_at: 123456,
                    metadata: {
                        meta_attribute: 'metadata value'
                    }
                };

                const mockValRepo = {
                    createValue: global.__mockPromise(savedValueData)
                };

                const mockAttrDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: jest.fn().mockImplementation(({id, ctx: ct}) =>
                        Promise.resolve(
                            id === attrWithMetadataId
                                ? {...mockAttrAdvWithMetadata}
                                : {
                                      ...mockAttrSimple,
                                      id: 'meta_attribute',
                                      actions_list: {[ActionsListEvents.SAVE_VALUE]: {name: 'myAction'}}
                                  }
                        )
                    )
                };

                const mockLibDomain = {
                    getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1}),
                    getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
                };

                const valDomain = valueDomain({
                    config: mockConfig as Config.IConfig,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.domain.library': mockLibDomain as ILibraryDomain,
                    'core.infra.value': mockValRepo as IValueRepo,
                    'core.infra.record': mockRecordRepo as IRecordRepo,
                    'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                    'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                    'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain,
                    'core.infra.tree': mockTreeRepo as ITreeRepo,
                    'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain
                });

                await valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: attrWithMetadataId,
                    value: {value: 'test val', metadata: {meta_attribute: 'metadata value'}},
                    ctx
                });

                expect(mockActionsListDomain.runActionsList).toHaveBeenCalled();
                expect(mockActionsListDomain.runActionsList.mock.calls[0][2].attribute.id).toBe('meta_attribute');
            });

            test('Should throw with metafield specified if actions list throws', async () => {
                const mockUtils: Mockify<IUtils> = {
                    rethrow: jest.fn().mockImplementation(e => {
                        throw e;
                    })
                };

                const attrWithMetadataId = 'advanced_attribute_with_meta';
                const savedValueData = {
                    id_value: '1337',
                    value: 'test val',
                    attribute: attrWithMetadataId,
                    modified_at: 123456,
                    created_at: 123456,
                    metadata: {
                        meta_attribute: 'metadata value'
                    }
                };

                const mockValRepo = {
                    createValue: global.__mockPromise(savedValueData)
                };

                const mockAttrDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: jest.fn().mockImplementation(id =>
                        Promise.resolve(
                            id === attrWithMetadataId
                                ? {...mockAttrAdvWithMetadata}
                                : {
                                      ...mockAttrSimple,
                                      id: 'meta_attribute',
                                      actions_list: {[ActionsListEvents.SAVE_VALUE]: {name: 'myAction'}}
                                  }
                        )
                    )
                };

                const mockALThrowsDomain: Mockify<IActionsListDomain> = {
                    runActionsList: jest.fn().mockImplementation(() => {
                        throw new ValidationError({test_attr: Errors.ERROR});
                    })
                };

                const mockLibDomain = {
                    getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1}),
                    getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
                };

                const valDomain = valueDomain({
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.domain.library': mockLibDomain as ILibraryDomain,
                    'core.infra.value': mockValRepo as IValueRepo,
                    'core.infra.record': mockRecordRepo as IRecordRepo,
                    'core.domain.actionsList': mockALThrowsDomain as IActionsListDomain,
                    'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                    'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain,
                    'core.infra.tree': mockTreeRepo as ITreeRepo,
                    'core.utils': mockUtils as IUtils
                });

                const saveVal = valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'advanced_attribute_with_meta',
                    value: {value: 'test val', metadata: {meta_attribute: 'metadata value'}},
                    ctx
                });

                await expect(saveVal).rejects.toThrow(ValidationError);
                await expect(saveVal).rejects.toHaveProperty('fields.metadata');
            });
        });
    });

    describe('saveValueBatch', () => {
        const mockTreeRepo: Mockify<ITreeRepo> = {
            isElementPresent: global.__mockPromise(true),
            getTrees: global.__mockPromise({list: [mockTree], totalCount: 0})
        };

        test('Should save multiple values', async () => {
            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };
            const mockUtils: Mockify<IUtils> = {
                rethrow: jest.fn().mockImplementation(e => {
                    throw e;
                })
            };
            const values: IValue[] = [
                {
                    attribute: 'test_attr',
                    value: 'test',
                    id_value: '12345'
                },
                {
                    attribute: 'test_attr2',
                    value: 'test',
                    id_value: null
                },
                {
                    attribute: 'test_attr3',
                    value: 'test',
                    id_value: null
                }
            ];

            const mockValRepo: Mockify<IValueRepo> = {
                updateValue: global.__mockPromise({value: 'test', id_value: 12345}),
                createValue: global.__mockPromiseMultiple([
                    {value: 'test', id_value: 12345},
                    {value: 'test', id_value: null}
                ]),
                getValueById: global.__mockPromise({
                    id_value: '12345'
                })
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: jest.fn().mockImplementation(({id, ctx: ct}) => {
                    let attrProps;

                    switch (id) {
                        case 'test_attr':
                        case 'test_attr2':
                            attrProps = {...mockAttrAdv};
                            break;
                        case 'test_attr3':
                            attrProps = {...mockAttrSimple};
                            break;
                    }

                    return Promise.resolve(attrProps);
                })
            };

            const valDomain = valueDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.utils': mockUtils as IUtils,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain
            });

            const res = await valDomain.saveValueBatch({
                library: 'test_lib',
                recordId: '123456',
                values,
                ctx
            });

            expect(mockValRepo.updateValue.mock.calls.length).toBe(1);
            expect(mockValRepo.createValue.mock.calls.length).toBe(2);

            expect(res).toStrictEqual({
                values: [
                    {
                        attribute: 'test_attr',
                        value: 'test',
                        id_value: 12345
                    },
                    {
                        attribute: 'test_attr2',
                        value: 'test',
                        id_value: 12345
                    },
                    {
                        attribute: 'test_attr3',
                        value: 'test',
                        id_value: null
                    }
                ],
                errors: null
            });
        });

        test('Should return errors for invalid values', async () => {
            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1})
            };

            const values: IValue[] = [
                {
                    attribute: 'test_attr',
                    value: 'test',
                    id_value: '12345'
                },
                {
                    attribute: 'test_attr2',
                    value: 'test',
                    id_value: null
                }
            ];

            const mockValRepo: Mockify<IValueRepo> = {
                updateValue: jest.fn(),
                createValue: jest.fn(),
                getValueById: global.__mockPromise({
                    id_value: '12345'
                })
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute})
            };

            const mockActionsListDomainInvalid: Mockify<IActionsListDomain> = {
                runActionsList: jest.fn().mockImplementation(() => {
                    throw new ValidationError({test_attr: Errors.ERROR});
                })
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomainInvalid as IActionsListDomain,
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const res = await valDomain.saveValueBatch({
                library: 'test_lib',
                recordId: '123456',
                values,
                ctx
            });

            expect(res).toStrictEqual({
                values: [],
                errors: [
                    {attribute: 'test_attr', input: 'test', message: 'ERROR', type: 'VALIDATION_ERROR'},
                    {attribute: 'test_attr2', input: 'test', message: 'Validation error', type: 'VALIDATION_ERROR'}
                ]
            });

            expect(mockValRepo.updateValue.mock.calls.length).toBe(0);
            expect(mockValRepo.createValue.mock.calls.length).toBe(0);
        });

        test('Should throw if a value is not editable', async () => {
            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1})
            };

            const values: IValue[] = [
                {
                    attribute: 'test_attr',
                    value: 'test',
                    id_value: '12345'
                },
                {
                    attribute: 'test_attr2',
                    value: 'test',
                    id_value: null
                }
            ];

            const mockValRepo: Mockify<IValueRepo> = {
                updateValue: jest.fn(),
                createValue: jest.fn(),
                getValueById: global.__mockPromise({
                    id_value: '12345'
                })
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute})
            };

            const mockAttrPermDomainNoEdit: Mockify<IAttributePermissionDomain> = {
                getAttributePermission: global.__mockPromise(false)
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.attributePermission': mockAttrPermDomainNoEdit as IAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const res = await valDomain.saveValueBatch({
                library: 'test_lib',
                recordId: '123456',
                values,
                ctx
            });

            expect(res).toStrictEqual({
                values: [],
                errors: [
                    {attribute: 'test_attr', input: 'test', message: 'Action forbidden', type: 'PERMISSION_ERROR'},
                    {attribute: 'test_attr2', input: 'test', message: 'Action forbidden', type: 'PERMISSION_ERROR'}
                ]
            });

            expect(mockValRepo.updateValue.mock.calls.length).toBe(0);
            expect(mockValRepo.createValue.mock.calls.length).toBe(0);
        });

        test('Delete empty values', async () => {
            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const mockUtils: Mockify<IUtils> = {
                rethrow: jest.fn().mockImplementation(e => {
                    throw e;
                })
            };

            const values: IValue[] = [
                {
                    attribute: 'advanced_attribute',
                    value: '',
                    id_value: '987654'
                }
            ];

            const mockValRepo: Mockify<IValueRepo> = {
                updateValue: jest.fn(),
                createValue: jest.fn(),
                deleteValue: global.__mockPromise({
                    id_value: '12345',
                    value: 'MyLabel'
                }),
                getValueById: global.__mockPromise({
                    id_value: '12345'
                })
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttrAdv})
            };

            const valDomain = valueDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.utils': mockUtils as IUtils,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain
            });

            const res = await valDomain.saveValueBatch({
                library: 'test_lib',
                recordId: '123456',
                values,
                keepEmpty: false,
                ctx
            });

            expect(mockValRepo.deleteValue).toBeCalledTimes(1);
        });

        test("Don't delete empty values if keepEmpty true", async () => {
            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };
            const mockUtils: Mockify<IUtils> = {
                rethrow: jest.fn().mockImplementation(e => {
                    throw e;
                })
            };

            const values: IValue[] = [
                {
                    attribute: 'advanced_attribute',
                    value: '',
                    id_value: '987654'
                }
            ];

            const mockValRepo: Mockify<IValueRepo> = {
                updateValue: jest.fn(),
                createValue: jest.fn(),
                deleteValue: jest.fn(),
                getValueById: global.__mockPromise({
                    id_value: '12345'
                })
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttrAdv})
            };

            const valDomain = valueDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.utils': mockUtils as IUtils,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain
            });

            const res = await valDomain.saveValueBatch({
                library: 'test_lib',
                recordId: '123456',
                values,
                ctx,
                keepEmpty: true
            });

            expect(mockValRepo.deleteValue).toBeCalledTimes(0);
        });

        test('Should throw if unknown library', async function() {
            const values: IValue[] = [
                {
                    attribute: 'advanced_attribute',
                    value: '',
                    id_value: '987654'
                }
            ];

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributes: global.__mockPromise({list: [{id: 'test_attr'}], totalCount: 1})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [], totalCount: 0})
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain
            });

            const saveVal = valDomain.saveValueBatch({
                library: 'test_lib',
                recordId: '123456',
                values,
                ctx,
                keepEmpty: true
            });

            await expect(saveVal).rejects.toThrow(ValidationError);
            await expect(saveVal).rejects.toHaveProperty('fields.library');
        });

        test('Should throw if unknown record', async function() {
            const values: IValue[] = [
                {
                    attribute: 'advanced_attribute',
                    value: '',
                    id_value: '987654'
                }
            ];

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributes: global.__mockPromise({list: [{id: 'test_attr'}], totalCount: 1})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1})
            };

            const mockRecordRepoNotfound: Mockify<IRecordRepo> = {
                find: global.__mockPromise({totalCount: 0, list: []})
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.record': mockRecordRepoNotfound as IRecordRepo
            });

            const saveVal = valDomain.saveValueBatch({
                library: 'test_lib',
                recordId: '123456',
                values,
                ctx,
                keepEmpty: true
            });

            await expect(saveVal).rejects.toThrow(ValidationError);
            await expect(saveVal).rejects.toHaveProperty('fields.recordId');
        });
    });

    describe('deleteValue', () => {
        test('Should delete a value', async function() {
            const deletedValueData = {value: 'test val', attribute: 'test_attr'};

            const mockValRepo = {
                deleteValue: global.__mockPromise({value: 'test val', attribute: 'test_attr', id_value: '123'}),
                getValueById: global.__mockPromise({id_value: '12345'}),
                getValues: global.__mockPromise([{value: 'test val', attribute: 'test_attr'}])
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.SIMPLE})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const valDomain = valueDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain
            });

            const deletedValue = await valDomain.deleteValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                valueId: '123',
                ctx
            });

            expect(mockValRepo.deleteValue.mock.calls.length).toBe(1);
            expect(deletedValue).toMatchObject(deletedValueData);
        });

        test('Should throw if unknown attribute', async function() {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: jest.fn().mockImplementationOnce(id => {
                    throw new ValidationError({id: Errors.UNKNOWN_ATTRIBUTE});
                })
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain
            });

            await expect(
                valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    value: {value: 'test val'},
                    ctx
                })
            ).rejects.toThrow();
        });

        test('Should throw if unknown library', async function() {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributes: global.__mockPromise({list: [{id: 'test_attr'}], totalCount: 1})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [], totalCount: 0})
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain
            });

            const deleteVal = valDomain.deleteValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                valueId: '123',
                ctx
            });

            await expect(deleteVal).rejects.toThrow(ValidationError);
            await expect(deleteVal).rejects.toHaveProperty('fields.library');
        });

        test('Should throw if unknown record', async function() {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributes: global.__mockPromise({list: [{id: 'test_attr'}], totalCount: 1})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1})
            };

            const mockRecordRepoNotfound: Mockify<IRecordRepo> = {
                find: global.__mockPromise({totalCount: 0, list: []})
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.record': mockRecordRepoNotfound as IRecordRepo
            });

            const deleteVal = valDomain.deleteValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                valueId: '123',
                ctx
            });

            await expect(deleteVal).rejects.toThrow(ValidationError);
            await expect(deleteVal).rejects.toHaveProperty('fields.recordId');
        });

        test('Should throw if unknown value', async function() {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.ADVANCED})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain
            });

            await expect(
                valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    value: {
                        id_value: '12345',
                        value: 'test val'
                    },
                    ctx
                })
            ).rejects.toThrow();
        });
    });

    describe('getValues', () => {
        test('Should return values', async function() {
            const valueData = {value: 'test val', attribute: 'test_attr'};

            const mockValRepo = {
                getValues: global.__mockPromise(valueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.SIMPLE})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1})
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain
            });

            const resValue = await valDomain.getValues({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                ctx
            });

            expect(mockValRepo.getValues.mock.calls.length).toBe(1);
            expect(resValue).toMatchObject(valueData);
        });

        test('Should return versioned values in simple mode', async function() {
            const version = {my_tree: {library: 'my_lib', id: '12345'}};
            const valueData = {
                value: 'test val',
                attribute: 'test_attr',
                version
            };

            const mockValRepo = {
                getValues: global.__mockPromise(valueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrAdvVersionableSimple)
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1})
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain
            });

            const resValue = await valDomain.getValues({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                options: {version},
                ctx
            });

            expect(mockValRepo.getValues.mock.calls.length).toBe(1);
            expect(mockValRepo.getValues.mock.calls[0][0].forceGetAllValues).toBe(false);
            expect(mockValRepo.getValues.mock.calls[0][0].options).toMatchObject({version});
            expect(resValue).toMatchObject(valueData);
        });

        test('Should return versioned values in smart mode', async function() {
            const valueData = [
                {
                    value: 'val1',
                    attribute: 'test_attr',
                    version: {
                        my_tree: {id: 7, library: 'my_lib'}
                    }
                },
                {
                    value: 'val2',
                    attribute: 'test_attr',
                    version: {
                        my_tree: {id: 8, library: 'my_lib'}
                    }
                }
            ];

            const mockTreeRepo: Mockify<ITreeRepo> = {
                getElementAncestors: global.__mockPromise([
                    {
                        record: {
                            id: 9,
                            library: 'my_lib'
                        }
                    },
                    {
                        record: {
                            id: 8,
                            library: 'my_lib'
                        }
                    },
                    {
                        record: {
                            id: 7,
                            library: 'my_lib'
                        }
                    }
                ])
            };

            const mockValRepo = {
                getValues: global.__mockPromise(valueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrAdvVersionable)
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1})
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const version: IValueVersion = {
                my_tree: {id: '9', library: 'my_lib'}
            };

            const resValue = await valDomain.getValues({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                options: {version},
                ctx
            });

            expect(mockValRepo.getValues.mock.calls.length).toBe(1);
            expect(mockValRepo.getValues.mock.calls[0][0].options).toMatchObject({version});
            expect(mockTreeRepo.getElementAncestors).toBeCalledTimes(1);
            expect(resValue.length).toBe(1);
            expect(resValue[0].value).toBe('val2');
            expect(resValue[0].version).toMatchObject({
                my_tree: {id: 8, library: 'my_lib'}
            });
        });

        test('Should return versioned values with multiple trees', async function() {
            const valueData = [
                {
                    value: 'val1',
                    attribute: 'test_attr',
                    version: {
                        my_tree: {id: 9, library: 'my_lib'},
                        other_tree: {id: 1, library: 'my_lib'},
                        third_tree: {id: 88, library: 'my_lib'}
                    }
                },
                {
                    value: 'val2',
                    attribute: 'test_attr',
                    version: {
                        my_tree: {id: 8, library: 'my_lib'},
                        other_tree: {id: 2, library: 'my_lib'},
                        third_tree: {id: 99, library: 'my_lib'}
                    }
                },
                {
                    value: 'val3',
                    attribute: 'test_attr',
                    version: {
                        my_tree: {id: 8, library: 'my_lib'},
                        other_tree: {id: 2, library: 'my_lib'},
                        third_tree: {id: 99, library: 'my_lib'}
                    }
                },
                {
                    value: 'val4',
                    attribute: 'test_attr',
                    version: {
                        my_tree: {id: 9, library: 'my_lib'},
                        other_tree: {id: 2, library: 'my_lib'},
                        third_tree: {id: 88, library: 'my_lib'}
                    }
                }
            ];

            const mockTreeRepo: Mockify<ITreeRepo> = {
                getElementAncestors: jest.fn().mockImplementation(({treeId, element, ctx: ct}) => {
                    let parents;
                    switch (treeId) {
                        case 'my_tree':
                            parents = [
                                {
                                    record: {
                                        id: 9,
                                        library: 'my_lib'
                                    }
                                },
                                {
                                    record: {
                                        id: 8,
                                        library: 'my_lib'
                                    }
                                },
                                {
                                    record: {
                                        id: 7,
                                        library: 'my_lib'
                                    }
                                }
                            ];
                            break;
                        case 'other_tree':
                            parents = [
                                {
                                    record: {
                                        id: 3,
                                        library: 'my_lib'
                                    }
                                },
                                {
                                    record: {
                                        id: 2,
                                        library: 'my_lib'
                                    }
                                },
                                {
                                    record: {
                                        id: '1',
                                        library: 'my_lib'
                                    }
                                }
                            ];
                            break;
                        case 'third_tree':
                            parents = [
                                {
                                    record: {
                                        id: 99,
                                        library: 'my_lib'
                                    }
                                },
                                {
                                    record: {
                                        id: 88,
                                        library: 'my_lib'
                                    }
                                }
                            ];
                            break;
                    }

                    return Promise.resolve(parents);
                })
            };

            const mockValRepo = {
                getValues: global.__mockPromise(valueData)
            };

            const mockAttrAdvVersionableWithThreeTrees = {
                ...mockAttrAdvVersionable,
                versions_conf: {
                    versionable: true,
                    trees: ['my_tree', 'other_tree', 'third_tree']
                }
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrAdvVersionableWithThreeTrees)
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1})
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const version: IValueVersion = {
                my_tree: {id: '9', library: 'my_lib'},
                other_tree: {id: '3', library: 'my_lib'},
                third_tree: {id: '99', library: 'my_lib'}
            };

            const resValue = await valDomain.getValues({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                options: {version},
                ctx
            });

            expect(mockValRepo.getValues.mock.calls.length).toBe(1);
            expect(mockValRepo.getValues.mock.calls[0][0].options).toMatchObject({version});
            expect(mockTreeRepo.getElementAncestors).toBeCalledTimes(3);
            expect(resValue.length).toBe(2);
            expect(resValue[0].value).toBe('val2');
            expect(resValue[1].value).toBe('val3');
            expect(resValue[0].version).toMatchObject({
                my_tree: {id: 8, library: 'my_lib'},
                other_tree: {id: 2, library: 'my_lib'},
                third_tree: {id: 99, library: 'my_lib'}
            });
        });

        test('Should return empty array if no values matching version', async function() {
            const valueData = [
                {
                    value: 'val1',
                    attribute: 'test_attr',
                    version: {
                        my_tree: {id: 99, library: 'my_lib'}
                    }
                },
                {
                    value: 'val2',
                    attribute: 'test_attr',
                    version: {
                        my_tree: {id: 88, library: 'my_lib'}
                    }
                }
            ];

            const mockTreeRepo: Mockify<ITreeRepo> = {
                getElementAncestors: global.__mockPromise([
                    {
                        record: {
                            id: 9,
                            library: 'my_lib'
                        }
                    },
                    {
                        record: {
                            id: 8,
                            library: 'my_lib'
                        }
                    },
                    {
                        record: {
                            id: 7,
                            library: 'my_lib'
                        }
                    }
                ])
            };

            const mockValRepo = {
                getValues: global.__mockPromise(valueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrAdvVersionable)
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1})
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const version: IValueVersion = {
                my_tree: {id: '9', library: 'my_lib'}
            };

            const resValue = await valDomain.getValues({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                options: {version},
                ctx
            });

            expect(resValue.length).toBe(0);
        });

        test('Should throw if unknown attribute', async function() {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: jest.fn().mockImplementationOnce(id => {
                    throw new ValidationError({id: Errors.UNKNOWN_ATTRIBUTE});
                })
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1})
            };

            const mockValRepo = {};

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo
            });

            await expect(
                valDomain.getValues({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    ctx
                })
            ).rejects.toThrow();
        });

        test('Should throw if unknown library', async function() {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributes: global.__mockPromise({list: [{id: 'test_attr'}], totalCount: 1})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [], totalCount: 0})
            };

            const mockValRepo = {};

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo
            });

            const getVal = valDomain.getValues({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                ctx
            });

            await expect(getVal).rejects.toThrow(ValidationError);
            await expect(getVal).rejects.toHaveProperty('fields.library');
        });

        test('Should throw if unknown record', async function() {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributes: global.__mockPromise({list: [{id: 'test_attr'}], totalCount: 1})
            };

            const mockLibDomain = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib'}], totalCount: 1})
            };

            const mockRecordRepoNotfound: Mockify<IRecordRepo> = {
                find: global.__mockPromise({totalCount: 0, list: []})
            };

            const mockValRepo = {};

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.library': mockLibDomain as ILibraryDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepoNotfound as IRecordRepo
            });

            const getVal = valDomain.getValues({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                ctx
            });

            await expect(getVal).rejects.toThrow(ValidationError);
            await expect(getVal).rejects.toHaveProperty('fields.recordId');
        });
    });
});
