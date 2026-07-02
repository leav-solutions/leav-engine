import {EventAction} from '@leav/utils';
import {type IQueryInfos} from '../../../../../_types/queryInfos';
import {systemUserId} from '../../../../../_constants/users';
import {ActionExecutionResultStatus, type IAutomationAction} from '../../../../../domain/automation/actions/_types';
import {type ModifyAttributeActionParams} from '../../../../../domain/automation/actions/modifyAttributeAction';
import {type ILibraryDomain} from '../../../../../domain/library/libraryDomain';
import {type IAttributeDomain} from '../../../../../domain/attribute/attributeDomain';
import {type IValueDomain} from '../../../../../domain/value/valueDomain';
import {type IRecord} from '../../../../../_types/record';
import {AttributeFormats, AttributeTypes} from '../../../../../_types/attribute';
import {getCoreDep} from '../../../integrationTestUtils';
import {type IRecordDomain} from '../../../../../domain/record/recordDomain';
import {type ISaveValue} from '../../../../../_types/value';
import {type IAutomationPipelineExecutionState} from '../../../../../domain/automation/pipeline/_types';
import ValidationError from '../../../../../errors/ValidationError';
import {pipelineStepValidation} from '../../../../../domain/automation/pipeline/stepValidation';

const libSource = 'maa_lib_source';
const libTarget = 'maa_lib_target';

const STANDARD_MONO_ATTR = 'maa_standard_mono';
const STANDARD_MULTI_ATTR = 'maa_standard_multi';
const LINK_MONO_ATTR = 'maa_adv_link_mono';
const LINK_MULTI_ATTR = 'maa_adv_link_multi';
const TARGET_ATTR = 'maa_target_attr';

