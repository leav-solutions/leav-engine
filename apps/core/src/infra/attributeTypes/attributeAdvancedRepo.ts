import {aql, type GeneratedAqlQuery, literal} from 'arangojs/aql';
import {type DocumentCollection, type EdgeCollection} from 'arangojs/collection';
import {type IDbDocument, type IDbEdge} from '../db/_types';
import {type IFilterTypesHelper} from '../record/helpers/filterTypes';
import {VALUES_COLLECTION, VALUES_LINKS_COLLECTION} from '../value/valueRepo';
import {AttributeFormats, type AttributeTypes, type IAttribute} from '../../_types/attribute';
import {type IRecord} from '../../_types/record';
import {type IDistinctValue, type IStandardBaseValue, type IStandardValue, type IValueEdge} from '../../_types/value';
import {type IDbService} from '../db/dbService';
import {BASE_QUERY_IDENTIFIER, type IAttributeTypeRepo} from './attributeTypesRepo';

export interface IAttributeAdvancedRepoDeps {
    'core.infra.db.dbService': IDbService;
    'core.infra.record.helpers.filterTypes': IFilterTypesHelper;
}

export type IAttributeAdvancedRepo = IAttributeTypeRepo<AttributeTypes.ADVANCED>;

export default function ({
    'core.infra.db.dbService': dbService,
    'core.infra.record.helpers.filterTypes': filterTypesHelper,
}: IAttributeAdvancedRepoDeps): IAttributeAdvancedRepo {
    function _getExtendedFilterPart(attributes: IAttribute[], advancedValue: GeneratedAqlQuery): GeneratedAqlQuery {
        return aql`${
            attributes
                .map(a => a.id)
                .slice(1)
                .reduce((acc, value, i) => {
                    acc.push(aql`TRANSLATE(${value}, ${i ? acc[acc.length - 1] : aql`${advancedValue}`})`);
                    if (i) {
                        acc.shift();
                    }
                    return acc;
                }, [])[0]
        }`;
    }

    return {
        async createValue({library, recordId, attribute, value, ctx}): Promise<IStandardValue> {
            const valCollec = dbService.db.collection(VALUES_COLLECTION);
            const edgeCollec = dbService.db.collection(VALUES_LINKS_COLLECTION);

            // Create new value entity
            const valueData = {
                value: value.payload,
            };
            const resVal = await dbService.execute({
                query: aql`
                    INSERT ${valueData}
                    IN ${valCollec}
                    RETURN NEW`,
                ctx,
            });
            const savedVal: Partial<IDbDocument> = resVal.length ? resVal[0] : {};

            // Create the link record<->value and add some metadata on it
            const edgeData: any = {
                _from: library + '/' + recordId,
                _to: savedVal._id,
                attribute: attribute.id,
                modified_at: value.modified_at,
                created_at: value.created_at,
                modified_by: String(ctx.userId),
                created_by: String(ctx.userId),
                version: value.version ?? null,
            };

            if (value.metadata) {
                edgeData.metadata = value.metadata;
            }

            const resEdge = await dbService.execute<IDbEdge[]>({
                query: aql`
                    INSERT ${edgeData}
                    IN ${edgeCollec}
                    RETURN NEW`,
                ctx,
            });
            const savedEdge: Partial<IDbEdge> = resEdge.length ? resEdge[0] : {};

            return {
                id_value: savedVal._key,
                payload: savedVal.value,
                attribute: savedEdge.attribute,
                modified_at: savedEdge.modified_at,
                created_at: savedEdge.created_at,
                modified_by: savedEdge.modified_by,
                created_by: savedEdge.created_by,
                metadata: savedEdge.metadata,
                version: savedEdge.version ?? null,
            };
        },
        async updateValue({library, recordId, attribute, value, ctx}): Promise<IStandardValue> {
            const valCollec = dbService.db.collection(VALUES_COLLECTION);
            const edgeCollec = dbService.db.collection(VALUES_LINKS_COLLECTION);

            // Save value entity
            const valueData = {
                value: value.payload,
            };

            // For extended format we don't want to merge object with previous value
            // because we are not able to do partial updates on extended attributes.
            const mergeObjects = attribute.format !== AttributeFormats.EXTENDED;

            const resVal = await dbService.execute({
                query: aql`
                    UPDATE ${{_key: value.id_value}}
                    WITH ${valueData}
                    IN ${valCollec}
                    OPTIONS { mergeObjects: ${mergeObjects} }
                    RETURN NEW`,
                ctx,
            });
            const savedVal: Partial<IDbDocument> = resVal.length ? resVal[0] : {};

            // Update value's metadata on record<->value link
            const edgeFrom = library + '/' + recordId;
            const edgeTo = savedVal._id;
            const edgeData: any = {
                _from: edgeFrom,
                _to: edgeTo,
                attribute: attribute.id,
                modified_at: value.modified_at,
                created_at: value.created_at,
                modified_by: String(ctx.userId),
                created_by: value.created_by,
                version: value.version ?? null,
            };

            if (value.metadata) {
                edgeData.metadata = value.metadata;
            }

            const resEdge = await dbService.execute<IValueEdge[]>({
                query: aql`
                    FOR e IN ${edgeCollec}
                    FILTER e._from == ${edgeFrom} AND e._to == ${edgeTo}
                    UPDATE e
                        WITH ${edgeData}
                        IN ${edgeCollec}
                    RETURN NEW`,
                ctx,
            });
            const savedEdge: Partial<IValueEdge> = resEdge.length ? resEdge[0] : {};

            return {
                id_value: savedVal._key,
                payload: savedVal.value,
                attribute: savedEdge.attribute,
                modified_at: savedEdge.modified_at,
                created_at: savedEdge.created_at,
                modified_by: savedEdge.modified_by,
                created_by: savedEdge.created_by,
                metadata: savedEdge.metadata,
                version: savedEdge.version ?? null,
            };
        },
        async deleteValue({library, recordId, value}): Promise<IStandardValue | null> {
            const valCollec = dbService.db.collection(VALUES_COLLECTION) as DocumentCollection;
            const edgeCollec = dbService.db.collection(VALUES_LINKS_COLLECTION) as EdgeCollection<IDbEdge>;

            const deletedVal = await valCollec.remove({_key: String(value.id_value)}, {returnOld: true});

            // Delete the link record<->value and add some metadata on it
            const edgeData = {
                _from: library + '/' + recordId,
                _to: deletedVal._id,
            };

            const deletedEdge: IRecord = await edgeCollec.removeByExample(edgeData);

            return {
                id_value: deletedVal._key,
                payload: deletedVal.old.value,
                attribute: deletedEdge.attribute,
                modified_at: deletedEdge.modified_at,
                created_at: deletedEdge.created_at,
                modified_by: deletedEdge.modified_by,
                created_by: deletedEdge.created_by,
                metadata: deletedEdge.metadata,
                version: deletedEdge.version ?? null,
            };
        },
        async getValuesBatch({library, recordIds, attribute, options, ctx}): Promise<IStandardValue[][]> {
            const edgeCollec = dbService.db.collection(VALUES_LINKS_COLLECTION);

            const filterVersion = !options?.forceGetAllValues
                ? options?.version
                    ? aql`FILTER edge.version == ${options.version}`
                    : aql`FILTER edge.version == null`
                : aql``;

            const query: GeneratedAqlQuery =
                !options?.forceGetAllValues && !attribute.multiple_values
                    ? aql`
                    FOR recordId IN ${recordIds}
                        LET valueEdge = FIRST(
                            FOR edge IN ${edgeCollec}
                                FILTER edge._from == CONCAT(${library}, '/', recordId)
                                AND edge.attribute == ${attribute.id}
                                SORT edge.created_at DESC, edge._key DESC
                                ${filterVersion}
                                LET value = DOCUMENT(edge._to)
                                RETURN { value, edge }
                        )
                        RETURN MERGE({ recordId: recordId }, valueEdge)
                `
                    : aql`
                    FOR recordId IN ${recordIds}
                        FOR edge IN ${edgeCollec}
                            FILTER edge._from == CONCAT(${library}, '/', recordId)
                            AND edge.attribute == ${attribute.id}
                            ${filterVersion}
                            LET value = DOCUMENT(edge._to)
                            RETURN MERGE({ recordId: recordId }, { value, edge })
                `;

            const resArr = await dbService.execute<Array<{recordId: string; value: any; edge: IValueEdge}>>({
                query,
                ctx,
            });

            const valuesByRecordId: Map<string, IStandardValue[]> = new Map(recordIds.map(recordId => [recordId, []]));

            for (const res of resArr) {
                const values = res && valuesByRecordId.get(res.recordId);
                if (values) {
                    values.push({
                        id_value: res.value._key,
                        payload: res.value.value,
                        attribute: res.edge.attribute,
                        modified_at: res.edge.modified_at,
                        created_at: res.edge.created_at,
                        modified_by: res.edge.modified_by,
                        created_by: res.edge.created_by,
                        metadata: res.edge.metadata,
                        version: res.edge.version ?? null,
                    });
                }
            }

            return recordIds.map(recordId => valuesByRecordId.get(recordId) || []);
        },
        async getValueById({valueId, ctx}): Promise<IStandardValue> {
            const valCollec = dbService.db.collection(VALUES_COLLECTION) as DocumentCollection;
            const edgeCollec = dbService.db.collection(VALUES_LINKS_COLLECTION) as EdgeCollection<IDbEdge>;

            const query = aql`
                LET value = FIRST(FOR v IN ${valCollec}
                    FILTER v._key == ${valueId}
                RETURN v)

                FOR e IN ${edgeCollec}
                    FILTER e._to == value._id
                RETURN MERGE(e, {payload: value.value})
            `;

            const valueLinks = await dbService.execute({query, ctx});

            if (!valueLinks.length) {
                return null;
            }

            return {
                id_value: valueId,
                payload: valueLinks[0].payload,
                attribute: valueLinks[0].attribute,
                modified_at: valueLinks[0].modified_at,
                created_at: valueLinks[0].created_at,
                modified_by: valueLinks[0].modified_by,
                created_by: valueLinks[0].created_by,
            };
        },

        async listDistinctValues({attribute, recordIds, options, ctx}): Promise<IDistinctValue<IStandardBaseValue>> {
            const valuesEdgeCollec = dbService.db.collection(VALUES_LINKS_COLLECTION);

            // For all recordIds,
            // retrieve the corresponding edges and count the occurrences of each linked value,
            // including unlinked records
            const query = aql`
                    LET allRecordIds = ${recordIds}
                    LET linkedValuesGroups = (
                        FOR edge IN ${valuesEdgeCollec}
    
                            FILTER edge.attribute == ${attribute.id}
                            ${options?.version ? aql`FILTER edge.version == ${options.version}` : aql`FILTER edge.version == null`}
                            FILTER PARSE_IDENTIFIER(edge._from).key IN allRecordIds
    
                            // Get the linked record and ensure it exists
                            Let valueRecord = DOCUMENT(edge._to)
                            COLLECT valueGrouped = valueRecord.value INTO grouped
    
                            // Keep track of which records are linked to this value
                            LET groupLinkedRecordIds = (FOR g IN grouped[*].edge._from RETURN PARSE_IDENTIFIER(g).key)
                            RETURN { value: valueGrouped, count: LENGTH(grouped), groupLinkedRecordIds }
                    )
    
                    LET linkedRecordIds = UNIQUE(FLATTEN(linkedValuesGroups[*].groupLinkedRecordIds))
                    LET linkGroupWithoutRecordIds = (FOR r IN linkedValuesGroups RETURN UNSET(r, 'groupLinkedRecordIds'))
                    
                    // Find unlinked records
                    LET unlinkedRecordIds = OUTERSECTION(allRecordIds, linkedRecordIds)
                    LET unlinkedRecordCount = COUNT(unlinkedRecordIds)
    
                    // Add null value for unlinked records
                    LET finalResultArray = APPEND(
                        linkGroupWithoutRecordIds,
                        unlinkedRecordCount > 0 ? [{ value: null, count: unlinkedRecordCount }] : []
                    )
    
                    // Flatten result array
                    FOR r IN finalResultArray RETURN r
                `;

            const res = await dbService.execute<Array<{value: string | null; count: number}>>({query, ctx});
            return res;
        },
        sortQueryPart({attributes, order}) {
            const collec = dbService.db.collection(VALUES_LINKS_COLLECTION);

            const advancedValue = aql`FIRST(
                FOR v, e IN 1 OUTBOUND r._id
                ${collec}
                FILTER e.attribute == ${attributes[0].id} RETURN v.value
            )`;

            return attributes[0].format === AttributeFormats.EXTENDED && attributes.length > 1
                ? aql`${_getExtendedFilterPart(attributes, advancedValue)} ${order}`
                : aql`${advancedValue} ${order}`;
        },
        filterValueQueryPart(attributes, filter, parentIdentifier = BASE_QUERY_IDENTIFIER) {
            const vIdentifier = literal(parentIdentifier + 'v');
            const eIdentifier = literal(parentIdentifier + 'e');
            const collec = dbService.db.collection(VALUES_LINKS_COLLECTION);

            const retrieveValues = aql`
                FOR ${vIdentifier}, ${eIdentifier} IN 1 OUTBOUND ${literal(parentIdentifier)}._id
                    ${collec}
                    FILTER ${eIdentifier}.attribute == ${attributes[0].id}
                    RETURN ${vIdentifier}.value
            `;

            let advancedValue: GeneratedAqlQuery;
            if (attributes[0].format === AttributeFormats.EXTENDED && attributes.length > 1) {
                advancedValue = _getExtendedFilterPart(attributes, retrieveValues);
            } else {
                advancedValue = retrieveValues;
            }

            return filterTypesHelper.isCountFilter(filter) ? aql`COUNT(${advancedValue})` : advancedValue;
        },
        async clearAllValues(): Promise<boolean> {
            return true;
        },
        async clearMultipleValues({libraryId, attribute, ctx}): Promise<void> {
            const edgeValuesLinksCollection = dbService.db.collection(
                VALUES_LINKS_COLLECTION,
            ) as EdgeCollection<IDbEdge>;
            const valuesCollection = dbService.db.collection(VALUES_COLLECTION) as DocumentCollection;

            const recordsEdges = await dbService.execute({
                query: aql`
                    FOR edge IN ${edgeValuesLinksCollection}
                       FILTER edge.attribute == ${attribute.id}
                       AND LIKE(edge._from, ${libraryId + '/%'})
                       COLLECT recordId = edge._from INTO valuesByRecord
                       FILTER LENGTH(valuesByRecord) > 1
                       LET sortedEdges = (
                           FOR e IN valuesByRecord[*].edge
                               SORT e.created_at DESC, e._key DESC
                           RETURN e
                       )
                    RETURN { recordId, edges: sortedEdges }
                `,
                ctx,
            });

            for (const {edges} of recordsEdges) {
                const edgesToRemove = edges.slice(1); // The most recent one is the first one, we delete the others

                for (const edge of edgesToRemove) {
                    await valuesCollection.remove({_key: String(edge._to.split('/')[1])}); // Delete the value
                    await edgeValuesLinksCollection.remove(edge._key); // Delete the edge
                }
            }

            return;
        },
    };
}
