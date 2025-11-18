// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordAttributePermissionsActions} from '../../../_types/permissions';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IRecord} from '../../../_types/record';
import {AttributeTypes, type IAttribute} from '../../../_types/attribute';
import ValidationError from '../../../errors/ValidationError';
import {Errors} from '../../../_types/errors';
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type IStandardValue, type IValue, type IValuesOptions} from '../../../_types/value';
import {ActionsListEvents} from '../../../_types/actionsList';
import {type IRecordAttributePermissionDomain} from '../../permission/recordAttributePermissionDomain';
import {type IValueDomain} from '../../value/valueDomain';

// FIXME: GetRecordFieldValue should be in value domain

/**
 * Get the value of targeted attribute with actions applied on it including metadata.
 *
 * Avoid requesting DB if attribute already found in `record` param.
 *
 * @param {Object} params
 * @param params.library
 * @param params.record Could be emulated with only `{ id: <real_id> }`
 * @param params.attributeId
 * @param params.options
 * @param params.ctx
 */
export type GetRecordFieldValueHelper = ({
    library,
    record,
    attributeId,
    options,
    ctx,
}: {
    library: string;
    record: IRecord;
    attributeId: string;
    options?: IValuesOptions;
    ctx: IQueryInfos;
}) => Promise<IValue[]>;

export interface IGetRecordFieldValueHelperDeps {
    'core.domain.attribute': IAttributeDomain;
    'core.domain.value': IValueDomain;
    'core.domain.permission.recordAttribute': IRecordAttributePermissionDomain;
}

export default function ({
    'core.domain.attribute': attributeDomain,
    'core.domain.value': valueDomain,
    'core.domain.permission.recordAttribute': recordAttributePermissionDomain,
}: IGetRecordFieldValueHelperDeps): GetRecordFieldValueHelper {
    /**
     * Extract value from record if it's available (attribute simple), or fetch it from DB
     *
     * @param record
     * @param attribute
     * @param library
     * @param options
     * @param ctx
     */
    const _extractRecordValue = async (
        record: IRecord,
        attribute: IAttribute,
        library: string,
        options: IValuesOptions,
        ctx: IQueryInfos,
    ): Promise<IValue[]> => {
        let values: IValue[];

        if (attribute.id && typeof record[attribute.id] !== 'undefined') {
            // Format attribute field into simple value
            values = [
                {
                    payload:
                        attribute.type === AttributeTypes.SIMPLE_LINK && typeof record[attribute.id] === 'string'
                            ? {id: record[attribute.id]}
                            : record[attribute.id],
                },
            ];

            // Apply actionsList
            values = await valueDomain.runActionsList({
                listName: ActionsListEvents.GET_VALUE,
                values,
                attribute,
                record,
                library,
                ctx,
            });
        } else {
            values = await valueDomain.getValues({
                library,
                recordId: record.id,
                attribute: attribute.id,
                options,
                ctx,
            });
        }

        return values;
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
            ctx.userId,
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

        const hasNoValue = values.length === 0;
        if (hasNoValue) {
            values = [
                {
                    payload: null,
                },
            ];
        }

        let formattedValues = await Promise.all(
            values.map(async v => {
                const formattedValue = await valueDomain.formatValue({
                    attribute: attrProps,
                    value: v,
                    record,
                    library,
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

                        const computedMetadata = await valueDomain.runActionsList({
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

        // sort of flatMap cause _formatRecordValue can return multiple values for 1 input val (think heritage)
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

        if (hasNoValue) {
            // remove null values or values that do not represent a record
            formattedValues = formattedValues.filter(
                v =>
                    v.payload !== null &&
                    typeof v.payload !== 'undefined' &&
                    typeof v.payload === 'object' &&
                    v.payload.hasOwnProperty('id') &&
                    v.payload.hasOwnProperty('library'),
            );
        }

        return formattedValues;
    };
}
