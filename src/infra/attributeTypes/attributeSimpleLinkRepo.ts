import {IDbService} from '../db/dbService';
import {IAttributeTypeRepo} from '../attributeRepo';
import {IValue} from '_types/value';
import {IAttribute} from '_types/attribute';
import {IDbUtils} from '../db/dbUtils';
import {aql} from 'arangojs';

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
            return null;
        },
        async getValues(library: string, recordId: number, attribute: IAttribute): Promise<IValue[]> {
            const res = await dbService.execute(aql`
                FOR r IN ${library}
                    FOR l IN ${attribute.linked_library}
                        FILTER r.${attribute.id} == l._key
                        RETURN l
            `);

            return res.map(r => dbUtils.cleanup(r));
        },
        async getValueById(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            return null;
        }
    };
}
