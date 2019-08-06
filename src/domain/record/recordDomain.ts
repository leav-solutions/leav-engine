import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {IRecordRepo} from 'infra/record/recordRepo';
import * as moment from 'moment';
import {ICursorPaginationParams, IListWithCursor, IPaginationParams} from '_types/list';
import {IValue, IValuesOptions} from '_types/value';
import PermissionError from '../../errors/PermissionError';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import {RecordPermissionsActions} from '../../_types/permissions';
import {IQueryInfos} from '../../_types/queryInfos';
import {IRecord, IRecordFilterOption, IRecordIdentity} from '../../_types/record';
import {IActionsListDomain} from '../actionsList/actionsListDomain';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IRecordPermissionDomain} from '../permission/recordPermissionDomain';

/**
 * Simple list of filters (fieldName: filterValue) to apply to get records.
 */
export interface IRecordFiltersLight {
    [attrId: string]: string;
}

export interface IFindRecordParams {
    library: string;
    filters?: IRecordFiltersLight;
    options?: IValuesOptions;
    pagination?: IPaginationParams | ICursorPaginationParams;
    withCount?: boolean;
}

export interface IRecordDomain {
    /**
     * Create new record
     *
     * @param library       Library ID
     */
    createRecord(library: string, infos: IQueryInfos): Promise<IRecord>;

    /**
     * Update record
     * Must be used to update metadata (modified_at, ...) only
     *
     * @param library       Library ID
     * @param infos      Query context (userId...)
     * @param recordData
     */
    updateRecord(library: string, recordData: IRecord, infos: IQueryInfos): Promise<IRecord>;

    /**
     * Delete record
     *
     * @param library    Library ID
     * @param id         Record ID
     * @param infos      Query context (userId...)
     * @param recordData
     */
    deleteRecord(library: string, id: number, infos: IQueryInfos): Promise<IRecord>;

    /**
     * Search records
     *
     * @param library Library Id
     * @param filters Filters to apply on records selection
     * @param fields Fields to retrieve on each records
     */
    find(params: IFindRecordParams): Promise<IListWithCursor<IRecord>>;

    getRecordFieldValue(
        library: string,
        record: IRecord,
        attributeId: string,
        options?: IValuesOptions
    ): Promise<IValue | IValue[]>;

    /**
     * Return record identity values
     *
     * @param record
     */
    getRecordIdentity(record: IRecord): Promise<IRecordIdentity>;
}

