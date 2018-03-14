import {IAttribute, AttributeTypes} from '../domain/attributeDomain';
import {IValue} from '../domain/valueDomain';
import {IDbService} from './db/dbService';

export interface IValueRepo {
    saveValue?(library: string, recordId: string, attribute: IAttribute, value: IValue): Promise<IValue>;
}

export default function(dbService: IDbService | any): IValueRepo {
    return {
        async saveValue(library: string, recordId: string, attribute: IAttribute, value: IValue): Promise<IValue> {
            if (attribute.type === AttributeTypes.INDEX) {
                const collec = dbService.db.collection(library);
                const updatedDoc = await collec.update(
                    {
                        _key: recordId
                    },
                    {
                        [attribute.id]: value.value
                    }
                );

                const docData = await collec.document(updatedDoc);

                return {value: docData[attribute.id]};
            }
        }
    };
}
