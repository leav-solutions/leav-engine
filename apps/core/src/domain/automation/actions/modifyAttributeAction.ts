// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {z} from 'zod';
import {logger} from '@leav/logger';
import {ActionExecutionResultStatus, AutomationRuleActions, type IAutomationAction} from './_types';
import {type ISaveBatchValueError, type IValueDomain} from '../../value/valueDomain';
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type IRecord} from '../../../_types/record';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {AttributeTypes, type IAttribute} from '../../../_types/attribute';
import {
    type ISaveValue,
    type ILinkValue,
    type ITreeValue,
    type IValue,
    type ISaveStandardValue,
    type ISaveLinkValue,
    type ISaveTreeValue,
} from '../../../_types/value';
import _ from 'lodash';

const modifyAttributeActionParamsSchema = z.object({
    attributePath: z.string().meta({
        title: 'Attribute path',
        description: 'The path of the attribute to modify when this action is executed.',
    }),
    mode: z.enum(['replace', 'add']).meta({
        title: 'Modification mode',
        description:
            'The mode of modification to apply to the attribute. "replace" will replace the current value, "add" will add the new value at the end of the current value.',
    }),
});

export type ModifyAttributeActionParams = z.infer<typeof modifyAttributeActionParamsSchema>;

const recordSchema = z.object(
    {
        id: z.string(),
    },
    {
        error: issue => `Invalid record value: ${JSON.stringify(issue.input)}`,
    },
);
const treeNodeSchema = z.object(
    {
        id: z.string(),
    },
    {
        error: issue => `Invalid tree node value: ${JSON.stringify(issue.input)}`,
    },
);
const standardValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null(), z.undefined()], {
    error: issue => `Invalid standard value: ${JSON.stringify(issue.input)}`,
});

const linkValuesSchema = z.array(recordSchema);
const treeValuesSchema = z.array(treeNodeSchema);
const standardValuesSchema = z.array(standardValueSchema);

interface IAbstractValuesToSave<P = IValue['payload']> {
    payloads: P[];
    comparePayloads: (payload1: P, payload2: P) => boolean;
    toSaveValue: (payload: P | null, idValue?: string) => ISaveValue;
}

interface IDeps {
    'core.domain.value': IValueDomain;
    'core.domain.attribute': IAttributeDomain;
}

