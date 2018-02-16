import {Database} from 'arangojs';
import {AqlQuery} from 'arangojs/lib/esm/aql-query';

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
}

export enum collectionTypes {
    DOCUMENT = 'document',
    EDGE = 'edge'
}

export default function(db: Database): IDbService {
    return {
        db,
        async execute(query: string | AqlQuery): Promise<[any]> {
            const res = await db.query(query);
            return res.all();
        },
        async createCollection(name: string, type = collectionTypes.DOCUMENT): Promise<void> {
            const collections = await db.listCollections();

            const colExists = collections.reduce((exists, c) => exists || c.name === name, false);
            if (colExists) {
                throw new Error(`Collection ${name} already exists`);
            }

            if (type === collectionTypes.EDGE) {
                const collection = db.edgeCollection(name);
                await collection.create();
            } else {
                const collection = db.collection(name);
                await collection.create();
            }
        }
    };
}
