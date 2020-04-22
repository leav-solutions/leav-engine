import {aql} from 'arangojs';
import {AqlQuery} from 'arangojs/lib/cjs/aql-query';
import {IAttribute} from '../../_types/attribute';
import {IValue} from '../../_types/value';
import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';
import {IAttributeTypeRepo} from './attributeTypesRepo';
const VALUES_LINKS_COLLECTION = 'core_edge_values_links';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.infra.attributeTypes.attributeSimple'?: IAttributeTypeRepo;
}

export default function({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
    'core.infra.attributeTypes.attributeSimple': attributeSimpleRepo = null
}: IDeps = {}): IAttributeTypeRepo {
    return {
        async createValue(args): Promise<IValue> {
            return attributeSimpleRepo.createValue(args);
        },
        async updateValue(args): Promise<IValue> {
            return attributeSimpleRepo.updateValue(args);
        },
        async deleteValue(args): Promise<IValue> {
            return attributeSimpleRepo.deleteValue(args);
        },
        async getValues({library, recordId, attribute, ctx}): Promise<IValue[]> {
            const libCollec = dbService.db.collection(library);
            const linkedLibCollec = dbService.db.collection(attribute.linked_library);

            const res = await dbService.execute({
                query: aql`
                    FOR r IN ${libCollec}
                        FILTER r._key == ${recordId}
                        FOR l IN ${linkedLibCollec}
                            FILTER r.${attribute.id} == l._key
                            RETURN l
                `,
                ctx
            });

            return res.slice(0, 1).map(r => ({id_value: null, value: dbUtils.cleanup(r)}));
        },
        async getValueById(args): Promise<IValue> {
            return null;
        },
        filterQueryPart(args): AqlQuery {
            return null;
        },
        async clearAllValues(args): Promise<boolean> {
            return true;
        }
    };
}
