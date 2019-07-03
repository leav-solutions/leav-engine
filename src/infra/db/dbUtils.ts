import {asFunction, AwilixContainer} from 'awilix';
import * as fs from 'fs';
import * as path from 'path';
import * as winston from 'winston';
import {IAttribute, IAttributeFilterOptions} from '_types/attribute';
import {ILibrary, ILibraryFilterOptions} from '_types/library';
import {ITree, ITreeFilterOptions} from '_types/tree';
import {IDbValueVersion, IValueVersion} from '_types/value';
import {IDbService} from './dbService';

const COLLECTION_NAME = 'core_db_migrations';

export interface IDbUtils {
    migrate?(depsManager: AwilixContainer): Promise<void>;
    cleanup?(record: {}): any;
    convertToDoc?(obj: {}): any;
    isCollectionExists?(name: string): Promise<boolean>;
    findCoreEntity?<T extends ITree | ILibrary | IAttribute>(
        collectionName: string,
        filters?: ITreeFilterOptions | ILibraryFilterOptions | IAttributeFilterOptions,
        strictFilters?: boolean
    ): Promise<T[]>;
    convertValueVersionToDb?(version: IValueVersion): IDbValueVersion;
    convertValueVersionFromDb?(version: IDbValueVersion): IValueVersion;
}