describe('modifyAttributeAction', () => {
    let action: IAutomationAction<ModifyAttributeActionParams>;
    let libraryDomain: ILibraryDomain;
    let attributeDomain: IAttributeDomain;
    let valueDomain: IValueDomain;
    let recordDomain: IRecordDomain;

    let targetRecord1: IRecord;
    let targetRecord2: IRecord;

    const ctx: IQueryInfos = {userId: systemUserId};

    beforeAll(async () => {
        action = getCoreDep<IAutomationAction<ModifyAttributeActionParams>>(
            'core.domain.automation.actions.modifyAttribute',
        );
        libraryDomain = getCoreDep<ILibraryDomain>('core.domain.library');
        attributeDomain = getCoreDep<IAttributeDomain>('core.domain.attribute');
        valueDomain = getCoreDep<IValueDomain>('core.domain.value');
        recordDomain = getCoreDep<IRecordDomain>('core.domain.record');

        const standardMonoAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: STANDARD_MONO_ATTR,
                type: AttributeTypes.ADVANCED,
                format: AttributeFormats.TEXT,
                label: {en: 'Simple Mono'},
            },
            ctx,
        });
        const standardMultiAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: STANDARD_MULTI_ATTR,
                type: AttributeTypes.ADVANCED,
                format: AttributeFormats.TEXT,
                multiple_values: true,
                label: {en: 'Simple Multi'},
            },
            ctx,
        });
        const linkMonoAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: LINK_MONO_ATTR,
                type: AttributeTypes.ADVANCED_LINK,
                linked_library: libTarget,
                label: {en: 'Link Mono'},
            },
            ctx,
        });
        const linkMultiAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: LINK_MULTI_ATTR,
                type: AttributeTypes.ADVANCED_LINK,
                linked_library: libTarget,
                multiple_values: true,
                label: {en: 'Link Multi'},
            },
            ctx,
        });
        const targetAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: TARGET_ATTR,
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.TEXT,
                label: {en: 'Target'},
            },
            ctx,
        });

        // libTarget must be created before libSource (ADVANCED_LINK references it)
        await libraryDomain.saveLibrary({id: libTarget, attributes: [targetAttr]}, ctx);
        await libraryDomain.saveLibrary(
            {id: libSource, attributes: [standardMonoAttr, standardMultiAttr, linkMonoAttr, linkMultiAttr]},
            ctx,
        );

        targetRecord1 = await createRecord(libTarget);
        targetRecord2 = await createRecord(libTarget);
    });

    const createRecord = async (library: string, values: ISaveValue[] = []): Promise<IRecord> => {
        const res = await recordDomain.createRecord({
            library,
            values,
            ctx,
        });

        if (res.valuesErrors?.length) {
            throw new Error(`Error creating record: ${JSON.stringify(res.valuesErrors)}`);
        }
        return res.record;
    };

    const makeState = (
        recordId: string,
        libraryId: string,
        lastResult: unknown,
    ): IAutomationPipelineExecutionState => ({
        trigger: {
            synchronous: true,
            eventAction: EventAction.RECORD_INIT,
            eventTopic: {record: {id: recordId, libraryId}} as any,
        },
        results: {},
        startDateMs: Date.now(),
        stepIndex: 0,
        lastResult,
    });

    describe('validateParams', () => {
        const makeValidateParams = (library: string, attributePath: string) =>
            pipelineStepValidation<ModifyAttributeActionParams>(
                {
                    steps: [
                        {
                            type: 'some_other_action',
                            params: {},
                        },
                        {params: {attributePath, mode: 'replace' as const}, type: 'modifyAttribute'},
                    ],
                    trigger: {
                        synchronous: true,
                        eventAction: EventAction.RECORD_INIT,
                        eventTopic: {library} as any,
                    },
                },
                1,
            );

        it('throws when trigger has no eventTopic', async () => {
            await expect(
                action.validateStep?.(
                    {
                        ...makeValidateParams(libSource, STANDARD_MONO_ATTR),
                        trigger: {synchronous: true, eventAction: EventAction.RECORD_INIT},
                    },
                    ctx,
                ),
            ).rejects.toThrow(
                'ModifyAttributeAction can only be used with triggers that have a library in their event topic',
            );
        });

        it('throws when eventTopic has no library', async () => {
            await expect(
                action.validateStep?.(
                    {
                        ...makeValidateParams(libSource, STANDARD_MONO_ATTR),
                        trigger: {
                            synchronous: true,
                            eventAction: EventAction.RECORD_INIT,
                            eventTopic: {} as any,
                        },
                    },
                    ctx,
                ),
            ).rejects.toThrow(
                'ModifyAttributeAction can only be used with triggers that have a library in their event topic',
            );
        });

        it('resolves for a single-segment attributePath with valid trigger', async () => {
            await expect(
                action.validateStep?.(makeValidateParams(libSource, STANDARD_MONO_ATTR), ctx),
            ).resolves.toBeUndefined();
        });

        it('resolves for a valid two-segment path with ADVANCED_LINK intermediate attribute', async () => {
            await expect(
                action.validateStep?.(makeValidateParams(libSource, `${LINK_MONO_ATTR}.${TARGET_ATTR}`), ctx),
            ).resolves.toBeUndefined();
        });

        it('throws when an intermediate path segment is a standard (non-link) attribute type', async () => {
            await expect(
                action.validateStep?.(makeValidateParams(libSource, `${STANDARD_MONO_ATTR}.${TARGET_ATTR}`), ctx),
            ).rejects.toThrow(/must be of type simple_link, advanced_link or tree/);
        });

        it('throws when an intermediate attribute does not belong to the library', async () => {
            // TARGET_ATTR belongs to libTarget, not libSource → validateLibraryAttribute throws
            await expect(
                action.validateStep?.(makeValidateParams(libSource, `${TARGET_ATTR}.${TARGET_ATTR}`), ctx),
            ).rejects.toBeInstanceOf(ValidationError);
        });

        it('throws when attribute in path does not exists', async () => {
            await expect(
                action.validateStep?.(makeValidateParams(libSource, 'some_not_existing_attribute'), ctx),
            ).rejects.toBeInstanceOf(ValidationError);
        });

        it('throws when action is first in pipeline', async () => {
            await expect(
                action.validateStep?.(
                    pipelineStepValidation<ModifyAttributeActionParams>(
                        {
                            steps: [
                                {
                                    params: {attributePath: STANDARD_MONO_ATTR, mode: 'replace' as const},
                                    type: 'modifyAttribute',
                                },
                            ],
                            trigger: {
                                synchronous: true,
                                eventAction: EventAction.RECORD_INIT,
                                eventTopic: {library: libSource} as any,
                            },
                        },
                        0,
                    ),
                    ctx,
                ),
            ).rejects.toThrow('ModifyAttributeAction cannot be used in the first step of a pipeline');
        });
    });

    describe('execute — throws when no record in eventTopic', () => {
        it('throws when eventTopic has no record', async () => {
            const state: IAutomationPipelineExecutionState = {
                trigger: {
                    synchronous: true,
                    eventAction: EventAction.RECORD_INIT,
                    eventTopic: {} as any,
                },
                results: {},
                startDateMs: Date.now(),
                stepIndex: 0,
            };

            await expect(
                action.execute({attributePath: STANDARD_MONO_ATTR, mode: 'replace'}, state, ctx),
            ).rejects.toThrow('ModifyAttributeAction requires a record in the event topic');
        });
    });

    describe('execute — STANDARD mono attribute (replace mode)', () => {
        it('sets value when no existing value', async () => {
            const record = await createRecord(libSource);
            const state = makeState(record.id, libSource, 'hello');

            await action.execute({attributePath: STANDARD_MONO_ATTR, mode: 'replace'}, state, ctx);

            const values = await valueDomain.getRecordFieldValue({
                library: libSource,
                record,
                attributePath: STANDARD_MONO_ATTR,
                ctx,
            });
            expect(values[0].payload).toBe('hello');
        });

        it('replaces an existing value', async () => {
            const record = await createRecord(libSource, [
                {
                    attribute: STANDARD_MONO_ATTR,
                    payload: 'initial',
                },
            ]);

            const state = makeState(record.id, libSource, 'updated');
            await action.execute({attributePath: STANDARD_MONO_ATTR, mode: 'replace'}, state, ctx);

            const values = await valueDomain.getRecordFieldValue({
                library: libSource,
                record,
                attributePath: STANDARD_MONO_ATTR,
                ctx,
            });
            expect(values[0].payload).toBe('updated');
        });

        it('should throw when state lastResult is not standard value', async () => {
            const record = await createRecord(libSource);
            const state = makeState(record.id, libSource, {unexpected: 'object'});

            await expect(
                action.execute({attributePath: STANDARD_MONO_ATTR, mode: 'replace'}, state, ctx),
            ).rejects.toThrow(/Invalid standard value/);
        });

        it('should throw when state lastResult is not expected format', async () => {
            const record = await createRecord(libSource);
            const state = makeState(record.id, libSource, 42);

            await expect(
                action.execute({attributePath: STANDARD_MONO_ATTR, mode: 'replace'}, state, ctx),
            ).rejects.toThrow(/Errors occurred while saving values/);
        });

        it('returns CONTINUE with nbRecordsUpdated: 1', async () => {
            const record = await createRecord(libSource);
            const state = makeState(record.id, libSource, 'value');

            const result = await action.execute({attributePath: STANDARD_MONO_ATTR, mode: 'replace'}, state, ctx);

            expect(result).toEqual({
                status: ActionExecutionResultStatus.CONTINUE,
                result: {nbRecordsUpdated: 1},
            });
        });
    });

    describe('execute — STANDARD multi attribute', () => {
        it('replace mode — removes old values not in new set and adds new ones', async () => {
            const record = await createRecord(libSource, [
                {attribute: STANDARD_MULTI_ATTR, payload: 'A'},
                {attribute: STANDARD_MULTI_ATTR, payload: 'B'},
            ]);

            const state = makeState(record.id, libSource, ['B', 'C']);
            await action.execute({attributePath: STANDARD_MULTI_ATTR, mode: 'replace'}, state, ctx);

            const values = await valueDomain.getRecordFieldValue({
                library: libSource,
                record,
                attributePath: STANDARD_MULTI_ATTR,
                ctx,
            });
            expect(values.map(v => v.payload).sort()).toEqual(['B', 'C']);
        });

        it('replace mode — does not re-add an already-present value', async () => {
            const record = await createRecord(libSource, [{attribute: STANDARD_MULTI_ATTR, payload: 'A'}]);

            const state = makeState(record.id, libSource, ['A']);
            await action.execute({attributePath: STANDARD_MULTI_ATTR, mode: 'replace'}, state, ctx);

            const values = await valueDomain.getRecordFieldValue({
                library: libSource,
                record,
                attributePath: STANDARD_MULTI_ATTR,
                ctx,
            });
            expect(values).toHaveLength(1);
            expect(values[0].payload).toBe('A');
        });

        it('replace mode — returns nbRecordsUpdated: 0 when all values are already present', async () => {
            const record = await createRecord(libSource, [{attribute: STANDARD_MULTI_ATTR, payload: 'A'}]);

            const state = makeState(record.id, libSource, ['A']);
            const result = await action.execute({attributePath: STANDARD_MULTI_ATTR, mode: 'replace'}, state, ctx);

            expect(result).toEqual({
                status: ActionExecutionResultStatus.CONTINUE,
                result: {nbRecordsUpdated: 0},
            });
        });

        it('add mode — keeps existing values and appends new ones', async () => {
            const record = await createRecord(libSource, [
                {attribute: STANDARD_MULTI_ATTR, payload: 'A'},
                {attribute: STANDARD_MULTI_ATTR, payload: 'B'},
            ]);

            const state = makeState(record.id, libSource, ['C']);
            await action.execute({attributePath: STANDARD_MULTI_ATTR, mode: 'add'}, state, ctx);

            const values = await valueDomain.getRecordFieldValue({
                library: libSource,
                record,
                attributePath: STANDARD_MULTI_ATTR,
                ctx,
            });
            expect(values.map(v => v.payload).sort()).toEqual(['A', 'B', 'C']);
        });
    });

    describe('execute — ADVANCED_LINK mono attribute', () => {
        it('sets a link value', async () => {
            const record = await createRecord(libSource);
            const state = makeState(record.id, libSource, [{id: targetRecord1.id, library: libTarget}]);

            await action.execute({attributePath: LINK_MONO_ATTR, mode: 'replace'}, state, ctx);

            const values = await valueDomain.getRecordFieldValue({
                library: libSource,
                record,
                attributePath: LINK_MONO_ATTR,
                ctx,
            });
            expect(values[0].payload).toMatchObject({id: targetRecord1.id});
        });

        it('replaces an existing link value', async () => {
            const record = await createRecord(libSource, [{attribute: LINK_MONO_ATTR, payload: targetRecord1.id}]);

            const state = makeState(record.id, libSource, [{id: targetRecord2.id, library: libTarget}]);
            await action.execute({attributePath: LINK_MONO_ATTR, mode: 'replace'}, state, ctx);

            const values = await valueDomain.getRecordFieldValue({
                library: libSource,
                record,
                attributePath: LINK_MONO_ATTR,
                ctx,
            });
            expect(values[0].payload).toMatchObject({id: targetRecord2.id});
        });

        it('should throw when state lastResult is not record value', async () => {
            const record = await createRecord(libSource);
            const state = makeState(record.id, libSource, 'not a record value');

            await expect(action.execute({attributePath: LINK_MONO_ATTR, mode: 'replace'}, state, ctx)).rejects.toThrow(
                /Invalid record value/,
            );
        });
    });

    describe('execute — ADVANCED_LINK multi attribute (replace mode)', () => {
        it('removes old links not in new set and adds new ones', async () => {
            const record = await createRecord(libSource, [{attribute: LINK_MULTI_ATTR, payload: targetRecord1.id}]);

            const state = makeState(record.id, libSource, [{id: targetRecord2.id, library: libTarget}]);
            await action.execute({attributePath: LINK_MULTI_ATTR, mode: 'replace'}, state, ctx);

            const values = await valueDomain.getRecordFieldValue({
                library: libSource,
                record,
                attributePath: LINK_MULTI_ATTR,
                ctx,
            });
            expect(values).toHaveLength(1);
            expect(values[0].payload).toMatchObject({id: targetRecord2.id});
        });

        it('does not re-add an already-present link', async () => {
            const record = await createRecord(libSource, [{attribute: LINK_MULTI_ATTR, payload: targetRecord1.id}]);

            const state = makeState(record.id, libSource, [{id: targetRecord1.id, library: libTarget}]);
            await action.execute({attributePath: LINK_MULTI_ATTR, mode: 'replace'}, state, ctx);

            const values = await valueDomain.getRecordFieldValue({
                library: libSource,
                record,
                attributePath: LINK_MULTI_ATTR,
                ctx,
            });
            expect(values).toHaveLength(1);
            expect(values[0].payload).toMatchObject({id: targetRecord1.id});
        });
    });

    describe('execute — ADVANCED_LINK multi attribute (add mode)', () => {
        it('appends new links without removing existing ones', async () => {
            const record = await createRecord(libSource, [{attribute: LINK_MULTI_ATTR, payload: targetRecord1.id}]);

            const state = makeState(record.id, libSource, [{id: targetRecord2.id, library: libTarget}]);
            await action.execute({attributePath: LINK_MULTI_ATTR, mode: 'add'}, state, ctx);

            const values = await valueDomain.getRecordFieldValue({
                library: libSource,
                record,
                attributePath: LINK_MULTI_ATTR,
                ctx,
            });
            expect(values).toHaveLength(2);
            expect(values.map(v => v.payload.id).sort()).toEqual([targetRecord1.id, targetRecord2.id].sort());
        });

        it('does not re-add an already-present link', async () => {
            const record = await createRecord(libSource, [{attribute: LINK_MULTI_ATTR, payload: targetRecord1.id}]);

            const state = makeState(record.id, libSource, [{id: targetRecord1.id, library: libTarget}]);
            await action.execute({attributePath: LINK_MULTI_ATTR, mode: 'add'}, state, ctx);

            const values = await valueDomain.getRecordFieldValue({
                library: libSource,
                record,
                attributePath: LINK_MULTI_ATTR,
                ctx,
            });
            expect(values).toHaveLength(1);
            expect(values[0].payload).toMatchObject({id: targetRecord1.id});
        });
    });

    describe('execute — path traversal via ADVANCED_LINK', () => {
        let linkSourceRecord: IRecord;

        beforeAll(async () => {
            linkSourceRecord = await createRecord(libSource);

            // Pre-link linkSourceRecord → targetRecord1 (used in path traversal tests)
            await valueDomain.saveValueBatch({
                library: libSource,
                recordId: linkSourceRecord.id,
                values: [{attribute: LINK_MONO_ATTR, payload: targetRecord1.id}],
                skipPermission: true,
                ctx,
            });
        });

        it('sets an attribute on the linked record', async () => {
            const state = makeState(linkSourceRecord.id, libSource, 'traversed');

            await action.execute({attributePath: `${LINK_MONO_ATTR}.${TARGET_ATTR}`, mode: 'replace'}, state, ctx);

            const values = await valueDomain.getRecordFieldValue({
                library: libTarget,
                record: targetRecord1,
                attributePath: TARGET_ATTR,
                ctx,
            });
            expect(values[0].payload).toBe('traversed');
        });

        it('returns CONTINUE without result when path traversal leads to no records', async () => {
            const emptyLinkRecord = await createRecord(libSource);
            const state = makeState(emptyLinkRecord.id, libSource, 'value');

            const result = await action.execute(
                {attributePath: `${LINK_MONO_ATTR}.${TARGET_ATTR}`, mode: 'replace'},
                state,
                ctx,
            );

            expect(result).toEqual({status: ActionExecutionResultStatus.CONTINUE});
        });
    });

    describe('execute — error cases', () => {
        it('throws when providing multiple values for a mono attribute', async () => {
            const record = await createRecord(libSource);
            const state = makeState(record.id, libSource, ['A', 'B']);

            await expect(
                action.execute({attributePath: STANDARD_MONO_ATTR, mode: 'replace'}, state, ctx),
            ).rejects.toThrow('Multiple values not allowed');
        });

        it('throws when using a STANDARD attribute as an intermediate path segment', async () => {
            const record = await createRecord(libSource);
            const state = makeState(record.id, libSource, 'value');

            await expect(
                action.execute({attributePath: `${STANDARD_MONO_ATTR}.${TARGET_ATTR}`, mode: 'replace'}, state, ctx),
            ).rejects.toThrow('not supported');
        });
    });
});
