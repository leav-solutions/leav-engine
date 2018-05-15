import {ITree, ITreeElement, ITreeFilterOptions, ITreeNode} from '_types/tree';
import {aql} from 'arangojs';
import {IDbService, collectionTypes} from './db/dbService';
import {IDbUtils} from './db/dbUtils';
import {IRecord} from '_types/record';
import {VALUES_LINKS_COLLECTION} from './recordRepo';

export interface ITreeRepo {
    createTree(treeData: ITree): Promise<ITree>;
    updateTree(treeData: ITree): Promise<ITree>;
    getTrees(filters?: ITreeFilterOptions): Promise<ITree[]>;
    deleteTree(id: string): Promise<ITree>;

    /**
     * Add an element to the tree
     *
     * @param element
     * @param parent Parent must be a record or null to add element to root
     */
    addElement(treeId: string, element: ITreeElement, parent: ITreeElement | null): Promise<ITreeElement>;

    /**
     * Move an element in the tree
     *
     * @param element
     * @param parentFrom A record or null to move from root
     * @param parentTo A record or null to move to root
     */
    moveElement(treeId: string, element: ITreeElement, parentTo: ITreeElement | null): Promise<ITreeElement>;

    /**
     * Delete an element from the tree
     *
     * @param element
     * @param parent A record or null to delete from root
     */
    deleteElement(treeId: string, element: ITreeElement, deleteChildren: boolean | null): Promise<ITreeElement>;

    /**
     * Return whether an element is present in given tree
     *
     * @param treeId
     * @param element
     */
    isElementPresent(treeId: string, element: ITreeElement): Promise<boolean>;

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
     * @param treeId
     * @param startingNode  Return the tree starting from this node. If not specified, start from root
     */
    getTreeContent(treeId: string, startingNode?: ITreeElement): Promise<ITreeNode[]>;

    /**
     * Return all first level children of an element
     *
     * @param treeId
     * @param element
     */
    getElementChildren(treeId: string, element: ITreeElement): Promise<ITreeNode[]>;

    /**
     * Return all ancestors of an element, including element itself, but excluding tree root
     *
     * @param treeId
     * @param element
     */
    getElementAncestors(treeId: string, element: ITreeElement): Promise<ITreeNode[]>;

    getLinkedRecords(treeId: string, attribute: string, element: ITreeElement): Promise<IRecord[]>;
}

const TREES_COLLECTION_NAME = 'core_trees';
const EDGE_COLLEC_PREFIX = 'core_edge_tree_';
const MAX_TREE_DEPTH = 1000;

