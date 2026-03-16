// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {logger} from '@leav/logger';
import {aql, type GeneratedAqlQuery, join, literal} from 'arangojs/aql';
import {type IDbDocument, type IDbEdge} from 'infra/db/_types';
import {type IFilterTypesHelper} from 'infra/record/helpers/filterTypes';
import {type IUtils} from 'utils/utils';
import {getEdgesCollectionName, getFullNodeId} from '../../infra/tree/helpers/utils';
import {NODE_LIBRARY_ID_FIELD, NODE_RECORD_ID_FIELD} from '../../infra/tree/_types';
import {VALUES_LINKS_COLLECTION} from '../../infra/value/valueRepo';
import {AttributeFormats, type AttributeTypes, type IAttribute} from '../../_types/attribute';
import {type IRecord} from '../../_types/record';
import {type IDistinctValue, type ITreeValue, type IValueEdge, type ITreeBaseValue} from '../../_types/value';
import {type IDbService} from '../db/dbService';
import {type IDbUtils} from '../db/dbUtils';
import {BASE_QUERY_IDENTIFIER, type IAttributeTypeRepo} from './attributeTypesRepo';
import {type GetConditionPart} from './helpers/getConditionPart';
import {type EdgeCollection} from 'arangojs/collection';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.infra.attributeTypes.helpers.getConditionPart'?: GetConditionPart;
    'core.infra.record.helpers.filterTypes'?: IFilterTypesHelper;
    'core.utils'?: IUtils;
}

