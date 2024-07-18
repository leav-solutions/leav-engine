// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, AqlQuery, GeneratedAqlQuery, literal, join} from 'arangojs/aql';
import {IDbDocument} from 'infra/db/_types';
import {IFilterTypesHelper} from 'infra/record/helpers/filterTypes';
import {IUtils} from 'utils/utils';
import {getEdgesCollectionName, getFullNodeId} from '../../infra/tree/helpers/utils';
import {NODE_LIBRARY_ID_FIELD, NODE_RECORD_ID_FIELD} from '../../infra/tree/_types';
import {VALUES_LINKS_COLLECTION} from '../../infra/value/valueRepo';
import {AttributeFormats, IAttribute} from '../../_types/attribute';
import {IRecord} from '../../_types/record';
import {ITreeValue, IValue, IValueEdge} from '../../_types/value';
import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';
import {BASE_QUERY_IDENTIFIER, IAttributeTypeRepo} from './attributeTypesRepo';
import {GetConditionPart} from './helpers/getConditionPart';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.infra.attributeTypes.helpers.getConditionPart'?: GetConditionPart;
    'core.infra.record.helpers.filterTypes'?: IFilterTypesHelper;
    'core.utils'?: IUtils;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
    'core.infra.attributeTypes.helpers.getConditionPart': getConditionPart = null,
    'core.infra.record.helpers.filterTypes': filterTypes = null,
    'core.utils': utils = null
}: IDeps = {}): IAttributeTypeRepo {
    const _buildTreeValue = (
        treeId: string,
        nodeId: string,
        linkedRecord: IRecord,
        valueEdge: IValueEdge
    ): ITreeValue => ({
        id_value: valueEdge._key,
        value:
            linkedRecord && nodeId
                ? {
                      id: nodeId,
                      record: linkedRecord
                  }
                : null,
        attribute: valueEdge.attribute,
        modified_at: valueEdge.modified_at,
        modified_by: valueEdge.modified_by,
        created_at: valueEdge.created_at,
        created_by: valueEdge.created_by,
        version: valueEdge.version ?? null,
        metadata: valueEdge.metadata,
        treeId
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
            const edgeCollec = dbService.db.collection(VALUES_LINKS_COLLECTION);

            // Create the link between records and add some metadata on it
            const edgeData: any = {
                _from: library + '/' + recordId,
                _to: getFullNodeId(value.value, attribute.linked_tree),
                attribute: attribute.id,
                modified_at: value.modified_at,
                created_at: value.created_at,
                created_by: String(ctx.userId),
                modified_by: String(ctx.userId),
                version: value.version ?? null
            };

            if (value.metadata) {
                edgeData.metadata = value.metadata;
            }

            const {id: nodeId, library: nodeCollection} = utils.decomposeValueEdgeDestination(edgeData._to);
            const resEdge = await dbService.execute<Array<{newEdge: IValueEdge; linkedRecord: IRecord}>>({
                query: aql`
                    LET linkedNode = DOCUMENT(${nodeCollection}, ${nodeId})
                    LET linkedRecord = DOCUMENT(linkedNode.libraryId, linkedNode.recordId)
                    INSERT ${edgeData} IN ${edgeCollec}
                    RETURN {newEdge: NEW, linkedRecord}
                `,
                ctx
            });
            if (!resEdge.length) {
                return null;
            }
            const savedValue = resEdge[0];

            return _buildTreeValue(
                attribute.linked_tree,
                nodeId,
                dbUtils.cleanup(savedValue.linkedRecord),
                savedValue.newEdge
            );
        },
        async updateValue({library, recordId, attribute, value, ctx}): Promise<ITreeValue> {
            const edgeCollec = dbService.db.collection(VALUES_LINKS_COLLECTION);

            // Update value's metadata on records link
            const edgeData: any = {
                _from: library + '/' + recordId,
                _to: getFullNodeId(value.value, attribute.linked_tree),
                attribute: attribute.id,
                modified_at: value.modified_at,
                created_by: value.created_by,
                modified_by: String(ctx.userId),
                version: value.version ?? null
            };

            if (value.metadata) {
                edgeData.metadata = value.metadata;
            }

            const {id: nodeId, library: nodeCollection} = utils.decomposeValueEdgeDestination(edgeData._to);
            const resEdge = await dbService.execute<Array<{newEdge: IValueEdge; linkedRecord: IRecord}>>({
                query: aql`
                    LET linkedNode = DOCUMENT(${nodeCollection}, ${nodeId})
                    LET linkedRecord = DOCUMENT(linkedNode.libraryId, linkedNode.recordId)
                    UPDATE ${{_key: String(value.id_value)}} WITH ${edgeData} IN ${edgeCollec}
                    RETURN {newEdge: NEW, linkedRecord}
                `,
                ctx
            });

            if (!resEdge.length) {
                return null;
            }

            const savedValue = resEdge[0];

            return _buildTreeValue(
                attribute.linked_tree,
                nodeId,
                dbUtils.cleanup(savedValue.linkedRecord),
                savedValue.newEdge
            );
        },
        async deleteValue({attribute, value, library, recordId, ctx}): Promise<ITreeValue> {
            const edgeCollec = dbService.db.collection(VALUES_LINKS_COLLECTION);

            const resEdge = await dbService.execute<Array<{edge: IValueEdge; linkedRecord: IRecord}>>({
                query: aql`
                    FOR linkedNode, edge IN 1 OUTBOUND ${library + '/' + recordId}
                        ${edgeCollec}
                        FILTER edge._key == ${value.id_value}
                        LET linkedRecord = DOCUMENT(linkedNode.libraryId, linkedNode.recordId)
                        REMOVE edge IN ${edgeCollec}
                        RETURN {edge: OLD, linkedRecord}
                `,
                ctx
            });
            const deletedValue = resEdge?.[0] ?? null;

            if (!deletedValue) {
                return null;
            }

            const {id: nodeId} = utils.decomposeValueEdgeDestination(deletedValue.edge._to);
            return _buildTreeValue(
                attribute.linked_tree,
                nodeId,
                dbUtils.cleanup(deletedValue.linkedRecord),
                deletedValue.edge
            );
        },
        async getValues({
            library,
            recordId,
            attribute,
            forceGetAllValues = false,
            options,
            ctx
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
                `
            ];

            if (!forceGetAllValues && typeof options !== 'undefined' && options.version) {
                queryParts.push(aql`FILTER edge.version == ${options.version}`);
            }

            const limitOne = literal(!attribute.multiple_values && !forceGetAllValues ? 'LIMIT 1' : '');
            queryParts.push(aql`
                ${limitOne}
                RETURN {id: vertex._key, record, edge}
            `);

            const query = join(queryParts);
            const treeElements = await dbService.execute({query, ctx});

            return treeElements.reduce((acc, r) => {
                if (!r.record) {
                    return acc;
                }

                const record = {
                    ...r.record,
                    library: r?.record?._id.split('/')[0]
                };

                acc.push(_buildTreeValue(attribute.linked_tree, r.id, dbUtils.cleanup(record), r.edge));

                return acc;
            }, []);
        },
        async getValueById({library, recordId, attribute, valueId, ctx}): Promise<IValue> {
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
                Array<{linkedNode: IDbDocument; edge: IValueEdge; linkedRecord: IRecord}>
            >({query, ctx});

            if (!res.length) {
                return null;
            }

            return _buildTreeValue(
                attribute.linked_tree,
                res[0].linkedNode._key,
                dbUtils.cleanup(res[0].linkedRecord),
                res[0].edge
            );
        },
        sortQueryPart({attributes, order}: {attributes: IAttribute[]; order: string}): AqlQuery {
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

            const query =
                linked.format !== AttributeFormats.EXTENDED
                    ? aql`SORT ${linkedValue} ${order}`
                    : aql`SORT ${_getExtendedFilterPart(attributes, linkedValue)} ${order}`;

            return query;
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

            const linked = !attributes[1]
                ? {id: '_key', format: AttributeFormats.TEXT}
                : attributes[1].id === 'id'
                  ? {...attributes[1], id: '_key'}
                  : attributes[1];

            const linkValueIdentifier = literal(`${parentIdentifier}linkVal`);
            const recordIdentifierStr = parentIdentifier + 'Record';
            const recordIdentifier = literal(recordIdentifierStr);
            const eIdentifier = literal(parentIdentifier + 'e');
            const returnValue = aql`RETURN ${linkValueIdentifier}`;
            const retrieveValue = aql`
                FOR ${vIdentifier}, ${eIdentifier} IN 1 OUTBOUND ${literal(parentIdentifier)}._id
                    ${valuesLinksCollec}
                    FILTER ${eIdentifier}.attribute == ${attributes[0].id}
                    LET ${recordIdentifier} = DOCUMENT(
                        ${vIdentifier}.${literal(NODE_LIBRARY_ID_FIELD)},
                        ${vIdentifier}.${literal(NODE_RECORD_ID_FIELD)}
                        )
                        `;

            const linkValueQuery = attributes[1]
                ? aql`LET ${literal(linkValueIdentifier)} = (${attributes[1]._repo.filterValueQueryPart(
                      [...attributes].splice(1),
                      filter,
                      recordIdentifierStr
                  )})`
                : null;
            const linkedValue = join([literal('FLATTEN('), retrieveValue, linkValueQuery, returnValue, literal(')')]);

            return linked.format !== AttributeFormats.EXTENDED
                ? linkedValue
                : _getExtendedFilterPart(attributes, linkedValue);
        },
        async clearAllValues({attribute, ctx}): Promise<boolean> {
            return true;
        }
    };
}
