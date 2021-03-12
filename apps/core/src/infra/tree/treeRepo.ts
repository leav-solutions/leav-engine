// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {IList} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IRecord} from '_types/record';
import {IGetCoreEntitiesParams} from '_types/shared';
import {ITree, ITreeElement, ITreeNode, TreePaths} from '_types/tree';
import {collectionTypes, IDbService} from '../db/dbService';
import {IDbUtils} from '../db/dbUtils';
import {VALUES_LINKS_COLLECTION} from '../record/recordRepo';

export interface ITreeRepo {
    getDefaultElement({id, ctx}: {id: string; ctx: IQueryInfos}): Promise<ITreeElement>;
    createTree({treeData, ctx}: {treeData: ITree; ctx: IQueryInfos}): Promise<ITree>;
    updateTree({treeData, ctx}: {treeData: ITree; ctx: IQueryInfos}): Promise<ITree>;
    getTrees({params, ctx}: {params?: IGetCoreEntitiesParams; ctx: IQueryInfos}): Promise<IList<ITree>>;
    deleteTree({id, ctx}: {id: string; ctx: IQueryInfos}): Promise<ITree>;

    /**
     * Add an element to the tree
     *
     * Parent must be a record or null to add element to root
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
        parent: ITreeElement | null;
        order?: number;
        ctx: IQueryInfos;
    }): Promise<ITreeElement>;

    /**
     * Move an element in the tree
     *
     * parentTo A record or null to move to root
     */
    moveElement({
        treeId,
        element,
        parentTo,
        order,
        ctx
    }: {
        treeId: string;
        element: ITreeElement;
        parentTo: ITreeElement | null;
        order?: number;
        ctx: IQueryInfos;
    }): Promise<ITreeElement>;

    /**
     * Delete an element from the tree
     */
    deleteElement({
        treeId,
        element,
        deleteChildren,
        ctx
    }: {
        treeId: string;
        element: ITreeElement;
        deleteChildren: boolean | null;
        ctx: IQueryInfos;
    }): Promise<ITreeElement>;

    /**
     * Return whether an element is present in given tree
     */
    isElementPresent({
        treeId,
        element,
        ctx
    }: {
        treeId: string;
        element: ITreeElement;
        ctx: IQueryInfos;
    }): Promise<boolean>;

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
        startingNode?: ITreeElement;
        ctx: IQueryInfos;
    }): Promise<ITreeNode[]>;

    /**
     * Return all first level children of an element
     */
    getElementChildren({
        treeId,
        element,
        ctx
    }: {
        treeId: string;
        element: ITreeElement;
        ctx: IQueryInfos;
    }): Promise<ITreeNode[]>;

    /**
     * Return all ancestors of an element, including element itself, but excluding tree root
     *
     * @param treeId
     * @param element
     */
    getElementAncestors({
        treeId,
        element,
        ctx
    }: {
        treeId: string;
        element: ITreeElement;
        ctx: IQueryInfos;
    }): Promise<TreePaths>;

    getLinkedRecords({
        treeId,
        attribute,
        element,
        ctx
    }: {
        treeId: string;
        attribute: string;
        element: ITreeElement;
        ctx: IQueryInfos;
    }): Promise<IRecord[]>;
}

