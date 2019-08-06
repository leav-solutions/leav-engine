import {aql} from 'arangojs';
import {AqlQuery} from 'arangojs/lib/cjs/aql-query';
import {IDbUtils} from 'infra/db/dbUtils';
import {IAttribute} from '../../_types/attribute';
import {IValue, IValuesOptions} from '../../_types/value';
import {IDbService} from '../db/dbService';
import {IAttributeTypeRepo} from './attributeTypesRepo';

const VALUES_COLLECTION = 'core_values';
const VALUES_LINKS_COLLECTION = 'core_edge_values_links';

export default function(dbService: IDbService | any, dbUtils: IDbUtils = null): IAttributeTypeRepo {
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
            const edgeData: any = {
                _from: library + '/' + recordId,
                _to: savedVal._id,
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
                id_value: savedValDoc._key,
                value: savedValDoc.value,
                attribute: savedEdge.attribute,
                modified_at: savedEdge.modified_at,
                created_at: savedEdge.created_at
            };

            if (value.version) {
                res.version = dbUtils.convertValueVersionFromDb(savedEdge.version);
            }

            return res;
        },
        async updateValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            const valCollec = dbService.db.collection(VALUES_COLLECTION);
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            // Save value entity
            const valueData = {
                value: value.value
            };
            const savedVal = await valCollec.update({_key: value.id_value}, valueData);
            const savedValDoc = await valCollec.document(savedVal);

            // Update value's metadata on record<->value link
            const edgeData: any = {
                _from: library + '/' + recordId,
                _to: savedVal._id,
                attribute: attribute.id,
                modified_at: value.modified_at,
                created_at: value.created_at
            };

            if (value.version) {
                edgeData.version = dbUtils.convertValueVersionToDb(value.version);
            }

            let savedEdge;
            await edgeCollec.updateByExample({_from: edgeData._from, _to: edgeData._to}, edgeData);
            savedEdge = await edgeCollec.firstExample({_from: edgeData._from, _to: edgeData._to});

            const res: IValue = {
                id_value: savedValDoc._key,
                value: savedValDoc.value,
                attribute: savedEdge.attribute,
                modified_at: savedEdge.modified_at,
                created_at: savedEdge.created_at
            };

            if (value.version) {
                res.version = dbUtils.convertValueVersionFromDb(savedEdge.version);
            }

            return res;
        },
        async deleteValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            const valCollec = dbService.db.collection(VALUES_COLLECTION);
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            const deletedVal = await valCollec.remove({_key: value.id_value});

            // Delete the link record<->value and add some metadata on it
            const edgeData = {
                _from: library + '/' + recordId,
                _to: deletedVal._id
            };

            let deletedEdge;
            deletedEdge = await edgeCollec.removeByExample(edgeData);

            return {
                id_value: deletedVal._key,
                attribute: deletedEdge.attribute,
                modified_at: deletedEdge.modified_at,
                created_at: deletedEdge.created_at
            };
        },
        async getValues(
            library: string,
            recordId: number,
            attribute: IAttribute,
            forceGetAllValues: boolean = false,
            options?: IValuesOptions
        ): Promise<IValue[]> {
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            const queryParts = [
                aql`
                FOR value, edge
                IN 1 OUTBOUND ${library + '/' + recordId}
                ${edgeCollec}
                FILTER edge.attribute == ${attribute.id}
                `
            ];

            if (!forceGetAllValues && typeof options !== 'undefined' && options.version) {
                queryParts.push(aql`FILTER edge.version == ${options.version}`);
            }

            const limitOne = aql.literal(!attribute.multiple_values && !forceGetAllValues ? 'LIMIT 1' : '');
            queryParts.push(aql`
                ${limitOne}
                RETURN {value, edge}
            `);
            const query = aql.join(queryParts);
            const res = await dbService.execute(query);

            return res.map(r => ({
                id_value: r.value._key,
                value: r.value.value,
                attribute: r.edge.attribute,
                modified_at: r.edge.modified_at,
                created_at: r.edge.created_at,
                version: dbUtils.convertValueVersionFromDb(r.edge.version)
            }));
        },
        async getValueById(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            const valCollec = dbService.db.collection(VALUES_COLLECTION);
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            const values = await valCollec.lookupByKeys([value.id_value]);

            if (!values.length) {
                return null;
            }

            const valueLinks = await edgeCollec.inEdges(values[0]);

            return {
                id_value: values[0]._key,
                value: values[0].value,
                attribute: valueLinks[0].attribute,
                modified_at: valueLinks[0].modified_at,
                created_at: valueLinks[0].created_at
            };
        },
        filterQueryPart(fieldName: string, index: number, value: string): AqlQuery {
            const collec = dbService.db.collection(VALUES_LINKS_COLLECTION);
            const filterName = aql.literal('filterField' + index);
            const query = aql`LET ${filterName} = (
                FOR v, e IN 1 OUTBOUND r._id
                ${collec}
                FILTER e.attribute == ${fieldName} RETURN v.value
            ) FILTER ${filterName} LIKE ${'%' + value + '%'}`;

            return query;
        },
        async clearAllValues(attribute: IAttribute): Promise<boolean> {
            return true;
        }
    };
}
