import {aql} from 'arangojs';
import {AqlQuery} from 'arangojs/lib/cjs/aql-query';
import {IValue} from '_types/value';
import {IAttribute} from '../../_types/attribute';
import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';
import {IAttributeTypeRepo} from './attributeTypesRepo';

const VALUES_LINKS_COLLECTION = 'core_edge_values_links';

export default function(dbService: IDbService | any, dbUtils: IDbUtils = null): IAttributeTypeRepo {
    return {
        async createValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            // Create the link between records and add some metadata on it
            const edgeData: any = {
                _from: library + '/' + recordId,
                _to: attribute.linked_library + '/' + value.value,
                attribute: attribute.id,
                modified_at: value.modified_at,
                created_at: value.created_at
            };

            if (value.version) {
                edgeData.version = dbUtils.convertValueVersionToDb(value.version);
            }

            let savedEdge;
            savedEdge = await edgeCollec.save(edgeData);
            savedEdge = await edgeCollec.firstExample(savedEdge);

            const res: IValue = {
                id_value: savedEdge._key,
                value: Number(savedEdge._to.split('/')[1]),
                attribute: savedEdge.attribute,
                modified_at: savedEdge.modified_at,
                created_at: savedEdge.created_at,
                version: savedEdge.version
            };

            if (value.version) {
                res.version = dbUtils.convertValueVersionFromDb(savedEdge.version);
            }

            return res;
        },
        async updateValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            // Update value's metadata on records link
            const edgeData: any = {
                _from: library + '/' + recordId,
                _to: attribute.linked_library + '/' + value.value,
                attribute: attribute.id,
                modified_at: value.modified_at
            };

            if (value.version) {
                edgeData.version = dbUtils.convertValueVersionToDb(value.version);
            }

            let savedEdge;
            await edgeCollec.updateByExample({_key: value.id_value}, edgeData);
            savedEdge = await edgeCollec.firstExample({_key: value.id_value});

            const res: IValue = {
                id_value: savedEdge._key,
                value: Number(savedEdge._to.split('/')[1]),
                attribute: savedEdge.attribute,
                modified_at: savedEdge.modified_at,
                created_at: savedEdge.created_at,
                version: savedEdge.version
            };

            if (value.version) {
                res.version = dbUtils.convertValueVersionFromDb(savedEdge.version);
            }

            return res;
        },
        async deleteValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            // Create the link between records and add some metadata on it
            const edgeData = {
                _key: value.id_value
            };

            let deletedEdge;
            deletedEdge = await edgeCollec.removeByExample(edgeData);

            return {
                id_value: value.id_value
            };
        },
        async getValues(library: string, recordId: number, attribute: IAttribute): Promise<IValue[]> {
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);
            const res = await dbService.execute(aql`
                FOR linkedRecord, edge
                    IN 1 OUTBOUND ${library + '/' + recordId}
                    ${edgeCollec}
                    FILTER edge.attribute == ${attribute.id}
                    RETURN {linkedRecord, edge}
            `);

            const valuesToReturn = attribute.multipleValues ? res : res.slice(0, 1);

            return valuesToReturn.map(r => ({
                id_value: Number(r.edge._key),
                value: dbUtils.cleanup(r.linkedRecord),
                attribute: r.edge.attribute,
                modified_at: r.edge.modified_at,
                created_at: r.edge.created_at
            }));
        },
        async getValueById(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            const query = aql`
                FOR linkedRecord, edge
                    IN 1 OUTBOUND ${library + '/' + recordId}
                    ${edgeCollec}
                    FILTER edge._key == ${value.id_value}
                    FILTER edge.attribute == ${attribute.id}
                    LIMIT 1
                    RETURN {linkedRecord, edge}
            `;

            const res = await dbService.execute(query);

            if (!res.length) {
                return null;
            }

            return {
                id_value: Number(res[0].edge._key),
                value: dbUtils.cleanup(res[0].linkedRecord),
                attribute: res[0].edge.attribute,
                modified_at: res[0].edge.modified_at,
                created_at: res[0].edge.created_at
            };
        },
        filterQueryPart(fieldName: string, index: number, value: string): AqlQuery {
            return null;
        },
        async clearAllValues(attribute: IAttribute): Promise<boolean> {
            return true;
        }
    };
}
