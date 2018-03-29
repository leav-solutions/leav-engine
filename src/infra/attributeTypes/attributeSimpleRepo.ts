import {IDbService} from '../db/dbService';
import {IAttributeTypeRepo} from '../attributeRepo';
import {IValue} from '_types/value';
import {IAttribute} from '_types/attribute';
import {aql} from 'arangojs';
import {AqlQuery} from 'arangojs/lib/esm/aql-query';

export default function(dbService: IDbService | any): IAttributeTypeRepo {
    async function _saveValue(
        library: string,
        recordId: number,
        attribute: IAttribute,
        value: IValue
    ): Promise<IValue> {
        const collec = dbService.db.collection(library);
        const updatedDoc = await collec.update(
            {
                _key: recordId
            },
            {
                [attribute.id]: value.value
            },
            {
                keepNull: false
            }
        );

        const docData = await collec.document(updatedDoc);

        return {value: typeof docData[attribute.id] !== 'undefined' ? docData[attribute.id] : null};
    }

    return {
        async createValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            return _saveValue(library, recordId, attribute, value);
        },
        async updateValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            return _saveValue(library, recordId, attribute, value);
        },
        async deleteValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            return _saveValue(library, recordId, attribute, {...value, value: null});
        },
        async getValues(library: string, recordId: number, attribute: IAttribute): Promise<IValue[]> {
            const res = await dbService.execute(aql`
                FOR r IN ${library}
                    FILTER r._key == ${recordId}
                    RETURN r.${attribute.id}
            `);

            return [
                {
                    value: res[0],
                    attribute: attribute.id
                }
            ];
        },
        async getValueById(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            return null;
        },
        filterQueryPart(fieldName: string, index: number, value: string): AqlQuery {
            const query = `FILTER r.@filterField${index} == @filterValue${index}`;

            fieldName = fieldName === 'id' ? '_key' : fieldName;

            const bindVars = {
                ['filterField' + index]: fieldName,
                ['filterValue' + index]: value
            };

            return {query, bindVars};
        }
    };
}
