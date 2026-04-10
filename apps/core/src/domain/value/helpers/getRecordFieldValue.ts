// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ILogger} from '@leav/logger';
import {type IActionsListDomain} from '../../actionsList/actionsListDomain';
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type IRecordAttributePermissionDomain} from '../../permission/recordAttributePermissionDomain';
import {type GetValuesHelper} from './getValues';
import {type IRecordRepo} from '../../../infra/record/recordRepo';
import {type IUtils} from '../../../utils/utils';
import {ActionsListEvents} from '../../../_types/actionsList';
import {AttributeTypes, type IAttribute} from '../../../_types/attribute';
import {Errors, ErrorTypes} from '../../../_types/errors';
import {RecordAttributePermissionsActions} from '../../../_types/permissions';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IRecord} from '../../../_types/record';
import {type IStandardValue, type IValue, type IValuesOptions} from '../../../_types/value';
import ValidationError from '../../../errors/ValidationError';

export type GetRecordFieldValueHelper = (params: {
    library: string;
    record: IRecord;
    attributeId: string;
    options?: IValuesOptions;
    ctx: IQueryInfos;
}) => Promise<IValue[]>;

export interface IGetRecordFieldValueHelperDeps {
    'core.domain.attribute': IAttributeDomain;
    'core.domain.permission.recordAttribute': IRecordAttributePermissionDomain;
    'core.domain.value.helpers.getValues': GetValuesHelper;
    'core.domain.actionsList': IActionsListDomain;
    'core.infra.record': IRecordRepo;
    'core.utils': IUtils;
    'core.utils.logger': ILogger;
}