export interface IMigration {
    run(): Promise<void>;
}
export default function(dbService: IDbService = null, logger: winston.Winston = null, config: any = null): IDbUtils {
    /**
     * Create the collections used to managed db migrations
     * This can't be in a migration file because we do have to initialize it somewhere
     *
     */
    async function _initMigrationsCollection(): Promise<void> {
        const collections = await dbService.db.listCollections();

        const colExists = collections.reduce((exists, c) => exists || c.name === COLLECTION_NAME, false);
        if (!colExists) {
            const collection = dbService.db.collection(COLLECTION_NAME);
            await collection.create();
        }
    }

    /**
     * Return the filter's conditions based on key and val supplied.
     *
     * @param filterKey
     * @param filterVal
     * @param bindVars
     * @param index
     * @param strictFilters
     */
    function _getFilterCondition(
        filterKey: string,
        filterVal: string | boolean | string[],
        bindVars: any,
        index: number | string,
        strictFilters: boolean
    ): any {
        const newBindVars = {...bindVars};
        let query;
        // If value is an array (types or formats for example),
        // we call this function recursively on array and join filters with an OR
        if (Array.isArray(filterVal)) {
            if (filterVal.length) {
                const filters = filterVal.map((val, i) =>
                    // We add a prefix to the index to avoid crashing with other filters
                    _getFilterCondition(filterKey, val, newBindVars, index + '0' + i, strictFilters)
                );
                query = filters.map(f => f.query).join(' OR ');
                Object.assign(newBindVars, ...filters.map(f => f.bindVars));
            }
        } else {
            if (filterKey === 'label') {
                // Search for label in any language
                query = `${config.lang.available
                    .map(l => `LIKE(el.label.${l}, @filterValue${index}, true)`)
                    .join(' OR ')}`;

                bindVars[`filterValue${index}`] = `${filterVal}`;
            } else {
                const isBooleanCol = filterKey === 'system' || filterKey === 'multipleValues';

                // Filter with a "like" on ID or exact value in other fields
                query =
                    filterKey === '_key' && !strictFilters
                        ? `LIKE(el.@filterKey${index}, @filterValue${index}, true)`
                        : `el.@filterKey${index} == @filterValue${index}`;

                newBindVars[`filterKey${index}`] = filterKey;
                newBindVars[`filterValue${index}`] = isBooleanCol
                    ? filterVal // Boolean must not be converted to string
                    : `${filterVal}`;
            }
        }

        return {query, bindVars: newBindVars};
    }

    const ret = {
        /**
         * Run database migrations.
         * It takes all files present in migrations folder and run it if it's never been executed before
         *
         * @param depsManager
         */
        async migrate(depsManager: AwilixContainer): Promise<void> {
            await _initMigrationsCollection();

            // Load already ran migrations
            const executedMigrations = await dbService.execute(`
                FOR m IN core_db_migrations
                RETURN m.file
            `);

            // Load migrations files
            const migrationsDir = path.resolve(__dirname, 'migrations');
            const migrationFiles = fs.readdirSync(migrationsDir).filter(file => file.indexOf('.map') === -1);

            for (const file of migrationFiles) {
                // Check if it's been run before
                if (typeof executedMigrations.find(el => el === file) === 'undefined') {
                    const importedFile = await import(path.resolve(migrationsDir, file));

                    if (typeof importedFile.default !== 'function') {
                        throw new Error(
                            `[DB Migration Error] ${file}: Migration files' default export must be a function`
                        );
                    }

                    try {
                        logger.info(`[DB Migration] Executing ${file}...`);

                        // Run migration
                        const migration: IMigration = depsManager.build(asFunction(importedFile.default));
                        await migration.run();

                        // Store migration execution to DB
                        const collection = dbService.db.collection(COLLECTION_NAME);
                        await collection.save({
                            file,
                            date: Date.now()
                        });
                    } catch (e) {
                        throw new Error(`[DB Migration Error] ${file}: ${e}`);
                    }
                }
            }
        },

        /**
         * Cleanup every system keys from an object coming from database.
         * _key is kept under 'id'
         *
         * @param obj
         * @return any   Cleaned up object
         */
        cleanup(obj: any): any {
            if (obj === null) {
                return null;
            }

            return Object.keys(obj).reduce((newObj: any, key) => {
                if (key === '_key') {
                    newObj.id = obj[key];
                } else if (key[0] !== '_') {
                    newObj[key] = obj[key];
                }

                return newObj;
            }, {});
        },

        /**
         * Convert an object to an object looking like a DB document
         * id is replaced by _key
         *
         * @param obj
         * @return any   DB document compatible object
         */
        convertToDoc(obj: {}): any {
            const newObj: any = {...obj};

            if (typeof newObj.id !== 'undefined') {
                newObj._key = newObj.id;
            }
            delete newObj.id;

            return newObj;
        },

        async findCoreEntity<T extends ITree | ILibrary | IAttribute>(
            collectionName: string,
            filters?: ITreeFilterOptions | ILibraryFilterOptions | IAttributeFilterOptions,
            strictFilters?: boolean
        ): Promise<T[]> {
            let query = `FOR el IN ${collectionName}`;
            let bindVars = {};

            if (typeof filters !== 'undefined') {
                const dbFilters = ret.convertToDoc(filters);
                const filtersKeys = Object.keys(dbFilters);

                for (let i = 0; i < filtersKeys.length; i++) {
                    const queryFilter = _getFilterCondition(
                        filtersKeys[i],
                        dbFilters[filtersKeys[i]],
                        bindVars,
                        i,
                        strictFilters
                    );

                    query += queryFilter.query ? ' FILTER ' + queryFilter.query : '';
                    bindVars = {...bindVars, ...queryFilter.bindVars};
                }
            }

            query += ` RETURN el`;

            const res = await dbService.execute({query, bindVars});

            return res.map(ret.cleanup);
        },
        convertValueVersionToDb(version: IValueVersion): IDbValueVersion {
            return Object.keys(version).reduce((allVers, treeName) => {
                const {library, id} = version[treeName];

                allVers[treeName] = `${library}/${id}`;

                return allVers;
            }, {});
        },
        convertValueVersionFromDb(version: IDbValueVersion): IValueVersion {
            return Object.keys(version).reduce((allVers, treeName) => {
                const [library, id] = version[treeName].split('/');

                allVers[treeName] = {
                    library,
                    id: Number(id)
                };

                return allVers;
            }, {});
        }
    };

    return ret;
}
