import {ITree, ITreeFilterOptions, ITreeElement} from '_types/tree';
import {IDbService, collectionTypes} from './db/dbService';
import {IDbUtils} from './db/dbUtils';
import {aql} from 'arangojs';
import {IRecord} from '_types/record';

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
    moveElement(
        treeId: string,
        element: ITreeElement,
        parentFrom: ITreeElement | null,
        parentTo: ITreeElement | null
    ): Promise<ITreeElement>;

    /**
     * Delete an element from the tree
     *
     * @param element
     * @param parent A record or null to delete from root
     */
    deleteElement(
        treeId: string,
        element: ITreeElement,
        parent: ITreeElement | null,
        deleteChildren: boolean | null
    ): Promise<ITreeElement>;

    /**
     * Return whether an element is present in given tree
     *
     * @param treeId
     * @param element
     */
    isElementPresent(treeId: string, element: ITreeElement): Promise<boolean>;
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
        async moveElement(
            treeId: string,
            element: ITreeElement,
            parentFrom: ITreeElement | null,
            parentTo: ITreeElement | null
        ): Promise<ITreeElement> {
            const origin = parentFrom !== null ? `${parentFrom.library}/${parentFrom.id}` : _getRootId(treeId);
            const destination = parentTo !== null ? `${parentTo.library}/${parentTo.id}` : _getRootId(treeId);
            const elemId = `${element.library}/${element.id}`;

            const collec = dbService.db.edgeCollection(_getTreeEdgeCollectionName(treeId));

            const res = await dbService.execute(
                aql`
                    FOR e IN ${collec}
                        FILTER e._from == ${origin} && e._to == ${elemId}
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
            parent: ITreeElement | null,
            deleteChildren: boolean | null = true
        ): Promise<ITreeElement> {
            const collec = dbService.db.edgeCollection(_getTreeEdgeCollectionName(treeId));
            const origin = parent !== null ? `${parent.library}/${parent.id}` : _getRootId(treeId);
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

                        return this.moveElement(treeId, {id: childId, library: childLib}, element, parent);
                    })
                );
            }

            // Remove element from its parent
            const resRemElem = await dbService.execute(aql`
                FOR e IN ${collec}
                    FILTER e._from == ${origin} && e._to == ${elemId}
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
        }
    };
}
