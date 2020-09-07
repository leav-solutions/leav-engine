import moment from 'moment';
import {join} from 'path';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {IRecordRepo} from 'infra/record/recordRepo';
import validateLibrary from './helpers/validateLibrary';
import {ICursorPaginationParams, IListWithCursor, IPaginationParams} from '_types/list';
import {IValue, IValuesOptions} from '_types/value';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {getPreviewUrl} from '../../utils/preview/preview';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import {Errors} from '../../_types/errors';
import {ILibrary, LibraryBehavior} from '../../_types/library';
import {IList} from '../../_types/list';
import {RecordPermissionsActions} from '../../_types/permissions';
import {IQueryInfos} from '../../_types/queryInfos';
import {EventType} from '../../_types/event';
import {
    Condition,
    IRecord,
    IRecordFilterOption,
    IRecordIdentity,
    IRecordIdentityConf,
    IRecordSort,
    Operator
} from '../../_types/record';
import {IActionsListDomain} from '../actionsList/actionsListDomain';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IRecordPermissionDomain} from '../permission/recordPermissionDomain';
import {pick} from 'lodash';
import * as Config from '_types/config';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';

/**
 * Simple list of filters (fieldName: filterValue) to apply to get records.
 */

export type IRecordFiltersLight = Array<{
    field?: string;
    value?: string;
    condition?: Condition;
    operator?: Operator;
}>;

export interface IRecordSortLight {
    field: string;
    order: string;
}

export interface IFindRecordParams {
    library: string;
    filters?: IRecordFiltersLight;
    sort?: IRecordSortLight;
    options?: IValuesOptions;
    pagination?: IPaginationParams | ICursorPaginationParams;
    withCount?: boolean;
    retrieveInactive?: boolean;
}

const allowedTypeOperator = {
    string: [
        Condition.EQUAL,
        Condition.NOT_EQUAL,
        Condition.BEGIN_WITH,
        Condition.END_WITH,
        Condition.CONTAINS,
        Condition.NOT_CONTAINS
    ],
    number: [Condition.EQUAL, Condition.NOT_EQUAL, Condition.GREATER_THAN, Condition.LESS_THAN],
    boolean: [Condition.EQUAL, Condition.NOT_EQUAL],
    null: [Condition.EQUAL, Condition.NOT_EQUAL]
};

export interface IRecordDomain {
    createRecord(library: string, ctx: IQueryInfos): Promise<IRecord>;

    /**
     * Update record
     * Must be used to update metadata (modified_at, ...) only
     */
    updateRecord({
        library,
        recordData,
        ctx
    }: {
        library: string;
        recordData: IRecord;
        ctx: IQueryInfos;
    }): Promise<IRecord>;

    deleteRecord({library, id, ctx}: {library: string; id: string; ctx: IQueryInfos}): Promise<IRecord>;

    /**
     * Search records
     * Filters to apply on records selection
     * Fields to retrieve on each records
     */
    find({params, ctx}: {params: IFindRecordParams; ctx: IQueryInfos}): Promise<IListWithCursor<IRecord>>;

    search({
        library,
        query,
        from,
        size,
        ctx
    }: {
        library: string;
        query: string;
        from?: number;
        size?: number;
        ctx: IQueryInfos;
    }): Promise<IList<IRecord>>;

    getRecordFieldValue({
        library,
        record,
        attributeId,
        options,
        ctx
    }: {
        library: string;
        record: IRecord;
        attributeId: string;
        options?: IValuesOptions;
        ctx: IQueryInfos;
    }): Promise<IValue | IValue[]>;

    getRecordIdentity(record: IRecord, ctx: IQueryInfos): Promise<IRecordIdentity>;

    deactivateRecord(record: IRecord, ctx: IQueryInfos): Promise<IRecord>;

    activateRecord(record: IRecord, ctx: IQueryInfos): Promise<IRecord>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.record'?: IRecordRepo;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.value'?: IValueDomain;
    'core.domain.actionsList'?: IActionsListDomain;
    'core.domain.permission.recordPermission'?: IRecordPermissionDomain;
    'core.domain.library'?: ILibraryDomain;
    'core.domain.eventsManager'?: IEventsManagerDomain;
}

