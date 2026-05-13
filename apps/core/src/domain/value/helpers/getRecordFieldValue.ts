import {type ILogger} from '@leav/logger';
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type IRecordAttributePermissionDomain} from '../../permission/recordAttributePermissionDomain';
import {type GetValuesHelper} from './getValues';
import {type IRecordRepo} from '../../../infra/record/recordRepo';
import {ActionsListEvents} from '../../../_types/actionsList';
import {AttributeTypes, type IAttribute} from '../../../_types/attribute';
import {Errors} from '../../../_types/errors';
import {RecordAttributePermissionsActions} from '../../../_types/permissions';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IRecord} from '../../../_types/record';
import {type IStandardValue, type IValue, type IValuesOptions} from '../../../_types/value';
import ValidationError from '../../../errors/ValidationError';
import {type FormatValueHelper} from './formatValue';
import {type RunActionsListHelper} from './runActionsList';

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
    'core.domain.value.helpers.runActionsList': RunActionsListHelper;
    'core.domain.value.helpers.formatValue': FormatValueHelper;
    'core.infra.record': IRecordRepo;
    'core.utils.logger': ILogger;
}

export default function ({
    'core.domain.attribute': attributeDomain,
    'core.domain.permission.recordAttribute': recordAttributePermissionDomain,
    'core.domain.value.helpers.getValues': getValuesHelper,
    'core.domain.value.helpers.runActionsList': runActionsListHelper,
    'core.domain.value.helpers.formatValue': formatValueHelper,
    'core.infra.record': recordRepo,
    'core.utils.logger': logger,
}: IGetRecordFieldValueHelperDeps): GetRecordFieldValueHelper {
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

            return runActionsListHelper({
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
                const formattedValue = await formatValueHelper({
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

                        const computedMetadata = await runActionsListHelper({
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
