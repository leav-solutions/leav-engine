import {Database} from 'arangojs';
import {AqlQuery} from 'arangojs/lib/cjs/aql-query';
import {IUtils} from 'utils/utils';

export interface IDbService {
    db?: Database;

    /**
     * Execute an AQL query
     *
     * @param query
     */
    execute?(query: string | AqlQuery): Promise<any>;

    /**
     * Create a new collection in database
     * @param name Collection name
     * @param type Document or edge collection?
     * @throws If collection already exists
     */
    createCollection?(name: string, type?: collectionTypes): Promise<void> | null;

    /**
     * Delete a collection in database
     * @param name Collection name
     * @param type Document or edge collection?
     * @throws If collection already exists
     */
    dropCollection?(name: string, type?: collectionTypes): Promise<void> | null;

    /**
     * Check if collection already exists
     * @param name
     */
    collectionExists?(name: string): Promise<boolean>;
}

export enum collectionTypes {
    DOCUMENT = 'document',
    EDGE = 'edge'
}

export default function(db: Database, utils: IUtils): IDbService {
    const collectionExists = async function(name: string): Promise<boolean> {
        const collections = await db.listCollections();

        return collections.reduce((exists, c) => exists || c.name === name, false);
    };

    return {
        db,
        async execute(query: string | AqlQuery): Promise<any[]> {
            try {
                const res = await db.query(query);
                return res.all();
            } catch (e) {
                e.query = query;
                utils.rethrow(e);
            }
        },
        async createCollection(name: string, type = collectionTypes.DOCUMENT): Promise<void> {
            if (await collectionExists(name)) {
                throw new Error(`Collection ${name} already exists`);
            }

            if (type === collectionTypes.EDGE) {
                const collection = db.edgeCollection(name);
                await collection.create();
            } else {
                const collection = db.collection(name);
                await collection.create();
            }
        },
        async dropCollection(name: string, type = collectionTypes.DOCUMENT): Promise<void> {
            if (!(await collectionExists(name))) {
                throw new Error(`Collection ${name} does not exist`);
            }

            const collection = type === collectionTypes.EDGE ? db.edgeCollection(name) : db.collection(name);
            await collection.drop();
        },
        collectionExists
    };
}
