import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';
import {IRecord, IRecordFilterOption} from '_types/record';
import {aql} from 'arangojs';
import {UserError} from 'graphql-errors';
import {IAttributeRepo} from '../attribute/attributeRepo';
import {IAttribute} from '_types/attribute';
import {IValue} from '_types/value';
import {IAttributeTypesRepo} from '../attributeTypes/attributeTypesRepo';

export interface IValueRepo {
    /**
     * Create a new value
     *
     * @param library
     * @param recordId
     * @param attribute
     * @param value
     * @param {}
     */
    createValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue>;

    /**
     * Update an existing value. Field "id" is expected on the value
     * @param library
     * @param recordId
     * @param attribute
     * @param value
     * @param {}
     */
    updateValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue>;

    /**
     * Delete an existing value. Field "id" is expected on the value
     *
     * @param library
     * @param recordId
     * @param attribute
     * @param value
     * @param {}
     */
    deleteValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue>;

    /**
     * Get all values for given record and attribute
     *
     * @param library
     * @param recordId
     * @param attribute
     * @return Array<{}>    Return an empty array if no value found
     */
    getValues(library: string, recordId: number, attribute: IAttribute, options?: any): Promise<IValue[]>;

    /**
     * Return a specific value based on its ID. Field "id" is expect on the value
     *
     * @param library
     * @param recordId
     * @param attribute
     * @param value
     * @return {}   Return null if no value found
     */
    getValueById(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue>;
    clearAllValues(attribute: IAttribute): Promise<boolean>;
}

export default function(attributeTypesRepo: IAttributeTypesRepo | null = null): IValueRepo {
    return {
        createValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            const typeRepo = attributeTypesRepo.getTypeRepo(attribute);
            return typeRepo.createValue(library, recordId, attribute, value);
        },
        updateValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            const typeRepo = attributeTypesRepo.getTypeRepo(attribute);
            return typeRepo.updateValue(library, recordId, attribute, value);
        },
        deleteValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            const typeRepo = attributeTypesRepo.getTypeRepo(attribute);
            return typeRepo.deleteValue(library, recordId, attribute, value);
        },
        getValues(library: string, recordId: number, attribute: IAttribute): Promise<IValue[]> {
            const typeRepo = attributeTypesRepo.getTypeRepo(attribute);
            return typeRepo.getValues(library, recordId, attribute);
        },
        getValueById(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            const typeRepo = attributeTypesRepo.getTypeRepo(attribute);
            return typeRepo.getValueById(library, recordId, attribute, value);
        },
        clearAllValues(attribute: IAttribute): Promise<boolean> {
            const typeRepo = attributeTypesRepo.getTypeRepo(attribute);
            return typeRepo.clearAllValues(attribute);
        }
    };
}
