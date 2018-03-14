import {IRecordRepo} from 'infra/recordRepo';
import * as moment from 'moment';
import {IAttributeDomain} from './attributeDomain';
import {IValueRepo} from 'infra/valueRepo';
import {ILibraryDomain} from './libraryDomain';

export interface IValue {
    id?: number;
    value?: any;
    created_at?: number;
    mdofiier_at?: number;
}

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

                return valueRepo.saveValue(library, recordId, attr, value);
            } catch (e) {
                throw new Error('Save value : ' + e);
            }
        }
    };
}
