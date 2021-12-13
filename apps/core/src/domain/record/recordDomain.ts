// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {IRecordRepo} from 'infra/record/recordRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import moment from 'moment';
import {join} from 'path';
import {IUtils} from 'utils/utils';
import * as Config from '_types/config';
import {ICursorPaginationParams, IListWithCursor, IPaginationParams} from '_types/list';
import {ITree} from '_types/tree';
import {IStandardValue, IValue, IValuesOptions} from '_types/value';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {getPreviewUrl} from '../../utils/preview/preview';
import {AttributeFormats, AttributeTypes, IAttribute, IAttributeFilterOptions} from '../../_types/attribute';
import {Errors} from '../../_types/errors';
import {EventType} from '../../_types/event';
import {ILibrary, LibraryBehavior} from '../../_types/library';
import {RecordPermissionsActions} from '../../_types/permissions';
import {IQueryInfos} from '../../_types/queryInfos';
import {
    AttributeCondition,
    IRecord,
    IRecordFilterOption,
    IRecordIdentity,
    IRecordIdentityConf,
    IRecordSort,
    Operator,
    TreeCondition
} from '../../_types/record';
import {IActionsListDomain} from '../actionsList/actionsListDomain';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IRecordPermissionDomain} from '../permission/recordPermissionDomain';
import getAttributesFromField from './helpers/getAttributesFromField';

/**
 * Simple list of filters (fieldName: filterValue) to apply to get records.
 */

export interface IRecordFilterLight {
    field?: string;
    value?: string;
    condition?: AttributeCondition | TreeCondition;
    operator?: Operator;
    treeId?: string;
}

export interface IRecordSortLight {
    field: string;
    order: string;
}

export interface IFindRecordParams {
    library: string;
    filters?: IRecordFilterLight[];
    sort?: IRecordSortLight;
    options?: IValuesOptions;
    pagination?: IPaginationParams | ICursorPaginationParams;
    withCount?: boolean;
    retrieveInactive?: boolean;
    searchQuery?: string;
}

const allowedTypeOperator = {
    string: [
        AttributeCondition.EQUAL,
        AttributeCondition.NOT_EQUAL,
        AttributeCondition.BEGIN_WITH,
        AttributeCondition.END_WITH,
        AttributeCondition.CONTAINS,
        AttributeCondition.NOT_CONTAINS,
        TreeCondition.CLASSIFIED_IN,
        TreeCondition.NOT_CLASSIFIED_IN
    ],
    number: [
        AttributeCondition.EQUAL,
        AttributeCondition.NOT_EQUAL,
        AttributeCondition.GREATER_THAN,
        AttributeCondition.LESS_THAN
    ],
    boolean: [AttributeCondition.EQUAL, AttributeCondition.NOT_EQUAL],
    null: [AttributeCondition.EQUAL, AttributeCondition.NOT_EQUAL]
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
    'core.domain.permission.record'?: IRecordPermissionDomain;
    'core.infra.library'?: ILibraryRepo;
    'core.infra.tree'?: ITreeRepo;
    'core.domain.eventsManager'?: IEventsManagerDomain;
    'core.utils'?: IUtils;
}

