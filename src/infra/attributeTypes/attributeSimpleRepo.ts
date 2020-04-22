import {aql} from 'arangojs';
import {AqlQuery} from 'arangojs/lib/cjs/aql-query';
import {IAttribute} from '../../_types/attribute';
import {IValue} from '../../_types/value';
import {ATTRIB_COLLECTION_NAME} from '../attribute/attributeRepo';
import {IDbService} from '../db/dbService';
import {LIB_ATTRIB_COLLECTION_NAME} from '../library/libraryRepo';
import {IAttributeTypeRepo} from './attributeTypesRepo';
import {IQueryInfos} from '_types/queryInfos';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function({'core.infra.db.dbService': dbService = null}: IDeps = {}): IAttributeTypeRepo {
    async function _saveValue(
        library: string,
        recordId: number,
        attribute: IAttribute,
        value: IValue,
        ctx: IQueryInfos
    ): Promise<IValue> {
        const collec = dbService.db.collection(library);

        const res = await dbService.execute({
            query: aql`
                UPDATE ${{_key: recordId}}
                WITH ${{[attribute.id]: value.value}}
                IN ${collec}
                OPTIONS { keepNull: false }
                RETURN NEW`,
            ctx
        });
        const updatedDoc = res.length ? res[0] : {};

        return {value: typeof updatedDoc[attribute.id] !== 'undefined' ? updatedDoc[attribute.id] : null};
    }

    return {
        async createValue({library, recordId, attribute, value, ctx}): Promise<IValue> {
            return _saveValue(library, recordId, attribute, value, ctx);
        },
        async updateValue({library, recordId, attribute, value, ctx}): Promise<IValue> {
            return _saveValue(library, recordId, attribute, value, ctx);
        },
        async deleteValue({library, recordId, attribute, value, ctx}): Promise<IValue> {
            return _saveValue(library, recordId, attribute, {...value, value: null}, ctx);
        },
        async getValues({library, recordId, attribute, ctx}): Promise<IValue[]> {
            const query = aql`
                FOR r IN ${dbService.db.collection(library)}
                    FILTER r._key == ${String(recordId)}
                    RETURN r.${attribute.id}
            `;
            const res = await dbService.execute({query, ctx});

            return [
                {
                    value: res[0],
                    attribute: attribute.id
                }
            ];
        },
        async getValueById({library, recordId, attribute, value, ctx}): Promise<IValue> {
            return null;
        },
        filterQueryPart(fieldName: string, index: number, value: string): AqlQuery {
            const fieldToUse = fieldName === 'id' ? '_key' : fieldName;
            const query = aql`FILTER r.${fieldToUse} == ${value}`;

            return query;
        },
        async clearAllValues({attribute, ctx}): Promise<boolean> {
            const libAttribCollec = dbService.db.edgeCollection(LIB_ATTRIB_COLLECTION_NAME);

            // TODO: use aql template tag, and find out why it doesn't work :)
            const query = `
                FOR v
                IN 1 INBOUND '${ATTRIB_COLLECTION_NAME}/${attribute.id}'
                ${LIB_ATTRIB_COLLECTION_NAME}
                RETURN v
            `;

            const libraries = await dbService.execute({query, ctx});

            for (const lib of libraries) {
                const recordsCollec = dbService.db.collection(lib._key);
                const clearQuery = aql`
                    FOR r IN ${recordsCollec}
                    FILTER r.${attribute.id} != null
                    UPDATE r WITH {${attribute.id}: null} IN ${recordsCollec} OPTIONS {keepNull: false}
                `;

                await dbService.execute({query: clearQuery, ctx});
            }

            return true;
        }
    };
}
