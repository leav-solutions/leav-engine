// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IEventsManagerDomain} from '../eventsManager/eventsManagerDomain';
import {type IGetDefaultElementHelper} from '../tree/helpers/getDefaultElement';
import {type IVersionProfileDomain} from '../versionProfile/versionProfileDomain';
import {type IRecordRepo} from '../../infra/record/recordRepo';
import {type ITreeRepo} from '../../infra/tree/treeRepo';
import {type IValueRepo} from '../../infra/value/valueRepo';
import {type IUtils, type ToAny} from '../../utils/utils';
import type * as Config from '../../_types/config';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type ISaveValue, type IValue} from '../../_types/value';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {ActionsListEvents} from '../../_types/actionsList';
import {AttributeTypes} from '../../_types/attribute';
import {Errors} from '../../_types/errors';
import {
    mockAttrAdv,
    mockAttrAdvLink,
    mockAttrAdvVersionable,
    mockAttrAdvWithMetadata,
    mockAttrSimple,
    mockAttrTree,
} from '../../__tests__/mocks/attribute';
import {mockTree} from '../../__tests__/mocks/tree';
import {mockVersionProfile} from '../../__tests__/mocks/versionProfile';
import {type IActionsListDomain} from '../actionsList/actionsListDomain';
import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type IValidateHelper} from '../helpers/validate';
import {type IAttributeDependentValuesPermissionDomain} from '../permission/attributeDependentValuesPermissionDomain';
import {type IRecordAttributePermissionDomain} from '../permission/recordAttributePermissionDomain';
import {type IRecordPermissionDomain} from '../permission/recordPermissionDomain';
import valueDomain, {type IValueDomainDeps} from './valueDomain';
import {type IRecordInCreationBypassHelper} from '../permission/helpers/recordInCreationBypass';
import {type IAutomationDomain} from '../automation/automationDomain';

const depsBase: ToAny<IValueDomainDeps> = {
    config: {},
    'core.domain.actionsList': vi.fn(),
    'core.domain.attribute': vi.fn(),
    'core.domain.automation': vi.fn(),
    'core.domain.permission.attributeDependentValues': vi.fn(),
    'core.domain.permission.recordAttribute': vi.fn(),
    'core.domain.permission.record': vi.fn(),
    'core.domain.eventsManager': vi.fn(),
    'core.domain.helpers.validate': vi.fn(),
    'core.domain.helpers.updateRecordLastModif': vi.fn(),
    'core.domain.tree.helpers.elementAncestors': vi.fn(),
    'core.domain.tree.helpers.getDefaultElement': vi.fn(),
    'core.domain.record.helpers.sendRecordUpdateEvent': vi.fn(),
    'core.domain.record.helpers.getRecordIdentity': vi.fn(),
    'core.domain.permission.helpers.recordInCreationBypass': vi.fn(),
    'core.domain.versionProfile': vi.fn(),
    'core.infra.record': vi.fn(),
    'core.infra.tree': vi.fn(),
    'core.infra.value': vi.fn(),
    'core.utils': vi.fn(),
    'core.utils.logger': vi.fn(),
    'core.domain.tree': vi.fn(),
    'core.domain.attribute.helpers.ifLibraryJoinLinkAttribute': vi.fn(),
    'core.domain.record.helpers.createRecord': vi.fn(),
    'core.domain.record.helpers.findRecords': vi.fn(),
    'core.domain.value.helpers.getRecordFieldValue': vi.fn(),
    'core.domain.value.helpers.getValues': vi.fn(),
    'core.domain.value.helpers.runActionsList': vi.fn(async ({values}) =>
        values.map((v: any) => ({...v, raw_payload: v.payload})),
    ),
    'core.domain.value.helpers.formatValue': vi.fn(async ({attribute, value}) => {
        const processedValue: any = {...value, attribute: attribute.id};
        // Mimic real behavior: wrap metadata values in {payload: ...}
        if (attribute.metadata_fields?.length && processedValue.metadata) {
            const formattedMeta: Record<string, any> = {};
            for (const field of attribute.metadata_fields) {
                if (typeof processedValue.metadata[field] !== 'undefined') {
                    formattedMeta[field] = {payload: processedValue.metadata[field], attribute: field};
                } else {
                    formattedMeta[field] = null;
                }
            }
            processedValue.metadata = formattedMeta;
        }
        return processedValue;
    }),
};

