import {Database} from 'arangojs';
import {AqlQuery, isAqlQuery} from 'arangojs/lib/cjs/aql-query';
import {IUtils} from 'utils/utils';

const MAX_ATTEMPTS = 10;

export interface IExecuteWithCount {
    totalCount: number;
    results: any[];
}

export interface IDbService {
    db?: Database;

    /**
     * Execute an AQL query
     * If withTotalCount is set to true, return an object with totalCount and results. Otherwise, just return
     * results straight from DB.
     *
     * @param query
     * @param withTotalCount
     * @param attempts Used when we have to retry a query after a write-write conflict
     * @throws If query fails or we still have a conflict after all attempts
     */
    execute?<T extends IExecuteWithCount | any[] = any[]>(
        query: string | AqlQuery,
        withTotalCount?: boolean,
        attempts?: number
    ): Promise<T>;

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

interface IDeps {
    'core.infra.db'?: Database;
    'core.utils'?: IUtils;
}

export default function({'core.infra.db': db = null, 'core.utils': utils = null}: IDeps = {}): IDbService {
    const collectionExists = async function(name: string): Promise<boolean> {
        const collections = await db.listCollections();

        return collections.reduce((exists, c) => exists || c.name === name, false);
    };

    const _sleep = (ms: number): Promise<void> => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    return {
        db,
        async execute<T extends IExecuteWithCount | any[] = any[]>(
            query: string | AqlQuery,
            withTotalCount: boolean = false,
            attempts: number = 0
        ): Promise<T> {
            try {
                // Convert query to AqlQuery if we have a simple query to match query() types
                const queryToRun = isAqlQuery(query)
                    ? {...query}
                    : {
                          query,
                          bindVars: {}
                      };

                const queryOptions = withTotalCount ? {count: true, options: {fullCount: true}} : {};

                const cursor = await db.query(queryToRun, queryOptions);

                const results = await cursor.all();
                return withTotalCount ? {totalCount: cursor.extra.stats.fullCount, results} : results;
            } catch (e) {
                // Handle write-write conflicts: we try the query again with a growing delay between trials.
                // If we reach maximum attempts and still no success, stop it and throw the exception
                // error 1200 === conflict
                if (e.isArangoError && e.errorNum === 1200 && attempts < MAX_ATTEMPTS) {
                    const timeToWait = 2 ** attempts;
                    await _sleep(timeToWait);
                    return this.execute(query, withTotalCount, attempts + 1);
                }

                e.message += `\nQuery was: ${JSON.stringify(query).replace(/\\n/g, ' ')}`;
                e.query = query;

                // Response contains circular references which can cause an error when converted to JSON
                // later on. It doesn't contains useful information anyway, so throw it away.
                delete e.response;

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