export default function ({
    'core.domain.value': valueDomain,
    'core.domain.attribute': attributeDomain,
}: IDeps): IAutomationAction<ModifyAttributeActionParams> {
    const _getTargetRecords = async (record: IRecord, attributes: string[], ctx: IQueryInfos): Promise<IRecord[]> => {
        if (!attributes.length) {
            return [record];
        }

        const attributeProps = await attributeDomain.getAttributeProperties({id: attributes[0], ctx});

        switch (attributeProps.type) {
            case AttributeTypes.SIMPLE_LINK:
            case AttributeTypes.ADVANCED_LINK: {
                const linkValues: ILinkValue[] = await valueDomain.getRecordFieldValue({
                    library: record.library,
                    record,
                    attributeId: attributeProps.id,
                    ctx,
                });
                return (
                    await Promise.all(
                        linkValues.map(async el => {
                            if (el && el.payload) {
                                return _getTargetRecords(el.payload, attributes.slice(1), ctx);
                            }
                            return null;
                        }),
                    ).then(res => res.filter(r => r !== null))
                ).flat();
            }
            case AttributeTypes.TREE: {
                const treeValues: ITreeValue[] = (await valueDomain.getRecordFieldValue({
                    library: record.library,
                    record,
                    attributeId: attributeProps.id,
                    ctx,
                })) as ITreeValue[];
                return (
                    await Promise.all(
                        treeValues.map(async el => {
                            if (el && el.payload) {
                                return _getTargetRecords(el.payload.record, attributes.slice(1), ctx);
                            }
                            return null;
                        }),
                    ).then(res => res.filter(r => r !== null))
                ).flat();
            }
            default:
                throw new Error(
                    `Attribute type ${attributeProps.type} not supported for replaceAnotherAttribute action`,
                );
        }
    };

    const _preparePayloadForMonoValue = async (
        targetAttributeProps: IAttribute,
        targetRecord: IRecord,
        valuesToSave: IAbstractValuesToSave,
        ctx: IQueryInfos,
    ): Promise<{valuesToAdd: ISaveValue[]; valuesToRemove: ISaveValue[]}> => {
        const currentRecordValues =
            targetAttributeProps.type === AttributeTypes.ADVANCED ||
            targetAttributeProps.type === AttributeTypes.ADVANCED_LINK ||
            targetAttributeProps.type === AttributeTypes.TREE
                ? await valueDomain.getValues({
                      recordId: targetRecord.id,
                      library: targetRecord.library,
                      attribute: targetAttributeProps.id,
                      ctx,
                  })
                : [];

        const [idValueToReuse] = currentRecordValues;

        // If an existing value exists, then reuse existing id_value to avoid delete/add when not needed
        const valuesToAddOrReplace: ISaveValue[] = [
            valuesToSave.toSaveValue(valuesToSave.payloads[0], idValueToReuse?.id_value),
        ];

        return {valuesToAdd: valuesToAddOrReplace, valuesToRemove: []};
    };

    const _preparePayloadForMultipleValues = async (
        targetAttributeProps: IAttribute,
        targetRecord: IRecord,
        valuesToSave: IAbstractValuesToSave,
        mode: 'add' | 'replace',
        ctx: IQueryInfos,
    ): Promise<{valuesToAdd: ISaveValue[]; valuesToRemove: ISaveValue[]}> => {
        const currentRecordValues = await valueDomain.getValues({
            recordId: targetRecord.id,
            library: targetRecord.library,
            attribute: targetAttributeProps.id,
            ctx,
        });

        const valuesToAdd: ISaveValue[] = valuesToSave.payloads
            .filter(newValuePayload =>
                currentRecordValues.every(
                    (recordValue: IValue) => !valuesToSave.comparePayloads(recordValue.payload, newValuePayload),
                ),
            )
            .map(newValuePayload => valuesToSave.toSaveValue(newValuePayload));

        // In replace mode, we want to remove the values that are not in the new values list anymore
        const valuesToRemove: ISaveValue[] =
            mode === 'replace'
                ? currentRecordValues
                      .filter(
                          (recordValue: IValue) =>
                              !valuesToSave.payloads.some(newValuePayload =>
                                  valuesToSave.comparePayloads(recordValue.payload, newValuePayload),
                              ),
                      )
                      .map((recordValue: IValue) => valuesToSave.toSaveValue(null, recordValue.id_value))
                : [];

        return {valuesToAdd, valuesToRemove};
    };

    const _buildStandardValuesToSave = <P extends z.infer<typeof standardValueSchema>>(
        targetAttributeProps: IAttribute,
        valueToSetRaw: unknown,
    ): IAbstractValuesToSave => ({
        payloads: standardValuesSchema.parse(valueToSetRaw),
        toSaveValue: (payload?: P, idValue?: string): ISaveStandardValue => ({
            payload: payload ?? null,
            attribute: targetAttributeProps.id,
            id_value: idValue ?? null,
        }),
        comparePayloads: (payload1: P, payload2: P) => payload1 === payload2,
    });
    const _buildLinkValuesToSave = <P extends z.infer<typeof recordSchema>>(
        targetAttributeProps: IAttribute,
        valueToSetRaw: unknown,
    ): IAbstractValuesToSave => ({
        payloads: linkValuesSchema.parse(valueToSetRaw),
        toSaveValue: (payload?: P, idValue?: string): ISaveLinkValue => ({
            payload: payload?.id ?? null,
            attribute: targetAttributeProps.id,
            id_value: idValue ?? null,
        }),
        comparePayloads: (payload1: P, payload2: P) => payload1?.id === payload2?.id,
    });
    const _buildTreeValuesToSave = <P extends z.infer<typeof treeNodeSchema>>(
        targetAttributeProps: IAttribute,
        valueToSetRaw: unknown,
    ): IAbstractValuesToSave => ({
        payloads: treeValuesSchema.parse(valueToSetRaw),
        toSaveValue: (payload?: P, idValue?: string): ISaveTreeValue => ({
            payload: payload?.id ?? null,
            attribute: targetAttributeProps.id,
            id_value: idValue ?? null,
        }),
        comparePayloads: (payload1: P, payload2: P) => payload1?.id === payload2?.id,
    });

    const _buildValuesToSave = (targetAttributeProps: IAttribute, valueToSetRaw: unknown): IAbstractValuesToSave => {
        const valueToSetRawArray: unknown[] = Array.isArray(valueToSetRaw) ? valueToSetRaw : [valueToSetRaw];
        if (!targetAttributeProps.multiple_values && valueToSetRawArray.length > 1) {
            throw new Error(
                `Multiple values not allowed for attribute ${targetAttributeProps.id}. Got ${valueToSetRawArray.length} values.`,
            );
        }

        switch (targetAttributeProps.type) {
            case AttributeTypes.SIMPLE:
            case AttributeTypes.ADVANCED:
                return _buildStandardValuesToSave(targetAttributeProps, valueToSetRawArray);
            case AttributeTypes.SIMPLE_LINK:
            case AttributeTypes.ADVANCED_LINK:
                return _buildLinkValuesToSave(targetAttributeProps, valueToSetRawArray);
            case AttributeTypes.TREE:
                return _buildTreeValuesToSave(targetAttributeProps, valueToSetRawArray);
            default:
                throw new Error(`Unsupported attribute type ${targetAttributeProps.type}`);
        }
    };

    return {
        type: AutomationRuleActions.MODIFY_ATTRIBUTE,
        paramsSchema: modifyAttributeActionParamsSchema,
        async execute(params, state, ctx) {
            if (state.trigger.eventTopic.record == null) {
                throw new Error('ModifyAttributeAction requires a record in the event topic');
            }

            const valueToSetRaw: unknown = state.lastResult; // The value to set is the result of the previous step in the pipeline
            const currentRecord: IRecord = {
                id: state.trigger.eventTopic.record.id,
                library: state.trigger.eventTopic.record.libraryId,
            };

            const attributeIdsPath = params.attributePath.split('.');
            const targetRecordPath = attributeIdsPath.slice(0, -1);
            const targetAttributeId = attributeIdsPath[attributeIdsPath.length - 1];

            const targetAttributeProps = await attributeDomain.getAttributeProperties({id: targetAttributeId, ctx});
            const valuesToSet = _buildValuesToSave(targetAttributeProps, valueToSetRaw);

            const targetRecords = _.uniqBy(await _getTargetRecords(currentRecord, targetRecordPath, ctx), r => r.id);
            if (targetRecords.length === 0) {
                logger.debug(
                    `[ModifyAttributeAction] No target record found with attributePath ${params.attributePath} and currentRecord ${currentRecord.library}/${currentRecord.id}`,
                );
                return {status: ActionExecutionResultStatus.CONTINUE};
            }

            logger.debug(`[ModifyAttributeAction] Target records resolved on library ${targetRecords[0].library}`, {
                targetRecords: targetRecords.map(r => r.id),
            });

            const errors: Record<string, ISaveBatchValueError[]> = {};
            let nbRecordsUpdated = 0;
            await Promise.all(
                targetRecords.map(async targetRecord => {
                    const {valuesToAdd, valuesToRemove} = targetAttributeProps.multiple_values
                        ? await _preparePayloadForMultipleValues(
                              targetAttributeProps,
                              targetRecord,
                              valuesToSet,
                              params.mode,
                              ctx,
                          )
                        : await _preparePayloadForMonoValue(targetAttributeProps, targetRecord, valuesToSet, ctx);

                    if (valuesToAdd.length === 0 && valuesToRemove.length === 0) {
                        logger.debug(
                            `[ModifyAttributeAction] No changes detected for ${targetAttributeProps.type} ${targetAttributeProps.multiple_values ? 'multiple' : 'mono'} values on attribute ${targetAttributeId} for record ${targetRecord.id}`,
                        );
                        return;
                    }
                    logger.debug(
                        `[ModifyAttributeAction] Saving ${targetAttributeProps.type} ${targetAttributeProps.multiple_values ? 'multiple' : 'mono'} values on attribute ${targetAttributeId} for record ${targetRecord.id}`,
                        {
                            payloadToAdd: valuesToAdd.map(v => v.payload),
                            idValuesToRemove: valuesToRemove.map(v => v.id_value),
                        },
                    );

                    const res = await valueDomain.saveValueBatch({
                        recordId: targetRecord.id,
                        library: targetRecord.library,
                        values: [...valuesToRemove, ...valuesToAdd],
                        skipPermission: true,
                        ctx,
                    });
                    if (res.errors?.length) {
                        res.errors.forEach(error => {
                            logger.error(
                                `[ModifyAttributeAction] Error saving ${targetAttributeProps.type} values on attribute ${targetAttributeId} for record ${targetRecord.id}: ${error.message}`,
                            );
                        });
                        errors[targetRecord.id] = res.errors;
                    } else {
                        nbRecordsUpdated++;
                    }
                }),
            );

            if (Object.keys(errors).length) {
                throw new Error('Errors occurred while saving values', {
                    cause: errors,
                });
            }

            return {
                status: ActionExecutionResultStatus.CONTINUE,
                result: {nbRecordsUpdated},
            };
        },
    };
}
