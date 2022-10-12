// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {GeneratedAqlQuery} from 'arangojs/lib/cjs/aql-query';
import {CollectionType} from 'arangojs/lib/cjs/collection';
import {AwilixContainer} from 'awilix';
import {accessSync, constants, readdirSync} from 'fs';
import {IPluginsRepo} from 'infra/plugins/pluginsRepo';
import * as path from 'path';
import * as winston from 'winston';
import {IAttribute} from '_types/attribute';
import {IConfig} from '_types/config';
import {ILibrary} from '_types/library';
import {IList, IPaginationParams, ISortParams} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IKeyValue} from '_types/shared';
import {ITree} from '_types/tree';
import {IDbValueVersion, IValueVersion} from '_types/value';
import {ECacheType, ICachesService} from '../../infra/cache/cacheService';
import {collectionTypes, IDbService} from './dbService';
import runMigrationFiles from './helpers/runMigrationFiles';
import {IExecuteWithCount} from './_types';

export const MIGRATIONS_COLLECTION_NAME = 'core_db_migrations';

export type CustomFilterConditionsFunc = (
    filterKey: string,
    filterVal: string | boolean | string[],
    strictFilters: boolean
) => GeneratedAqlQuery;

export interface IFindCoreEntityParams {
    collectionName: string;
    filters?: ICoreEntityFilterOptions;
    strictFilters?: boolean;
    withCount?: boolean;
    pagination?: IPaginationParams;
    sort?: ISortParams;
    customFilterConditions?: IKeyValue<CustomFilterConditionsFunc>;
    nonStrictFields?: string[];
    ctx: IQueryInfos;
}