export default function({
    config = null,
    'core.infra.record': recordRepo = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.value': valueDomain = null,
    'core.domain.actionsList': actionsListDomain = null,
    'core.domain.permission.recordPermission': recordPermissionDomain = null,
    'core.domain.library': libraryDomain = null,
    'core.domain.eventsManager': eventsManager = null
}: IDeps = {}): IRecordDomain {
    /**
     * Run actions list on a value
     *
     * @param isLinkAttribute
     * @param value
     * @param attrProps
     * @param record
     * @param library
     * @param ctx
     */
    const _runActionsList = async (
        isLinkAttribute: boolean,
        value: IValue,
        attrProps: IAttribute,
        record: IRecord,
        library: string,
        ctx: IQueryInfos
    ) => {
        return !isLinkAttribute && value !== null && !!attrProps.actions_list && !!attrProps.actions_list.getValue
            ? actionsListDomain.runActionsList(attrProps.actions_list.getValue, value, {
                  ...ctx,
                  attribute: attrProps,
                  recordId: record.id,
                  library,
                  value
              })
            : value;
    };

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
        ctx: IQueryInfos
    ): Promise<IValue[]> => {
        let values;
        if (typeof record[attribute.id] !== 'undefined') {
            // Format attribute field into simple value
            values = [
                {
                    value:
                        attribute.type === AttributeTypes.SIMPLE_LINK && typeof record[attribute.id] === 'string'
                            ? {id: record[attribute.id]}
                            : record[attribute.id]
                }
            ];
        } else {
            values = await valueDomain.getValues({
                library,
                recordId: record.id,
                attribute: attribute.id,
                options,
                ctx
            });
        }
        return values;
    };

    /**
     * Format value: add a few informations for link attributes, run actions list
     *
     * @param attribute
     * @param value
     * @param record
     * @param library
     */
    const _formatRecordValue = async (
        attribute: IAttribute,
        value: IValue,
        record: IRecord,
        library: string,
        ctx: IQueryInfos
    ): Promise<IValue> => {
        let val = {...value}; // Don't mutate given value

        const isLinkAttribute =
            attribute.type === AttributeTypes.SIMPLE_LINK || attribute.type === AttributeTypes.ADVANCED_LINK;

        if (isLinkAttribute && attribute.linked_library) {
            const linkValue = {...val.value, library: attribute.linked_library};
            val = {...value, value: linkValue};
        }

        const processedValue: IValue =
            !isLinkAttribute &&
            val !== null &&
            attribute.id !== 'id' &&
            !!attribute.actions_list &&
            !!attribute.actions_list.getValue
                ? await _runActionsList(isLinkAttribute, val, attribute, record, library, ctx)
                : val;

        processedValue.raw_value = val.value;
        processedValue.attribute = attribute.id;

        return processedValue;
    };

    const _checkLogicExpr = (filters: IRecordFilterOption[]) => {
        const stack = [];
        const output = [];

        // convert to Reverse Polish Notation
        for (const f of filters) {
            if (typeof f.value !== 'undefined') {
                output.push(f);
            } else if (f.operator !== Operator.CLOSE_BRACKET) {
                stack.push(f);
            } else {
                let e: IRecordFilterOption = stack.pop();
                while (e && e.operator !== Operator.OPEN_BRACKET) {
                    output.push(e);
                    e = stack.pop();
                }
                if (!e) {
                    throw new ValidationError({id: Errors.INVALID_FILTERS_EXPRESSION});
                }
            }
        }

        const rpn = output.concat(stack.reverse());

        // validation filters logical expression (order)
        let stackSize = 0;
        for (const e of rpn) {
            stackSize += typeof e.value !== 'undefined' ? 1 : -1;
            if (stackSize <= 0) {
                throw new ValidationError({id: Errors.INVALID_FILTERS_EXPRESSION});
            }
        }

        if (stackSize !== 1) {
            throw new ValidationError({id: Errors.INVALID_FILTERS_EXPRESSION});
        }
    };

    const _getAttributesFromField = async (field: string, ctx: IQueryInfos): Promise<IAttribute[]> => {
        const fields = field.split('.');
        const attributes: IAttribute[] = [];

        let linkedLibrary;
        let extended = false;
        for (const f of fields) {
            if (linkedLibrary) {
                const attrLinkedLibrary = await libraryDomain.getLibraryAttributes(linkedLibrary, ctx);
                if (!attrLinkedLibrary.find(a => a.id === f)) {
                    throw new ValidationError({id: Errors.INVALID_FILTER_FIELDS});
                }
            }

            const attribute: IAttribute = !extended
                ? await attributeDomain.getAttributeProperties({id: f, ctx})
                : {id: f, type: AttributeTypes.SIMPLE, format: AttributeFormats.EXTENDED}; // not necessary extended

            linkedLibrary = attribute.linked_library;
            extended = attribute.format === AttributeFormats.EXTENDED;

            attributes.push(attribute);
        }

        return attributes;
    };

    return {
        async createRecord(library: string, ctx: IQueryInfos): Promise<IRecord> {
            const recordData = {
                created_at: moment().unix(),
                created_by: ctx.userId,
                modified_at: moment().unix(),
                modified_by: ctx.userId,
                active: true
            };

            const newRecord = await recordRepo.createRecord({libraryId: library, recordData, ctx});

            await eventsManager.send(
                {
                    type: EventType.RECORD_SAVE,
                    data: {
                        id: newRecord.id,
                        libraryId: newRecord.library,
                        new: pick(
                            newRecord,
                            (await libraryDomain.getLibraryFullTextAttributes(library, ctx)).map(a => a.id)
                        )
                    }
                },
                config.indexationManager.routingKeys.events,
                ctx
            );

            return newRecord;
        },
        async updateRecord({library, recordData, ctx}): Promise<IRecord> {
            // Check permission
            const canUpdate = await recordPermissionDomain.getRecordPermission(
                RecordPermissionsActions.EDIT,
                ctx.userId,
                recordData.library,
                recordData.id,
                ctx
            );

            if (!canUpdate) {
                throw new PermissionError(RecordPermissionsActions.EDIT);
            }

            return recordRepo.updateRecord({libraryId: library, recordData, ctx});
        },
        async deleteRecord({library, id, ctx}): Promise<IRecord> {
            // Get library
            const lib = await libraryDomain.getLibraries({params: {filters: {id: library}, strictFilters: true}, ctx});

            // Check if exists and can delete
            if (!lib.list.length) {
                throw new Error('Unknown library');
            }

            // Check permission
            const canDelete = await recordPermissionDomain.getRecordPermission(
                RecordPermissionsActions.DELETE,
                ctx.userId,
                library,
                id,
                ctx
            );

            if (!canDelete) {
                throw new PermissionError(RecordPermissionsActions.DELETE);
            }

            const deletedRecord = await recordRepo.deleteRecord({libraryId: library, recordId: id, ctx});

            await eventsManager.send(
                {
                    type: EventType.RECORD_DELETE,
                    data: {
                        id: deletedRecord.id,
                        libraryId: deletedRecord.library,
                        old: pick(
                            deletedRecord.old,
                            (await libraryDomain.getLibraryFullTextAttributes(library, ctx)).map(a => a.id)
                        )
                    }
                },
                config.indexationManager.routingKeys.events,
                ctx
            );

            return deletedRecord;
        },
        async search({library, query, from, size, ctx}): Promise<IList<IRecord>> {
            await validateLibrary(library, {libraryDomain}, ctx);

            return recordRepo.search(library, query, from, size);
        },
        async find({params, ctx}): Promise<IListWithCursor<IRecord>> {
            const {library, filters, sort, pagination, withCount, retrieveInactive = false} = params;
            const fullFilters: IRecordFilterOption[] = [];
            let fullSort: IRecordSort;

            // Hydrate filters with attribute properties and cast filters values if needed
            if (filters && typeof filters !== 'undefined' && filters.length) {
                for (const f of filters) {
                    let filter: IRecordFilterOption = {};

                    if (!f.operator) {
                        const attributes = await _getAttributesFromField(f.field, ctx);
                        let value: any = f.value;

                        const lastAttr = attributes[attributes.length - 1];
                        if (value && lastAttr.format === AttributeFormats.NUMERIC) {
                            value = Number(f.value);
                        } else if (value && lastAttr.format === AttributeFormats.BOOLEAN) {
                            value = f.value === 'true';
                        }

                        const valueType = value === null ? 'null' : typeof value;

                        if (f.condition && !allowedTypeOperator[valueType].includes(f.condition)) {
                            throw new ValidationError({id: Errors.INVALID_FILTER_CONDITION_VALUE});
                        }

                        filter = {attributes, value, condition: f.condition};
                    } else {
                        filter = f;
                    }

                    fullFilters.push(filter);
                }

                _checkLogicExpr(fullFilters);
            }

            // Check sort fields
            if (sort && typeof sort !== 'undefined') {
                fullSort = {
                    attributes: await _getAttributesFromField(sort.field, ctx),
                    order: sort.order
                };
            }

            const records = await recordRepo.find({
                libraryId: library,
                filters: fullFilters,
                sort: fullSort,
                pagination,
                withCount,
                retrieveInactive,
                ctx
            });

            return records;
        },
        async getRecordIdentity(record: IRecord, ctx: IQueryInfos): Promise<IRecordIdentity> {
            const lib = await libraryDomain.getLibraryProperties(record.library, ctx);
            const conf = lib.recordIdentityConf || {};

            let label = null;
            if (conf.label) {
                const labelValues = await valueDomain.getValues({
                    library: lib.id,
                    recordId: record.id,
                    attribute: conf.label,
                    ctx
                });

                label = labelValues.length ? labelValues.pop().value : null;
            }

            let color = null;
            if (conf.color) {
                const colorValues = await valueDomain.getValues({
                    library: lib.id,
                    recordId: record.id,
                    attribute: conf.color,
                    ctx
                });

                color = colorValues.length ? colorValues.pop().value : null;
            }

            return {
                id: record.id,
                library: lib,
                label,
                color,
                preview: (await getPreviews({conf, lib, record, valueDomain, libraryDomain, ctx})) ?? null
            };
        },
        async getRecordFieldValue({library, record, attributeId, options, ctx}): Promise<IValue | IValue[]> {
            const attrProps = await attributeDomain.getAttributeProperties({id: attributeId, ctx});
            const values = await _extractRecordValue(record, attrProps, library, options, ctx);
            const forceArray = options?.forceArray ?? false;

            const formattedValues = await Promise.all(
                values.map(v => _formatRecordValue(attrProps, v, record, library, ctx))
            );

            return attrProps.multiple_values || forceArray ? formattedValues : formattedValues[0];
        },
        async deactivateRecord(record: IRecord, ctx: IQueryInfos): Promise<IRecord> {
            const savedVal = await valueDomain.saveValue({
                library: record.library,
                recordId: record.id,
                attribute: 'active',
                value: {value: false},
                ctx
            });

            return {...record, active: savedVal.value};
        },
        async activateRecord(record: IRecord, ctx: IQueryInfos): Promise<IRecord> {
            const savedVal = await valueDomain.saveValue({
                library: record.library,
                recordId: record.id,
                attribute: 'active',
                value: {value: true},
                ctx
            });

            return {...record, active: savedVal.value};
        }
    };
}

