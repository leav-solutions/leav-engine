import {aql} from 'arangojs';
import {AqlQuery} from 'arangojs/lib/cjs/aql-query';
import {IAttribute} from '../../_types/attribute';
import {IValue} from '../../_types/value';
import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';
import {IAttributeTypeRepo} from './attributeTypesRepo';
const VALUES_LINKS_COLLECTION = 'core_edge_values_links';

export default function(
    dbService: IDbService | any,
    attributeSimpleRepo: IAttributeTypeRepo,
    dbUtils: IDbUtils
): IAttributeTypeRepo {
    return {
        async createValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            return attributeSimpleRepo.createValue(library, recordId, attribute, value);
        },
        async updateValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            return attributeSimpleRepo.updateValue(library, recordId, attribute, value);
        },
        async deleteValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            return attributeSimpleRepo.deleteValue(library, recordId, attribute, value);
        },
        async getValues(library: string, recordId: number, attribute: IAttribute): Promise<IValue[]> {
            const libCollec = dbService.db.collection(library);
            const linkedLibCollec = dbService.db.collection(attribute.linked_library);

            const res = await dbService.execute(aql`
                FOR r IN ${libCollec}
                    FILTER r._key == ${recordId}
                    FOR l IN ${linkedLibCollec}
                        FILTER r.${attribute.id} == l._key
                        RETURN l
            `);

            return res.slice(0, 1).map(r => ({id_value: null, value: dbUtils.cleanup(r)}));
        },
        async getValueById(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            return null;
        },
        filterQueryPart(fieldName: string, index: number, value: string): AqlQuery {
            return null;
        },
        async clearAllValues(attribute: IAttribute): Promise<boolean> {
            return true;
        }
    };
}
