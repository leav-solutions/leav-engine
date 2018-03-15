import {IRecordRepo} from 'infra/recordRepo';
import * as moment from 'moment';
import {IAttributeDomain} from './attributeDomain';
import {IValueRepo} from 'infra/valueRepo';
import {ILibraryDomain} from './libraryDomain';
import {IValue} from '_types/value';

export interface IValueDomain {
    saveValue?(library: string, recordId: string, attribute: string, value: IValue): Promise<IValue>;
}

export default function(
    attributeDomain: IAttributeDomain,
    libraryDomain: ILibraryDomain,
    valueRepo: IValueRepo
): IValueDomain {
    return {
        async saveValue(library: string, recordId: string, attribute: string, value: IValue): Promise<IValue> {
            try {
                // Get library
                const lib = await libraryDomain.getLibraries({id: library});

                // Check if exists and can delete
                if (!lib.length) {
                    throw new Error('Unknown library');
                }

                const attr = await attributeDomain.getAttributeProperties(attribute);

                // Check if value ID actually exists
                if (value.id) {
                    const existingVal = await valueRepo.getValueById(value.id);

                    if (existingVal === null) {
                        throw new Error('Unknown value');
                    }
                }

                const valueToSave = {
                    ...value,
                    modified_at: moment().unix()
                };

                if (!value.id) {
                    valueToSave.created_at = moment().unix();
                }

                return valueRepo.saveValue(library, recordId, attr, valueToSave);
            } catch (e) {
                throw new Error('Save value : ' + e);
            }
        }
    };
}
