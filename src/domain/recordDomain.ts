import {IRecordRepo} from 'infra/recordRepo';
import * as moment from 'moment';
import {IRecord, IRecordFilterOption, IQueryField} from '_types/record';
import {IAttributeDomain} from './attributeDomain';
import {AttributeFormats, IAttribute, AttributeTypes} from '../_types/attribute';
import valueDomain from './valueDomain';
import {IAttributeTypeRepo} from 'infra/attributeTypesRepo';
import {IValueRepo} from 'infra/valueRepo';
import {IValue} from '_types/value';
import {IActionsListDomain} from './actionsListDomain';

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
     * @param recordData
     */
    updateRecord(library: string, recordData: IRecord): Promise<IRecord>;

    /**
     * Delete record
     *
     * @param library    Library ID
     * @param id         Record ID
     * @param recordData
     */
    deleteRecord(library: string, id: number): Promise<IRecord>;

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
    actionsListDomain: IActionsListDomain = null
): IRecordDomain {
    return {
        async createRecord(library: string): Promise<IRecord> {
            const recordData = {created_at: moment().unix(), modified_at: moment().unix()};

            return recordRepo.createRecord(library, recordData);
        },
        async updateRecord(library: string, recordData: IRecord): Promise<IRecord> {
            return recordRepo.updateRecord(library, recordData);
        },
        async deleteRecord(library: string, id: number): Promise<IRecord> {
            // Get library
            // const lib = await this.getLibraries({id});

            // // Check if exists and can delete
            // if (!lib.length) {
            //     throw new Error('Unknown library');
            // }

            // if (lib.pop().system) {
            //     throw new Error('Cannot delete system library');
            // }

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
