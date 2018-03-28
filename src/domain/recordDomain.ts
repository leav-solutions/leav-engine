import {IRecordRepo} from 'infra/recordRepo';
import * as moment from 'moment';
import {IRecord, IRecordFilterOption, IQueryField} from '_types/record';
import {IAttributeDomain} from './attributeDomain';
import {AttributeFormats, IAttribute, AttributeTypes} from '../_types/attribute';
import valueDomain from './valueDomain';
import {IAttributeTypeRepo} from 'infra/attributeRepo';

export interface IRecordFiltersLight {
    [attrId: string]: string;
}

export interface IRecordDomain {
    /**
     * Create new record
     *
     * @param library       Library ID
     * @param recordData
     */
    createRecord?(library: string): Promise<IRecord>;

    /**
     * Delete record
     *
     * @param library    Library ID
     * @param id         Record ID
     * @param recordData
     */
    deleteRecord?(library: string, id: number): Promise<IRecord>;

    find(library: string, filters?: IRecordFiltersLight, fields?: IQueryField[]): Promise<IRecord[]>;
    populateRecordFields(linbrary: string, record: IRecord, queryFields: IQueryField[]): Promise<IRecord>;
}

export default function(recordRepo: IRecordRepo, attributeDomain: IAttributeDomain): IRecordDomain {
    return {
        async createRecord(library: string): Promise<IRecord> {
            const recordData = {created_at: moment().unix(), modified_at: moment().unix()};

            return recordRepo.createRecord(library, recordData);
        },
        async deleteRecord(library: string, id: number): Promise<IRecord> {
            try {
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
            } catch (e) {
                throw new Error('Delete record ' + e);
            }
        },
        async find(library: string, filters?: IRecordFiltersLight, fields?: IQueryField[]): Promise<IRecord[]> {
            try {
                const fullFilters: IRecordFilterOption[] = [];

                if (typeof filters !== 'undefined' && filters) {
                    for (const attrId of Object.keys(filters)) {
                        const attribute = await attributeDomain.getAttributeProperties(attrId);
                        const value =
                            attribute.format === AttributeFormats.NUMERIC ? Number(filters[attrId]) : filters[attrId];

                        fullFilters.push({
                            attribute,
                            value,
                            typeRepo: attributeDomain.getTypeRepo(attribute)
                        });
                    }
                }

                let records = await recordRepo.find(library, fullFilters);

                if (typeof fields !== 'undefined' && fields.length) {
                    records = await Promise.all(
                        records.map(record => this.populateRecordFields(library, record, fields))
                    );
                }

                return records;
            } catch (e) {
                throw new Error('Find records ' + e);
            }
        },
        async populateRecordFields(library: string, record: IRecord, queryFields: IQueryField[]): Promise<IRecord> {
            const fieldsProps: {[attrName: string]: IAttribute} = {};
            const fieldsTypeRepo: {[attrName: string]: IAttributeTypeRepo} = {};

            for (const field of queryFields) {
                // Retrieve field properties
                if (typeof fieldsProps[field.name] === 'undefined') {
                    fieldsProps[field.name] = await attributeDomain.getAttributeProperties(field.name);
                    fieldsTypeRepo[field.name] = await attributeDomain.getTypeRepo(fieldsProps[field.name]);
                }

                const isLinkAttribute =
                    fieldsProps[field.name].type === AttributeTypes.SIMPLE_LINK ||
                    fieldsProps[field.name].type === AttributeTypes.ADVANCED_LINK;

                // Get field value
                if (
                    typeof record[field.name] === 'undefined' ||
                    fieldsProps[field.name].type !== AttributeTypes.SIMPLE
                ) {
                    const fieldValues = await fieldsTypeRepo[field.name].getValues(
                        library,
                        record.id,
                        fieldsProps[field.name]
                    );

                    if (fieldValues.length) {
                        const fieldValue = fieldValues[0];

                        // If value is a linked record, populate fields on this record
                        if (field.fields.length && isLinkAttribute) {
                            const linkFields = field.fields;

                            const valueLinkFields = linkFields.reduce((acc, linkField) => {
                                if (linkField.name === 'value') {
                                    acc = acc.concat(linkField.fields);
                                } else {
                                    acc.push(linkField);
                                }

                                return acc;
                            }, []);

                            fieldValue.value = await this.populateRecordFields(
                                fieldsProps[field.name].linked_library,
                                fieldValue.value,
                                valueLinkFields
                            );

                            if (isLinkAttribute && fieldsProps[field.name].linked_library) {
                                fieldValue.value.library = fieldsProps[field.name].linked_library;
                            }
                        }

                        record[field.name] = fieldValue;
                    }
                } else if (field.name !== 'id') {
                    record[field.name] = {
                        value: record[field.name]
                    };
                }
            }

            return record;
        }
    };
}
