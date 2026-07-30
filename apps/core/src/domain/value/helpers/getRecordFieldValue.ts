import {type ILogger} from '@leav/logger';
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type IRecordAttributePermissionDomain} from '../../permission/recordAttributePermissionDomain';
import {type GetValuesHelper} from './getValues';
import {type IRecordRepo} from '../../../infra/record/recordRepo';
import {ActionsListEvents} from '../../../_types/actionsList';
import {AttributeFormats, AttributeTypes, type IAttribute} from '../../../_types/attribute';
import {Errors} from '../../../_types/errors';
import {RecordAttributePermissionsActions} from '../../../_types/permissions';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IRecord} from '../../../_types/record';
import {
    type ILinkValue,
    type IStandardValue,
    type ITreeValue,
    type IValue,
    type IValuesOptions,
} from '../../../_types/value';
import ValidationError from '../../../errors/ValidationError';
import {type FormatValueHelper} from './formatValue';
import {type RunActionsListHelper} from './runActionsList';

export type GetRecordFieldValueHelper = (params: {
    library: string;
    record: IRecord;
    /**
     * Attribute to read, optionally as a dotted path to traverse links and extended attributes.
     * Ex: `"created_by"`, `"created_by.login"`, `"bikes_shop.shops_label"`.
     */
    attributePath: string;
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

    const _assertAttributeInLibrary = async (attributeId: string, library: string, ctx: IQueryInfos): Promise<void> => {
        const libraryAttributes = await attributeDomain.getLibraryAttributes(library, ctx);

        if (!libraryAttributes.map(a => a.id).includes(attributeId)) {
            throw new ValidationError({
                [attributeId]: {msg: Errors.INVALID_ATTRIBUTE_FOR_LIBRARY, vars: {attribute: attributeId, library}},
            });
        }
    };

    const _hasReadPermission = (attributeId: string, library: string, recordId: string, ctx: IQueryInfos) =>
        recordAttributePermissionDomain.getRecordAttributePermission(
            RecordAttributePermissionsActions.ACCESS_ATTRIBUTE,
            attributeId,
            library,
            recordId,
            ctx,
        );

    // Format a single value and compute its metadata fields (running their GET_VALUE actions).
    const _formatValueWithMetadata = async (
        value: IValue,
        attribute: IAttribute,
        library: string,
        ctx: IQueryInfos,
    ): Promise<IValue> => {
        const formattedValue = await formatValueHelper({attribute, value, ctx});

        if (attribute.metadata_fields && formattedValue.metadata) {
            for (const metadataField of attribute.metadata_fields) {
                if (!formattedValue.metadata[metadataField]) {
                    continue;
                }

                const metadataAttributeProps = await attributeDomain.getAttributeProperties({id: metadataField, ctx});

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
    };

    // Resolve, format and clean the values of a single attribute (one path segment).
    const _resolveSegmentValues = async (
        record: IRecord,
        attribute: IAttribute,
        library: string,
        options: IValuesOptions,
        ctx: IQueryInfos,
    ): Promise<IValue[]> => {
        let values = await _extractRecordValue(record, attribute, library, options, ctx);

        if (values.length === 0) {
            values = [{payload: null}];
        }

        const formattedValues = await Promise.all(
            values.map(value => _formatValueWithMetadata(value, attribute, library, ctx)),
        );

        // sort of flatMap cause _formatValue can return multiple values for 1 input val (think heritage)
        const flattenedValues = formattedValues.reduce((acc, v) => {
            if (Array.isArray(v.payload)) {
                acc = [...acc, ...v.payload.map(vpart => ({value: vpart, attribute: v.attribute}))];
            } else {
                acc.push(v);
            }
            return acc;
        }, []);

        // remove null values
        return flattenedValues.filter(v => v.payload !== null && typeof v.payload !== 'undefined');
    };

    // Follow every linked record of a link attribute and keep traversing the remaining path.
    const _traverseLink = async (
        values: ILinkValue[],
        linkedLibrary: string,
        remainingPath: string,
        options: IValuesOptions,
        ctx: IQueryInfos,
    ): Promise<IValue[]> => {
        const nestedValues = await Promise.all(
            values.map(v => {
                const linkedRecordId = v.payload?.id;
                if (!linkedRecordId) {
                    return [];
                }

                return getRecordFieldValue({
                    library: linkedLibrary,
                    record: {id: linkedRecordId, library: linkedLibrary},
                    attributePath: remainingPath,
                    options,
                    ctx,
                });
            }),
        );

        return nestedValues.flat();
    };

    // Read the remaining path directly on the record linked by each tree node. A node can reference
    // records from different libraries; a record whose library does not define the attribute yields nothing.
    const _traverseTree = async (
        values: ITreeValue[],
        remainingPath: string,
        options: IValuesOptions,
        ctx: IQueryInfos,
    ): Promise<IValue[]> => {
        const nestedValues = await Promise.all(
            values.map(async v => {
                const linkedRecord = v.payload?.record;
                if (!linkedRecord?.id) {
                    return [];
                }

                try {
                    return await getRecordFieldValue({
                        library: linkedRecord.library,
                        record: {id: linkedRecord.id, library: linkedRecord.library},
                        attributePath: remainingPath,
                        options,
                        ctx,
                    });
                } catch {
                    // The linked record's library may not define this attribute → skip it.
                    return [];
                }
            }),
        );

        return nestedValues.flat();
    };

    // Read a sub-field inside a payload, which may be stored (or formatted by a GET_VALUE action list,
    // e.g. `toJSON` on extended attributes) as a JSON string rather than an object.
    const _readSubField = (payload: unknown, subSegments: string[]): unknown => {
        const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
        return subSegments.reduce((acc, segment) => acc?.[segment], parsed);
    };

    // Navigate the remaining path inside the payload object (extended sub-fields, or `.from` / `.to`
    // for date ranges). `raw_payload` is navigated as well, independently: it holds the value before
    // its GET_VALUE action list ran (so it can have another shape), and consumers such as the SDO
    // export read the sub-field from there. It is left untouched when absent (`options.skipActions`).
    const _navigateSubFields = (values: IStandardValue[], subSegments: string[]): IValue[] =>
        values
            .map(v => {
                const navigated: IStandardValue = {...v, payload: _readSubField(v.payload, subSegments) ?? null};

                if (typeof v.raw_payload !== 'undefined') {
                    navigated.raw_payload = _readSubField(v.raw_payload, subSegments) ?? null;
                }

                return navigated;
            })
            .filter(v => v.payload !== null && typeof v.payload !== 'undefined');

    const getRecordFieldValue: GetRecordFieldValueHelper = async ({library, record, attributePath, options, ctx}) => {
        const segments = attributePath.split('.');
        const attributeId = segments[0];

        await _assertAttributeInLibrary(attributeId, library, ctx);

        if (!(await _hasReadPermission(attributeId, library, record.id, ctx))) {
            return [];
        }

        const attrProps = await attributeDomain.getAttributeProperties({id: attributeId, ctx});
        const currentValues = await _resolveSegmentValues(record, attrProps, library, options, ctx);

        // Terminal segment: return the values of the current attribute as-is.
        if (segments.length === 1) {
            return currentValues;
        }

        const remainingSegments = segments.slice(1);

        if (attrProps.type === AttributeTypes.SIMPLE_LINK || attrProps.type === AttributeTypes.ADVANCED_LINK) {
            return _traverseLink(
                currentValues as ILinkValue[],
                attrProps.linked_library,
                remainingSegments.join('.'),
                options,
                ctx,
            );
        }

        if (attrProps.type === AttributeTypes.TREE) {
            return _traverseTree(currentValues as ITreeValue[], remainingSegments.join('.'), options, ctx);
        }

        if (attrProps.format === AttributeFormats.EXTENDED || attrProps.format === AttributeFormats.DATE_RANGE) {
            return _navigateSubFields(currentValues as IStandardValue[], remainingSegments);
        }

        // Any other type cannot be traversed further.
        throw new ValidationError({
            [attributeId]: {msg: Errors.INVALID_NESTED_ATTRIBUTE_PATH, vars: {attribute: attributeId}},
        });
    };

    return getRecordFieldValue;
}
