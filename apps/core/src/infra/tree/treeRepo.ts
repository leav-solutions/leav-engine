// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {IDbDocument, IDbEdge} from 'infra/db/_types';
import {IList} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IRecord} from '_types/record';
import {IGetCoreEntitiesParams} from '_types/shared';
import {IGetCoreTreesParams, ITree, ITreeElement, ITreeNode, ITreeNodeLight, TreePaths} from '_types/tree';
import {collectionTypes, IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';
import {VALUES_LINKS_COLLECTION} from '../record/recordRepo';
import {
    getEdgesCollectionName,
    getFullNodeId,
    getLibraryFromDbId,
    getNodesCollectionName,
    getRootId
} from './helpers/utils';

export interface ITreeRepo {
    getDefaultElement({id, ctx}: {id: string; ctx: IQueryInfos}): Promise<string>;
    createTree({treeData, ctx}: {treeData: ITree; ctx: IQueryInfos}): Promise<ITree>;
    updateTree({treeData, ctx}: {treeData: ITree; ctx: IQueryInfos}): Promise<ITree>;
    getTrees({params, ctx}: {params?: IGetCoreTreesParams; ctx: IQueryInfos}): Promise<IList<ITree>>;
    deleteTree({id, ctx}: {id: string; ctx: IQueryInfos}): Promise<ITree>;

    /**
     * Add an element to the tree
     *
     * Parent must be a record or null to add element to root
     *
     * We return a TreeNodeLight and not a TreeNode to avoid an extra query just to get the record. If client needs it,
     * we'll get it through or manually where needed
     */
    addElement({
        treeId,
        element,
        parent,
        order,
        ctx
    }: {
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
    moveElement({
        treeId,
        nodeId,
        parentTo,
        order,
        ctx
    }: {
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
    deleteElement({
        treeId,
        nodeId,
        deleteChildren,
        ctx
    }: {
        treeId: string;
        nodeId: string;
        deleteChildren: boolean | null;
        ctx: IQueryInfos;
    }): Promise<ITreeNodeLight>;

    /**
     * Return whether a node is present in given tree
     */
    isNodePresent({treeId, nodeId, ctx}: {treeId: string; nodeId: string; ctx: IQueryInfos}): Promise<boolean>;

    /**
     * Return whether a record is present in given tree
     */
    isRecordPresent({treeId, record, ctx}: {treeId: string; record: ITreeElement; ctx: IQueryInfos}): Promise<boolean>;

    /* eslint-disable jsdoc/check-indentation */
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
    getTreeContent({
        treeId,
        startingNode,
        ctx
    }: {
        treeId: string;
        startingNode?: string;
        ctx: IQueryInfos;
    }): Promise<ITreeNode[]>;

    /**
     * Return all first level children of an element
     */
    getElementChildren({treeId, nodeId, ctx}: {treeId: string; nodeId: string; ctx: IQueryInfos}): Promise<ITreeNode[]>;

    /**
     * Return all ancestors of an element, including element itself, but excluding tree root
     *
     * @param treeId
     * @param element
     */
    getElementAncestors({treeId, nodeId, ctx}: {treeId: string; nodeId: string; ctx: IQueryInfos}): Promise<TreePaths>;

    getLinkedRecords({
        treeId,
        attribute,
        nodeId,
        ctx
    }: {
        treeId: string;
        attribute: string;
        nodeId: string;
        ctx: IQueryInfos;
    }): Promise<IRecord[]>;

    /**
     * Return record linked to given node
     */
    getRecordByNodeId({treeId, nodeId, ctx}: {treeId: string; nodeId: string; ctx: IQueryInfos}): Promise<IRecord>;

    /**
     * Return nodes linked to given record
     */
    getNodesByRecord({
        treeId,
        record,
        ctx
    }: {
        treeId: string;
        record: ITreeElement;
        ctx: IQueryInfos;
    }): Promise<string[]>;
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
        async getDefaultElement({id, ctx}): Promise<string> {
            // TODO Change this behavior
            // for now, get first element in tree
            const content = await this.getTreeContent({treeId: id, ctx});
            return content[0].id;
        },
        async createTree({treeData, ctx}): Promise<ITree> {
            const collec = dbService.db.collection(TREES_COLLECTION_NAME);

            const docToInsert = dbUtils.convertToDoc(treeData);

            const treeRes = await dbService.execute({
                query: aql`INSERT ${docToInsert} IN ${collec} RETURN NEW`,
                ctx
            });

            await dbService.createCollection(getEdgesCollectionName(treeData.id), collectionTypes.EDGE);
            await dbService.createCollection(getNodesCollectionName(treeData.id), collectionTypes.DOCUMENT);

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

            await dbService.dropCollection(getEdgesCollectionName(id), collectionTypes.EDGE);
            await dbService.dropCollection(getNodesCollectionName(id), collectionTypes.DOCUMENT);

            // Return deleted library
            return dbUtils.cleanup(res.pop());
        },
        async addElement({treeId, element, parent = null, order = 0, ctx}): Promise<ITreeNodeLight> {
            const destination = parent ? getFullNodeId(parent, treeId) : getRootId(treeId);

            // Create new node entity
            const nodeCollec = dbService.db.collection(getNodesCollectionName(treeId));
            const nodeEntity = (
                await dbService.execute({
                    query: aql`INSERT {} IN ${nodeCollec} RETURN NEW`,
                    ctx
                })
            )[0];

            const edgeCollec = dbService.db.edgeCollection(getEdgesCollectionName(treeId));

            // Link this entity to its record
            const toRecordEdgeData = {
                _from: nodeEntity._id,
                _to: `${element.library}/${element.id}`,
                [TO_RECORD_PROP_NAME]: true
            };
            await dbService.execute({
                query: aql`INSERT ${toRecordEdgeData} IN ${edgeCollec} RETURN NEW`,
                ctx
            });

            // Add this entity to the tree
            const res = (
                await dbService.execute<ITreeEdge[]>({
                    query: aql`INSERT {_from: ${destination}, _to: ${nodeEntity._id}, order: ${order}} IN ${edgeCollec} RETURN NEW`,
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

            const edgeCollec = dbService.db.edgeCollection(getEdgesCollectionName(treeId));

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
            const edgeCollec = dbService.db.edgeCollection(getEdgesCollectionName(treeId));
            const nodesCollec = dbService.db.edgeCollection(getNodesCollectionName(treeId));
            const fullNodeId = getFullNodeId(nodeId, treeId);

            if (deleteChildren) {
                // Remove all element's children
                //TODO: are children of children removed?
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
            const collec = dbService.db.edgeCollection(getEdgesCollectionName(treeId));
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
            const collec = dbService.db.edgeCollection(getEdgesCollectionName(treeId));
            const elementId = `${record.library}/${record.id}`;

            const query = aql`
                FOR e IN ${collec}
                    FILTER e._to == ${elementId} AND e.${TO_RECORD_PROP_NAME}
                    RETURN e
            `;
            const res = await dbService.execute({query, ctx});

            return !!res.length;
        },
        async getTreeContent({treeId, startingNode, ctx}): Promise<ITreeNode[]> {
            const rootId = getRootId(treeId);

            const collec = dbService.db.edgeCollection(getEdgesCollectionName(treeId));

            const nodeFrom = startingNode ? getFullNodeId(startingNode, treeId) : rootId;
            const nodeFromKey = startingNode ?? rootId.split('/')[1];

            /**
             * This query return a list of all records present in the tree with their path IDs
             * from the root. Query is made depth-first
             *
             * The order we need is defined between the node and its parent.
             * Thus, we have to retrieve it on the before-last edge of the path to the record
             */
            const data: Array<{
                id: string;
                record: IDbDocument & {path: string[]};
                order: number;
            }> = await dbService.execute({
                query: aql`
                    FOR v, e, p IN 1..${MAX_TREE_DEPTH} OUTBOUND ${nodeFrom}
                    ${collec}
                    FILTER e.${TO_RECORD_PROP_NAME} AND e._from != ${nodeFrom}
                    LET path = (
                        FOR pv IN p.vertices
                        FILTER pv._id != v._id
                        AND pv._id != e._from
                        RETURN pv._key
                    )
                    LET nodeOrder = TO_NUMBER(p.edges[-2].order)
                    SORT LENGTH(path), nodeOrder ASC
                    RETURN {id: SPLIT(e._from, '/')[1], record: MERGE(v, {path}), order: nodeOrder}
                `,
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

                destination.push({id: elem.id, order: elem.order, record: dbUtils.cleanup(elem.record), children: []});
            }

            return treeContent;
        },
        async getElementChildren({treeId, nodeId, ctx}): Promise<ITreeNode[]> {
            const treeEdgeCollec = dbService.db.edgeCollection(getEdgesCollectionName(treeId));
            const query = aql`
                FOR v, e IN 2 OUTBOUND ${getFullNodeId(nodeId, treeId)}
                    ${treeEdgeCollec}
                    RETURN {id: SPLIT(e._from, '/')[1], order: TO_NUMBER(e.order), record: v}
            `;

            const res: Array<{
                id: string;
                record: IDbDocument;
                order: number;
            }> = await dbService.execute({query, ctx});

            return res.map(elem => {
                elem.record.library = getLibraryFromDbId(elem.record._id);
                return {id: elem.id, order: elem.order, record: dbUtils.cleanup(elem.record)};
            });
        },
        async getElementAncestors({treeId, nodeId, ctx}): Promise<TreePaths> {
            if (!nodeId) {
                return [];
            }

            const treeEdgeCollec = dbService.db.edgeCollection(getEdgesCollectionName(treeId));

            // Fix get ancestors
            const query = aql`
                FOR v,e,p IN 0..${MAX_TREE_DEPTH} INBOUND ${getFullNodeId(nodeId, treeId)}
                ${treeEdgeCollec}
                FILTER v._id != ${getRootId(treeId)}
                LET rec = FIRST(
                    FOR vrec, erec in 1 outbound v._id ${treeEdgeCollec}
                    FILTER erec.${TO_RECORD_PROP_NAME}
                    return vrec
                    )
                RETURN {id: v._key, order: TO_NUMBER(e.order), record: rec}
            `;

            const res: Array<{
                id: string;
                record: IDbDocument;
                order: number;
            }> = await dbService.execute({query, ctx});

            const cleanResult = res.reverse().map(elem => {
                elem.record.library = getLibraryFromDbId(elem.record._id);
                return {id: elem.id, order: elem.order, record: dbUtils.cleanup(elem.record)};
            });
            return cleanResult;
        },
        async getLinkedRecords({treeId, attribute, nodeId, ctx}): Promise<IRecord[]> {
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

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
            const edgeCollec = dbService.db.edgeCollection(getEdgesCollectionName(treeId));
            const fullNodeId = getFullNodeId(nodeId, treeId);

            const query = aql`
            FOR v,e,p
            IN 1 OUTBOUND ${fullNodeId}
            ${edgeCollec}
            FILTER e.${TO_RECORD_PROP_NAME}
            RETURN v
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
            const edgeCollec = dbService.db.edgeCollection(getEdgesCollectionName(treeId));

            const query = aql`
                FOR v,e,p IN 1 INBOUND ${`${record.library}/${record.id}`}
                    ${edgeCollec}
                    FILTER e.${TO_RECORD_PROP_NAME}
                    RETURN v._key
            `;
            const nodes = await dbService.execute<string[]>({query, ctx});

            return nodes;
        }
    };
}