export type IAttributeTreeRepo = IAttributeTypeRepo<AttributeTypes.TREE>;

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
    'core.infra.attributeTypes.helpers.getConditionPart': getConditionPart = null,
    'core.infra.record.helpers.filterTypes': filterTypes = null,
    'core.utils': utils = null,
}: IDeps = {}): IAttributeTreeRepo {
    const _buildTreeValue = (
        treeId: string,
        nodeId: string,
        linkedRecord: IRecord,
        valueEdge: IValueEdge,
    ): ITreeValue => ({
        id_value: valueEdge._key,
        payload:
            linkedRecord && nodeId
                ? {
                      id: nodeId,
                      record: linkedRecord,
                  }
                : null,
        attribute: valueEdge.attribute,
        modified_at: valueEdge.modified_at,
        modified_by: valueEdge.modified_by,
        created_at: valueEdge.created_at,
        created_by: valueEdge.created_by,
        version: valueEdge.version ?? null,
        metadata: valueEdge.metadata,
        treeId,
    });

    const _buildRemoteRecord = (remoteRecord: IRecord & IDbDocument): IRecord =>
        dbUtils.cleanup({
            ...remoteRecord,
            library: remoteRecord?._id?.split('/')[0],
        });

    function _getExtendedFilterPart(attributes: IAttribute[], linkedValue: GeneratedAqlQuery): GeneratedAqlQuery {
        return aql`${
            attributes
                .map(a => a.id)
                .slice(2)
                .reduce((acc, value, i) => {
                    acc.push(aql`TRANSLATE(${value}, ${i ? acc[acc.length - 1] : aql`${linkedValue}`})`);
                    if (i) {
                        acc.shift();
                    }
                    return acc;
                }, [])[0]
        }`;
    }

    return {
        async createValue({library, recordId, attribute, value, ctx}): Promise<ITreeValue> {
            if (typeof value.payload !== 'string') {
                throw new Error('Tree attribute value must be a string representing the linked node ID.');
            }
            const edgeCollec = dbService.db.collection(VALUES_LINKS_COLLECTION);

            // Create the link between records and add some metadata on it
            const edgeData: any = {
                _from: library + '/' + recordId,
                _to: getFullNodeId(value.payload, attribute.linked_tree),
                attribute: attribute.id,
                modified_at: value.modified_at,
                created_at: value.created_at,
                created_by: String(ctx.userId),
                modified_by: String(ctx.userId),
                version: value.version ?? null,
            };

            if (value.metadata) {
                edgeData.metadata = value.metadata;
            }

            const {id: nodeId, library: nodeCollection} = utils.decomposeValueEdgeDestination(edgeData._to);
            const resEdge = await dbService.execute<Array<{newEdge: IValueEdge; linkedRecord: IDbDocument & IRecord}>>({
                query: aql`
                    LET linkedNode = DOCUMENT(${nodeCollection}, ${nodeId})
                    LET linkedRecord = DOCUMENT(linkedNode.libraryId, linkedNode.recordId)
                    INSERT ${edgeData} IN ${edgeCollec}
                    RETURN {newEdge: NEW, linkedRecord}
                `,
                ctx,
            });
            if (!resEdge.length) {
                return null;
            }
            const savedValue = resEdge[0];

            return _buildTreeValue(
                attribute.linked_tree,
                nodeId,
                _buildRemoteRecord(savedValue.linkedRecord),
                savedValue.newEdge,
            );
        },
        async updateValue({library, recordId, attribute, value, ctx}): Promise<ITreeValue> {
            if (typeof value.payload !== 'string') {
                throw new Error('Tree attribute value must be a string representing the linked node ID.');
            }
            const edgeCollec = dbService.db.collection(VALUES_LINKS_COLLECTION);

            // Update value's metadata on records link
            const edgeData: any = {
                _from: library + '/' + recordId,
                _to: getFullNodeId(value.payload, attribute.linked_tree),
                attribute: attribute.id,
                modified_at: value.modified_at,
                created_by: value.created_by,
                modified_by: String(ctx.userId),
                version: value.version ?? null,
            };

            if (value.metadata) {
                edgeData.metadata = value.metadata;
            }

            const {id: nodeId, library: nodeCollection} = utils.decomposeValueEdgeDestination(edgeData._to);
            const resEdge = await dbService.execute<Array<{newEdge: IValueEdge; linkedRecord: IDbDocument & IRecord}>>({
                query: aql`
                    LET linkedNode = DOCUMENT(${nodeCollection}, ${nodeId})
                    LET linkedRecord = DOCUMENT(linkedNode.libraryId, linkedNode.recordId)
                    UPDATE ${{_key: String(value.id_value)}} WITH ${edgeData} IN ${edgeCollec}
                    RETURN {newEdge: NEW, linkedRecord}
                `,
                ctx,
            });

            if (!resEdge.length) {
                return null;
            }

            const savedValue = resEdge[0];

            return _buildTreeValue(
                attribute.linked_tree,
                nodeId,
                _buildRemoteRecord(savedValue.linkedRecord),
                savedValue.newEdge,
            );
        },
        async deleteValue({attribute, value, library, recordId, ctx}): Promise<ITreeValue | null> {
            const edgeCollec = dbService.db.collection(VALUES_LINKS_COLLECTION);

            const resEdge = await dbService.execute<Array<{edge: IValueEdge; linkedRecord: IDbDocument & IRecord}>>({
                query: aql`
                    FOR linkedNode, edge IN 1 OUTBOUND ${library + '/' + recordId}
                        ${edgeCollec}
                        FILTER edge._key == ${value.id_value}
                        LET linkedRecord = DOCUMENT(linkedNode.libraryId, linkedNode.recordId)
                        REMOVE edge IN ${edgeCollec}
                        RETURN {edge: OLD, linkedRecord}
                `,
                ctx,
            });
            const deletedValue = resEdge?.[0] ?? null;

            if (!deletedValue) {
                return null;
            }

            const {id: nodeId} = utils.decomposeValueEdgeDestination(deletedValue.edge._to);
            return _buildTreeValue(
                attribute.linked_tree,
                nodeId,
                _buildRemoteRecord(deletedValue.linkedRecord),
                deletedValue.edge,
            );
        },
        async getValues({
            library,
            recordId,
            attribute,
            forceGetAllValues = false,
            options,
            ctx,
        }): Promise<ITreeValue[]> {
            if (!attribute.linked_tree) {
                return [];
            }

            const valuesLinksCollec = dbService.db.collection(VALUES_LINKS_COLLECTION);
            const treeEdgeCollec = dbService.db.collection(getEdgesCollectionName(attribute.linked_tree));

            const queryParts = [
                aql`FOR vertex, edge IN 1 OUTBOUND ${library + '/' + recordId}
                    ${valuesLinksCollec}, ${treeEdgeCollec}
                    LET record = DOCUMENT(
                        vertex.${literal(NODE_LIBRARY_ID_FIELD)},
                        vertex.${literal(NODE_RECORD_ID_FIELD)}
                    )
                    FILTER edge.attribute == ${attribute.id}
                `,
            ];

            if (!forceGetAllValues) {
                if (options?.version) {
                    queryParts.push(aql`FILTER edge.version == ${options.version}`);
                } else {
                    queryParts.push(aql`FILTER edge.version == null`);
                }
            }

            const limitAndSort = literal(
                !attribute.multiple_values && !forceGetAllValues
                    ? 'SORT edge.created_at DESC, edge._key DESC LIMIT 1'
                    : '',
            );

            queryParts.push(aql`
                ${limitAndSort}
                RETURN {id: vertex._key, record, edge}
            `);

            const query = join(queryParts);
            const treeElements = await dbService.execute({query, ctx});

            return treeElements.reduce((acc, r) => {
                if (!r.record) {
                    return acc;
                }

                const treeValue = _buildTreeValue(attribute.linked_tree, r.id, _buildRemoteRecord(r.record), r.edge);
                if (treeValue.payload == null) {
                    logger.warn(
                        `[AttributeTreeRepo] Unable to find record for tree ${attribute.linked_tree} and node ${r.id} (id_value: ${r.edge._id})`,
                        {
                            edge: r.edge,
                        },
                    );
                } else {
                    acc.push(treeValue);
                }

                return acc;
            }, []);
        },
        async getValuesBatch({library, recordIds, attribute, options, ctx}): Promise<ITreeValue[][]> {
            if (!attribute.linked_tree) {
                return recordIds.map(() => []);
            }

            const valuesLinksCollec = dbService.db.collection(VALUES_LINKS_COLLECTION);
            const treeEdgeCollec = dbService.db.collection(getEdgesCollectionName(attribute.linked_tree));

            const recordsList = recordIds.map(id => library + '/' + id);
            const queryParts = [
                aql`
                    FOR recordKey IN ${recordsList}
                        FOR vertex, edge IN 1 OUTBOUND recordKey ${valuesLinksCollec}, ${treeEdgeCollec}
                            FILTER edge.attribute == ${attribute.id}
                `,
            ];

            if (!options?.forceGetAllValues) {
                if (options?.version) {
                    queryParts.push(aql`FILTER edge.version == ${options.version}`);
                } else {
                    queryParts.push(aql`FILTER edge.version == null`);
                }
            }

            queryParts.push(aql`
                LET record = DOCUMENT(
                    vertex.${literal(NODE_LIBRARY_ID_FIELD)},
                    vertex.${literal(NODE_RECORD_ID_FIELD)}
                )`);

            if (!attribute.multiple_values && !options?.forceGetAllValues) {
                queryParts.push(aql`SORT edge.created_at DESC, edge._key DESC`);
                queryParts.push(aql`
                    COLLECT collectedRecId = recordKey INTO grouped
                    LET first = FIRST(grouped)
                    RETURN {
                        recordId: PARSE_IDENTIFIER(collectedRecId).key,
                        values: [{
                            id: first.vertex._key,
                            record: first.record,
                            edge: first.edge
                        }]
                    }
                `);
            } else {
                queryParts.push(aql`
                    COLLECT collectedRecId = recordKey INTO grouped
                    RETURN {
                        recordId: PARSE_IDENTIFIER(collectedRecId).key,
                        values: UNIQUE(grouped[* RETURN {
                            id: CURRENT.vertex._key,
                            record: CURRENT.record,
                            edge: CURRENT.edge
                        }])
                    }
                `);
            }

            const query = join(queryParts);
            const treeElements = await dbService.execute<
                Array<{
                    recordId: string;
                    values: Array<{id: string; record: IDbDocument & IRecord; edge: IValueEdge}>;
                }>
            >({query, ctx});

            const recordIdToValuesMap = new Map(treeElements.map(e => [e.recordId, e.values]));
            return recordIds.map(recordId => {
                const record = recordIdToValuesMap.get(recordId);
                return (
                    record
                        ?.map(r => {
                            const treeValue = _buildTreeValue(
                                attribute.linked_tree,
                                r.id,
                                _buildRemoteRecord(r.record),
                                r.edge,
                            );

                            if (treeValue.payload == null) {
                                logger.warn(
                                    `[AttributeTreeRepo] Unable to find record for tree ${attribute.linked_tree} and node ${r.id} (id_value: ${r.edge._id})`,
                                    {
                                        edge: r.edge,
                                    },
                                );
                                return null;
                            }
                            return treeValue;
                        })
                        .filter(Boolean) || []
                );
            });
        },
        async listDistinctValues({
            library,
            attribute,
            recordIds,
            options,
            ctx,
        }): Promise<IDistinctValue<ITreeBaseValue>> {
            if (!attribute.linked_tree) {
                return [];
            }

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

                        // Get the linked node and ensure it exists, necessary to build the node value with linked record
                        LET nodeLinkedTo = DOCUMENT(edge._to)
                        FILTER nodeLinkedTo != null

                        COLLECT nodeRecord = nodeLinkedTo INTO grouped

                        // Keep track of which records are linked to this value
                        LET groupLinkedRecordIds = (FOR g IN grouped[*].edge._from RETURN PARSE_IDENTIFIER(g).key)
                        RETURN { value: nodeRecord, count: COUNT(grouped), groupLinkedRecordIds }
                )

                LET linkedRecordIds = UNIQUE(FLATTEN(linkedValuesGroups[*].groupLinkedRecordIds))
                LET linkGroupWithoutRecordIds = (FOR r IN linkedValuesGroups RETURN UNSET(r, 'groupLinkedRecordIds'))

                // Find unlinked records
                LET unlinkedRecordIds = OUTERSECTION(allRecordIds, linkedRecordIds)
                LET unlinkedRecordCount = COUNT(unlinkedRecordIds)

                // Add null value for unlinked records
                LET finalResultArray = APPEND(
                    linkGroupWithoutRecordIds,
                    unlinkedRecordCount > 0 ? [{ valueId: null, count: unlinkedRecordCount }] : []
                )

                // Flatten result array
                FOR r IN finalResultArray RETURN r
            `;

            const res = await dbService.execute<
                Array<{value: {_key: string; libraryId: string; recordId: string} | null; count: number}>
            >({query, ctx});

            return res.map(({value, count}) =>
                value
                    ? {
                          value: {
                              id: value._key,
                              treeId: attribute.linked_tree,
                              record: {
                                  id: value.recordId,
                                  library: value.libraryId,
                              },
                          },
                          count,
                      }
                    : {
                          value: null,
                          count,
                      },
            );
        },
        async getValueById({library, recordId, attribute, valueId, ctx}): Promise<ITreeValue> {
            const edgeCollec = dbService.db.collection(VALUES_LINKS_COLLECTION);

            const query = aql`
                FOR linkedNode, edge IN 1 OUTBOUND ${library + '/' + recordId}
                    ${edgeCollec}
                    FILTER edge._key == ${valueId}
                    FILTER edge.attribute == ${attribute.id}
                    LET linkedRecord = DOCUMENT(linkedNode.libraryId, linkedNode.recordId)
                    LIMIT 1
                    RETURN {linkedNode, edge, linkedRecord}
            `;

            const res = await dbService.execute<
                Array<{linkedNode: IDbDocument; edge: IValueEdge; linkedRecord: IDbDocument & IRecord}>
            >({query, ctx});

            if (!res.length) {
                return null;
            }

            return _buildTreeValue(
                attribute.linked_tree,
                res[0].linkedNode._key,
                _buildRemoteRecord(res[0].linkedRecord),
                res[0].edge,
            );
        },
        sortQueryPart({attributes, order}) {
            const valuesLinksCollec = dbService.db.collection(VALUES_LINKS_COLLECTION);
            const treeCollec = dbService.db.collection(getEdgesCollectionName(attributes[0].linked_tree));

            const linked = !attributes[1]
                ? {id: '_key', format: AttributeFormats.TEXT}
                : attributes[1].id === 'id'
                  ? {...attributes[1], id: '_key'}
                  : attributes[1];

            const linkedValue = aql`FIRST(
                FOR v, e IN 1 OUTBOUND r._id
                ${valuesLinksCollec}, ${treeCollec}
                FILTER e.attribute == ${attributes[0].id}
                LET record = DOCUMENT(
                    v.${literal(NODE_LIBRARY_ID_FIELD)},
                    v.${literal(NODE_RECORD_ID_FIELD)}
                )
                RETURN record.${linked.id}
            )`;

            return linked.format !== AttributeFormats.EXTENDED
                ? aql`${linkedValue} ${order}`
                : aql`${_getExtendedFilterPart(attributes, linkedValue)} ${order}`;
        },
        filterValueQueryPart(attributes, filter, parentIdentifier = BASE_QUERY_IDENTIFIER) {
            const valuesLinksCollec = dbService.db.collection(VALUES_LINKS_COLLECTION);

            const isCountFilter = filterTypes.isCountFilter(filter);
            const linkIdentifier = parentIdentifier + 'v';
            const vIdentifier = literal(linkIdentifier);

            if (isCountFilter) {
                // In "count" filters, we don't need to retrieve the actual value, we just need to know how many links we have
                // Thus, using a "join" query on the edge collection is more efficient than using a traversal
                return aql`
                COUNT(
                    FOR ${vIdentifier} IN ${valuesLinksCollec}
                    FILTER ${vIdentifier}._from == ${literal(parentIdentifier)}._id
                    AND ${vIdentifier}.attribute == ${attributes[0].id}
                    RETURN true
                    )
                    `;
            }

            const linkValueIdentifier = literal(`${parentIdentifier}linkVal`);
            const recordIdentifierStr = parentIdentifier + 'Record';
            const recordIdentifier = literal(recordIdentifierStr);
            const eIdentifier = literal(parentIdentifier + 'e');
            const retrieveValue = aql`
                FOR ${vIdentifier}, ${eIdentifier} IN 1 OUTBOUND ${literal(parentIdentifier)}._id
                    ${valuesLinksCollec}
                    FILTER ${eIdentifier}.attribute == ${attributes[0].id}
                        `;

            // Filter on link record attribute
            const linkValueQuery = attributes[1]
                ? attributes[1].id === 'id'
                    ? aql`RETURN ${vIdentifier}.${literal(NODE_RECORD_ID_FIELD)}` // No need to fetch document to just get its id (_key)
                    : aql`
                        LET ${recordIdentifier} = DOCUMENT(
                                ${vIdentifier}.${literal(NODE_LIBRARY_ID_FIELD)},
                                ${vIdentifier}.${literal(NODE_RECORD_ID_FIELD)}
                                )
                        LET ${literal(linkValueIdentifier)} = (${attributes[1]._repo.filterValueQueryPart(
                            [...attributes].splice(1),
                            filter,
                            recordIdentifierStr,
                        )})
                        RETURN ${linkValueIdentifier}`
                : null;
            const linkedValue = join([literal('FLATTEN('), retrieveValue, linkValueQuery, literal(')')]);

            return attributes[1]?.format !== AttributeFormats.EXTENDED
                ? linkedValue
                : _getExtendedFilterPart(attributes, linkedValue);
        },
        async clearAllValues({attribute, ctx}): Promise<boolean> {
            return true;
        },
        async clearMultipleValues({libraryId, attribute, ctx}): Promise<void> {
            const edgeValuesLinksCollection = dbService.db.collection(
                VALUES_LINKS_COLLECTION,
            ) as EdgeCollection<IDbEdge>;

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
                    RETURN { recordId, edgeKeys: sortedEdges[*]._key }
                `,
                ctx,
            });

            for (const {edgeKeys} of recordsEdges) {
                const edgesToRemove = edgeKeys.slice(1); // The most recent one is the first one, we delete the others

                for (const edgeKey of edgesToRemove) {
                    await edgeValuesLinksCollection.remove(edgeKey);
                }
            }

            return;
        },
    };
}
