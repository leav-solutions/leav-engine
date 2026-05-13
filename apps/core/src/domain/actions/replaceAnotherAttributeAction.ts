import _ from 'lodash';
import {logger} from '@leav/logger';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IRecord} from '../../_types/record';
import {type IStandardValue, type ILinkValue, type ITreeValue, type ISaveValue, type IValue} from '../../_types/value';
import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type IValueDomain} from '../value/valueDomain';
import {ActionsListIOTypes, type IActionsListFunction} from '../../_types/actionsList';
import {AttributeTypes} from '../../_types/attribute';
import {type IUtils} from '../../utils/utils';

interface IDeps {
    'core.domain.value'?: IValueDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.utils': IUtils;
}

export default function ({
    'core.domain.value': valueDomain,
    'core.domain.attribute': attributeDomain,
    'core.utils': utils,
}: IDeps): IActionsListFunction<{attributePath: true}> {
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

    return {
        id: 'replaceAnotherAttribute',
        name: 'Replace Another Attribute',
        description: 'Replace values in another attribute, may be preceded by a calculation to prepare values',
        input_types: [
            ActionsListIOTypes.STRING,
            ActionsListIOTypes.NUMBER,
            ActionsListIOTypes.OBJECT,
            ActionsListIOTypes.BOOLEAN,
        ],
        output_types: [
            ActionsListIOTypes.STRING,
            ActionsListIOTypes.NUMBER,
            ActionsListIOTypes.OBJECT,
            ActionsListIOTypes.BOOLEAN,
        ],
        compute: false,
        params: [
            {
                name: 'attributePath',
                type: 'string',
                description:
                    'Path to the attribute where to register the values: Ex: local_attribute or link_attribute.sub_attribute',
                required: true,
                helper_value: '',
            },
        ],
        action: async (values, params, ctx) => {
            const {attributePath} = params;

            if (!ctx.recordId || !ctx.library) {
                return {values, errors: []};
            }

            const attributeIdsPath = attributePath.split('.');
            const targetRecordPath = attributeIdsPath.slice(0, -1);
            const targetAttributeId = attributeIdsPath[attributeIdsPath.length - 1];
            const targetAttributeProps = await attributeDomain.getAttributeProperties({id: targetAttributeId, ctx});

            const targetRecords = _.uniqBy(
                await _getTargetRecords(
                    {
                        id: ctx.recordId,
                        library: ctx.library,
                    },
                    targetRecordPath,
                    ctx,
                ),
                r => r.id,
            );

            if (targetRecords.length === 0) {
                logger.debug(
                    `[replaceAnotherAttribute, ${ctx.actionEvent}] No target records found for record ${ctx.recordId} in library ${ctx.library} with path ${attributePath}`,
                );
                return {values, errors: []};
            }

            logger.debug(
                `[replaceAnotherAttribute, ${ctx.actionEvent}] Target records resolved on library ${targetRecords[0].library}`,
                {
                    targetRecords: targetRecords.map(r => r.id),
                },
            );

            const _preparePayloadToAdd = utils.isStandardAttribute(targetAttributeProps)
                ? (v1: IStandardValue) => v1.payload // string, number or boolean payload
                : (v1: ILinkValue) => v1.payload.id; // recordId or nodeId

            const _compareValuesPayload = utils.isStandardAttribute(targetAttributeProps)
                ? (v1: IStandardValue, v2: IStandardValue) => v1.payload === v2.payload // compare string, number or boolean payload
                : (v1: ITreeValue | ILinkValue, v2: ITreeValue | ILinkValue) => v1.payload.id === v2.payload.id; // compare nodeId or recordId

            const _replaceSingleValue = async (
                targetRecord: IRecord,
            ): Promise<{valuesToAdd: ISaveValue[]; valuesToRemove: ISaveValue[]}> => {
                const currentRecordValues =
                    targetAttributeProps.type === AttributeTypes.ADVANCED ||
                    targetAttributeProps.type === AttributeTypes.ADVANCED_LINK ||
                    targetAttributeProps.type === AttributeTypes.TREE
                        ? await valueDomain.getValues({
                              recordId: targetRecord.id,
                              library: targetRecord.library,
                              attribute: targetAttributeId,
                              ctx,
                          })
                        : [];

                const newValueToSet = values.length > 0 ? values[values.length - 1] : null;
                const [idValueToReuse] = currentRecordValues;

                // If an existing value exists, then reuse existing id_value to avoid delete/add when not needed
                const valuesToAddOrReplace: ISaveValue[] = [
                    {
                        id_value: idValueToReuse ? idValueToReuse.id_value : null,
                        payload: newValueToSet ? _preparePayloadToAdd(newValueToSet) : null,
                        attribute: targetAttributeId,
                    },
                ];

                return {valuesToAdd: valuesToAddOrReplace, valuesToRemove: []};
            };

            const _replaceMultipleValues = async (
                targetRecord: IRecord,
            ): Promise<{valuesToAdd: ISaveValue[]; valuesToRemove: ISaveValue[]}> => {
                const currentRecordValues = await valueDomain.getValues({
                    recordId: targetRecord.id,
                    library: targetRecord.library,
                    attribute: targetAttributeId,
                    ctx,
                });

                const missingNewValues = values.filter(
                    newValue =>
                        !currentRecordValues.some((recordValue: ITreeValue | ILinkValue) =>
                            _compareValuesPayload(recordValue, newValue),
                        ),
                );
                const removedCurrentValues = currentRecordValues.filter(
                    (recordValue: ITreeValue | ILinkValue) =>
                        !values.some(newValue => _compareValuesPayload(newValue, recordValue)),
                );

                const valuesToAdd: ISaveValue[] = missingNewValues.map(newValue => ({
                    payload: _preparePayloadToAdd(newValue),
                    attribute: targetAttributeId,
                }));
                const valuesToRemove: ISaveValue[] = removedCurrentValues.map(
                    (recordValue: ITreeValue | ILinkValue) => ({
                        payload: null,
                        id_value: recordValue.id_value,
                        attribute: targetAttributeId,
                    }),
                );

                return {valuesToAdd, valuesToRemove};
            };

            await Promise.all(
                targetRecords.map(async targetRecord => {
                    const {valuesToAdd, valuesToRemove} = targetAttributeProps.multiple_values
                        ? await _replaceMultipleValues(targetRecord)
                        : await _replaceSingleValue(targetRecord);

                    if (valuesToAdd.length === 0 && valuesToRemove.length === 0) {
                        logger.debug(
                            `[replaceAnotherAttribute, ${ctx.actionEvent}] No changes detected for ${targetAttributeProps.type} ${targetAttributeProps.multiple_values ? 'multiple' : 'mono'} values on attribute ${targetAttributeId} for record ${targetRecord.id}`,
                        );
                        return null;
                    }
                    logger.debug(
                        `[replaceAnotherAttribute, ${ctx.actionEvent}] Saving ${targetAttributeProps.type} ${targetAttributeProps.multiple_values ? 'multiple' : 'mono'} values on attribute ${targetAttributeId} for record ${targetRecord.id}`,
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
                    res.errors?.forEach(error => {
                        logger.error(
                            `[replaceAnotherAttribute, ${ctx.actionEvent}] Error saving ${targetAttributeProps.type} values on attribute ${targetAttributeId} for record ${targetRecord.id}: ${error.message}`,
                        );
                    });
                    return res;
                }),
            );

            return {values, errors: []};
        },
    };
}
