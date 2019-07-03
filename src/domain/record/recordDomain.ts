import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {IRecordRepo} from 'infra/record/recordRepo';
import * as moment from 'moment';
import {IValue, IValuesOptions, IValueVersion} from '_types/value';
import PermissionError from '../../errors/PermissionError';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import {RecordPermissionsActions} from '../../_types/permissions';
import {IQueryInfos} from '../../_types/queryInfos';
import {IQueryField, IRecord, IRecordFilterOption, IRecordIdentity} from '../../_types/record';
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
    find(
        library: string,
        filters?: IRecordFiltersLight,
        fields?: IQueryField[],
        options?: IValuesOptions
    ): Promise<IRecord[]>;

    /**
     * Add values for requested fields on the record. Values can be of any types here.
     *
     * @param library
     * @param record
     * @param queryFields Fields to retrieve
     */
    populateRecordFields(
        library: string,
        record: IRecord,
        queryFields: IQueryField[],
        options?: IValuesOptions
    ): Promise<IRecord>;

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
     * Recursively populate fields on a link attribute
     *
     * @param attrProps
     * @param field
     * @param fieldValue
     */
    const _populateFieldsLinkAttribute = async (
        attrProps: IAttribute,
        field: IQueryField,
        fieldValue: IValue
    ): Promise<IValue> => {
        if (field.fields.length) {
            const _processFieldValue = (record: IRecord, valueFields: IQueryField[]): Promise<IRecord> => {
                const linkedLibrary = attrProps.linked_library || record.library;
                return ret.populateRecordFields(linkedLibrary, record, valueFields);
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
            if (attrProps.linked_library) {
                fieldValue.value.library = attrProps.linked_library;
            }
        }

        return fieldValue;
    };

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
    ) => {
        let processedValue: IValue;
        if (!isLinkAttribute && value !== null) {
            processedValue =
                !!attrProps.actions_list && !!attrProps.actions_list.getValue
                    ? await actionsListDomain.runActionsList(attrProps.actions_list.getValue, value, {
                          attribute: attrProps,
                          recordId: record.id,
                          library,
                          value
                      })
                    : value;
            processedValue.raw_value = value.value;
        } else {
            processedValue = value;
        }

        return processedValue;
    };

    const ret = {
        async createRecord(library: string): Promise<IRecord> {
            const recordData = {created_at: moment().unix(), modified_at: moment().unix()};

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
        async find(
            library: string,
            filters?: IRecordFiltersLight,
            fields?: IQueryField[],
            version?: IValueVersion
        ): Promise<IRecord[]> {
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
                records = await Promise.all(
                    records.map(record => this.populateRecordFields(library, record, fields, version))
                );
            }

            return records;
        },
        async populateRecordFields(
            library: string,
            record: IRecord,
            queryFields: IQueryField[],
            options?: IValuesOptions
        ): Promise<IRecord> {
            const fieldsProps: {[attrName: string]: IAttribute} = {};

            for (const field of queryFields) {
                // Library has its own resolver, just ignore it
                if (field.name === 'library' || field.name === 'whoAmI') {
                    continue;
                }

                // Retrieve field properties
                if (typeof fieldsProps[field.name] === 'undefined') {
                    fieldsProps[field.name] = await attributeDomain.getAttributeProperties(field.name);
                }

                const isLinkAttribute =
                    fieldsProps[field.name].type === AttributeTypes.SIMPLE_LINK ||
                    fieldsProps[field.name].type === AttributeTypes.ADVANCED_LINK;

                // Get field value
                if (
                    typeof record[field.name] === 'undefined' ||
                    fieldsProps[field.name].type !== AttributeTypes.SIMPLE
                ) {
                    // We haven't retrieved this value yet (straight from query for example),
                    // so let's get it from DB now
                    const fieldOpts = {...options, ...field.arguments};
                    const fieldValues = await valueDomain.getValues(library, record.id, field.name, fieldOpts);

                    if (fieldValues !== null && fieldValues.length) {
                        const values = await Promise.all(
                            fieldValues.map(async fieldValue => {
                                // If value is a linked record, recursively populate fields on this record
                                if (isLinkAttribute) {
                                    fieldValue = await _populateFieldsLinkAttribute(
                                        fieldsProps[field.name],
                                        field,
                                        fieldValue
                                    );
                                }

                                fieldValue = await _runActionsList(
                                    isLinkAttribute,
                                    fieldValue,
                                    fieldsProps[field.name],
                                    record,
                                    library
                                );

                                return fieldValue;
                            })
                        );

                        record[field.name] = fieldsProps[field.name].multipleValues ? values : values[0];
                    }
                } else if (field.name !== 'id') {
                    // Format attribute field into simple value
                    record[field.name] = {
                        value: record[field.name]
                    };
                }
            }

            return record;
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
        }
    };

    return ret;
}