export default function(dbService: IDbService, dbUtils: IDbUtils): ITreeRepo {
    function _getRootId(treeId: string): string {
        return `${TREES_COLLECTION_NAME}/${treeId}`;
    }

    function _getTreeEdgeCollectionName(treeId: string): string {
        return EDGE_COLLEC_PREFIX + treeId;
    }

    return {
        async createTree(treeData: ITree): Promise<ITree> {
            const defaultParams = {_key: '', system: false, label: {fr: '', en: ''}};
            const collec = dbService.db.collection(TREES_COLLECTION_NAME);

            const docToInsert = {...defaultParams, ...dbUtils.convertToDoc(treeData)};

            const treeRes = await dbService.execute(aql`INSERT ${docToInsert} IN ${collec} RETURN NEW`);

            const edgeCollec = await dbService.createCollection(EDGE_COLLEC_PREFIX + treeData.id, collectionTypes.EDGE);

            return dbUtils.cleanup(treeRes.pop());
        },
        async updateTree(treeData: ITree): Promise<ITree> {
            const collec = dbService.db.collection(TREES_COLLECTION_NAME);

            const docToSave = dbUtils.convertToDoc(treeData);

            const treeRes = await dbService.execute(aql`UPDATE ${docToSave} IN ${collec} RETURN NEW`);

            return dbUtils.cleanup(treeRes.pop());
        },
        async getTrees(filters?: ITreeFilterOptions): Promise<ITree[]> {
            let query = `FOR l IN ${TREES_COLLECTION_NAME}`;
            const bindVars = {};

            if (typeof filters !== 'undefined') {
                const dbFilters = dbUtils.convertToDoc(filters);
                const filtersKeys = Object.keys(dbFilters);
                for (let i = 0; i < filtersKeys.length; i++) {
                    query += ` FILTER l.@filterKey${i} == @filterValue${i}`;
                    bindVars[`filterKey${i}`] = filtersKeys[i];
                    bindVars[`filterValue${i}`] = `${dbFilters[filtersKeys[i]]}`;
                }
            }

            query += ` RETURN l`;

            const res = await dbService.execute({query, bindVars});

            return res.map(dbUtils.cleanup);
        },
        async deleteTree(id: string): Promise<ITree> {
            const collec = dbService.db.collection(TREES_COLLECTION_NAME);
            const res = await dbService.execute(aql`REMOVE ${{_key: id}} IN ${collec} RETURN OLD`);

            const delCollec = await dbService.dropCollection(EDGE_COLLEC_PREFIX + id, collectionTypes.EDGE);

            // Return deleted library
            return dbUtils.cleanup(res.pop());
        },
        async addElement(treeId: string, element: ITreeElement, parent: ITreeElement | null): Promise<ITreeElement> {
            const destination = parent !== null ? `${parent.library}/${parent.id}` : _getRootId(treeId);
            const elemId = `${element.library}/${element.id}`;

            const collec = dbService.db.edgeCollection(_getTreeEdgeCollectionName(treeId));

            const res = await dbService.execute(
                aql`INSERT {_from: ${destination}, _to: ${elemId}} IN ${collec} RETURN NEW`
            );

            return element;
        },
        async moveElement(treeId: string, element: ITreeElement, parentTo: ITreeElement | null): Promise<ITreeElement> {
            const destination = parentTo !== null ? `${parentTo.library}/${parentTo.id}` : _getRootId(treeId);
            const elemId = `${element.library}/${element.id}`;

            const collec = dbService.db.edgeCollection(_getTreeEdgeCollectionName(treeId));

            const res = await dbService.execute(
                aql`
                    FOR e IN ${collec}
                        FILTER e._to == ${elemId}
                        UPDATE e WITH {_from: ${destination}, _to: ${elemId}}
                        IN ${collec}
                        RETURN NEW
                `
            );

            return element;
        },
        async deleteElement(
            treeId: string,
            element: ITreeElement,
            deleteChildren: boolean | null = true
        ): Promise<ITreeElement> {
            const collec = dbService.db.edgeCollection(_getTreeEdgeCollectionName(treeId));
            const elemId = `${element.library}/${element.id}`;

            if (deleteChildren) {
                // Remove all element's children
                const resRemChildren = await dbService.execute(aql`
                    LET edges = (
                        FOR v, e IN 0..${MAX_TREE_DEPTH} OUTBOUND ${elemId}
                        ${collec}
                        RETURN e
                    )
                    FOR ed IN edges
                        FILTER ed != null
                        REMOVE ed IN ${collec}
                        RETURN OLD
                `);
            } else {
                const parentId = await dbService.execute(aql`
                    FOR v IN 1 INBOUND ${elemId}
                    ${collec}
                    RETURN v._id
                `);

                const parent = {
                    library: parentId[0].split('/')[0],
                    id: parentId[0].split('/')[1]
                };

                const children = await dbService.execute(aql`
                    FOR v IN 1 OUTBOUND ${elemId}
                    ${collec}
                    RETURN v
                `);

                // Move children to element's parent
                await Promise.all(
                    children.map(child => {
                        const childLib = child._id.split('/')[0];
                        const childId = child._id.split('/')[1];

                        return this.moveElement(treeId, {id: childId, library: childLib}, parent);
                    })
                );
            }

            // Remove element from its parent
            const resRemElem = await dbService.execute(aql`
                FOR e IN ${collec}
                    FILTER e._to == ${elemId}
                    REMOVE e IN ${collec}
                    RETURN OLD
            `);

            return element;
        },
        async isElementPresent(treeId: string, element: ITreeElement): Promise<boolean> {
            const collec = dbService.db.edgeCollection(_getTreeEdgeCollectionName(treeId));
            const elemId = `${element.library}/${element.id}`;

            const res = await dbService.execute(aql`
                FOR e IN ${collec}
                    FILTER e._to == ${elemId}
                    RETURN e
            `);

            return !!res.length;
        },
        async getTreeContent(treeId: string, startingNode?: ITreeElement): Promise<ITreeNode[]> {
            const rootId = _getRootId(treeId);

            const treeContent: ITreeNode[] = [];

            const collec = dbService.db.edgeCollection(_getTreeEdgeCollectionName(treeId));

            const nodeFrom = !!startingNode ? `${startingNode.library}/${startingNode.id}` : rootId;

            /**
             * This query return a list of all records present in the tree with their path IDs
             * from the root. Query is made depth-first
             */
            const data = await dbService.execute(aql`
                FOR v, e, p IN 1..${MAX_TREE_DEPTH} OUTBOUND ${nodeFrom}
                ${collec}
                LET path = (FOR pv IN p.vertices RETURN pv._id)
                RETURN MERGE(v, {path})
            `);

            /**
             * Process query result to transform it to a proper tree structure
             * For each record of the tree, we run through its path to find out where is its parent
             * in the tree.
             * Then we can add it to its parent children.
             */
            for (const elem of data) {
                // We don't want the root in the tree, skip it
                if (elem._id === rootId) {
                    continue;
                }

                // Last path part is the element itself, we don't need it
                elem.path.pop();

                /** Determine where is the parent in the tree */
                let parentInTree: any = treeContent;
                for (const pathPart of elem.path) {
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
                delete elem.path;
                elem.library = elem._id.split('/')[0];

                // If destination is the tree root, there's no 'children'
                const destination = parentInTree === treeContent ? parentInTree : parentInTree.children;

                destination.push({record: dbUtils.cleanup(elem), children: []});
            }

            return treeContent;
        },
        async getElementChildren(treeId: string, element: ITreeElement): Promise<ITreeNode[]> {
            const treeEdgeCollec = dbService.db.edgeCollection(_getTreeEdgeCollectionName(treeId));
            const query = aql`
                FOR v
                    IN 1 OUTBOUND ${element.library + '/' + element.id}
                    ${treeEdgeCollec}
                    RETURN v
            `;

            const res = await dbService.execute(query);
            return res.map(elem => {
                elem.library = elem._id.split('/')[0];
                return {record: dbUtils.cleanup(elem)};
            });
        },
        async getElementAncestors(treeId: string, element: ITreeElement): Promise<ITreeNode[]> {
            const treeEdgeCollec = dbService.db.edgeCollection(_getTreeEdgeCollectionName(treeId));

            const query = aql`
                FOR v,e,p
                    IN 0..${MAX_TREE_DEPTH} INBOUND ${element.library + '/' + element.id}
                    ${treeEdgeCollec}
                    SORT COUNT(p.edges) DESC
                    FILTER v._id != ${_getRootId(treeId)}
                    RETURN v
            `;

            const res = await dbService.execute(query);

            return res.map(elem => {
                elem.library = elem._id.split('/')[0];

                return {record: dbUtils.cleanup(elem)};
            });
        },
        async getLinkedRecords(treeId: string, attribute: string, element: ITreeElement): Promise<IRecord[]> {
            const edgeCollec = dbService.db.edgeCollection(VALUES_LINKS_COLLECTION);

            const query = aql`
                FOR v,e,p
                    IN 1 INBOUND ${element.library + '/' + element.id}
                    ${edgeCollec}
                    FILTER e.attribute == ${attribute}
                    RETURN v
            `;

            const res = await dbService.execute(query);

            return res.map(elem => {
                elem.library = elem._id.split('/')[0];

                return dbUtils.cleanup(elem);
            });
        }
    };
}
