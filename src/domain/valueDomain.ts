import {IRecordRepo} from 'infra/recordRepo';
import * as moment from 'moment';
import {IAttributeDomain} from './attributeDomain';
import {ILibraryDomain} from './libraryDomain';
import {IValue} from '_types/value';
import {IAttributeTypeRepo} from 'infra/attributeRepo';
import {AttributeTypes} from '../_types/attribute';

export interface IValueDomain {
    saveValue?(library: string, recordId: number, attribute: string, value: IValue): Promise<IValue>;
}

export default function(attributeDomain: IAttributeDomain, libraryDomain: ILibraryDomain): IValueDomain {
    return {
        async saveValue(library: string, recordId: number, attribute: string, value: IValue): Promise<IValue> {
            try {
                // Get library
                const lib = await libraryDomain.getLibraries({id: library});

                // Check if exists and can delete
                if (!lib.length) {
                    throw new Error('Unknown library');
                }

                const attr = await attributeDomain.getAttributeProperties(attribute);
                const attrTypeRepo = attributeDomain.getTypeRepo(attr);

                // Check if value ID actually exists
                if (value.id && attr.type !== AttributeTypes.SIMPLE) {
                    const existingVal = await attrTypeRepo.getValueById(library, recordId, attr, value);

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

                return value.id && attr.type !== AttributeTypes.SIMPLE
                    ? attrTypeRepo.updateValue(library, recordId, attr, valueToSave)
                    : attrTypeRepo.createValue(library, recordId, attr, valueToSave);
            } catch (e) {
                throw new Error('Save value : ' + e);
            }
        }
    };
}