export const TREES_COLLECTION_NAME = 'core_trees';
const EDGE_COLLEC_PREFIX = 'core_edge_tree_';
const MAX_TREE_DEPTH = 1000;

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
}
export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null
}: IDeps = {}): ITreeRepo {
    function _getRootId(treeId: string): string {
        return `${TREES_COLLECTION_NAME}/${treeId}`;
    }

    function _getTreeEdgeCollectionName(treeId: string): string {
        return EDGE_COLLEC_PREFIX + treeId;
    }

    return {
        async getDefaultElement({id, ctx}): Promise<ITreeElement> {
            // TODO Change this behavior
            // for now, get first element in tree
            const content = await this.getTreeContent({treeId: id, ctx});
            return {
                id: content[0].record.id,
                library: content[0].record.library
            };
        },
        async createTree({treeData, ctx}): Promise<ITree> {
            const collec = dbService.db.collection(TREES_COLLECTION_NAME);

            const docToInsert = dbUtils.convertToDoc(treeData);

            const treeRes = await dbService.execute({
                query: aql`INSERT ${docToInsert} IN ${collec} RETURN NEW`,
                ctx
            });

            await dbService.createCollection(EDGE_COLLEC_PREFIX + treeData.id, collectionTypes.EDGE);

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
        async getTrees({params = {}, ctx}): Promise<IList<ITree>> {
            const defaultParams: IGetCoreEntitiesParams = {
                filters: null,
                strictFilters: false,
                withCount: false,
                pagination: null,
                sort: null
            };
            const initializedParams = {...defaultParams, ...params};

            return dbUtils.findCoreEntity<ITree>({...initializedParams, collectionName: TREES_COLLECTION_NAME, ctx});
        },
        async deleteTree({id, ctx}): Promise<ITree> {
            const collec = dbService.db.collection(TREES_COLLECTION_NAME);
            const res = await dbService.execute({
                query: aql`REMOVE ${{_key: id}} IN ${collec} RETURN OLD`,
                ctx
            });

            const delCollec = await dbService.dropCollection(EDGE_COLLEC_PREFIX + id, collectionTypes.EDGE);

            // Return deleted library
            return dbUtils.cleanup(res.pop());
        },
        async addElement({treeId, element, parent = null, order = 0, ctx}): Promise<ITreeElement> {
            const destination = parent !== null ? `${parent.library}/${parent.id}` : _getRootId(treeId);
            const elemId = `${element.library}/${element.id}`;

            const collec = dbService.db.edgeCollection(_getTreeEdgeCollectionName(treeId));

            const res = await dbService.execute({
                query: aql`INSERT {_from: ${destination}, _to: ${elemId}, order: ${order}} IN ${collec} RETURN NEW`,
                ctx
            });

            return element;
        },
        async moveElement({treeId, element, parentTo = null, order = 0, ctx}): Promise<ITreeElement> {
            const destination = parentTo !== null ? `${parentTo.library}/${parentTo.id}` : _getRootId(treeId);
            const elemId = `${element.library}/${element.id}`;

            const collec = dbService.db.edgeCollection(_getTreeEdgeCollectionName(treeId));

            const res = await dbService.execute({
                query: aql`
                    FOR e IN ${collec}
                        FILTER e._to == ${elemId}
                        UPDATE e WITH {_from: ${destination}, _to: ${elemId}, order: ${order}}
                        IN ${collec}
                        RETURN NEW
                `,
                ctx
            });

            return element;
        },
        async deleteElement({treeId, element, deleteChildren = true, ctx}): Promise<ITreeElement> {
            const collec = dbService.db.edgeCollection(_getTreeEdgeCollectionName(treeId));
            const elemId = `${element.library}/${element.id}`;

            if (deleteChildren) {
                // Remove all element's children
                const resRemChildren = await dbService.execute({
                    query: aql`
                        LET edges = (
                            FOR v, e IN 0..${MAX_TREE_DEPTH} OUTBOUND ${elemId}
                            ${collec}
                            RETURN e
                        )
                        FOR ed IN edges
                            FILTER ed != null
                            REMOVE ed IN ${collec}
                            RETURN OLD
                    `,
                    ctx
                });
            } else {
                const parentId = await dbService.execute({
                    query: aql`
                        FOR v IN 1 INBOUND ${elemId}
                        ${collec}
                        RETURN v._id
                    `,
                    ctx
                });

                const parent = {
                    library: parentId[0].split('/')[0],
                    id: parentId[0].split('/')[1]
                };

                const children = await dbService.execute({
                    query: aql`
                        FOR v IN 1 OUTBOUND ${elemId}
                        ${collec}
                        RETURN v
                    `,
                    ctx
                });

                // Move children to element's parent
                await Promise.all(
                    children.map(child => {
                        const childLib = child._id.split('/')[0];
                        const childId = child._id.split('/')[1];

                        return this.moveElement({
                            treeId,
                            element: {id: childId, library: childLib},
                            parentTo: parent,
                            ctx
                        });
                    })
                );
            }

            // Remove element from its parent
            const resRemElem = await dbService.execute({
                query: aql`
                    FOR e IN ${collec}
                        FILTER e._to == ${elemId}
                        REMOVE e IN ${collec}
                        RETURN OLD
                `,
                ctx
            });

            return element;
        },
        async isElementPresent({treeId, element, ctx}): Promise<boolean> {
            const collec = dbService.db.edgeCollection(_getTreeEdgeCollectionName(treeId));
            const elemId = `${element.library}/${element.id}`;

            const query = aql`
                FOR e IN ${collec}
                    FILTER e._to == ${elemId}
                    RETURN e
            `;
            const res = await dbService.execute({query, ctx});

            return !!res.length;
        },
        async getTreeContent({treeId, startingNode, ctx}): Promise<ITreeNode[]> {
            const rootId = _getRootId(treeId);

            const treeContent: ITreeNode[] = [];

            const collec = dbService.db.edgeCollection(_getTreeEdgeCollectionName(treeId));

            const nodeFrom = !!startingNode ? `${startingNode.library}/${startingNode.id}` : rootId;

            /**
             * This query return a list of all records present in the tree with their path IDs
             * from the root. Query is made depth-first
             */
            const data = await dbService.execute({
                query: aql`
                    FOR v, e, p IN 1..${MAX_TREE_DEPTH} OUTBOUND ${nodeFrom}
                    ${collec}
                    LET path = (FOR pv IN p.vertices RETURN pv._id)
                    SORT LENGTH(path), e.order ASC
                    RETURN {record: MERGE(v, {path}), order: TO_NUMBER(e.order)}
                `,
                ctx
            });

            /**
             * Process query result to transform it to a proper tree structure
             * For each record of the tree, we run through its path to find out where is its parent
             * in the tree.
             * Then we can add it to its parent children.
             */
            for (const elem of data) {
                // We don't want the root in the tree, skip it
                if (elem.record._id === rootId) {
                    continue;
                }

                // Last path part is the element itself, we don't need it
                elem.record.path.pop();

                /** Determine where is the parent in the tree */
                let parentInTree: any = treeContent;
                for (const pathPart of elem.record.path) {
                    // Root's first level children will be directly added to the tree
                    if (pathPart === nodeFrom) {
                        parentInTree = treeContent;
                    } else {
                        // If previous parent was the tree root, there's no 'children'
                        const container = parentInTree === treeContent ? parentInTree : parentInTree.children;

                        // Look for the path to follow among all nodes
                        parentInTree = container.find(el => {
                            const pathLib = pathPart.split('/')[0];
                            const pathId = pathPart.split('/')[1];
                            return el.record.library === pathLib && el.record.id === pathId;
                        });
                    }
                }

                /** Add element to its parent */
                delete elem.record.path;
                elem.record.library = elem.record._id.split('/')[0];

                // If destination is the tree root, there's no 'children'
                const destination = parentInTree === treeContent ? parentInTree : parentInTree.children;

                destination.push({order: elem.order, record: dbUtils.cleanup(elem.record), children: []});
            }

            return treeContent;
        },
        async getElementChildren({treeId, element, ctx}): Promise<ITreeNode[]> {
            const treeEdgeCollec = dbService.db.edgeCollection(_getTreeEdgeCollectionName(treeId));
            const query = aql`
                FOR v
                    IN 1 OUTBOUND ${element.library + '/' + element.id}
                    ${treeEdgeCollec}
                    RETURN v
            `;

            const res = await dbService.execute({query, ctx});
            return res.map(elem => {
                elem.library = elem._id.split('/')[0];
                return {record: dbUtils.cleanup(elem)};
            });
        },
        async getElementAncestors({treeId, element, ctx}): Promise<TreePaths> {
            if (!element.id) {
                return [];
            }

            const treeEdgeCollec = dbService.db.edgeCollection(_getTreeEdgeCollectionName(treeId));

            const query = aql`
                FOR v,e,p
                    IN 0..${MAX_TREE_DEPTH} INBOUND ${element.library + '/' + element.id}
                    ${treeEdgeCollec}
                    SORT COUNT(p.edges) DESC
                    FILTER v._id == ${_getRootId(treeId)}
                    RETURN APPEND([], REVERSE(p.vertices[* FILTER CURRENT._key != ${treeId}]))
            `;

            const res = await dbService.execute({query, ctx});

            return res.map(path =>
                path.map(elem => {
                    elem.library = elem._id.split('/')[0];

                    return {record: dbUtils.cleanup(elem)};
                })
            );
        },
        async getLinkedRecords({treeId, attribute, element, ctx}): Promise<IRecord[]> {
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            const query = aql`
                FOR v,e,p
                    IN 1 INBOUND ${element.library + '/' + element.id}
                    ${edgeCollec}
                    FILTER e.attribute == ${attribute}
                    RETURN v
            `;

            const res = await dbService.execute({query, ctx});

            return res.map(elem => {
                elem.library = elem._id.split('/')[0];

                return dbUtils.cleanup(elem);
            });
        }
    };
}