interface IGetPreview {
    conf: IRecordIdentityConf;
    lib: ILibrary;
    record: IRecord;
    valueDomain: IValueDomain;
    libraryDomain: ILibraryDomain;
    ctx: any;
}

const getPreviews = async ({conf, lib, record, valueDomain, libraryDomain, ctx}: IGetPreview) => {
    const previewUrl = getPreviewUrl();
    const confPreview = lib.behavior === LibraryBehavior.FILES ? 'previews' : conf.preview;

    // can return a preview object or a full record for advance link
    const valuePreview = confPreview
        ? (
              await valueDomain.getValues({
                  library: lib.id,
                  recordId: record.id,
                  attribute: confPreview,
                  ctx
              })
          )?.pop()
        : null;

    const getPreviewFromRecord = async (valueRecord: IRecord) => {
        let previewAttribute: string;

        if (valueRecord.library) {
            const valueLib = await libraryDomain.getLibraryProperties(valueRecord.library, ctx);
            const valueConf = valueLib.recordIdentityConf || {};

            return valueConf.preview;
        } else {
            previewAttribute = 'previews';
        }

        return valueRecord[previewAttribute];
    };

    const previews = valuePreview?.value.id ? await getPreviewFromRecord(valuePreview?.value) : valuePreview?.value;

    // append preview url
    return previews
        ? Object.entries(previews)
              .map(value => {
                  const [key, url] = value;

                  if (!url || url.toString() === '') {
                      // avoid broken image
                      return {[key]: null};
                  }
                  // add host url to preview
                  const absoluteUrl = join(previewUrl, url.toString());

                  return {[key]: absoluteUrl};
              })
              .reduce((obj, o) => ({...obj, ...o}))
        : null;
};
