import {IRecordRepo} from 'infra/recordRepo';
import * as moment from 'moment';
import {IAttributeDomain} from './attributeDomain';
import {ILibraryDomain} from './libraryDomain';
import {IValue} from '_types/value';
import {IAttributeTypeRepo} from 'infra/attributeRepo';
import {AttributeTypes} from '../_types/attribute';
import ValidationError from '../errors/ValidationError';

export interface IValueDomain {
    saveValue?(library: string, recordId: number, attribute: string, value: IValue): Promise<IValue>;
    deleteValue?(library: string, recordId: number, attribute: string, value: IValue): Promise<IValue>;
}

export default function(attributeDomain: IAttributeDomain, libraryDomain: ILibraryDomain): IValueDomain {
    return {
        async saveValue(library: string, recordId: number, attribute: string, value: IValue): Promise<IValue> {
            // Get library
            const lib = await libraryDomain.getLibraries({id: library});

            // Check if exists and can delete
            if (!lib.length) {
                throw new ValidationError([{id: 'Unknown library'}]);
            }

            const attr = await attributeDomain.getAttributeProperties(attribute);
            const attrTypeRepo = attributeDomain.getTypeRepo(attr);

            // Check if value ID actually exists
            if (value.id && attr.type !== AttributeTypes.SIMPLE) {
                const existingVal = await attrTypeRepo.getValueById(library, recordId, attr, value);

                if (existingVal === null) {
                    throw new ValidationError([{id: 'Unknown value'}]);
                }
            }

            const valueToSave = {
                ...value,
                modified_at: moment().unix()
            };

            if (!value.id) {
                valueToSave.created_at = moment().unix();
            }

            return value.id && attr.type !== AttributeTypes.SIMPLE
                ? attrTypeRepo.updateValue(library, recordId, attr, valueToSave)
                : attrTypeRepo.createValue(library, recordId, attr, valueToSave);
        },
        async deleteValue(library: string, recordId: number, attribute: string, value: IValue): Promise<IValue> {
            // Get library
            const lib = await libraryDomain.getLibraries({id: library});

            // Check if exists and can delete
            if (!lib.length) {
                throw new ValidationError([{id: 'Unknown library'}]);
            }

            const attr = await attributeDomain.getAttributeProperties(attribute);
            const attrTypeRepo = attributeDomain.getTypeRepo(attr);

            // Check if value ID actually exists
            if (value.id && attr.type !== AttributeTypes.SIMPLE) {
                const existingVal = await attrTypeRepo.getValueById(library, recordId, attr, value);

                if (existingVal === null) {
                    throw new ValidationError([{id: 'Unknown value'}]);
                }
            }

            return attrTypeRepo.deleteValue(library, recordId, attr, value);
        }
    };
}
