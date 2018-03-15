import {IAttribute, AttributeTypes} from '../domain/attributeDomain';
import {IValue} from '../domain/valueDomain';
import {IDbService} from './db/dbService';
import {aql} from 'arangojs';

const VALUES_COLLECTION = 'core_values';
const VALUES_LINKS_COLLECTION = 'core_edge_values_links';

export interface IValueRepo {
    saveValue?(library: string, recordId: string, attribute: IAttribute, value: IValue): Promise<IValue>;
    getValueById?(valueId: number): Promise<IValue>;
    getValues?(library: string, recordId: number, attribute: IAttribute): Promise<IValue[]>;
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
            } else if (attribute.type === AttributeTypes.STANDARD) {
                const valCollec = dbService.db.collection(VALUES_COLLECTION);
                const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

                const valueData = {
                    value: value.value
                };

                const savedVal = value.id
                    ? await valCollec.update({_key: value.id}, valueData)
                    : await valCollec.save(valueData);

                const savedValDoc = await valCollec.document(savedVal);

                const edgeData = {
                    _from: library + '/' + recordId,
                    _to: savedVal._id,
                    attribute: attribute.id,
                    modified_at: value.modified_at,
                    created_at: value.created_at
                };

                let savedEdge;
                if (value.id) {
                    await edgeCollec.updateByExample({_from: edgeData._from, _to: edgeData._to}, edgeData);
                    savedEdge = await edgeCollec.firstExample({_from: edgeData._from, _to: edgeData._to});
                } else {
                    savedEdge = await edgeCollec.save(edgeData);
                    savedEdge = await edgeCollec.firstExample(savedEdge);
                }

                return {
                    id: savedValDoc._key,
                    value: savedValDoc.value,
                    attribute: savedEdge.attribute,
                    modified_at: savedEdge.modified_at,
                    created_at: savedEdge.created_at
                };
            }
        },
        async getValueById(valueId: number): Promise<IValue> {
            const valCollec = dbService.db.collection(VALUES_COLLECTION);
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            const values = await valCollec.lookupByKeys([valueId]);

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
        async getValues(library: string, recordId: number, attribute: IAttribute): Promise<IValue[]> {
            if (attribute.type === AttributeTypes.INDEX) {
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
            } else if (attribute.type === AttributeTypes.STANDARD) {
                const res = await dbService.execute(aql`
                    FOR value, edge
                        IN 1 OUTBOUND ${library + '/' + recordId}
                        ${VALUES_LINKS_COLLECTION}
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
            }
        }
    };
}
