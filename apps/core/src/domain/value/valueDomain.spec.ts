// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IElementAncestorsHelper} from 'domain/tree/helpers/elementAncestors';
import {IRecordRepo} from 'infra/record/recordRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IUtils} from 'utils/utils';
import * as Config from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {IValue, IValueVersion} from '_types/value';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {ActionsListEvents} from '../../_types/actionsList';
import {AttributeTypes} from '../../_types/attribute';
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
import {IValidateHelper} from '../helpers/validate';
import {IRecordAttributePermissionDomain} from '../permission/recordAttributePermissionDomain';
import {IRecordPermissionDomain} from '../permission/recordPermissionDomain';
import valueDomain from './valueDomain';

describe('ValueDomain', () => {
    const eventsManagerMockConfig: Mockify<Config.IEventsManager> = {routingKeys: {events: 'test.database.event'}};

    const mockConfig: Mockify<Config.IConfig> = {
        eventsManager: eventsManagerMockConfig as Config.IEventsManager
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

    const mockRecordAttrPermDomain: Mockify<IRecordAttributePermissionDomain> = {
        getRecordAttributePermission: global.__mockPromise(true)
    };

    const mockEventsManagerDomain: Mockify<IEventsManagerDomain> = {
        send: jest.fn()
    };

    const mockValidateHelper: Mockify<IValidateHelper> = {
        validateLibrary: global.__mockPromise(true),
        validateRecord: global.__mockPromise(true)
    };

    const mockAttribute = {
        id: 'test_attr',
        actions_list: {
            saveValue: [{name: 'validate'}],
            getValue: [{name: 'toNumber'}]
        },
        type: AttributeTypes.SIMPLE
    };

    const mockUtilsStandardAttribute: Mockify<IUtils> = {
        isStandardAttribute: jest.fn(() => true)
    };

    const mockElementAncestorsHelper: Mockify<IElementAncestorsHelper> = {
        getCachedElementAncestors: global.__mockPromise([
            {
                id: '9',
                record: {
                    id: 9,
                    library: 'my_lib'
                }
            },
            {
                id: '8',
                record: {
                    id: 8,
                    library: 'my_lib'
                }
            },
            {
                id: '7',
                record: {
                    id: 7,
                    library: 'my_lib'
                }
            }
        ])
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
            isNodePresent: global.__mockPromise(true),
            getTrees: global.__mockPromise({list: [mockTree], totalCount: 0})
        };

        test('Should save an indexed value', async function () {
            const savedValueData = {value: 'test val', attribute: 'test_attr'};

            const mockValRepo = {
                createValue: global.__mockPromise(savedValueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.SIMPLE}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const valDomain = valueDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils
            });

            const savedValue = await valDomain.saveValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {value: 'test val'},
                ctx
            });

            expect(mockValRepo.createValue.mock.calls.length).toBe(1);
            expect(mockActionsListDomain.runActionsList.mock.calls.length).toBe(2);
            expect(savedValue).toMatchObject(savedValueData);
        });

        test('Should save a new standard value', async function () {
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
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.ADVANCED}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const valDomain = valueDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils
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

        test('Should update a standard value', async function () {
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
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.ADVANCED}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const valDomain = valueDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils
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

        test('Should throw if unknown attribute', async function () {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: jest.fn().mockImplementationOnce(id => {
                    throw new ValidationError({id: Errors.UNKNOWN_ATTRIBUTE});
                }),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };
            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils
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

        test('Should throw if unknown library', async function () {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributes: global.__mockPromise({list: [{id: 'test_attr'}], totalCount: 1}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils
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

        test('Should throw if unknown value', async function () {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.ADVANCED}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils
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

        test('Should update record modif date and user', async function () {
            const savedValueData = {value: 'test val', attribute: 'test_attr'};

            const mockValRepo = {
                createValue: global.__mockPromise(savedValueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.SIMPLE}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const mockRecRepo = {
                updateRecord: global.__mockPromise({}),
                find: global.__mockPromise({totalCount: 1, list: [{id: '54321'}]})
            };

            const valDomain = valueDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils
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
                version: {my_tree: '1'}
            };

            const mockValRepo = {
                createValue: global.__mockPromise(savedValueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrAdvVersionable),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const valDomain = valueDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils
            });

            const savedValue = await valDomain.saveValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {
                    value: 'test val',
                    version: {my_tree: '1'}
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
                getAttributeProperties: global.__mockPromise(mockAttrAdv),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const valDomain = valueDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils
            });

            const savedValue = await valDomain.saveValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {
                    value: 'test val',
                    version: {my_tree: '1'}
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
                getAttributeProperties: global.__mockPromise({...mockAttrSimple}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const mockRecordRepoNotfound: Mockify<IRecordRepo> = {
                find: global.__mockPromise({totalCount: 0, list: []}),
                updateRecord: global.__mockPromise(true)
            };

            const mockValidHelper: Mockify<IValidateHelper> = {
                validateRecord: jest.fn().mockImplementation(() => {
                    throw new ValidationError({test_record: Errors.UNKNOWN_RECORD});
                }),
                validateLibrary: global.__mockPromise(true)
            };

            const valDomain = valueDomain({
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepoNotfound as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.helpers.validate': mockValidHelper as IValidateHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils
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
                getAttributeProperties: global.__mockPromise(mockAttrAdvVersionable),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const mockTreeRepoNoTree: Mockify<ITreeRepo> = {
                getTrees: global.__mockPromise({list: [], totalCount: 0})
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.infra.tree': mockTreeRepoNoTree as ITreeRepo,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils
            });

            await expect(
                valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    value: {
                        value: 'test val',
                        version: {my_tree: '1'}
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
                getAttributeProperties: global.__mockPromise(mockAttrAdvVersionable),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const mockTreeRepoNotPresent: Mockify<ITreeRepo> = {
                ...mockTreeRepo,
                isNodePresent: global.__mockPromise(false)
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.infra.tree': mockTreeRepoNotPresent as ITreeRepo,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils
            });

            await expect(
                valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    value: {
                        value: 'test val',
                        version: {my_tree: '1'}
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
                getAttributeProperties: global.__mockPromise({...mockAttrAdvLink}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const mockRecordRepoNotfound: Mockify<IRecordRepo> = {
                find: global.__mockPromise({totalCount: 0, list: []})
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepoNotfound as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils
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
                getAttributeProperties: global.__mockPromise({...mockAttrTree}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const mockRecordRepoWithFind: Mockify<IRecordRepo> = {
                find: global.__mockPromise({totalCount: 1, list: [{id: '123456'}]})
            };

            const mockTreeRepoNotPresent: Mockify<ITreeRepo> = {
                isNodePresent: global.__mockPromise(false),
                getTrees: global.__mockPromise({list: [mockTree], totalCount: 1})
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepoWithFind as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.infra.tree': mockTreeRepoNotPresent as ITreeRepo,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils
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
                    getAttributeProperties: global.__mockPromise({...mockAttrAdvWithMetadata}),
                    getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
                };

                const valDomain = valueDomain({
                    config: mockConfig as Config.IConfig,
                    'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.infra.value': mockValRepo as IValueRepo,
                    'core.infra.record': mockRecordRepo as IRecordRepo,
                    'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                    'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                    'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                    'core.infra.tree': mockTreeRepo as ITreeRepo,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.utils': mockUtilsStandardAttribute as IUtils
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

                expect(savedValue.metadata).toMatchObject({
                    meta_attribute: {
                        value: 'metadata value'
                    }
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
                    getAttributeProperties: global.__mockPromise({...mockAttrAdv}),
                    getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
                };

                const valDomain = valueDomain({
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.infra.value': mockValRepo as IValueRepo,
                    'core.infra.record': mockRecordRepo as IRecordRepo,
                    'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                    'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                    'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                    'core.infra.tree': mockTreeRepo as ITreeRepo,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.utils': mockUtilsStandardAttribute as IUtils
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
                    getAttributeProperties: global.__mockPromise({...mockAttrAdv}),
                    getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
                };

                const mockRecordAttrPermForbidDom: Mockify<IRecordAttributePermissionDomain> = {
                    getRecordAttributePermission: jest
                        .fn()
                        .mockImplementation((a, u, attrId) =>
                            Promise.resolve(attrId === 'meta_attribute' ? false : true)
                        )
                };
                const valDomain = valueDomain({
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.infra.value': mockValRepo as IValueRepo,
                    'core.infra.record': mockRecordRepo as IRecordRepo,
                    'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                    'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                    'core.domain.permission.recordAttribute': mockRecordAttrPermForbidDom as IRecordAttributePermissionDomain,
                    'core.infra.tree': mockTreeRepo as ITreeRepo,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.utils': mockUtilsStandardAttribute as IUtils
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
                    ),
                    getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
                };

                const valDomain = valueDomain({
                    config: mockConfig as Config.IConfig,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.infra.value': mockValRepo as IValueRepo,
                    'core.infra.record': mockRecordRepo as IRecordRepo,
                    'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                    'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                    'core.infra.tree': mockTreeRepo as ITreeRepo,
                    'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                    'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.utils': mockUtilsStandardAttribute as IUtils
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
                    ...mockUtilsStandardAttribute,
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
                    ),
                    getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
                };

                const mockALThrowsDomain: Mockify<IActionsListDomain> = {
                    runActionsList: jest.fn().mockImplementation(() => {
                        throw new ValidationError({test_attr: Errors.ERROR});
                    })
                };

                const valDomain = valueDomain({
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.infra.value': mockValRepo as IValueRepo,
                    'core.infra.record': mockRecordRepo as IRecordRepo,
                    'core.domain.actionsList': mockALThrowsDomain as IActionsListDomain,
                    'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                    'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                    'core.infra.tree': mockTreeRepo as ITreeRepo,
                    'core.utils': mockUtils as IUtils,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper
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
            isNodePresent: global.__mockPromise(true),
            getTrees: global.__mockPromise({list: [mockTree], totalCount: 0})
        };

        test('Should save multiple values', async () => {
            const mockUtils: Mockify<IUtils> = {
                ...mockUtilsStandardAttribute,
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
                            attrProps = {...mockAttrAdv, id};
                            break;
                        case 'test_attr3':
                            attrProps = {...mockAttrSimple, id};
                            break;
                    }

                    return Promise.resolve(attrProps);
                }),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const valDomain = valueDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.utils': mockUtils as IUtils,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper
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
                        raw_value: 'test',
                        id_value: 12345
                    },
                    {
                        attribute: 'test_attr2',
                        value: 'test',
                        raw_value: 'test',
                        id_value: 12345
                    },
                    {
                        attribute: 'test_attr3',
                        value: 'test',
                        raw_value: 'test',
                        id_value: null
                    }
                ],
                errors: null
            });
        });

        test('Should return errors for invalid values', async () => {
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

            const mockUtils: Mockify<IUtils> = {
                ...mockUtilsStandardAttribute,
                translateError: jest.fn().mockImplementation(err => err.msg ?? err)
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomainInvalid as IActionsListDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.utils': mockUtils as IUtils
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

            const mockRecordAttrPermDomainNoEdit: Mockify<IRecordAttributePermissionDomain> = {
                getRecordAttributePermission: global.__mockPromise(false)
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomainNoEdit as IRecordAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils
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
            const mockUtils: Mockify<IUtils> = {
                ...mockUtilsStandardAttribute,
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
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
                getAttributeProperties: global.__mockPromise({...mockAttrAdv})
            };

            const valDomain = valueDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.utils': mockUtils as IUtils,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper
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
            const mockUtils: Mockify<IUtils> = {
                ...mockUtilsStandardAttribute,
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
                updateValue: global.__mockPromise({value: 'test', id_value: 12345}),
                createValue: global.__mockPromiseMultiple([
                    {value: 'test', id_value: 12345},
                    {value: 'test', id_value: null}
                ]),
                deleteValue: jest.fn(),
                getValueById: global.__mockPromise({
                    id_value: '12345'
                })
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttrAdv}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const valDomain = valueDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.utils': mockUtils as IUtils,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper
            });

            await valDomain.saveValueBatch({
                library: 'test_lib',
                recordId: '123456',
                values,
                ctx,
                keepEmpty: true
            });

            expect(mockValRepo.deleteValue).toBeCalledTimes(0);
        });

        test('Should throw if unknown library', async function () {
            const values: IValue[] = [
                {
                    attribute: 'advanced_attribute',
                    value: '',
                    id_value: '987654'
                }
            ];

            const mockValidHelper: Mockify<IValidateHelper> = {
                validateRecord: global.__mockPromise(true),
                validateLibrary: jest.fn().mockImplementation(() => {
                    throw new ValidationError({library: Errors.UNKNOWN_LIBRARY});
                })
            };

            const valDomain = valueDomain({
                'core.domain.helpers.validate': mockValidHelper as IValidateHelper
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

        test('Should throw if unknown record', async function () {
            const values: IValue[] = [
                {
                    attribute: 'advanced_attribute',
                    value: '',
                    id_value: '987654'
                }
            ];

            const mockValidHelper: Mockify<IValidateHelper> = {
                validateRecord: jest.fn().mockImplementation(() => {
                    throw new ValidationError({recordId: Errors.UNKNOWN_RECORD});
                }),
                validateLibrary: global.__mockPromise(true)
            };

            const valDomain = valueDomain({
                'core.domain.helpers.validate': mockValidHelper as IValidateHelper
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
        test('Should delete a value', async function () {
            const deletedValueData = {value: 'test val', attribute: 'test_attr'};

            const mockValRepo = {
                deleteValue: global.__mockPromise({value: 'test val', attribute: 'test_attr', id_value: '123'}),
                getValueById: global.__mockPromise({id_value: '12345'}),
                getValues: global.__mockPromise([{value: 'test val', attribute: 'test_attr'}])
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.SIMPLE}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const valDomain = valueDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper
            });

            const deletedValue = await valDomain.deleteValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {id_value: '123'},
                ctx
            });

            expect(mockValRepo.deleteValue.mock.calls.length).toBe(1);
            expect(deletedValue).toMatchObject(deletedValueData);
        });

        test('Should throw if unknown attribute', async function () {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: jest.fn().mockImplementationOnce(id => {
                    throw new ValidationError({id: Errors.UNKNOWN_ATTRIBUTE});
                }),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain
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

        test('Should throw if unknown library', async function () {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttrSimple}),
                getAttributes: global.__mockPromise({list: [{id: 'test_attr'}], totalCount: 1})
            };

            const mockValRepo = {
                getValues: global.__mockPromise([]),
                deleteValue: global.__mockPromise({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    valueId: '123',
                    ctx
                })
            };

            const mockValidHelper: Mockify<IValidateHelper> = {
                validateRecord: global.__mockPromise(true),
                validateLibrary: jest.fn().mockImplementation(() => {
                    throw new ValidationError({library: Errors.UNKNOWN_LIBRARY});
                })
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.domain.helpers.validate': mockValidHelper as IValidateHelper,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain
            });

            const deleteVal = valDomain.deleteValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {id_value: '123'},
                ctx
            });

            await expect(deleteVal).rejects.toThrow(ValidationError);
            await expect(deleteVal).rejects.toHaveProperty('fields.library');
        });

        test('Should throw if unknown record', async function () {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttrSimple}),
                getAttributes: global.__mockPromise({list: [{id: 'test_attr'}], totalCount: 1})
            };

            const mockValRepo = {
                getValues: global.__mockPromise([]),
                deleteValue: global.__mockPromise({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    value: {id_value: '123'},
                    ctx
                })
            };

            const mockValidHelper: Mockify<IValidateHelper> = {
                validateLibrary: global.__mockPromise(true),
                validateRecord: jest.fn().mockImplementation(() => {
                    throw new ValidationError({recordId: Errors.UNKNOWN_RECORD});
                })
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.domain.helpers.validate': mockValidHelper as IValidateHelper,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain
            });

            const deleteVal = valDomain.deleteValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {id_value: '123'},
                ctx
            });

            await expect(deleteVal).rejects.toThrow(ValidationError);
            await expect(deleteVal).rejects.toHaveProperty('fields.recordId');
        });

        test('Should throw if unknown value', async function () {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.ADVANCED}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}])
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain
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
        test('Should return values', async function () {
            const valueData = {value: 'test val', attribute: 'test_attr'};

            const mockValRepo = {
                getValues: global.__mockPromise(valueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.SIMPLE})
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper
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

        test('Should return versioned values in simple mode', async function () {
            const version = {my_tree: '12345'};
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

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper
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

        test('Should return versioned values in smart mode', async function () {
            const valueData = [
                {
                    value: 'val1',
                    attribute: 'test_attr',
                    version: {my_tree: '7'}
                },
                {
                    value: 'val2',
                    attribute: 'test_attr',
                    version: {my_tree: '8'}
                }
            ];

            const mockValRepo = {
                getValues: global.__mockPromise(valueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrAdvVersionable)
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper
            });

            const version: IValueVersion = {my_tree: '9'};

            const resValue = await valDomain.getValues({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                options: {version},
                ctx
            });

            expect(mockValRepo.getValues.mock.calls.length).toBe(1);
            expect(mockValRepo.getValues.mock.calls[0][0].options).toMatchObject({version});

            expect(mockElementAncestorsHelper.getCachedElementAncestors).toBeCalledTimes(1);

            expect(resValue.length).toBe(1);
            expect(resValue[0].value).toBe('val2');
            expect(resValue[0].version).toMatchObject({my_tree: '8'});
        });

        test('Should return versioned values with multiple trees', async function () {
            const valueData = [
                {
                    value: 'val1',
                    attribute: 'test_attr',
                    version: {
                        my_tree: '9',
                        other_tree: '1',
                        third_tree: '88'
                    }
                },
                {
                    value: 'val2',
                    attribute: 'test_attr',
                    version: {
                        my_tree: '8',
                        other_tree: '2',
                        third_tree: '99'
                    }
                },
                {
                    value: 'val3',
                    attribute: 'test_attr',
                    version: {
                        my_tree: '8',
                        other_tree: '2',
                        third_tree: '99'
                    }
                },
                {
                    value: 'val4',
                    attribute: 'test_attr',
                    version: {
                        my_tree: '9',
                        other_tree: '2',
                        third_tree: '88'
                    }
                }
            ];

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

            const mockElementAncestorsHelperMultipleTrees = {
                ...mockElementAncestorsHelper,
                getCachedElementAncestors: jest.fn().mockImplementation(({treeId, element, ctx: ct}) => {
                    let parents;
                    switch (treeId) {
                        case 'my_tree':
                            parents = [
                                {
                                    id: '9',
                                    record: {
                                        id: 9,
                                        library: 'my_lib'
                                    }
                                },
                                {
                                    id: '8',
                                    record: {
                                        id: 8,
                                        library: 'my_lib'
                                    }
                                },
                                {
                                    id: '7',
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
                                    id: '3',
                                    record: {
                                        id: 3,
                                        library: 'my_lib'
                                    }
                                },
                                {
                                    id: '2',
                                    record: {
                                        id: 2,
                                        library: 'my_lib'
                                    }
                                },
                                {
                                    id: '1',
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
                                    id: '99',
                                    record: {
                                        id: '99',
                                        library: 'my_lib'
                                    }
                                },
                                {
                                    id: '88',
                                    record: {
                                        id: '88',
                                        library: 'my_lib'
                                    }
                                }
                            ];
                            break;
                    }

                    return Promise.resolve(parents);
                })
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelperMultipleTrees as IElementAncestorsHelper
            });

            const version: IValueVersion = {
                my_tree: '9',
                other_tree: '3',
                third_tree: '99'
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
            expect(mockElementAncestorsHelperMultipleTrees.getCachedElementAncestors).toBeCalledTimes(3);
            expect(resValue.length).toBe(2);
            expect(resValue[0].value).toBe('val2');
            expect(resValue[1].value).toBe('val3');
            expect(resValue[0].version).toMatchObject({
                my_tree: '8',
                other_tree: '2',
                third_tree: '99'
            });
        });

        test('Should return empty array if no values matching version', async function () {
            const valueData = [
                {
                    value: 'val1',
                    attribute: 'test_attr',
                    version: {
                        my_tree: '99'
                    }
                },
                {
                    value: 'val2',
                    attribute: 'test_attr',
                    version: {
                        my_tree: '88'
                    }
                }
            ];

            const mockValRepo = {
                getValues: global.__mockPromise(valueData)
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrAdvVersionable)
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as IActionsListDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper
            });

            const version: IValueVersion = {my_tree: '9'};

            const resValue = await valDomain.getValues({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                options: {version},
                ctx
            });

            expect(resValue.length).toBe(0);
        });

        test('Should throw if unknown attribute', async function () {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: jest.fn().mockImplementationOnce(id => {
                    throw new ValidationError({id: Errors.UNKNOWN_ATTRIBUTE});
                })
            };

            const valDomain = valueDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain
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

        test('Should throw if unknown library', async function () {
            const mockValidHelper: Mockify<IValidateHelper> = {
                validateLibrary: jest.fn().mockImplementation(() => {
                    throw new ValidationError({library: Errors.UNKNOWN_LIBRARY});
                }),
                validateRecord: global.__mockPromise(true)
            };

            const valDomain = valueDomain({
                'core.domain.helpers.validate': mockValidHelper as IValidateHelper
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

        test('Should throw if unknown record', async function () {
            const mockValidHelper: Mockify<IValidateHelper> = {
                validateRecord: jest.fn().mockImplementation(() => {
                    throw new ValidationError({recordId: Errors.UNKNOWN_RECORD});
                }),
                validateLibrary: global.__mockPromise(true)
            };

            const valDomain = valueDomain({
                'core.domain.helpers.validate': mockValidHelper as IValidateHelper
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