export default function ({
    config = null,
    'core.infra.record': recordRepo = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.value': valueDomain = null,
    'core.domain.actionsList': actionsListDomain = null,
    'core.domain.permission.record': recordPermissionDomain = null,
    'core.infra.library': libraryRepo = null,
    'core.infra.tree': treeRepo = null,
    'core.domain.eventsManager': eventsManager = null,
    'core.utils': utils = null
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
        let values: IValue[];

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

        processedValue.attribute = attribute.id;

        if (utils.isStandardAttribute(attribute)) {
            (processedValue as IStandardValue).raw_value = val.value;
        }

        return processedValue;
    };

    const _checkLogicExpr = async (filters: IRecordFilterLight[]) => {
        const stack = [];
        const output = [];

        // convert to Reverse Polish Notation
        for (const f of filters) {
            await _validationFilter(f);

            if (!_isOperatorFilter(f)) {
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
            stackSize += !_isOperatorFilter(e) ? 1 : -1;

            if (stackSize <= 0) {
                throw new ValidationError({id: Errors.INVALID_FILTERS_EXPRESSION});
            }
        }

        if (stackSize !== 1) {
            throw new ValidationError({id: Errors.INVALID_FILTERS_EXPRESSION});
        }
    };

    const _getSimpleLinkedRecords = async (
        library: string,
        value: string,
        ctx: IQueryInfos
    ): Promise<Array<{attribute: string; records: IRecord[]}>> => {
        const filters: IAttributeFilterOptions = {type: [AttributeTypes.SIMPLE_LINK], linked_library: library};
        // get all attributes linked to the library param
        const attributes = await attributeDomain.getAttributes({
            params: {
                filters
            },
            ctx
        });

        const linkedValuesToDel: Array<{records: IRecord[]; attribute: string}> = [];
        const libraryAttrs: {[library: string]: IAttribute[]} = {};

        for (const attr of attributes.list) {
            const libs = await libraryRepo.getLibrariesUsingAttribute(attr.id, ctx);
            for (const l of libs) {
                libraryAttrs[l] = !!libraryAttrs[l] ? [...libraryAttrs[l], attr] : [attr];
            }
        }

        for (const [lib, attrs] of Object.entries(libraryAttrs)) {
            for (const attr of attrs) {
                const records = await recordRepo.find({
                    libraryId: lib,
                    filters: [{attributes: [attr], condition: AttributeCondition.EQUAL, value}],
                    ctx
                });

                if (records.list.length) {
                    linkedValuesToDel.push({records: records.list, attribute: attr.id});
                }
            }
        }

        return linkedValuesToDel;
    };

    const _isAttributeFilter = (filter: IRecordFilterLight): boolean => {
        return (
            filter.condition in AttributeCondition &&
            typeof filter.field !== 'undefined' &&
            typeof filter.value !== 'undefined'
        );
    };

    const _isClassifiedFilter = (filter: IRecordFilterLight): boolean => {
        return filter.condition in TreeCondition && typeof filter.treeId !== 'undefined';
    };

    const _isOperatorFilter = (filter: IRecordFilterLight): boolean => filter.operator in Operator;

    const _validationFilter = async (filter: IRecordFilterLight): Promise<void> => {
        if (typeof filter.condition === 'undefined' && typeof filter.operator === 'undefined') {
            throw new ValidationError({
                id: Errors.INVALID_FILTER_FORMAT,
                message: 'Filter must have a condition or operator'
            });
        }

        if (filter.condition in AttributeCondition && !_isAttributeFilter(filter)) {
            throw new ValidationError({
                id: Errors.INVALID_FILTER_FORMAT,
                message: 'Attribute filter must have condition, field and value'
            });
        }

        if (filter.condition in TreeCondition && !_isClassifiedFilter(filter)) {
            throw new ValidationError({
                id: Errors.INVALID_FILTER_FORMAT,
                message: 'Classified filter must have condition, value and treeId'
            });
        }
    };

    return {
        async createRecord(library: string, ctx: IQueryInfos): Promise<IRecord> {
            const recordData = {
                created_at: moment().unix(),
                created_by: String(ctx.userId),
                modified_at: moment().unix(),
                modified_by: String(ctx.userId),
                active: true
            };

            const newRecord = await recordRepo.createRecord({libraryId: library, recordData, ctx});

            await eventsManager.send(
                {
                    type: EventType.RECORD_SAVE,
                    data: {
                        id: newRecord.id,
                        libraryId: newRecord.library,
                        new: newRecord
                    }
                },
                ctx
            );

            return newRecord;
        },
        async updateRecord({library, recordData, ctx}): Promise<IRecord> {
            // Check permission
            const canUpdate = await recordPermissionDomain.getRecordPermission(
                RecordPermissionsActions.EDIT_RECORD,
                ctx.userId,
                recordData.library,
                recordData.id,
                ctx
            );

            if (!canUpdate) {
                throw new PermissionError(RecordPermissionsActions.EDIT_RECORD);
            }

            return recordRepo.updateRecord({libraryId: library, recordData, ctx});
        },
        async deleteRecord({library, id, ctx}): Promise<IRecord> {
            // Get library
            const lib = await libraryRepo.getLibraries({params: {filters: {id: library}, strictFilters: true}, ctx});

            // Check if exists and can delete
            if (!lib.list.length) {
                throw new Error('Unknown library');
            }

            // Check permission
            const canDelete = await recordPermissionDomain.getRecordPermission(
                RecordPermissionsActions.DELETE_RECORD,
                ctx.userId,
                library,
                id,
                ctx
            );

            if (!canDelete) {
                throw new PermissionError(RecordPermissionsActions.DELETE_RECORD);
            }

            const simpleLinkedRecords = await _getSimpleLinkedRecords(library, id, ctx);

            const deletedRecord = await recordRepo.deleteRecord({libraryId: library, recordId: id, ctx});

            // delete simple linked values
            for (const e of simpleLinkedRecords) {
                for (const r of e.records) {
                    await valueDomain.deleteValue({
                        library: r.library,
                        recordId: r.id,
                        attribute: e.attribute,
                        ctx
                    });
                }
            }

            await eventsManager.send(
                {
                    type: EventType.RECORD_DELETE,
                    data: {
                        id: deletedRecord.id,
                        libraryId: deletedRecord.library,
                        old: deletedRecord.old
                    }
                },
                ctx
            );

            return deletedRecord;
        },
        async find({params, ctx}): Promise<IListWithCursor<IRecord>> {
            const {library, sort, pagination, withCount, retrieveInactive = false, searchQuery} = params;
            let {filters = [] as IRecordFilterLight[]} = params;
            const fullFilters: IRecordFilterOption[] = [];
            let fullSort: IRecordSort;
            let searchFilters: IRecordFilterLight[] = [];

            // Add ids filters if searchQuery is defined
            if (typeof searchQuery !== 'undefined') {
                const searchRecords = await recordRepo.search(library, searchQuery);

                if (searchRecords.list.length) {
                    searchFilters = searchRecords.list.flatMap((r, i, arr) =>
                        i < arr.length - 1
                            ? [{field: 'id', condition: AttributeCondition.EQUAL, value: r.id}, {operator: Operator.OR}]
                            : {field: 'id', condition: AttributeCondition.EQUAL, value: r.id}
                    );
                }

                if (searchQuery !== '' && !searchFilters.length) {
                    return {
                        totalCount: 0,
                        list: [],
                        cursor: {}
                    };
                }

                if (filters.length && searchFilters.length) {
                    searchFilters.push({operator: Operator.CLOSE_BRACKET});
                    searchFilters.unshift({operator: Operator.OPEN_BRACKET});
                    searchFilters.unshift({operator: Operator.AND});
                }
            }

            filters = filters.concat(searchFilters);

            if (filters.length) {
                await _checkLogicExpr(filters);
            }

            // Hydrate filters with attribute properties and cast filters values if needed
            for (const f of filters) {
                let filter: IRecordFilterOption = {};

                if (_isAttributeFilter(f)) {
                    const attributes = await getAttributesFromField(
                        f.field,
                        {
                            'core.domain.attribute': attributeDomain,
                            'core.infra.library': libraryRepo,
                            'core.infra.tree': treeRepo
                        },
                        ctx
                    );
                    let value: any = f.value;
                    const lastAttr = attributes[attributes.length - 1];

                    if (
                        (value && lastAttr.format === AttributeFormats.NUMERIC) ||
                        lastAttr.format === AttributeFormats.DATE
                    ) {
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

            // Check sort fields
            if (sort && sort?.field) {
                fullSort = {
                    attributes: await getAttributesFromField(
                        sort.field,
                        {
                            'core.domain.attribute': attributeDomain,
                            'core.infra.library': libraryRepo,
                            'core.infra.tree': treeRepo
                        },
                        ctx
                    ),
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
            const libs = await libraryRepo.getLibraries({
                params: {filters: {id: record.library}, strictFilters: true},
                ctx
            });

            if (!libs.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_LIBRARY});
            }

            const lib = libs.list.pop();
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
                preview: (await getPreviews({conf, lib, record, valueDomain, libraryRepo, ctx})) ?? null
            };
        },
        async getRecordFieldValue({library, record, attributeId, options, ctx}): Promise<IValue | IValue[] | null> {
            const attrProps = await attributeDomain.getAttributeProperties({id: attributeId, ctx});
            const values = await _extractRecordValue(record, attrProps, library, options, ctx);

            const forceArray = options?.forceArray ?? false;

            const formattedValues = await Promise.all(
                values.map(v => _formatRecordValue(attrProps, v, record, library, ctx))
            );

            return attrProps.multiple_values || forceArray ? formattedValues : formattedValues[0] || null;
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
    libraryRepo: ILibraryRepo;
    ctx: any;
}

const getPreviews = async ({conf, lib, record, valueDomain, libraryRepo, ctx}: IGetPreview) => {
    const _getPreviewFromRecord = async (valueRecord: IRecord) => {
        let previewAttribute: string;

        if (valueRecord.library) {
            const libs = await libraryRepo.getLibraries({
                params: {filters: {id: valueRecord.library}, strictFilters: true},
                ctx
            });

            if (!libs.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_LIBRARY});
            }

            const valueLib = libs.list.pop();

            const valueConf = valueLib.recordIdentityConf || {};

            return valueConf.preview;
        } else {
            previewAttribute = 'previews';
        }

        return valueRecord[previewAttribute];
    };

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

    const previews = valuePreview?.value?.id ? await _getPreviewFromRecord(valuePreview?.value) : valuePreview?.value;

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