export default function ({
    'core.domain.attribute': attributeDomain,
    'core.domain.permission.recordAttribute': recordAttributePermissionDomain,
    'core.domain.value.helpers.getValues': getValuesHelper,
    'core.domain.actionsList': actionsListDomain,
    'core.infra.record': recordRepo,
    'core.utils': utils,
    'core.utils.logger': logger,
}: IGetRecordFieldValueHelperDeps): GetRecordFieldValueHelper {
    const _runActionsList = async ({
        listName,
        values,
        attribute,
        record,
        library,
        ctx,
    }: {
        listName: ActionsListEvents;
        values: IValue[];
        attribute: IAttribute;
        record?: IRecord;
        library: string;
        ctx: IQueryInfos;
    }): Promise<IValue[]> => {
        const valuesToProcess = utils.isStandardAttribute(attribute)
            ? values.map(value => ({...value, raw_payload: value.payload}))
            : values;

        try {
            const processedValues =
                !!attribute.actions_list?.[listName] && values !== null
                    ? await actionsListDomain.runActionsList(attribute.actions_list[listName], valuesToProcess, {
                          ...ctx,
                          attribute,
                          recordId: record?.id,
                          library,
                          actionEvent: listName,
                      })
                    : valuesToProcess;
            return processedValues;
        } catch (e) {
            if (e.type === ErrorTypes.VALIDATION_ERROR) {
                e.context = {
                    attribute: attribute.id,
                    values,
                    recordId: record?.id,
                };
            }
            throw e;
        }
    };

    const _formatValue = async ({
        attribute,
        value,
        ctx,
    }: {
        attribute: IAttribute;
        value: IValue;
        ctx: IQueryInfos;
    }): Promise<IValue> => {
        let processedValue = {...value}; // Don't mutate given value

        if (utils.isLinkAttribute(attribute)) {
            const linkValue = processedValue.payload
                ? {...processedValue.payload, library: processedValue.payload.library ?? attribute.linked_library}
                : null;
            processedValue = {...value, payload: linkValue};
        }

        processedValue.attribute = attribute.id;

        // Format metadata values as well
        if ((attribute.metadata_fields ?? []).length) {
            const metadataValuesFormatted = await attribute.metadata_fields.reduce(
                async (allValuesProm, metadataField) => {
                    const allValues = await allValuesProm;
                    try {
                        const metadataAttributeProps = await attributeDomain.getAttributeProperties({
                            id: metadataField,
                            ctx,
                        });

                        allValues[metadataField] =
                            typeof value.metadata?.[metadataField] !== 'undefined'
                                ? await _formatValue({
                                      attribute: metadataAttributeProps,
                                      value: {payload: value.metadata?.[metadataField]},
                                      ctx,
                                  })
                                : null;
                    } catch (err) {
                        logger.error(`Error formatting metadata field ${metadataField} : ${err.stack}`);
                        allValues[metadataField] = null;
                    }

                    return allValues;
                },
                Promise.resolve({}),
            );
            processedValue.metadata = metadataValuesFormatted;
        }

        return processedValue;
    };

    const _extractRecordValue = async (
        record: IRecord,
        attribute: IAttribute,
        library: string,
        options: IValuesOptions,
        ctx: IQueryInfos,
    ): Promise<IValue[]> => {
        if (attribute.id && typeof record[attribute.id] !== 'undefined') {
            let values: IValue[];

            if (attribute.type === AttributeTypes.SIMPLE_LINK && typeof record[attribute.id] === 'string') {
                const linkedRecord = await recordRepo.getRecord({
                    libraryId: attribute.linked_library,
                    recordId: record[attribute.id],
                    ctx,
                });

                if (linkedRecord === null) {
                    values = [];
                    logger.warn(
                        `[ValueDomain] Unable to find record for library ${attribute.linked_library} and record ${record[attribute.id]}`,
                    );
                } else {
                    values = [{payload: {id: record[attribute.id]}}];
                }
            } else {
                values = [{payload: record[attribute.id]}];
            }

            return _runActionsList({
                listName: ActionsListEvents.GET_VALUE,
                values,
                attribute,
                record,
                library,
                ctx,
            });
        } else {
            return getValuesHelper({
                library,
                recordId: record.id,
                attribute: attribute.id,
                options,
                ctx,
            });
        }
    };

    return async ({library, record, attributeId, options, ctx}) => {
        const libraryAttributes = await attributeDomain.getLibraryAttributes(library, ctx);

        if (!libraryAttributes.map(a => a.id).includes(attributeId)) {
            throw new ValidationError({
                [attributeId]: {msg: Errors.INVALID_ATTRIBUTE_FOR_LIBRARY, vars: {attribute: attributeId, library}},
            });
        }

        const perm = await recordAttributePermissionDomain.getRecordAttributePermission(
            RecordAttributePermissionsActions.ACCESS_ATTRIBUTE,
            attributeId,
            library,
            record.id,
            ctx,
        );

        if (!perm) {
            return [];
        }

        const attrProps = await attributeDomain.getAttributeProperties({id: attributeId, ctx});
        let values = await _extractRecordValue(record, attrProps, library, options, ctx);

        if (values.length === 0) {
            values = [
                {
                    payload: null,
                },
            ];
        }

        let formattedValues = await Promise.all(
            values.map(async v => {
                const formattedValue = await _formatValue({
                    attribute: attrProps,
                    value: v,
                    ctx,
                });

                if (attrProps.metadata_fields && formattedValue.metadata) {
                    for (const metadataField of attrProps.metadata_fields) {
                        if (!formattedValue.metadata[metadataField]) {
                            continue;
                        }

                        const metadataAttributeProps = await attributeDomain.getAttributeProperties({
                            id: metadataField,
                            ctx,
                        });

                        const computedMetadata = await _runActionsList({
                            listName: ActionsListEvents.GET_VALUE,
                            attribute: metadataAttributeProps,
                            library,
                            values: [formattedValue.metadata[metadataField] as IStandardValue],
                            ctx,
                        });

                        formattedValue.metadata[metadataField] = computedMetadata[0];
                    }
                }

                return formattedValue;
            }),
        );

        // sort of flatMap cause _formatValue can return multiple values for 1 input val (think heritage)
        formattedValues = formattedValues.reduce((acc, v) => {
            if (Array.isArray(v.payload)) {
                acc = [
                    ...acc,
                    ...v.payload.map(vpart => ({
                        value: vpart,
                        attribute: v.attribute,
                    })),
                ];
            } else {
                acc.push(v);
            }
            return acc;
        }, []);

        // remove null values
        formattedValues = formattedValues.filter(v => v.payload !== null && typeof v.payload !== 'undefined');

        return formattedValues;
    };
}