describe('ValueDomain', () => {
    const eventsManagerMockConfig: Mockify<Config.IEventsManager> = {
        routingKeys: {data_events: 'test.data.events', pubsub_events: 'test.pubsub.events'},
    };

    const mockConfig: Mockify<Config.IConfig> = {
        eventsManager: eventsManagerMockConfig as Config.IEventsManager,
    };

    const mockRecordRepo: Mockify<IRecordRepo> = {
        updateRecord: vi.fn(),
        find: global.__mockPromise({totalCount: 1, list: [{id: 54321}]}),
    };

    const mockActionsListDomain = {
        runActionsList: vi.fn().mockImplementation((_, val) => Promise.resolve(val)),
    } satisfies Mockify<IActionsListDomain>;

    const mockRecordPermDomain: Mockify<IRecordPermissionDomain> = {
        getRecordPermission: global.__mockPromise(true),
    };

    const mockRecordAttrPermDomain: Mockify<IRecordAttributePermissionDomain> = {
        getRecordAttributePermission: global.__mockPromise(true),
    };

    const mockAttributeDependentValuesPermDomain: Mockify<IAttributeDependentValuesPermissionDomain> = {
        getAttributeDependentValuesPermission: global.__mockPromise(true),
    };

    const mockEventsManagerDomain: Mockify<IEventsManagerDomain> = {
        sendDatabaseEvent: global.__mockPromise(),
    };

    const mockAutomationDomain: Mockify<IAutomationDomain> = {
        triggerRules: global.__mockPromise(),
    };

    const mockValidateHelper: Mockify<IValidateHelper> = {
        validateLibrary: global.__mockPromise(true),
        validateRecord: global.__mockPromise(true),
        validateLibraryAttribute: global.__mockPromise(true),
    };

    const mockAttribute = {
        id: 'test_attr',
        actions_list: {
            saveValue: [{name: 'validate'}],
            getValue: [{name: 'toNumber'}],
        },
        type: AttributeTypes.SIMPLE,
    };

    const mockUtilsStandardAttribute: Mockify<IUtils> = {
        isStandardAttribute: vi.fn(() => true),
        isLinkAttribute: vi.fn(() => false),
        isTreeAttribute: vi.fn(() => false),
    };

    const mockGetDefaultElementHelper: Mockify<IGetDefaultElementHelper> = {
        getDefaultElement: global.__mockPromise({id: '12345'}),
    };

    const mockRecordInCreationBypassHelper: Mockify<IRecordInCreationBypassHelper> = {
        recordInCreationBypassById: global.__mockPromise(false),
    };

    const mockUpdateRecordLastModif = vi.fn();

    const mockVersionProfileDomain: Mockify<IVersionProfileDomain> = {
        getVersionProfileProperties: global.__mockPromise({...mockVersionProfile, trees: ['my_tree']}),
    };

    const mockSendRecordUpdateEventHelper = vi.fn();

    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'valueDomainTest',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('saveValue', () => {
        const mockTreeRepo: Mockify<ITreeRepo> = {
            isNodePresent: global.__mockPromise(true),
            getTrees: global.__mockPromise({list: [mockTree], totalCount: 0}),
        };

        test('Should save an indexed value', async function () {
            const savedValueData = {payload: 'test val', attribute: 'test_attr'};

            const mockValRepo = {
                createValue: global.__mockPromise(savedValueData),
                getValues: global.__mockPromise([{id_value: '12345'}]),
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.SIMPLE}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
            };

            const valDomain = valueDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as any,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.automation': mockAutomationDomain as IAutomationDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.helpers.updateRecordLastModif': mockUpdateRecordLastModif,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdateEventHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils,
            });

            const savedValue = await valDomain.saveValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {payload: 'test val'},
                ctx,
            });

            expect(mockValRepo.createValue.mock.calls.length).toBe(1);
            expect(mockActionsListDomain.runActionsList.mock.calls.length).toBe(1); // saveValue action only
            expect(savedValue[0]).toMatchObject(savedValueData);
        });

        test('Should save a new standard value', async function () {
            const savedValueData = {
                id_value: '1337',
                payload: 'test val',
                attribute: 'test_attr',
                modified_at: 123456,
                created_at: 123456,
            };

            const mockValRepo = {
                createValue: global.__mockPromise(savedValueData),
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.ADVANCED}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
            };

            const valDomain = valueDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as any,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.automation': mockAutomationDomain as IAutomationDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.helpers.updateRecordLastModif': mockUpdateRecordLastModif,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdateEventHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils,
            });

            const savedValue = await valDomain.saveValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {payload: 'test val'},
                ctx,
            });

            expect(mockValRepo.createValue.mock.calls.length).toBe(1);
            expect(mockValRepo.createValue.mock.calls[0][0].value.modified_at).toBeDefined();
            expect(mockValRepo.createValue.mock.calls[0][0].value.created_at).toBeDefined();

            expect(savedValue[0]).toMatchObject(savedValueData);
            expect(savedValue[0].id_value).toBeTruthy();
            expect(savedValue[0].attribute).toBeTruthy();
            expect(savedValue[0].modified_at).toBeTruthy();
            expect(savedValue[0].created_at).toBeTruthy();
        });

        test('Should update a standard value', async function () {
            const savedValueData = {
                id_value: '1337',
                payload: 'test val',
                attribute: 'test_attr',
                modified_at: 123456,
                created_at: 123456,
            };

            const mockValRepo = {
                updateValue: global.__mockPromise(savedValueData),
                getValueById: global.__mockPromise({
                    id_value: '12345',
                }),
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.ADVANCED}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
            };

            const valDomain = valueDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as any,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.automation': mockAutomationDomain as IAutomationDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.helpers.updateRecordLastModif': mockUpdateRecordLastModif,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdateEventHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils,
            });

            const savedValue = await valDomain.saveValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {
                    id_value: '12345',
                    payload: 'test val',
                },
                ctx,
            });

            expect(mockValRepo.updateValue.mock.calls.length).toBe(1);
            expect(mockValRepo.updateValue.mock.calls[0][0].value.modified_at).toBeDefined();
            expect(mockValRepo.updateValue.mock.calls[0][0].value.created_at).toBeUndefined();

            expect(savedValue[0]).toMatchObject(savedValueData);
            expect(savedValue[0].id_value).toBeTruthy();
            expect(savedValue[0].attribute).toBeTruthy();
            expect(savedValue[0].modified_at).toBeTruthy();
            expect(savedValue[0].created_at).toBeTruthy();
        });

        test('Should throw if unknown attribute', async function () {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: vi.fn().mockImplementationOnce(() => {
                    throw new ValidationError({id: Errors.UNKNOWN_ATTRIBUTE});
                }),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
            };
            const valDomain = valueDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils,
            });

            await expect(
                valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    value: {payload: 'test val'},
                    ctx,
                }),
            ).rejects.toThrow();
        });

        test('Should throw if the library does not use the attribute', async function () {
            const mValidateHelper: Mockify<IValidateHelper> = {
                validateLibraryAttribute: vi.fn().mockImplementation(() => {
                    throw new ValidationError({attribute: Errors.UNKNOWN_LIBRARY_ATTRIBUTE});
                }),
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.ADVANCED}),
            };

            const valDomain = valueDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.helpers.validate': mValidateHelper as IValidateHelper,
            });

            await expect(
                valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    value: {payload: 'test val'},
                    ctx,
                }),
            ).rejects.toThrow();
        });

        test('Should throw if unknown library', async function () {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributes: global.__mockPromise({list: [{id: 'test_attr'}], totalCount: 1}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
            };

            const valDomain = valueDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils,
            });

            await expect(
                valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    value: {payload: 'test val'},
                    ctx,
                }),
            ).rejects.toThrow();
        });

        test('Should throw if unknown value', async function () {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.ADVANCED}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
            };

            const valDomain = valueDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils,
            });

            await expect(
                valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    value: {
                        id_value: '12345',
                        payload: 'test val',
                    },
                    ctx,
                }),
            ).rejects.toThrow();
        });

        test('Should update record modif date and user', async function () {
            const savedValueData = {payload: 'test val', attribute: 'test_attr'};

            const mockValRepo = {
                createValue: global.__mockPromise(savedValueData),
                getValues: global.__mockPromise([{id_value: '12345'}]),
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.SIMPLE}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
            };

            const mockRecRepo = {
                updateRecord: global.__mockPromise({}),
                find: global.__mockPromise({totalCount: 1, list: [{id: '54321'}]}),
            };

            const valDomain = valueDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as any,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.automation': mockAutomationDomain as IAutomationDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.helpers.updateRecordLastModif': mockUpdateRecordLastModif,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdateEventHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils,
            });

            const savedValue = await valDomain.saveValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {payload: 'test val'},
                ctx,
            });

            expect(mockUpdateRecordLastModif).toBeCalledWith('test_lib', '12345', ctx);

            expect(savedValue[0]).toMatchObject(savedValueData);
        });

        test('Should save a versioned value', async () => {
            const savedValueData: IValue = {
                id_value: '1337',
                payload: 'test val',
                attribute: 'advanced_attribute',
                modified_at: 123456,
                created_at: 123456,
                version: {my_tree: '1'},
            };

            const mockValRepo = {
                createValue: global.__mockPromise(savedValueData),
                getValues: global.__mockPromise([]),
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrAdvVersionable),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
            };

            const valDomain = valueDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.actionsList': mockActionsListDomain as any,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.versionProfile': mockVersionProfileDomain as IVersionProfileDomain,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.automation': mockAutomationDomain as IAutomationDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.helpers.updateRecordLastModif': mockUpdateRecordLastModif,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdateEventHelper,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.utils': mockUtilsStandardAttribute as IUtils,
            });

            const savedValue = await valDomain.saveValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {
                    payload: 'test val',
                    version: {my_tree: '1'},
                },
                ctx,
            });

            expect(mockValRepo.createValue.mock.calls.length).toBe(1);
            expect(mockValRepo.createValue.mock.calls[0][0].value.version).toBeDefined();
            expect(savedValue[0].version).toBeTruthy();
        });

        test('Should ignore version when saving version on a non versionable attribute', async () => {
            const mockValRepo = {
                createValue: global.__mockPromise({}),
                getValues: global.__mockPromise([]),
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrAdv),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
            };

            const valDomain = valueDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as any,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.automation': mockAutomationDomain as IAutomationDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.helpers.updateRecordLastModif': mockUpdateRecordLastModif,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdateEventHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils,
            });

            const savedValue = await valDomain.saveValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {
                    payload: 'test val',
                    version: {my_tree: '1'},
                },
                ctx,
            });

            expect(savedValue[0].version).toBeUndefined();
        });

        test('Should throw if unknown record', async () => {
            const savedValueData = {
                id_value: '1337',
                value: '123465',
                attribute: mockAttrAdvLink.id,
                modified_at: 123456,
                created_at: 123456,
            };

            const mockValRepo = {
                createValue: global.__mockPromise(savedValueData),
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttrSimple}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
            };

            const mockRecordRepoNotfound: Mockify<IRecordRepo> = {
                find: global.__mockPromise({totalCount: 0, list: []}),
                updateRecord: global.__mockPromise(true),
            };

            const mockValidHelper: Mockify<IValidateHelper> = {
                validateRecord: vi.fn().mockImplementation(() => {
                    throw new ValidationError({test_record: Errors.UNKNOWN_RECORD});
                }),
                validateLibrary: global.__mockPromise(true),
                validateLibraryAttribute: global.__mockPromise(true),
            };

            const valDomain = valueDomain({
                ...depsBase,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.automation': mockAutomationDomain as IAutomationDomain,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepoNotfound as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as any,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.helpers.validate': mockValidHelper as IValidateHelper,
                'core.domain.helpers.updateRecordLastModif': mockUpdateRecordLastModif,
                'core.utils': mockUtilsStandardAttribute as IUtils,
            });

            await expect(
                valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    value: {payload: 'test val'},
                    ctx,
                }),
            ).rejects.toThrow(ValidationError);
        });

        test('Should throw if version is incorrect: unknown tree', async () => {
            const mockValRepo = {
                createValue: global.__mockPromise({}),
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrAdvVersionable),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
            };

            const mockTreeRepoNoTree: Mockify<ITreeRepo> = {
                getTrees: global.__mockPromise({list: [], totalCount: 0}),
            };

            const valDomain = valueDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as any,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.infra.tree': mockTreeRepoNoTree as ITreeRepo,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils,
            });

            await expect(
                valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    value: {
                        payload: 'test val',
                        version: {my_tree: '1'},
                    },
                    ctx,
                }),
            ).rejects.toThrow(ValidationError);
        });

        test('Should throw if version is incorrect: bad tree node', async () => {
            const mockValRepo = {
                createValue: global.__mockPromise({}),
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrAdvVersionable),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
            };

            const mockTreeRepoNotPresent: Mockify<ITreeRepo> = {
                ...mockTreeRepo,
                isNodePresent: global.__mockPromise(false),
            };

            const valDomain = valueDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as any,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.infra.tree': mockTreeRepoNotPresent as ITreeRepo,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils,
            });

            await expect(
                valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    value: {
                        payload: 'test val',
                        version: {my_tree: '1'},
                    },
                    ctx,
                }),
            ).rejects.toThrow(ValidationError);
        });

        test("Should throw if linked record doesn't exist", async () => {
            const savedValueData = {
                id_value: '1337',
                value: '123465',
                attribute: mockAttrAdvLink.id,
                modified_at: 123456,
                created_at: 123456,
            };

            const mockValRepo = {
                createValue: global.__mockPromise(savedValueData),
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttrAdvLink}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
            };

            const mockRecordRepoNotfound: Mockify<IRecordRepo> = {
                getRecord: global.__mockPromise(null),
            };

            const valDomain = valueDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepoNotfound as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as any,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils,
            });

            await expect(
                valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    value: {payload: 'test val'},
                    ctx,
                }),
            ).rejects.toThrow(ValidationError);
        });

        test('Should throw if linked record not in tree', async () => {
            const mockValRepo: Mockify<IValueRepo> = {};

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttrTree}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
            };

            const mockRecordRepoWithFind: Mockify<IRecordRepo> = {
                find: global.__mockPromise({totalCount: 1, list: [{id: '123456'}]}),
            };

            const mockTreeRepoNotPresent: Mockify<ITreeRepo> = {
                isNodePresent: global.__mockPromise(false),
                getTrees: global.__mockPromise({list: [mockTree], totalCount: 1}),
            };

            const valDomain = valueDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepoWithFind as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as any,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.permission.attributeDependentValues':
                    mockAttributeDependentValuesPermDomain as IAttributeDependentValuesPermissionDomain,
                'core.infra.tree': mockTreeRepoNotPresent as ITreeRepo,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.utils': mockUtilsStandardAttribute as IUtils,
            });

            await expect(
                valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: mockAttrTree.id,
                    value: {payload: 'lib1/123456'},
                    ctx,
                }),
            ).rejects.toThrow(ValidationError);
        });

        test('If value is identical to DB value, do not save it', async () => {
            const dbValueData = {
                id_value: '1337',
                payload: 'test val',
                attribute: 'test_attr',
                modified_at: 123456,
                created_at: 123456,
            };

            const mockValRepo: Mockify<IValueRepo> = {
                updateValue: vi.fn(),
                getValueById: global.__mockPromise(dbValueData),
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.ADVANCED}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
            };

            const mockUtils: Mockify<IUtils> = {
                ...mockUtilsStandardAttribute,
            };

            const valDomain = valueDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as any,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.automation': mockAutomationDomain as IAutomationDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.helpers.updateRecordLastModif': mockUpdateRecordLastModif,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdateEventHelper,
                'core.utils': mockUtils as IUtils,
            });

            const savedValue = await valDomain.saveValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {
                    id_value: '12345',
                    payload: 'test val',
                },
                ctx,
            });

            expect(mockValRepo.updateValue).not.toBeCalled();
            expect(mockEventsManagerDomain.sendDatabaseEvent).not.toBeCalled();
            expect(mockAutomationDomain.triggerRules).not.toBeCalled();
            expect(mockUpdateRecordLastModif).not.toBeCalled();
            expect(mockSendRecordUpdateEventHelper).not.toBeCalled();
            expect(savedValue[0]).toEqual({...dbValueData, raw_payload: dbValueData.payload});
        });

        describe('Metadata', () => {
            test('Save metadata on value', async () => {
                const savedValueData = {
                    id_value: '1337',
                    payload: 'test val',
                    attribute: 'advanced_attribute_with_meta',
                    modified_at: 123456,
                    created_at: 123456,
                    metadata: {
                        meta_attribute: 'metadata value',
                    },
                };

                const mockValRepo = {
                    createValue: global.__mockPromise(savedValueData),
                    getValues: global.__mockPromise([]),
                };

                const mockAttrDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromise({...mockAttrAdvWithMetadata}),
                    getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
                };

                const valDomain = valueDomain({
                    ...depsBase,
                    config: mockConfig as Config.IConfig,
                    'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                    'core.domain.automation': mockAutomationDomain as IAutomationDomain,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.infra.value': mockValRepo as IValueRepo,
                    'core.infra.record': mockRecordRepo as IRecordRepo,
                    'core.domain.actionsList': mockActionsListDomain as any,
                    'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                    'core.domain.permission.recordAttribute':
                        mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                    'core.infra.tree': mockTreeRepo as ITreeRepo,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.domain.helpers.updateRecordLastModif': mockUpdateRecordLastModif,
                    'core.utils': mockUtilsStandardAttribute as IUtils,
                    'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdateEventHelper,
                });

                const savedValue = await valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'advanced_attribute_with_meta',
                    value: {payload: 'test val', metadata: {meta_attribute: 'metadata value'}},
                    ctx,
                });

                expect(mockValRepo.createValue.mock.calls.length).toBe(1);
                expect(mockValRepo.createValue.mock.calls[0][0].value.metadata).toMatchObject({
                    meta_attribute: 'metadata value',
                });

                expect(savedValue[0].metadata).toMatchObject({
                    meta_attribute: {
                        payload: 'metadata value',
                    },
                });
            });

            test("Should throw if metadata doesn't match attribute settings", async () => {
                const savedValueData = {
                    id_value: '1337',
                    payload: 'test val',
                    attribute: 'advanced_attribute',
                    modified_at: 123456,
                    created_at: 123456,
                    metadata: {
                        meta_attribute: 'metadata value',
                    },
                };

                const mockValRepo = {
                    createValue: global.__mockPromise(savedValueData),
                };

                const mockAttrDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromise({...mockAttrAdv}),
                    getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
                };

                const valDomain = valueDomain({
                    ...depsBase,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.infra.value': mockValRepo as IValueRepo,
                    'core.infra.record': mockRecordRepo as IRecordRepo,
                    'core.domain.actionsList': mockActionsListDomain as any,
                    'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                    'core.domain.permission.recordAttribute':
                        mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                    'core.infra.tree': mockTreeRepo as ITreeRepo,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.utils': mockUtilsStandardAttribute as IUtils,
                });

                const saveVal = valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'advanced_attribute_with_meta',
                    value: {payload: 'test val', metadata: {meta_attribute: 'metadata value'}},
                    ctx,
                });

                await expect(saveVal).rejects.toThrow(ValidationError);
                await expect(saveVal).rejects.toHaveProperty('fields.metadata');
            });

            test('Should throw if no permission to edit metadata field', async () => {
                const savedValueData = {
                    id_value: '1337',
                    payload: 'test val',
                    attribute: 'advanced_attribute',
                    modified_at: 123456,
                    created_at: 123456,
                    metadata: {
                        meta_attribute: 'metadata value',
                    },
                };

                const mockValRepo = {
                    createValue: global.__mockPromise(savedValueData),
                };

                const mockAttrDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromise({...mockAttrAdv}),
                    getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
                };

                const mockRecordAttrPermForbidDom: Mockify<IRecordAttributePermissionDomain> = {
                    getRecordAttributePermission: vi
                        .fn()
                        .mockImplementation((a, attrId) => Promise.resolve(attrId !== 'meta_attribute')),
                };
                const valDomain = valueDomain({
                    ...depsBase,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.infra.value': mockValRepo as IValueRepo,
                    'core.infra.record': mockRecordRepo as IRecordRepo,
                    'core.domain.actionsList': mockActionsListDomain as any,
                    'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                    'core.domain.permission.recordAttribute':
                        mockRecordAttrPermForbidDom as IRecordAttributePermissionDomain,
                    'core.infra.tree': mockTreeRepo as ITreeRepo,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.utils': mockUtilsStandardAttribute as IUtils,
                });

                const saveVal = valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'advanced_attribute_with_meta',
                    value: {payload: 'test val', metadata: {meta_attribute: 'metadata value'}},
                    ctx,
                });

                await expect(saveVal).rejects.toThrow(PermissionError);
                await expect(saveVal).rejects.toHaveProperty('fields.metadata');
            });

            test('Should run actions list on metadata values', async () => {
                const attrWithMetadataId = 'advanced_attribute_with_meta';
                const savedValueData = {
                    id_value: '1337',
                    payload: 'test val',
                    attribute: attrWithMetadataId,
                    modified_at: 123456,
                    created_at: 123456,
                    metadata: {
                        meta_attribute: 'metadata value',
                    },
                };

                const mockValRepo = {
                    createValue: global.__mockPromise(savedValueData),
                    getValues: global.__mockPromise([]),
                };

                const mockAttrDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: vi.fn().mockImplementation(({id}) =>
                        Promise.resolve(
                            id === attrWithMetadataId
                                ? {...mockAttrAdvWithMetadata}
                                : {
                                      ...mockAttrSimple,
                                      id: 'meta_attribute',
                                      actions_list: {[ActionsListEvents.SAVE_VALUE]: {name: 'myAction'}},
                                  },
                        ),
                    ),
                    getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
                };

                const mockRunActionsListHelper = vi.fn(async ({values}) => values);

                const valDomain = valueDomain({
                    ...depsBase,
                    config: mockConfig as Config.IConfig,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.infra.value': mockValRepo as IValueRepo,
                    'core.infra.record': mockRecordRepo as IRecordRepo,
                    'core.domain.actionsList': mockActionsListDomain as any,
                    'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                    'core.infra.tree': mockTreeRepo as ITreeRepo,
                    'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                    'core.domain.automation': mockAutomationDomain as IAutomationDomain,
                    'core.domain.permission.recordAttribute':
                        mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.domain.helpers.updateRecordLastModif': mockUpdateRecordLastModif,
                    'core.utils': mockUtilsStandardAttribute as IUtils,
                    'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdateEventHelper,
                    'core.domain.value.helpers.runActionsList': mockRunActionsListHelper,
                });

                await valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: attrWithMetadataId,
                    value: {payload: 'test val', metadata: {meta_attribute: 'metadata value'}},
                    ctx,
                });

                expect(mockRunActionsListHelper).toHaveBeenCalled();
                // calls[0] is for the main attribute, calls[1] is for the metadata field
                const metaCall = mockRunActionsListHelper.mock.calls.find(
                    ([params]) => params.attribute.id === 'meta_attribute',
                );
                expect(metaCall).toBeDefined();
            });

            test('Should throw with metafield specified if actions list throws', async () => {
                const mockUtils: Mockify<IUtils> = {
                    ...mockUtilsStandardAttribute,
                    rethrow: vi.fn().mockImplementation(e => {
                        throw e;
                    }) as never,
                };

                const attrWithMetadataId = 'advanced_attribute_with_meta';
                const savedValueData = {
                    id_value: '1337',
                    payload: 'test val',
                    attribute: attrWithMetadataId,
                    modified_at: 123456,
                    created_at: 123456,
                    metadata: {
                        meta_attribute: 'metadata value',
                    },
                };

                const mockValRepo = {
                    createValue: global.__mockPromise(savedValueData),
                };

                const mockAttrDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: vi.fn().mockImplementation(id =>
                        Promise.resolve(
                            id === attrWithMetadataId
                                ? {...mockAttrAdvWithMetadata}
                                : {
                                      ...mockAttrSimple,
                                      id: 'meta_attribute',
                                      actions_list: {[ActionsListEvents.SAVE_VALUE]: {name: 'myAction'}},
                                  },
                        ),
                    ),
                    getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
                };

                const mockALThrowsDomain: Mockify<IActionsListDomain> = {
                    runActionsList: vi
                        .fn()
                        .mockImplementationOnce(mockActionsListDomain.runActionsList)
                        .mockImplementation(() => {
                            throw new ValidationError({test_attr: Errors.ERROR});
                        }),
                };

                const valDomain = valueDomain({
                    ...depsBase,
                    'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                    'core.infra.value': mockValRepo as IValueRepo,
                    'core.infra.record': mockRecordRepo as IRecordRepo,
                    'core.domain.actionsList': mockALThrowsDomain as IActionsListDomain,
                    'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                    'core.domain.permission.recordAttribute':
                        mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                    'core.infra.tree': mockTreeRepo as ITreeRepo,
                    'core.utils': mockUtils as IUtils,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                });

                const saveVal = valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'advanced_attribute_with_meta',
                    value: {payload: 'test val', metadata: {meta_attribute: 'metadata value'}},
                    ctx,
                });

                await expect(saveVal).rejects.toThrow(ValidationError);
                await expect(saveVal).rejects.toHaveProperty('fields.metadata');
            });
        });

        test('Should include linked record label in sendDatabaseEvent metadata for link attribute', async function () {
            const linkedRecordId = 'linked_record_id';
            const linkedRecordLabel = 'My Linked Record';

            const mockValRepo = {
                createValue: global.__mockPromise({
                    payload: {id: linkedRecordId, library: 'test_lib'},
                    attribute: mockAttrAdvLink.id,
                    id_value: '123',
                    modified_at: 123456,
                    created_at: 123456,
                }),
                getValues: global.__mockPromise([]),
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttrAdvLink}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
            };

            const mockRecordRepoWithLinked: Mockify<IRecordRepo> = {
                ...mockRecordRepo,
                getRecord: global.__mockPromise({id: linkedRecordId}),
            };

            const mockGetRecordIdentity = vi
                .fn()
                .mockResolvedValue({getLabel: vi.fn().mockResolvedValue(linkedRecordLabel)});

            const mockEventsManager: Mockify<IEventsManagerDomain> = {
                sendDatabaseEvent: vi.fn().mockResolvedValue(undefined),
            };

            const valDomain = valueDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepoWithLinked as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as any,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.automation': mockAutomationDomain as IAutomationDomain,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.helpers.updateRecordLastModif': mockUpdateRecordLastModif,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdateEventHelper,
                'core.domain.record.helpers.getRecordIdentity': mockGetRecordIdentity,
                'core.domain.permission.helpers.recordInCreationBypass':
                    mockRecordInCreationBypassHelper as IRecordInCreationBypassHelper,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
            });

            await valDomain.saveValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttrAdvLink.id,
                value: {payload: linkedRecordId},
                ctx,
            });

            expect(mockGetRecordIdentity).toHaveBeenCalledWith(
                {id: linkedRecordId, library: mockAttrAdvLink.linked_library},
                ctx,
            );
            expect(mockEventsManager.sendDatabaseEvent).toHaveBeenCalledWith(
                expect.objectContaining({metadata: {recordLabel: linkedRecordLabel}}),
                ctx,
            );
        });

        test('Should not include metadata in sendDatabaseEvent for standard attribute', async function () {
            const mockValRepo = {
                createValue: global.__mockPromise({
                    payload: 'test val',
                    attribute: 'test_attr',
                    id_value: '123',
                    modified_at: 123456,
                    created_at: 123456,
                }),
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.SIMPLE}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
            };

            const mockGetRecordIdentity = vi.fn();

            const mockEventsManager: Mockify<IEventsManagerDomain> = {
                sendDatabaseEvent: vi.fn().mockResolvedValue(undefined),
            };

            const valDomain = valueDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as any,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.domain.automation': mockAutomationDomain as IAutomationDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.helpers.updateRecordLastModif': mockUpdateRecordLastModif,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdateEventHelper,
                'core.domain.record.helpers.getRecordIdentity': mockGetRecordIdentity,
                'core.domain.permission.helpers.recordInCreationBypass':
                    mockRecordInCreationBypassHelper as IRecordInCreationBypassHelper,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
            });

            await valDomain.saveValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {payload: 'test val'},
                ctx,
            });

            expect(mockGetRecordIdentity).not.toHaveBeenCalled();
            expect(mockEventsManager.sendDatabaseEvent).toHaveBeenCalledWith(
                expect.objectContaining({metadata: {}}),
                ctx,
            );
        });
    });

    describe('saveValueBatch', () => {
        const mockTreeRepo: Mockify<ITreeRepo> = {
            isNodePresent: global.__mockPromise(true),
            getTrees: global.__mockPromise({list: [mockTree], totalCount: 0}),
        };

        test('Should save multiple values', async () => {
            const mockUtils: Mockify<IUtils> = {
                ...mockUtilsStandardAttribute,
                rethrow: vi.fn().mockImplementation(e => {
                    throw e;
                }) as never,
            };
            const values: ISaveValue[] = [
                {
                    attribute: 'test_attr',
                    payload: 'test',
                    id_value: '12345',
                },
                {
                    attribute: 'test_attr2',
                    payload: 'test',
                },
                {
                    attribute: 'test_attr3',
                    payload: 'test',
                },
            ];

            const mockValRepo = {
                updateValue: global.__mockPromise({payload: 'test', raw_payload: 'test', id_value: 12345}),
                createValue: global.__mockPromiseMultiple([
                    {payload: 'test', raw_payload: 'test', id_value: 12345},
                    {payload: 'test', raw_payload: 'test', id_value: null},
                ]),
                getValueById: global.__mockPromise({
                    id_value: '12345',
                }),
                getValues: global.__mockPromise([{payload: 'test', raw_payload: 'test', id_value: 12345}]),
            } satisfies Mockify<IValueRepo>;

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: vi.fn().mockImplementation(({id}) => {
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
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
            };

            const valDomain = valueDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as any,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.utils': mockUtils as IUtils,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.automation': mockAutomationDomain as IAutomationDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.helpers.updateRecordLastModif': mockUpdateRecordLastModif,
                'core.domain.tree.helpers.getDefaultElement': mockGetDefaultElementHelper as IGetDefaultElementHelper,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdateEventHelper,
            });

            const res = await valDomain.saveValueBatch({
                library: 'test_lib',
                recordId: '123456',
                values,
                ctx,
            });

            expect(mockValRepo.updateValue.mock.calls.length).toBe(0); // identical values
            expect(mockValRepo.createValue.mock.calls.length).toBe(2);

            expect(res).toStrictEqual({
                values: [
                    {
                        attribute: 'test_attr',
                        payload: 'test',
                        raw_payload: 'test',
                        id_value: 12345,
                    },
                    {
                        attribute: 'test_attr2',
                        payload: 'test',
                        raw_payload: 'test',
                        id_value: 12345,
                    },
                    {
                        attribute: 'test_attr3',
                        payload: 'test',
                        raw_payload: 'test',
                        id_value: null,
                    },
                ],
                errors: null,
            });
        });

        test('Should ignore values that are identical to DB value', async () => {
            const mockUtils: Mockify<IUtils> = {
                ...mockUtilsStandardAttribute,
                rethrow: vi.fn().mockImplementation(e => {
                    throw e;
                }) as never,
            };
            const values: ISaveValue[] = [
                {
                    attribute: 'test_attr',
                    payload: 'identical',
                    id_value: '12345',
                },
                {
                    attribute: 'test_attr2',
                    payload: 'test',
                },
                {
                    attribute: 'test_attr3',
                    payload: 'test',
                },
            ];

            const mockValRepo = {
                updateValue: global.__mockPromise({payload: 'test', raw_payload: 'test', id_value: 12345}),
                createValue: global.__mockPromiseMultiple([
                    {payload: 'test', raw_payload: 'test', id_value: 12345},
                    {payload: 'test', raw_payload: 'test', id_value: null},
                ]),
                getValueById: global.__mockPromise({
                    id_value: 12345,
                    payload: 'identical',
                    raw_payload: 'identical',
                }),
                getValues: global.__mockPromise([
                    {
                        id_value: 12345,
                        payload: 'identical',
                        raw_payload: 'identical',
                    },
                ]),
            } satisfies Mockify<IValueRepo>;

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: vi.fn().mockImplementation(({id}) => {
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
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
            };

            const valDomain = valueDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as any,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.utils': mockUtils as IUtils,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.automation': mockAutomationDomain as IAutomationDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.helpers.updateRecordLastModif': mockUpdateRecordLastModif,
                'core.domain.tree.helpers.getDefaultElement': mockGetDefaultElementHelper as IGetDefaultElementHelper,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdateEventHelper,
            });

            const res = await valDomain.saveValueBatch({
                library: 'test_lib',
                recordId: '123456',
                values,
                ctx,
            });

            expect(mockValRepo.updateValue.mock.calls.length).toBe(0);
            expect(mockValRepo.createValue.mock.calls.length).toBe(2);

            expect(res).toStrictEqual({
                values: [
                    {
                        attribute: 'test_attr',
                        payload: 'identical',
                        raw_payload: 'identical',
                        id_value: 12345,
                    },
                    {
                        attribute: 'test_attr2',
                        payload: 'test',
                        raw_payload: 'test',
                        id_value: 12345,
                    },
                    {
                        attribute: 'test_attr3',
                        payload: 'test',
                        raw_payload: 'test',
                        id_value: null,
                    },
                ],
                errors: null,
            });
        });

        test('Should return errors for invalid values', async () => {
            const values: ISaveValue[] = [
                {
                    attribute: 'test_attr',
                    payload: 'test',
                    id_value: '12345',
                },
                {
                    attribute: 'test_attr2',
                    payload: 'test',
                },
            ];

            const mockValRepo = {
                updateValue: vi.fn(),
                createValue: vi.fn(),
                getValueById: global.__mockPromise({
                    id_value: '12345',
                }),
            } satisfies Mockify<IValueRepo>;

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute}),
            };

            const mockActionsListDomainInvalid: Mockify<IActionsListDomain> = {
                runActionsList: vi.fn().mockImplementation(() => {
                    throw new ValidationError({test_attr: Errors.ERROR});
                }),
            };

            const mockUtils: Mockify<IUtils> = {
                ...mockUtilsStandardAttribute,
                translateError: vi.fn().mockImplementation(err => err.msg ?? err),
            };

            const valDomain = valueDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as any,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomainInvalid as IActionsListDomain,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.helpers.updateRecordLastModif': mockUpdateRecordLastModif,
                'core.utils': mockUtils as IUtils,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdateEventHelper,
            });

            const res = await valDomain.saveValueBatch({
                library: 'test_lib',
                recordId: '123456',
                values,
                ctx,
            });

            expect(res).toStrictEqual({
                values: [],
                errors: [
                    {attribute: 'test_attr', input: 'test', message: 'ERROR', type: 'VALIDATION_ERROR'},
                    {attribute: 'test_attr2', input: 'test', message: 'Invalid request', type: 'VALIDATION_ERROR'},
                ],
            });

            expect(mockValRepo.updateValue.mock.calls.length).toBe(0);
            expect(mockValRepo.createValue.mock.calls.length).toBe(0);
        });

        test('Should throw if a value is not editable', async () => {
            const values: ISaveValue[] = [
                {
                    attribute: 'test_attr',
                    payload: 'test',
                    id_value: '12345',
                },
                {
                    attribute: 'test_attr2',
                    payload: 'test',
                },
            ];

            const mockValRepo = {
                updateValue: vi.fn(),
                createValue: vi.fn(),
                getValueById: global.__mockPromise({
                    id_value: '12345',
                }),
            } satisfies Mockify<IValueRepo>;

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute}),
            };

            const mockRecordAttrPermDomainNoEdit: Mockify<IRecordAttributePermissionDomain> = {
                getRecordAttributePermission: global.__mockPromise(false),
            };

            const valDomain = valueDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as any,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as any,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute':
                    mockRecordAttrPermDomainNoEdit as IRecordAttributePermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.helpers.updateRecordLastModif': mockUpdateRecordLastModif,
                'core.utils': mockUtilsStandardAttribute as IUtils,
            });

            const res = await valDomain.saveValueBatch({
                library: 'test_lib',
                recordId: '123456',
                values,
                ctx,
            });

            expect(res).toStrictEqual({
                values: [],
                errors: [
                    {attribute: 'test_attr', input: 'test', message: 'Action forbidden', type: 'PERMISSION_ERROR'},
                    {attribute: 'test_attr2', input: 'test', message: 'Action forbidden', type: 'PERMISSION_ERROR'},
                ],
            });

            expect(mockValRepo.updateValue.mock.calls.length).toBe(0);
            expect(mockValRepo.createValue.mock.calls.length).toBe(0);
        });

        test('Delete empty values', async () => {
            const mockUtils: Mockify<IUtils> = {
                ...mockUtilsStandardAttribute,
                rethrow: vi.fn().mockImplementation(e => {
                    throw e;
                }) as never,
            };

            const values: ISaveValue[] = [
                {
                    attribute: 'advanced_attribute',
                    payload: '',
                    id_value: '987654',
                },
            ];

            const mockValRepo: Mockify<IValueRepo> = {
                updateValue: vi.fn(),
                createValue: vi.fn(),
                deleteValue: global.__mockPromise({
                    id_value: '12345',
                    payload: 'MyLabel',
                }),
                getValueById: global.__mockPromise({
                    id_value: '12345',
                }),
                getValues: global.__mockPromise([
                    {
                        id_value: '12345',
                    },
                ]),
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
                getAttributeProperties: global.__mockPromise({...mockAttrAdv}),
                getAttributeLibraries: global.__mockPromise([{id: 'test_lib'}]),
            };

            const valDomain = valueDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as any,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.utils': mockUtils as IUtils,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.automation': mockAutomationDomain as IAutomationDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.helpers.updateRecordLastModif': mockUpdateRecordLastModif,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdateEventHelper,
                'core.domain.permission.helpers.recordInCreationBypass':
                    mockRecordInCreationBypassHelper as IRecordInCreationBypassHelper,
            });

            await valDomain.saveValueBatch({
                library: 'test_lib',
                recordId: '123456',
                values,
                keepEmpty: false,
                ctx,
            });

            expect(mockValRepo.deleteValue).toBeCalledTimes(1);
        });

        test("Don't delete empty values if keepEmpty true", async () => {
            const mockUtils: Mockify<IUtils> = {
                ...mockUtilsStandardAttribute,
                rethrow: vi.fn().mockImplementation(e => {
                    throw e;
                }) as never,
            };

            const values: ISaveValue[] = [
                {
                    attribute: 'advanced_attribute',
                    payload: '',
                    id_value: '987654',
                },
            ];

            const mockValRepo: Mockify<IValueRepo> = {
                updateValue: global.__mockPromise({payload: 'test', id_value: 12345}),
                createValue: global.__mockPromiseMultiple([
                    {payload: 'test', id_value: 12345},
                    {payload: 'test', id_value: null},
                ]),
                deleteValue: vi.fn(),
                getValueById: global.__mockPromise({
                    id_value: '12345',
                }),
                getValues: global.__mockPromise([]),
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttrAdv}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
            };

            const valDomain = valueDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.actionsList': mockActionsListDomain as any,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.utils': mockUtils as IUtils,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.automation': mockAutomationDomain as IAutomationDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.helpers.updateRecordLastModif': mockUpdateRecordLastModif,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdateEventHelper,
            });

            await valDomain.saveValueBatch({
                library: 'test_lib',
                recordId: '123456',
                values,
                ctx,
                keepEmpty: true,
            });

            expect(mockValRepo.deleteValue).toBeCalledTimes(0);
        });

        test('Should throw if unknown library', async function () {
            const values: ISaveValue[] = [
                {
                    attribute: 'advanced_attribute',
                    payload: '',
                    id_value: '987654',
                },
            ];

            const mockValidHelper: Mockify<IValidateHelper> = {
                validateRecord: global.__mockPromise(true),
                validateLibrary: vi.fn().mockImplementation(() => {
                    throw new ValidationError({library: Errors.UNKNOWN_LIBRARY});
                }),
            };

            const valDomain = valueDomain({
                ...depsBase,
                'core.domain.helpers.validate': mockValidHelper as IValidateHelper,
            });

            const saveVal = valDomain.saveValueBatch({
                library: 'test_lib',
                recordId: '123456',
                values,
                ctx,
                keepEmpty: true,
            });

            await expect(saveVal).rejects.toThrow(ValidationError);
            await expect(saveVal).rejects.toHaveProperty('fields.library');
        });

        test('Should throw if the library does not use the attribute', async function () {
            const mValidateHelper: Mockify<IValidateHelper> = {
                validateLibrary: global.__mockPromise(true),
                validateLibraryAttribute: vi.fn().mockImplementation(() => {
                    throw new ValidationError({attribute: Errors.UNKNOWN_LIBRARY_ATTRIBUTE});
                }),
            };

            const valDomain = valueDomain({
                ...depsBase,
                'core.domain.helpers.validate': mValidateHelper as IValidateHelper,
            });

            await expect(
                valDomain.saveValueBatch({
                    library: 'test_lib',
                    recordId: '123456',
                    values: [],
                    ctx,
                    keepEmpty: true,
                }),
            ).rejects.toThrow();
        });

        test('Should throw if unknown record', async function () {
            const values: ISaveValue[] = [
                {
                    attribute: 'advanced_attribute',
                    payload: '',
                    id_value: '987654',
                },
            ];

            const mockValidHelper: Mockify<IValidateHelper> = {
                validateRecord: vi.fn().mockImplementation(() => {
                    throw new ValidationError({recordId: Errors.UNKNOWN_RECORD});
                }),
                validateLibrary: global.__mockPromise(true),
                validateLibraryAttribute: global.__mockPromise(true),
            };

            const valDomain = valueDomain({
                ...depsBase,
                'core.domain.helpers.validate': mockValidHelper as IValidateHelper,
            });

            const saveVal = valDomain.saveValueBatch({
                library: 'test_lib',
                recordId: '123456',
                values,
                ctx,
                keepEmpty: true,
            });

            await expect(saveVal).rejects.toThrow(ValidationError);
            await expect(saveVal).rejects.toHaveProperty('fields.recordId');
        });
    });

    describe('deleteValue', () => {
        test('Should delete a value', async function () {
            const deletedValueData = {payload: 'test val', attribute: 'test_attr'};

            const mockValRepo = {
                deleteValue: global.__mockPromise({payload: 'test val', attribute: 'test_attr', id_value: '123'}),
                getValueById: global.__mockPromise({id_value: '12345'}),
                getValues: global.__mockPromise([{payload: 'test val', attribute: 'test_attr'}]),
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.SIMPLE}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
                getAttributeLibraries: global.__mockPromise([{id: 'test_lib'}]),
            };

            const valDomain = valueDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.automation': mockAutomationDomain as IAutomationDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.helpers.updateRecordLastModif': mockUpdateRecordLastModif,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdateEventHelper,
                'core.domain.permission.helpers.recordInCreationBypass':
                    mockRecordInCreationBypassHelper as IRecordInCreationBypassHelper,
            });

            const deletedValue = await valDomain.deleteValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {id_value: '123'},
                ctx,
            });

            expect(mockValRepo.deleteValue.mock.calls.length).toBe(1);
            expect(deletedValue[0]).toMatchObject(deletedValueData);
        });

        test('Should throw if unknown attribute', async function () {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: vi.fn().mockImplementationOnce(() => {
                    throw new ValidationError({id: Errors.UNKNOWN_ATTRIBUTE});
                }),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
            };

            const valDomain = valueDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
            });

            await expect(
                valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    value: {payload: 'test val'},
                    ctx,
                }),
            ).rejects.toThrow();
        });

        test('Should throw if unknown library', async function () {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttrSimple}),
                getAttributes: global.__mockPromise({list: [{id: 'test_attr'}], totalCount: 1}),
            };

            const mockValRepo = {
                getValues: global.__mockPromise([]),
                deleteValue: global.__mockPromise({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    valueId: '123',
                    ctx,
                }),
            };

            const mockValidHelper: Mockify<IValidateHelper> = {
                validateRecord: global.__mockPromise(true),
                validateLibrary: vi.fn().mockImplementation(() => {
                    throw new ValidationError({library: Errors.UNKNOWN_LIBRARY});
                }),
            };

            const valDomain = valueDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.domain.helpers.validate': mockValidHelper as IValidateHelper,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.automation': mockAutomationDomain as IAutomationDomain,
                'core.domain.helpers.updateRecordLastModif': mockUpdateRecordLastModif,
            });

            const deleteVal = valDomain.deleteValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {id_value: '123'},
                ctx,
            });

            await expect(deleteVal).rejects.toThrow(ValidationError);
            await expect(deleteVal).rejects.toHaveProperty('fields.library');
        });

        test('Should throw if unknown record', async function () {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttrSimple}),
                getAttributes: global.__mockPromise({list: [{id: 'test_attr'}], totalCount: 1}),
            };

            const mockValRepo = {
                getValues: global.__mockPromise([]),
                deleteValue: global.__mockPromise({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    value: {id_value: '123'},
                    ctx,
                }),
            };

            const mockValidHelper: Mockify<IValidateHelper> = {
                validateLibrary: global.__mockPromise(true),
                validateRecord: vi.fn().mockImplementation(() => {
                    throw new ValidationError({recordId: Errors.UNKNOWN_RECORD});
                }),
            };

            const valDomain = valueDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.domain.helpers.validate': mockValidHelper as IValidateHelper,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.automation': mockAutomationDomain as IAutomationDomain,
            });

            const deleteVal = valDomain.deleteValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {id_value: '123'},
                ctx,
            });

            await expect(deleteVal).rejects.toThrow(ValidationError);
            await expect(deleteVal).rejects.toHaveProperty('fields.recordId');
        });

        test('Should throw if delete last value of required attribute', async function () {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttrSimple, required: true}),
                getAttributes: global.__mockPromise({list: [{id: 'test_attr'}], totalCount: 1}),
                getAttributeLibraries: global.__mockPromise([{id: 'test_lib'}]),
            };

            const mockValRepo = {
                getValues: global.__mockPromise([{payload: 'payload'}]),
            };

            const mockValidHelper: Mockify<IValidateHelper> = {
                validateLibrary: global.__mockPromise(true),
                validateRecord: global.__mockPromise(true),
            };

            const valDomain = valueDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.domain.helpers.validate': mockValidHelper as IValidateHelper,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.automation': mockAutomationDomain as IAutomationDomain,
                'core.domain.permission.helpers.recordInCreationBypass':
                    mockRecordInCreationBypassHelper as IRecordInCreationBypassHelper,
            });

            const deleteVal = valDomain.deleteValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {id_value: '123'},
                ctx,
            });

            await expect(deleteVal).rejects.toThrow(ValidationError);
            await expect(deleteVal).rejects.toHaveProperty('fields.test_attr');
        });

        test('Should not throw on delete value of required attribute if record in creation', async function () {
            const deletedValueData = {payload: 'test val', attribute: 'test_attr'};

            const mockValRepo = {
                deleteValue: global.__mockPromise({payload: 'test val', attribute: 'test_attr', id_value: '123'}),
                getValueById: global.__mockPromise({id_value: '12345'}),
                getValues: global.__mockPromise([{payload: 'test val', attribute: 'test_attr'}]),
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({
                    ...mockAttribute,
                    type: AttributeTypes.SIMPLE,
                    required: true,
                }),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
                getAttributeLibraries: global.__mockPromise([{id: 'test_lib'}]),
            };

            const valDomain = valueDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.automation': mockAutomationDomain as IAutomationDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.helpers.updateRecordLastModif': mockUpdateRecordLastModif,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdateEventHelper,
                'core.domain.permission.helpers.recordInCreationBypass': {
                    ...mockRecordInCreationBypassHelper,
                    recordInCreationBypassById: global.__mockPromise(true),
                } as IRecordInCreationBypassHelper,
            });

            const deletedValue = await valDomain.deleteValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {id_value: '123'},
                ctx,
            });

            expect(mockValRepo.deleteValue.mock.calls.length).toBe(1);
            expect(deletedValue[0]).toMatchObject(deletedValueData);
        });

        test('Should throw if unknown value', async function () {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.ADVANCED}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
            };

            const valDomain = valueDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
            });

            await expect(
                valDomain.saveValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    value: {
                        id_value: '12345',
                        payload: 'test val',
                    },
                    ctx,
                }),
            ).rejects.toThrow();
        });

        test('Should return an empty array if no values', async function () {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise(mockAttrSimple),
                getAttributeLibraries: global.__mockPromise([{id: 'test_lib'}]),
            };

            const mockValRepo = {
                getValues: global.__mockPromise([]),
            };

            const mockValidHelper: Mockify<IValidateHelper> = {
                validateLibrary: global.__mockPromise(true),
                validateRecord: global.__mockPromise(true),
            };

            const valDomain = valueDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.domain.helpers.validate': mockValidHelper as IValidateHelper,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.automation': mockAutomationDomain as IAutomationDomain,
                'core.domain.permission.helpers.recordInCreationBypass':
                    mockRecordInCreationBypassHelper as IRecordInCreationBypassHelper,
            });

            const deletedValues = valDomain.deleteValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                ctx,
            });

            await expect(deletedValues).resolves.toEqual([]);
        });

        test('Should include linked record label in sendDatabaseEvent metadata for link attribute', async function () {
            const linkedRecordId = 'linked_record_id';
            const linkedRecordLabel = 'My Linked Record';

            const mockValRepo = {
                deleteValue: global.__mockPromise({
                    payload: {id: linkedRecordId, library: 'test_lib'},
                    attribute: mockAttrAdvLink.id,
                    id_value: '123',
                }),
                getValueById: global.__mockPromise({id_value: '123'}),
                getValues: global.__mockPromise([
                    {payload: {id: linkedRecordId, library: 'test_lib'}, attribute: mockAttrAdvLink.id},
                ]),
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttrAdvLink}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
                getAttributeLibraries: global.__mockPromise([{id: 'test_lib'}]),
            };

            const mockGetRecordIdentity = vi
                .fn()
                .mockResolvedValue({getLabel: vi.fn().mockResolvedValue(linkedRecordLabel)});

            const mockEventsManager: Mockify<IEventsManagerDomain> = {
                sendDatabaseEvent: vi.fn().mockResolvedValue(undefined),
            };

            const valDomain = valueDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.helpers.updateRecordLastModif': mockUpdateRecordLastModif,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdateEventHelper,
                'core.domain.record.helpers.getRecordIdentity': mockGetRecordIdentity,
                'core.domain.permission.helpers.recordInCreationBypass':
                    mockRecordInCreationBypassHelper as IRecordInCreationBypassHelper,
            });

            await valDomain.deleteValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttrAdvLink.id,
                value: {id_value: '123'},
                ctx,
            });

            expect(mockGetRecordIdentity).toHaveBeenCalledWith(
                {id: linkedRecordId, library: mockAttrAdvLink.linked_library},
                ctx,
            );
            expect(mockEventsManager.sendDatabaseEvent).toHaveBeenCalledWith(
                expect.objectContaining({metadata: {recordLabel: linkedRecordLabel}}),
                ctx,
            );
        });

        test('Should not include metadata in sendDatabaseEvent for standard attribute', async function () {
            const mockValRepo = {
                deleteValue: global.__mockPromise({payload: 'test val', attribute: 'test_attr', id_value: '123'}),
                getValueById: global.__mockPromise({id_value: '12345'}),
                getValues: global.__mockPromise([{payload: 'test val', attribute: 'test_attr'}]),
            };

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttribute, type: AttributeTypes.SIMPLE}),
                getLibraryFullTextAttributes: global.__mockPromise([{id: 'id'}]),
                getAttributeLibraries: global.__mockPromise([{id: 'test_lib'}]),
            };

            const mockGetRecordIdentity = vi.fn();

            const mockEventsManager: Mockify<IEventsManagerDomain> = {
                sendDatabaseEvent: vi.fn().mockResolvedValue(undefined),
            };

            const valDomain = valueDomain({
                ...depsBase,
                config: mockConfig as Config.IConfig,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.record': mockRecordRepo as IRecordRepo,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.domain.helpers.updateRecordLastModif': mockUpdateRecordLastModif,
                'core.domain.record.helpers.sendRecordUpdateEvent': mockSendRecordUpdateEventHelper,
                'core.domain.record.helpers.getRecordIdentity': mockGetRecordIdentity,
                'core.domain.permission.helpers.recordInCreationBypass':
                    mockRecordInCreationBypassHelper as IRecordInCreationBypassHelper,
            });

            await valDomain.deleteValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: 'test_attr',
                value: {id_value: '123'},
                ctx,
            });

            expect(mockGetRecordIdentity).not.toHaveBeenCalled();
            expect(mockEventsManager.sendDatabaseEvent).toHaveBeenCalledWith(
                expect.objectContaining({metadata: {}}),
                ctx,
            );
        });

        test('Should check required param only if the attribute is linked to library', async function () {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({...mockAttrSimple, required: true}),
                getAttributeLibraries: global.__mockPromise([{id: 'test_lib'}]),
            };

            const mockValRepo: Mockify<IValueRepo> = {
                getValues: global.__mockPromise([{payload: 'test'}]),
                deleteValue: global.__mockPromise({}),
            };

            const mockValidHelper: Mockify<IValidateHelper> = {
                validateLibrary: global.__mockPromise(true),
                validateRecord: global.__mockPromise(true),
            };

            const valDomain = valueDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.domain.helpers.validate': mockValidHelper as IValidateHelper,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.domain.automation': mockAutomationDomain as IAutomationDomain,
                'core.domain.permission.helpers.recordInCreationBypass': {
                    recordInCreationBypassById: global.__mockPromise(false),
                } as IRecordInCreationBypassHelper,
            });

            await expect(
                valDomain.deleteValue({
                    library: 'test_lib',
                    recordId: '12345',
                    attribute: 'test_attr',
                    ctx,
                }),
            ).rejects.toThrow(ValidationError);

            expect(mockValRepo.deleteValue).toHaveBeenCalledTimes(0);
        });
    });
});
