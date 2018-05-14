import {IRecordRepo} from 'infra/recordRepo';
import * as moment from 'moment';
import {IAttributeDomain} from './attributeDomain';
import {ILibraryDomain} from './libraryDomain';
import {IValue} from '_types/value';
import {AttributeTypes} from '../_types/attribute';
import ValidationError from '../errors/ValidationError';
import {IValueRepo} from 'infra/valueRepo';

export interface IValueDomain {
    saveValue(library: string, recordId: number, attribute: string, value: IValue): Promise<IValue>;
    deleteValue(library: string, recordId: number, attribute: string, value: IValue): Promise<IValue>;
}

export default function(
    attributeDomain: IAttributeDomain | null = null,
    libraryDomain: ILibraryDomain | null = null,
    valueRepo: IValueRepo | null = null,
    recordRepo: IRecordRepo | null = null
): IValueDomain {
    return {
        async saveValue(library: string, recordId: number, attribute: string, value: IValue): Promise<IValue> {
            // Get library
            const lib = await libraryDomain.getLibraries({id: library});

            // Check if exists and can delete
            if (!lib.length) {
                throw new ValidationError({id: 'Unknown library'});
            }

            const attr = await attributeDomain.getAttributeProperties(attribute);

            // Check if value ID actually exists
            if (value.id_value && attr.type !== AttributeTypes.SIMPLE) {
                const existingVal = await valueRepo.getValueById(library, recordId, attr, value);

                if (existingVal === null) {
                    throw new ValidationError({id: 'Unknown value'});
                }
            }

            const valueToSave = {
                ...value,
                modified_at: moment().unix()
            };

            if (!value.id_value) {
                valueToSave.created_at = moment().unix();
            }

            const savedVal =
                value.id_value && attr.type !== AttributeTypes.SIMPLE
                    ? await valueRepo.updateValue(library, recordId, attr, valueToSave)
                    : await valueRepo.createValue(library, recordId, attr, valueToSave);

            const updatedRecord = await recordRepo.updateRecord(library, {id: recordId, modified_at: moment().unix()});

            return savedVal;
        },
        async deleteValue(library: string, recordId: number, attribute: string, value: IValue): Promise<IValue> {
            // Get library
            const lib = await libraryDomain.getLibraries({id: library});

            // Check if exists and can delete
            if (!lib.length) {
                throw new ValidationError({id: 'Unknown library'});
            }

            const attr = await attributeDomain.getAttributeProperties(attribute);
            // Check if value ID actually exists
            if (value.id_value && attr.type !== AttributeTypes.SIMPLE) {
                const existingVal = await valueRepo.getValueById(library, recordId, attr, value);

                if (existingVal === null) {
                    throw new ValidationError({id: 'Unknown value'});
                }
            }

            return valueRepo.deleteValue(library, recordId, attr, value);
        }
    };
}
