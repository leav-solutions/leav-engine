// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, literal, join} from 'arangojs/aql';
import {CollectionType} from 'arangojs/collection';
import {IList, IPaginationParams} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IRecord} from '_types/record';
import {IGetCoreEntitiesParams} from '_types/shared';
import {IGetCoreTreesParams, ITree, ITreeElement, ITreeNode, ITreeNodeLight, TreePaths} from '_types/tree';
import {IDbDocument, IDbEdge, IExecuteWithCount, isExecuteWithCount} from '../../infra/db/_types';
import {VALUES_LINKS_COLLECTION} from '../../infra/value/valueRepo';
import {IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';
import {
    getEdgesCollectionName,
    getFullNodeId,
    getLibraryFromDbId,
    getNodesCollectionName,
    getRootId
} from './helpers/utils';
import {IChildrenResultNode, NODE_LIBRARY_ID_FIELD, NODE_RECORD_ID_FIELD} from './_types';

export interface ITreeRepo {
    createTree(params: {treeData: ITree; ctx: IQueryInfos}): Promise<ITree>;
    updateTree(params: {treeData: ITree; ctx: IQueryInfos}): Promise<ITree>;
    getTrees(params: {params?: IGetCoreTreesParams; ctx: IQueryInfos}): Promise<IList<ITree>>;
    deleteTree(params: {id: string; ctx: IQueryInfos}): Promise<ITree>;

    /**
     * Add an element to the tree
     *
     * Parent must be a record or null to add element to root
     *
     * We return a TreeNodeLight and not a TreeNode to avoid an extra query just to get the record. If client needs it,
     * we'll get it through or manually where needed
     */
    addElement(params: {
        treeId: string;
        element: ITreeElement;
        parent: string | null;
        order?: number;
        ctx: IQueryInfos;
    }): Promise<ITreeNodeLight>;

    /**
     * Move an element in the tree
     *
     * parentTo A record or null to move to root
     *
     * We return a TreeNodeLight and not a TreeNode to avoid an extra query just to get the record. If client needs it,
     * we'll get it through or manually where needed
     */
    moveElement(params: {
        treeId: string;
        nodeId: string;
        parentTo: string | null;
        order?: number;
        ctx: IQueryInfos;
    }): Promise<ITreeNodeLight>;

    /**
     * Delete an element from the tree
     *
     * We return a TreeNodeLight and not a TreeNode to avoid an extra query just to get the record. If client needs it,
     * we'll get it through or manually where needed
     */
    deleteElement(params: {
        treeId: string;
        nodeId: string;
        deleteChildren: boolean | null;
        ctx: IQueryInfos;
    }): Promise<ITreeNodeLight>;

    /**
     * Return whether a node is present in given tree
     */
    isNodePresent(params: {treeId: string; nodeId: string; ctx: IQueryInfos}): Promise<boolean>;

    /**
     * Return whether a record is present in given tree
     */
    isRecordPresent(params: {treeId: string; record: ITreeElement; ctx: IQueryInfos}): Promise<boolean>;

    /**
     * Return the whole tree in the form:
     * [
     *      {
     *          record: {...},
     *          children: [
     *              {
     *                  record: ...
     *                  children: ...
     *              }
     *          ]
     *      },
     *      { ... }
     * ]
     *
     * startingNode  Return the tree starting from this node. If not specified, start from root
     */
    getTreeContent(params: {
        treeId: string;
        startingNode?: string;
        depth?: number;
        childrenCount?: boolean;
        ctx: IQueryInfos;
    }): Promise<ITreeNode[]>;

    /**
     * Return all first level children of an element
     */
    getElementChildren(params: {
        treeId: string;
        nodeId: string;
        childrenCount?: boolean;
        withTotalCount?: boolean;
        pagination?: IPaginationParams;
        ctx: IQueryInfos;
    }): Promise<IList<ITreeNode>>;

    /**
     * Return all ancestors of an element, including element itself, but excluding tree root
     *
     * @param treeId
     * @param element
     */
    getElementAncestors(params: {treeId: string; nodeId: string; ctx: IQueryInfos}): Promise<TreePaths>;

    getLinkedRecords(params: {treeId: string; attribute: string; nodeId: string; ctx: IQueryInfos}): Promise<IRecord[]>;

    /**
     * Return record linked to given node
     */
    getRecordByNodeId(params: {treeId: string; nodeId: string; ctx: IQueryInfos}): Promise<IRecord>;

    /**
     * Return nodes linked to given record
     */
    getNodesByRecord(params: {treeId: string; record: ITreeElement; ctx: IQueryInfos}): Promise<string[]>;

    /**
     * Return all nodes for given library
     */
    getNodesByLibrary(params: {treeId: string; libraryId: string; ctx: IQueryInfos}): Promise<string[]>;
}

export const TREES_COLLECTION_NAME = 'core_trees';
export const NODE_COLLEC_PREFIX = 'core_nodes_';
export const EDGE_COLLEC_PREFIX = 'core_edge_tree_';
export const MAX_TREE_DEPTH = 1000;
export const TO_RECORD_PROP_NAME = 'toRecord';

interface ITreeEdge extends IDbEdge {
    order: number;
}

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
}
export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null
}: IDeps = {}): ITreeRepo {
    return {
        async createTree({treeData, ctx}): Promise<ITree> {
            const collec = dbService.db.collection(TREES_COLLECTION_NAME);

            const docToInsert = dbUtils.convertToDoc(treeData);

            const treeRes = await dbService.execute({
                query: aql`INSERT ${docToInsert} IN ${collec} RETURN NEW`,
                ctx
            });

            await dbService.createCollection(getEdgesCollectionName(treeData.id), CollectionType.EDGE_COLLECTION);
            await dbService.createCollection(getNodesCollectionName(treeData.id), CollectionType.DOCUMENT_COLLECTION);

            const nodesCollection = dbService.db.collection(getNodesCollectionName(treeData.id));

            // Add an index on nodes collection
            await nodesCollection.ensureIndex({
                fields: [NODE_LIBRARY_ID_FIELD, NODE_RECORD_ID_FIELD],
                sparse: true,
                type: 'persistent'
            });

            return dbUtils.cleanup(treeRes.pop());
        },
        async updateTree({treeData, ctx}): Promise<ITree> {
            const collec = dbService.db.collection(TREES_COLLECTION_NAME);

            const docToSave = dbUtils.convertToDoc(treeData);

            const treeRes = await dbService.execute({
                query: aql`UPDATE ${docToSave} IN ${collec} OPTIONS { mergeObjects: false } RETURN NEW`,
                ctx
            });

            return dbUtils.cleanup(treeRes.pop());
        },
        async getTrees({params = {}, ctx}: {params?: IGetCoreTreesParams; ctx: IQueryInfos}): Promise<IList<ITree>> {
            const _generateLibraryFilter = (filterKey: string, filterVal: string | boolean | string[]) => {
                return aql`POSITION(ATTRIBUTES(el.libraries), ${filterVal})`;
            };

            const defaultParams: IGetCoreEntitiesParams = {
                filters: null,
                strictFilters: false,
                withCount: false,
                pagination: null,
                sort: null
            };

            const initializedParams = {...defaultParams, ...params};

            return dbUtils.findCoreEntity<ITree>({
                ...initializedParams,
                collectionName: TREES_COLLECTION_NAME,
                customFilterConditions: {library: _generateLibraryFilter},
                ctx
            });
        },
        async deleteTree({id, ctx}): Promise<ITree> {
            const collec = dbService.db.collection(TREES_COLLECTION_NAME);
            const res = await dbService.execute({
                query: aql`REMOVE ${{_key: id}} IN ${collec} RETURN OLD`,
                ctx
            });

            await dbService.dropCollection(getEdgesCollectionName(id), CollectionType.EDGE_COLLECTION);
            await dbService.dropCollection(getNodesCollectionName(id), CollectionType.DOCUMENT_COLLECTION);

            // Return deleted library
            return dbUtils.cleanup(res.pop());
        },
        async addElement({treeId, element, parent = null, order = 0, ctx}): Promise<ITreeNodeLight> {
            const destination = parent ? getFullNodeId(parent, treeId) : getRootId(treeId);

            // Create new node entity
            const nodeCollec = dbService.db.collection(getNodesCollectionName(treeId));
            const nodeEntity = (
                await dbService.execute({
                    query: aql`INSERT {
                        ${NODE_LIBRARY_ID_FIELD}: ${element.library},
                        ${NODE_RECORD_ID_FIELD}: ${element.id}
                    } IN ${nodeCollec} RETURN NEW`,
                    ctx
                })
            )[0];

            const edgeCollec = dbService.db.collection(getEdgesCollectionName(treeId));

            // Add this entity to the tree
            const res = (
                await dbService.execute<ITreeEdge[]>({
                    query: aql`INSERT {
                        _from: ${destination},
                        _to: ${nodeEntity._id},
                        order: ${order}
                    } IN ${edgeCollec} RETURN NEW`,
                    ctx
                })
            )[0];

            return {
                id: nodeEntity._key,
                order: res.order
            };
        },
        async moveElement({treeId, nodeId, parentTo = null, order = 0, ctx}): Promise<ITreeNodeLight> {
            const destination = parentTo ? getFullNodeId(parentTo, treeId) : getRootId(treeId);
            const elemId = getFullNodeId(nodeId, treeId);

            const edgeCollec = dbService.db.collection(getEdgesCollectionName(treeId));

            const res = (
                await dbService.execute<ITreeEdge[]>({
                    query: aql`
                    FOR e IN ${edgeCollec}
                        FILTER e._to == ${elemId}
                        UPDATE e WITH {_from: ${destination}, _to: ${elemId}, order: ${order}}
                        IN ${edgeCollec}
                        RETURN NEW
                `,
                    ctx
                })
            )[0];

            return {
                id: nodeId,
                order: res.order
            };
        },
        async deleteElement({treeId, nodeId, deleteChildren = true, ctx}): Promise<ITreeNodeLight> {
            const edgeCollec = dbService.db.collection(getEdgesCollectionName(treeId));
            const nodesCollec = dbService.db.collection(getNodesCollectionName(treeId));
            const fullNodeId = getFullNodeId(nodeId, treeId);

            if (deleteChildren) {
                // Remove all element's children
                await dbService.execute({
                    query: aql`
                        LET edges = (
                            FOR v, e IN 0..${MAX_TREE_DEPTH} OUTBOUND ${fullNodeId}
                            ${edgeCollec}
                            RETURN e
                        )
                        FOR ed IN edges
                            FILTER ed != null
                            REMOVE ed IN ${edgeCollec}
                            RETURN OLD
                    `,
                    ctx
                });
            } else {
                const parentId = (
                    await dbService.execute<string[]>({
                        query: aql`
                        FOR v IN 1 INBOUND ${fullNodeId}
                        ${edgeCollec}
                        RETURN v._id
                    `,
                        ctx
                    })
                )[0];

                const children = await dbService.execute({
                    query: aql`
                        FOR v IN 1 OUTBOUND ${fullNodeId}
                        ${edgeCollec}
                        RETURN v
                    `,
                    ctx
                });

                // Move children to element's parent
                await Promise.all(
                    children.map(child => {
                        return this.moveElement({
                            treeId,
                            nodeId: child._key,
                            parentTo: parentId,
                            ctx
                        });
                    })
                );
            }

            // Remove element from its parent and link to record
            await dbService.execute({
                query: aql`
                    FOR e IN ${edgeCollec}
                        FILTER e._to == ${fullNodeId} OR e._from == ${fullNodeId}
                        REMOVE e IN ${edgeCollec}
                        RETURN OLD
                `,
                ctx
            });

            // Remove node entity
            const removedEntity = (
                await dbService.execute({
                    query: aql`REMOVE {_id: ${fullNodeId}, _key: ${nodeId}} IN ${nodesCollec} RETURN OLD`,
                    ctx
                })
            )[0];

            return {id: removedEntity._key};
        },
        async isNodePresent({treeId, nodeId, ctx}): Promise<boolean> {
            const collec = dbService.db.collection(getEdgesCollectionName(treeId));
            const elemId = getFullNodeId(nodeId, treeId);

            const query = aql`
                FOR e IN ${collec}
                    FILTER e._to == ${elemId}
                    RETURN e
            `;
            const res = await dbService.execute({query, ctx});

            return !!res.length;
        },
        async isRecordPresent({treeId, record, ctx}): Promise<boolean> {
            const collec = dbService.db.collection(getNodesCollectionName(treeId));
            const elementId = `${record.library}/${record.id}`;

            const query = aql`
                FOR n IN ${collec}
                    FILTER n.${literal(NODE_LIBRARY_ID_FIELD)} == ${record.library}
                        AND n.${literal(NODE_RECORD_ID_FIELD)} == ${record.id}
                    RETURN n
            `;
            const res = await dbService.execute({query, ctx});

            return !!res.length;
        },
        async getTreeContent({
            treeId,
            startingNode,
            depth = MAX_TREE_DEPTH,
            childrenCount = false,
            ctx
        }): Promise<ITreeNode[]> {
            const rootId = getRootId(treeId);

            const collec = dbService.db.collection(getEdgesCollectionName(treeId));

            const nodeFrom = startingNode ? getFullNodeId(startingNode, treeId) : rootId;
            const nodeFromKey = startingNode ?? rootId.split('/')[1];

            /**
             * This query return a list of all records present in the tree with their path IDs
             * from the root. Query is made depth-first
             *
             * The order we need is defined between the node and its parent.
             * Thus, we have to retrieve it on the before-last edge of the path to the record
             */
            const queryParts = [
                aql`
                    FOR v, e, p IN 1..${depth} OUTBOUND ${nodeFrom}
                    ${collec}
                    LET record = DOCUMENT(v.${NODE_LIBRARY_ID_FIELD}, v.${NODE_RECORD_ID_FIELD})
                    LET path = (
                        FOR pv IN p.vertices
                        FILTER pv._id != v._id
                        RETURN pv._key
                    )
                    LET nodeOrder = TO_NUMBER(p.edges[-1].order)
                `
            ];

            if (childrenCount) {
                queryParts.push(aql`
                    LET childrenCount = COUNT(
                        FOR vChildren IN 1 outbound v
                        ${collec}
                        return vChildren
                    )
                `);
            }

            queryParts.push(aql`
                SORT LENGTH(path), nodeOrder ASC
                RETURN {
                    id: v._key,
                    record: MERGE(record, {path}),
                    order: nodeOrder,
                    ${literal(childrenCount ? 'childrenCount' : '')}
                }
            `);

            const data: Array<{
                id: string;
                record: IDbDocument & {path: string[]};
                order: number;
                childrenCount?: number;
            }> = await dbService.execute({
                query: join(queryParts),
                ctx
            });

            /**
             * Process query result to transform it to a proper tree structure
             * For each record of the tree, we run through its path to find out where is its parent
             * in the tree.
             * Then we can add it to its parent children.
             */
            const treeContent: ITreeNode[] = [];
            for (const elem of data) {
                /** Determine where is the parent in the tree */
                let parentInTree: ITreeNode[] | ITreeNode = treeContent;
                for (const pathPart of elem.record.path) {
                    // Root's first level children will be directly added to the tree
                    if (pathPart === nodeFromKey) {
                        parentInTree = treeContent;
                    } else {
                        // If previous parent was the tree root, there's no 'children'
                        const container: ITreeNode[] =
                            parentInTree === treeContent ? parentInTree : (parentInTree as ITreeNode).children;

                        // Look for the path to follow among all nodes
                        parentInTree = container.find(el => el.id === pathPart);
                    }
                }

                /** Add element to its parent */
                delete elem.record.path;
                elem.record.library = getLibraryFromDbId(elem.record._id);

                // If destination is the tree root, there's no 'children'
                const destination = parentInTree === treeContent ? parentInTree : (parentInTree as ITreeNode).children;

                const treeNode: ITreeNode = {
                    id: elem.id,
                    order: elem.order,
                    record: dbUtils.cleanup(elem.record),
                    children: []
                };

                if (childrenCount) {
                    treeNode.childrenCount = elem.childrenCount ?? 0;
                }
                destination.push(treeNode);
            }

            return treeContent;
        },
        async getElementChildren({
            treeId,
            nodeId,
            childrenCount = false,
            withTotalCount,
            pagination,
            ctx
        }): Promise<IList<ITreeNode>> {
            const rootId = getRootId(treeId);
            const nodeFrom = nodeId ? getFullNodeId(nodeId, treeId) : rootId;

            const hasPagination = typeof pagination?.offset !== 'undefined' && typeof pagination?.limit !== 'undefined';

            const treeEdgeCollec = dbService.db.collection(getEdgesCollectionName(treeId));

            const childrenCountQuery = aql`
                LET childrenCount = COUNT(
                    FOR vChildren IN 1 OUTBOUND v
                    ${treeEdgeCollec}
                    RETURN vChildren
                )
            `;

            // Fetch children. For each child, retrieve linked record
            const query = aql`
                FOR v, e, p IN 1 OUTBOUND ${nodeFrom}
                    ${treeEdgeCollec}
                    LET order = TO_NUMBER(p.edges[0].order)
                    LET key = p.edges[0]._key
                    SORT order ASC, key ASC
                    ${hasPagination ? aql`LIMIT ${pagination.offset}, ${pagination.limit}` : literal('')}

                    ${childrenCount ? childrenCountQuery : aql``}

                    LET record = DOCUMENT(v.${NODE_LIBRARY_ID_FIELD}, v.${NODE_RECORD_ID_FIELD})

                    RETURN {
                        id: v._key,
                        order,
                        ${childrenCount ? literal('childrenCount,') : aql``}
                        record
                    }
            `;

            const res = await dbService.execute<IExecuteWithCount<IChildrenResultNode> | IChildrenResultNode[]>({
                query,
                withTotalCount,
                ctx
            });

            const list = isExecuteWithCount(res) ? res.results : res;
            return {
                totalCount: isExecuteWithCount(res) ? res.totalCount : null,
                list: list.map(elem => {
                    elem.record.library = getLibraryFromDbId(elem.record._id);
                    return {
                        id: elem.id,
                        order: elem.order,
                        record: dbUtils.cleanup(elem.record),
                        childrenCount: elem.childrenCount ?? null
                    };
                })
            };
        },
        async getElementAncestors({treeId, nodeId, ctx}): Promise<TreePaths> {
            if (!nodeId) {
                return [];
            }

            const treeEdgeCollec = dbService.db.collection(getEdgesCollectionName(treeId));

            const query = aql`
                FOR v,e,p IN 0..${MAX_TREE_DEPTH} INBOUND ${getFullNodeId(nodeId, treeId)}
                    ${treeEdgeCollec}
                    FILTER v._id != ${getRootId(treeId)}
                    LET record = DOCUMENT(v.${NODE_LIBRARY_ID_FIELD}, v.${NODE_RECORD_ID_FIELD})
                    RETURN {id: v._key, order: TO_NUMBER(e.order), record}
            `;

            const res: Array<{
                id: string;
                record: IDbDocument;
                order: number;
            }> = await dbService.execute({query, ctx});

            const cleanResult = res.reverse().map(elem => {
                elem.record.library = elem.record?._id ? getLibraryFromDbId(elem.record._id) : null;
                return {id: elem.id, order: elem.order, record: dbUtils.cleanup(elem.record)};
            });
            return cleanResult;
        },
        async getLinkedRecords({treeId, attribute, nodeId, ctx}): Promise<IRecord[]> {
            const edgeCollec = dbService.db.collection(VALUES_LINKS_COLLECTION);

            const query = aql`
                FOR v,e,p
                    IN 1 INBOUND ${getFullNodeId(nodeId, treeId)}
                    ${edgeCollec}
                    FILTER e.attribute == ${attribute}
                    RETURN v
            `;

            const res = await dbService.execute({query, ctx});

            return res.map(elem => {
                elem.library = getLibraryFromDbId(elem._id);

                return dbUtils.cleanup(elem);
            });
        },
        async getRecordByNodeId({treeId, nodeId, ctx}): Promise<IRecord> {
            const nodesCollec = dbService.db.collection(getNodesCollectionName(treeId));

            const query = aql`
                FOR n IN ${nodesCollec}
                    FILTER n._key == ${nodeId}
                    LET record = DOCUMENT(n.${NODE_LIBRARY_ID_FIELD}, n.${NODE_RECORD_ID_FIELD})
                    RETURN record
            `;

            const queryRes = await dbService.execute({query, ctx});
            const recordDoc = queryRes[0];

            if (!recordDoc) {
                return null;
            }

            recordDoc.library = getLibraryFromDbId(recordDoc._id);

            return dbUtils.cleanup<IRecord>(recordDoc);
        },
        async getNodesByRecord({
            treeId,
            record,
            ctx
        }: {
            treeId: string;
            record: ITreeElement;
            ctx: IQueryInfos;
        }): Promise<string[]> {
            const nodesCollec = dbService.db.collection(getNodesCollectionName(treeId));

            const query = aql`
                FOR n IN ${nodesCollec}
                    FILTER n.${NODE_LIBRARY_ID_FIELD} == ${record.library} && n.${NODE_RECORD_ID_FIELD} == ${record.id}
                    RETURN n._key
            `;
            const nodes = await dbService.execute<string[]>({query, ctx});

            return nodes;
        },
        async getNodesByLibrary({treeId, libraryId, ctx}) {
            const nodesCollec = dbService.db.collection(getNodesCollectionName(treeId));

            const query = aql`
                FOR n IN ${nodesCollec}
                    FILTER n.${NODE_LIBRARY_ID_FIELD} == ${libraryId}
                    RETURN n._key
            `;
            const nodes = await dbService.execute<string[]>({query, ctx});

            return nodes;
        }
    };
}