export default function(
    recordRepo: IRecordRepo | null = null,
    attributeDomain: IAttributeDomain | null = null,
    valueDomain: IValueDomain = null,
    actionsListDomain: IActionsListDomain = null,
    recordPermissionDomain: IRecordPermissionDomain = null,
    libraryDomain: ILibraryDomain = null
): IRecordDomain {
    /**
     * Run actions list on a value
     *
     * @param isLinkAttribute
     * @param value
     * @param attrProps
     * @param record
     * @param library
     */
    const _runActionsList = async (
        isLinkAttribute: boolean,
        value: IValue,
        attrProps: IAttribute,
        record: IRecord,
        library: string
    ) =>
        !isLinkAttribute && value !== null && !!attrProps.actions_list && !!attrProps.actions_list.getValue
            ? actionsListDomain.runActionsList(attrProps.actions_list.getValue, value, {
                  attribute: attrProps,
                  recordId: record.id,
                  library,
                  value
              })
            : value;

    /**
     * Extract value from record if it's available (attribute simple), or fetch it from DB
     *
     * @param record
     * @param attribute
     * @param library
     * @param options
     */
    const _extractRecordValue = async (
        record: IRecord,
        attribute: IAttribute,
        library: string,
        options: IValuesOptions
    ): Promise<IValue[]> => {
        let values;
        if (typeof record[attribute.id] !== 'undefined') {
            // Format attribute field into simple value
            values = [
                {
                    value: record[attribute.id]
                }
            ];
        } else {
            values = await valueDomain.getValues(library, record.id, attribute.id, options);
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
    const _formatRecordValue = async (attribute: IAttribute, value: IValue, record: IRecord, library: string) => {
        let val = {...value}; // Don't mutate given value
        if (attribute.id === 'id') {
            return val.value;
        }

        const isLinkAttribute =
            attribute.type === AttributeTypes.SIMPLE_LINK || attribute.type === AttributeTypes.ADVANCED_LINK;

        if (isLinkAttribute && attribute.linked_library) {
            if (typeof val.value === 'number') {
                val.value = {
                    id: val.value
                };
            }

            const linkValue = {...val.value, library: attribute.linked_library};
            val = {...value, value: linkValue};
        }

        const processedValue: IValue =
            !isLinkAttribute &&
            val !== null &&
            attribute.id !== 'id' &&
            !!attribute.actions_list &&
            !!attribute.actions_list.getValue
                ? await _runActionsList(isLinkAttribute, val, attribute, record, library)
                : val;

        processedValue.raw_value = val.value;

        return processedValue;
    };

    const ret = {
        async createRecord(library: string, infos: IQueryInfos): Promise<IRecord> {
            const recordData = {
                created_at: moment().unix(),
                created_by: infos.userId,
                modified_at: moment().unix(),
                modified_by: infos.userId
            };

            return recordRepo.createRecord(library, recordData);
        },
        async updateRecord(library: string, recordData: IRecord, infos: IQueryInfos): Promise<IRecord> {
            // Check permission
            const canUpdate = await recordPermissionDomain.getRecordPermission(
                RecordPermissionsActions.DELETE,
                infos.userId,
                recordData.library,
                recordData.id
            );

            if (!canUpdate) {
                throw new PermissionError(RecordPermissionsActions.DELETE);
            }

            return recordRepo.updateRecord(library, recordData);
        },
        async deleteRecord(library: string, id: number, infos: IQueryInfos): Promise<IRecord> {
            // Get library
            // const lib = await this.getLibraries({id});

            // // Check if exists and can delete
            // if (!lib.length) {
            //     throw new Error('Unknown library');
            // }

            // if (lib.pop().system) {
            //     throw new Error('Cannot delete system library');
            // }

            // Check permission
            const canDelete = await recordPermissionDomain.getRecordPermission(
                RecordPermissionsActions.DELETE,
                infos.userId,
                library,
                id
            );

            if (!canDelete) {
                throw new PermissionError(RecordPermissionsActions.DELETE);
            }

            return recordRepo.deleteRecord(library, id);
        },
        async find(params: IFindRecordParams): Promise<IListWithCursor<IRecord>> {
            const {library, filters, options, pagination, withCount} = params;
            const fullFilters: IRecordFilterOption[] = [];

            // Hydrate filters with attribute properties and cast filters values if needed
            if (typeof filters !== 'undefined' && filters) {
                for (const attrId of Object.keys(filters)) {
                    const attribute = await attributeDomain.getAttributeProperties(attrId);
                    const value =
                        attribute.format === AttributeFormats.NUMERIC ? Number(filters[attrId]) : filters[attrId];

                    fullFilters.push({
                        attribute,
                        value
                    });
                }
            }

            const records = await recordRepo.find(library, fullFilters, pagination, withCount);

            return records;
        },
        async getRecordIdentity(record: IRecord): Promise<IRecordIdentity> {
            const lib = await libraryDomain.getLibraryProperties(record.library);
            const conf = lib.recordIdentityConf || {};

            return {
                id: record.id,
                library: lib,
                label: conf.label ? (await valueDomain.getValues(lib.id, record.id, conf.label)).pop().value : null,
                color: conf.color ? (await valueDomain.getValues(lib.id, record.id, conf.color)).pop().value : null,
                preview: conf.preview
                    ? (await valueDomain.getValues(lib.id, record.id, conf.preview)).pop().value
                    : null
            };
        },
        async getRecordFieldValue(
            library: string,
            record: IRecord,
            attributeId: string,
            options?: IValuesOptions
        ): Promise<IValue | IValue[]> {
            const attrProps = await attributeDomain.getAttributeProperties(attributeId);
            const values = await _extractRecordValue(record, attrProps, library, options);

            const formattedValues = await Promise.all(
                values.map(v => _formatRecordValue(attrProps, v, record, library))
            );

            return attrProps.multiple_values ? formattedValues : formattedValues[0];
        }
    };
    return ret;
}
