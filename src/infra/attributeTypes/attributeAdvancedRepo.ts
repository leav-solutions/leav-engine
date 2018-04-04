import {IDbService} from '../db/dbService';
import {IAttributeTypeRepo} from '../attributeTypesRepo';
import {IValue} from '_types/value';
import {IAttribute} from '_types/attribute';
import {aql} from 'arangojs';
import {AqlQuery} from 'arangojs/lib/esm/aql-query';

const VALUES_COLLECTION = 'core_values';
const VALUES_LINKS_COLLECTION = 'core_edge_values_links';

export default function(dbService: IDbService | any): IAttributeTypeRepo {
    return {
        async createValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            const valCollec = dbService.db.collection(VALUES_COLLECTION);
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            // Create new value entity
            const valueData = {
                value: value.value
            };

            const savedVal = await valCollec.save(valueData);
            const savedValDoc = await valCollec.document(savedVal);

            // Create the link record<->value and add some metadata on it
            const edgeData = {
                _from: library + '/' + recordId,
                _to: savedVal._id,
                attribute: attribute.id,
                modified_at: value.modified_at,
                created_at: value.created_at
            };

            let savedEdge;
            savedEdge = await edgeCollec.save(edgeData);
            savedEdge = await edgeCollec.firstExample(savedEdge);

            return {
                id: savedValDoc._key,
                value: savedValDoc.value,
                attribute: savedEdge.attribute,
                modified_at: savedEdge.modified_at,
                created_at: savedEdge.created_at
            };
        },
        async updateValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            const valCollec = dbService.db.collection(VALUES_COLLECTION);
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            // Save value entity
            const valueData = {
                value: value.value
            };
            const savedVal = await valCollec.update({_key: value.id}, valueData);
            const savedValDoc = await valCollec.document(savedVal);

            // Update value's metadata on record<->value link
            const edgeData = {
                _from: library + '/' + recordId,
                _to: savedVal._id,
                attribute: attribute.id,
                modified_at: value.modified_at,
                created_at: value.created_at
            };

            let savedEdge;
            await edgeCollec.updateByExample({_from: edgeData._from, _to: edgeData._to}, edgeData);
            savedEdge = await edgeCollec.firstExample({_from: edgeData._from, _to: edgeData._to});

            return {
                id: savedValDoc._key,
                value: savedValDoc.value,
                attribute: savedEdge.attribute,
                modified_at: savedEdge.modified_at,
                created_at: savedEdge.created_at
            };
        },
        async deleteValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            const valCollec = dbService.db.collection(VALUES_COLLECTION);
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            const deletedVal = await valCollec.remove({_key: value.id});

            // Delete the link record<->value and add some metadata on it
            const edgeData = {
                _from: library + '/' + recordId,
                _to: deletedVal._id
            };

            let deletedEdge;
            deletedEdge = await edgeCollec.removeByExample(edgeData);

            return {
                id: deletedVal._key,
                attribute: deletedEdge.attribute,
                modified_at: deletedEdge.modified_at,
                created_at: deletedEdge.created_at
            };
        },
        async getValues(library: string, recordId: number, attribute: IAttribute): Promise<IValue[]> {
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            const res = await dbService.execute(aql`
                FOR value, edge
                    IN 1 OUTBOUND ${library + '/' + recordId}
                    ${edgeCollec}
                    FILTER edge.attribute == ${attribute.id}
                    RETURN {value, edge}
            `);

            return res.map(r => ({
                id: r.value._key,
                value: r.value.value,
                attribute: r.edge.attribute,
                modified_at: r.edge.modified_at,
                created_at: r.edge.created_at
            }));
        },
        async getValueById(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            const valCollec = dbService.db.collection(VALUES_COLLECTION);
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            const values = await valCollec.lookupByKeys([value.id]);

            if (!values.length) {
                return null;
            }

            const valueLinks = await edgeCollec.inEdges(values[0]);

            return {
                id: values[0]._key,
                value: values[0].value,
                attribute: valueLinks[0].attribute,
                modified_at: valueLinks[0].modified_at,
                created_at: valueLinks[0].created_at
            };
        },
        filterQueryPart(fieldName: string, index: number, value: string): AqlQuery {
            const query = `LET filterField0 = (
                FOR v, e IN 1 OUTBOUND r._id
                @@linkCollection
                FILTER e.attribute == @filterField0 RETURN v.value
            ) FILTER filterField0 LIKE @filterValue0`;

            const bindVars = {
                ['@linkCollection']: VALUES_LINKS_COLLECTION,
                ['filterField' + index]: fieldName,
                ['filterValue' + index]: '%' + value + '%'
            };

            return {query, bindVars};
        },
        async clearAllValues(attribute: IAttribute): Promise<boolean> {
            return true;
        }
    };
}
