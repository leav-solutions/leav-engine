import {IValue} from '_types/value';
import {IRecordRepo} from 'infra/recordRepo';
import {IValueRepo} from 'infra/valueRepo';
import * as moment from 'moment';
import {AttributeTypes} from '../_types/attribute';
import ValidationError from '../errors/ValidationError';
import {IActionsListDomain} from './actionsListDomain';
import {IAttributeDomain} from './attributeDomain';
import {ILibraryDomain} from './libraryDomain';

export interface IValueDomain {
    saveValue(library: string, recordId: number, attribute: string, value: IValue): Promise<IValue>;
    deleteValue(library: string, recordId: number, attribute: string, value: IValue): Promise<IValue>;
}

export default function(
    attributeDomain: IAttributeDomain = null,
    libraryDomain: ILibraryDomain = null,
    valueRepo: IValueRepo = null,
    recordRepo: IRecordRepo = null,
    actionsListDomain: IActionsListDomain = null
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

            // Execute actions list. Output value might be different from input value
            const actionsListRes =
                !!attr.actions_list && !!attr.actions_list.saveValue
                    ? await actionsListDomain.runActionsList(attr.actions_list.saveValue, value, {
                          attribute: attr,
                          recordId,
                          library
                      })
                    : value;

            const valueToSave = {
                ...actionsListRes,
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
