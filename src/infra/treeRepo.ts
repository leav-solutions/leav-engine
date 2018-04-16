import {ITree, ITreeFilterOptions} from '_types/tree';
import {IDbService, collectionTypes} from './db/dbService';
import {IDbUtils} from './db/dbUtils';
import {aql} from 'arangojs';

export interface ITreeRepo {
    createTree(treeData: ITree): Promise<ITree>;
    updateTree(treeData: ITree): Promise<ITree>;
    getTrees(filters?: ITreeFilterOptions): Promise<ITree[]>;
    deleteTree(id: string): Promise<ITree>;
}

const TREES_COLLECTION_NAME = 'core_trees';
const EDGE_COLLEC_PREFIX = 'core_edge_tree_';

export default function(dbService: IDbService, dbUtils: IDbUtils): ITreeRepo {
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
        }
    };
}
