import {IRecordRepo} from 'infra/record/recordRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import * as moment from 'moment';
import {IQueryInfos} from '../../_types/queryInfos';
import {IQueryField, IRecord, IRecordFilterOption} from '../../_types/record';
import {IValue} from '../../_types/value';
import PermissionError from '../../errors/PermissionError';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import {RecordPermissions} from '../../_types/permissions';
import {IActionsListDomain} from '../actionsList/actionsListDomain';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IRecordPermissionDomain} from '../permission/recordPermissionDomain';

/**
 * Simple list of filters (fieldName: filterValue) to apply to get records.
 */
export interface IRecordFiltersLight {
    [attrId: string]: string;
}

export interface IRecordDomain {
    /**
     * Create new record
     *
     * @param library       Library ID
     */
    createRecord(library: string): Promise<IRecord>;

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
    find(library: string, filters?: IRecordFiltersLight, fields?: IQueryField[]): Promise<IRecord[]>;

    /**
     * Add values for requested fields on the record. Values can be of any types here.
     *
     * @param library
     * @param record
     * @param queryFields Fields to retrieve
     */
    populateRecordFields(library: string, record: IRecord, queryFields: IQueryField[]): Promise<IRecord>;
}

export default function(
    recordRepo: IRecordRepo | null = null,
    attributeDomain: IAttributeDomain | null = null,
    valueRepo: IValueRepo | null = null,
    actionsListDomain: IActionsListDomain = null,
    recordPermissionDomain: IRecordPermissionDomain = null
): IRecordDomain {
    return {
        async createRecord(library: string): Promise<IRecord> {
            const recordData = {created_at: moment().unix(), modified_at: moment().unix()};

            return recordRepo.createRecord(library, recordData);
        },
        async updateRecord(library: string, recordData: IRecord, infos: IQueryInfos): Promise<IRecord> {
            // Check permission
            const canUpdate = await recordPermissionDomain.getRecordPermission(
                RecordPermissions.DELETE,
                infos.userId,
                recordData.library,
                recordData.id
            );

            if (!canUpdate) {
                throw new PermissionError(RecordPermissions.DELETE);
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
                RecordPermissions.DELETE,
                infos.userId,
                library,
                id
            );

            if (!canDelete) {
                throw new PermissionError(RecordPermissions.DELETE);
            }

            return recordRepo.deleteRecord(library, id);
        },
        async find(library: string, filters?: IRecordFiltersLight, fields?: IQueryField[]): Promise<IRecord[]> {
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

            let records = await recordRepo.find(library, fullFilters);

            // Populate records with requested fields
            if (typeof fields !== 'undefined' && fields.length) {
                records = await Promise.all(records.map(record => this.populateRecordFields(library, record, fields)));
            }

            return records;
        },
        async populateRecordFields(library: string, record: IRecord, queryFields: IQueryField[]): Promise<IRecord> {
            const fieldsProps: {[attrName: string]: IAttribute} = {};

            for (const field of queryFields) {
                // Retrieve field properties
                if (typeof fieldsProps[field.name] === 'undefined') {
                    fieldsProps[field.name] = await attributeDomain.getAttributeProperties(field.name);
                }

                const isLinkAttribute =
                    fieldsProps[field.name].type === AttributeTypes.SIMPLE_LINK ||
                    fieldsProps[field.name].type === AttributeTypes.ADVANCED_LINK;

                // Get field value
                let value: IValue = null;
                if (
                    typeof record[field.name] === 'undefined' ||
                    fieldsProps[field.name].type !== AttributeTypes.SIMPLE
                ) {
                    const fieldValues = await valueRepo.getValues(
                        library,
                        record.id,
                        fieldsProps[field.name],
                        field.arguments
                    );

                    if (fieldValues !== null && fieldValues.length) {
                        const fieldValue = fieldValues[0];

                        // If value is a linked record, recursively populate fields on this record
                        if (field.fields.length && isLinkAttribute) {
                            const _processFieldValue = (fieldVal, valueFields): Promise<any> => {
                                const linkedLibrary = fieldsProps[field.name].linked_library || fieldVal.library;

                                return this.populateRecordFields(linkedLibrary, fieldVal, valueFields);
                            };

                            const linkFields = field.fields;

                            // "value" is the linked record,
                            // so retrieve fields requested for this record through the "value" field
                            const valueLinkFields = linkFields.reduce((acc, linkField) => {
                                if (linkField.name === 'value') {
                                    acc = acc.concat(linkField.fields);
                                } else if (linkField.name !== 'id_value') {
                                    acc.push(linkField);
                                }

                                return acc;
                            }, []);

                            // If value is an array (like in tree values), populate recursively all elements
                            if (Array.isArray(fieldValue.value)) {
                                fieldValue.value = await Promise.all(
                                    fieldValue.value.map(val => _processFieldValue(val, valueLinkFields))
                                );
                            } else {
                                fieldValue.value = await _processFieldValue(fieldValue.value, valueLinkFields);
                            }

                            // Add library on linked record to help determine which type is the record
                            if (isLinkAttribute && fieldsProps[field.name].linked_library) {
                                fieldValue.value.library = fieldsProps[field.name].linked_library;
                            }
                        }

                        value = fieldValue;
                    }
                } else if (field.name !== 'id') {
                    // Format attribute field into simple value
                    value = {
                        value: record[field.name]
                    };
                }

                // Run actions list, if any
                if (field.name !== 'id') {
                    let processedValue;

                    if (!isLinkAttribute && value !== null) {
                        processedValue =
                            !!fieldsProps[field.name].actions_list && !!fieldsProps[field.name].actions_list.getValue
                                ? await actionsListDomain.runActionsList(
                                      fieldsProps[field.name].actions_list.getValue,
                                      value,
                                      {
                                          attribute: fieldsProps[field.name],
                                          recordId: record.id,
                                          library,
                                          value
                                      }
                                  )
                                : value;

                        processedValue.raw_value = value.value;
                    } else {
                        processedValue = value;
                    }

                    record[field.name] = processedValue;
                }
            }

            return record;
        }
    };
}