export interface IDbUtils {
    migrate?(depsManager: AwilixContainer): Promise<void>;
    cleanup?<T extends {}>(record: {}): T;
    convertToDoc?(obj: {}): any;
    isCollectionExists?(name: string): Promise<boolean>;
    findCoreEntity?<T extends ICoreEntity>(params: IFindCoreEntityParams): Promise<IList<T>>;
    clearDatabase?(): Promise<void>;
}

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.cache.cacheService'?: ICachesService;
    'core.utils.logger'?: winston.Winston;
    'core.infra.plugins'?: IPluginsRepo;
    config?: IConfig;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.cache.cacheService': cacheService = null,
    'core.utils.logger': logger = null,
    'core.infra.plugins': pluginsRepo = null,
    config = null
}: IDeps = {}): IDbUtils {
    /**
     * Create the collections used to managed db migrations
     * This can't be in a migration file because we do have to initialize it somewhere
     *
     */
    async function _initMigrationsCollection(): Promise<void> {
        const collections = await dbService.db.listCollections();

        const colExists = collections.reduce((exists, c) => exists || c.name === MIGRATIONS_COLLECTION_NAME, false);
        if (!colExists) {
            const collection = dbService.db.collection(MIGRATIONS_COLLECTION_NAME);
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
        strictFilters: boolean,
        nonStrictFields?: string[]
    ): GeneratedAqlQuery {
        const queryParts = [];

        // If value is an array (types or formats for example),
        // we call this function recursively on array and join filters with an OR
        if (Array.isArray(filterVal)) {
            if (filterVal.length) {
                const valParts = filterVal.map(val => _getFilterCondition(filterKey, val, strictFilters));
                queryParts.push(aql.join(valParts, ' OR '));
            }
        } else {
            if (filterKey === 'label') {
                // Search for label in any language
                const valParts = config.lang.available.map(l => aql`LIKE(el.label.${l}, ${filterVal}, true)`);
                queryParts.push(aql.join(valParts, ' OR '));
            } else {
                // Filter with a "like" on ID or exact value in other fields
                queryParts.push(
                    (nonStrictFields ?? []).includes(filterKey) && !strictFilters
                        ? aql`LIKE(el.${filterKey}, ${filterVal}, true)`
                        : aql`el.${filterKey} == ${filterVal}`
                );
            }
        }

        return aql.join(queryParts);
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
            const ctx: IQueryInfos = {
                userId: config.defaultUserId,
                queryId: 'run-migrations'
            };
            // Load already ran migrations
            const executedMigrations = await dbService.execute<string[]>({
                query: `
                    FOR m IN core_db_migrations
                    RETURN m.file
                `,
                ctx
            });

            const _runMigrationFiles = (files, folder, prefix = null) =>
                runMigrationFiles({
                    files,
                    executedMigrations,
                    migrationsDir: folder,
                    prefix,
                    deps: {depsManager, dbService, logger},
                    ctx
                });

            /*** Core migrations ***/
            // Load migrations files
            const migrationsDir = path.resolve(__dirname, 'migrations');
            const migrationFiles = readdirSync(migrationsDir).filter(file => file.indexOf('.map') === -1);

            await _runMigrationFiles(migrationFiles, migrationsDir);

            /*** Plugins migrations ***/
            const plugins = pluginsRepo.getRegisteredPlugins();
            for (const plugin of plugins) {
                const pluginMigrationFolder = path.resolve(plugin.path + '/infra/db/migrations');

                try {
                    accessSync(pluginMigrationFolder, constants.R_OK);
                } catch (e) {
                    continue;
                }

                const pluginMigrationFiles = readdirSync(pluginMigrationFolder).filter(
                    file => file.indexOf('.map') === -1
                );

                await _runMigrationFiles(pluginMigrationFiles, pluginMigrationFolder, plugin.infos.name);
            }

            /** Clear cache */
            for (const cacheType of Object.values(ECacheType)) {
                cacheService.getCache(cacheType).deleteAll();
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
            if (obj === null || typeof obj === 'undefined') {
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
        /**
         * Search core entities (libraries, attributes, trees)
         *
         * @param collectionName
         * @param filters
         * @param strictFilters
         */
        async findCoreEntity<T extends ITree | ILibrary | IAttribute>(
            params: IFindCoreEntityParams
        ): Promise<IList<T>> {
            const {
                collectionName = null,
                filters = null,
                strictFilters = false,
                withCount = false,
                pagination = null,
                sort = null,
                customFilterConditions = {},
                nonStrictFields = ['label', '_key'],
                ctx = {}
            } = params;

            const collec = dbService.db.collection(collectionName);
            const queryParts = [aql`FOR el IN ${collec}`];

            if (filters !== null) {
                const dbFilters = ret.convertToDoc(filters);
                const filtersKeys = Object.keys(dbFilters);

                for (const filterKey of filtersKeys) {
                    const filterVal = dbFilters[filterKey];

                    // Caller can define some custom functions to generate filter condition (like looking on edges to
                    // filter on libraries linked to an attribute). So, if a custom function is define for this filter,
                    // we use it, otherwise we use the standard filters
                    const filterCondsFunc =
                        typeof customFilterConditions[filterKey] !== 'undefined'
                            ? customFilterConditions[filterKey]
                            : _getFilterCondition;
                    const conds = filterCondsFunc(filterKey, filterVal, strictFilters, nonStrictFields);

                    if (conds?.query) {
                        queryParts.push(aql`FILTER`, conds);
                    }
                }
            }

            if (!!sort) {
                const field = sort.field === 'id' ? '_key' : sort.field;
                queryParts.push(aql`SORT el.${field} ${sort.order}`);
            }

            if (!!pagination) {
                queryParts.push(aql`LIMIT ${pagination.offset || 0}, ${pagination.limit}`);
            }

            queryParts.push(aql`RETURN el`);

            const query = aql.join(queryParts);
            const res = await dbService.execute<IExecuteWithCount | any[]>({query, withTotalCount: withCount, ctx});

            const results = !Array.isArray(res) ? res.results : res;

            return {
                totalCount: withCount ? (res as IExecuteWithCount).totalCount : null,
                list: results.map(ret.cleanup)
            };
        },
        convertValueVersionToDb(version: IValueVersion): IDbValueVersion {
            return Object.keys(version).reduce((allVers, treeName) => {
                const id = version[treeName];

                allVers[treeName] = id;

                return allVers;
            }, {});
        },
        async clearDatabase(): Promise<void> {
            // Drop all collections
            const cols = await dbService.db.listCollections();
            for (const col of cols) {
                const colType =
                    col.type === CollectionType.DOCUMENT_COLLECTION ? collectionTypes.DOCUMENT : collectionTypes.EDGE;
                await dbService.dropCollection(col.name, colType);
            }
        }
    };

    return ret;
}
