// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {type GeneratedAqlQuery, join} from 'arangojs/aql';
import {CollectionType} from 'arangojs/collection';
import {type AwilixContainer} from 'awilix';
import * as fs from 'fs';
import * as path from 'path';
import {type ILogger} from '@leav/logger';
import {type IAttribute} from '_types/attribute';
import {type IConfig} from '_types/config';
import {type ILibrary} from '_types/library';
import {type IList, type IPaginationParams, type ISortParams} from '_types/list';
import {type IQueryInfos} from '_types/queryInfos';
import {type IKeyValue} from '_types/shared';
import {type ITree} from '_types/tree';
import {type IDbValueVersion, type IValueVersion} from '_types/value';
import {type ICachesService} from '../cache/cacheService';
import {type IDbService} from './dbService';
import runMigrationFiles from './helpers/runMigrationFiles';
import {type IDbDocument, type IExecuteWithCount} from './_types';
import {CORE_INDEX_FIELD} from '../indexation/indexationService';
import {CORE_IN_CREATION_BY} from '../../_types/record';
import {type GetSystemQueryContext} from '../../utils/helpers/getSystemQueryContext';

export const MIGRATIONS_COLLECTION_NAME = 'core_db_migrations';

export type CustomFilterConditionsFunc = (
    filterKey: string,
    filterVal: string | boolean | string[],
    strictFilters: boolean,
) => GeneratedAqlQuery;

export interface IFindCoreEntityParams<T extends ICoreEntity, DbDocument extends IDbDocument = IDbDocument> {
    collectionName: string;
    filters?: ICoreEntityFilterOptions;
    strictFilters?: boolean;
    withCount?: boolean;
    pagination?: IPaginationParams;
    sort?: ISortParams;
    customFilterConditions?: IKeyValue<CustomFilterConditionsFunc>;
    nonStrictFields?: string[];
    mapFromDbDocument?: (doc: DbDocument) => T;
    ctx: IQueryInfos;
}

export interface IDbUtils {
    migrate?(depsManager: AwilixContainer): Promise<void>;
    cleanup?<T extends {}>(record: {}): T;
    convertToDoc?(obj: {}): any;
    isCollectionExists?(name: string): Promise<boolean>;
    findCoreEntity?<T extends ICoreEntity, DbDocument extends IDbDocument = IDbDocument>(
        params: IFindCoreEntityParams<T, DbDocument>,
    ): Promise<IList<T>>;
    clearDatabase?(): Promise<void>;
}

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.cache.cacheService'?: ICachesService;
    'core.utils.logger'?: ILogger;
    config?: IConfig;
    'core.utils.getSystemQueryContext'?: GetSystemQueryContext;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.cache.cacheService': cacheService = null,
    'core.utils.logger': logger = null,
    config = null,
    'core.utils.getSystemQueryContext': getSystemQueryContext,
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
        nonStrictFields?: string[],
    ): GeneratedAqlQuery {
        const queryParts = [];

        // If value is an array (types or formats for example),
        // we call this function recursively on array and join filters with an OR
        if (Array.isArray(filterVal)) {
            if (filterVal.length) {
                const valParts = filterVal.map(val =>
                    _getFilterCondition(filterKey, val, strictFilters, nonStrictFields),
                );
                queryParts.push(join(valParts, ' OR '));
            }
        } else {
            if (filterKey === 'label') {
                // Search for label in any language
                const valParts = config.lang.available.map(l => aql`LIKE(el.label.${l}, ${filterVal}, true)`);
                valParts.push(aql`LIKE(el.label, ${filterVal}, true)`); // In case label is not translated
                queryParts.push(join(valParts, ' OR '));
            } else {
                // Filter with a "like" on ID or exact value in other fields
                queryParts.push(
                    (nonStrictFields ?? []).includes(filterKey) && !strictFilters
                        ? aql`LIKE(el.${filterKey}, ${filterVal}, true)`
                        : aql`el.${filterKey} == ${filterVal}`,
                );
            }
        }

        return join(queryParts);
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
                queryId: 'run-migrations',
            };
            // Load already ran migrations
            const executedMigrations = await dbService.execute<string[]>({
                query: `
                    FOR m IN core_db_migrations
                    RETURN m.file
                `,
                ctx,
            });

            const _runMigrationFiles = (files, folder, prefix = null) =>
                runMigrationFiles({
                    files,
                    executedMigrations,
                    migrationsDir: folder,
                    prefix,
                    deps: {depsManager, dbService, logger, cacheService},
                    ctx,
                });

            /*** Core migrations ***/
            // Load migrations files
            const migrationsDir = path.resolve(__dirname, 'migrations');
            const migrationFiles = (await fs.promises.readdir(migrationsDir)).filter(
                file => file.indexOf('.map') === -1,
            );

            await _runMigrationFiles(migrationFiles, migrationsDir);

            /*** Plugins migrations ***/
            for (const pluginPath of config.pluginsPath) {
                const pluginMigrationFolderPath = path.resolve(`${__dirname}/../../${pluginPath}/infra/db/migrations`);
                const pluginName = path.basename(pluginPath);

                try {
                    await fs.promises.access(pluginMigrationFolderPath, fs.constants.R_OK);
                } catch (e) {
                    continue;
                }

                const pluginMigrationFiles = (await fs.promises.readdir(pluginMigrationFolderPath)).filter(
                    file => file.indexOf('.map') === -1,
                );

                await _runMigrationFiles(pluginMigrationFiles, pluginMigrationFolderPath, pluginName);
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
                } else if ((key[0] !== '_' && key !== CORE_INDEX_FIELD) || key === CORE_IN_CREATION_BY) {
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
        async findCoreEntity<T extends ICoreEntity, DbDocument extends IDbDocument = IDbDocument>(
            params: IFindCoreEntityParams<T, DbDocument>,
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
                mapFromDbDocument = ret.cleanup,
                ctx = getSystemQueryContext('dbUtils:findCoreEntity'),
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

            const query = join(queryParts);
            const res = await dbService.execute<IExecuteWithCount | any[]>({query, withTotalCount: withCount, ctx});

            const results = !Array.isArray(res) ? res.results : res;

            return {
                totalCount: withCount ? (res as IExecuteWithCount).totalCount : null,
                list: results.map(mapFromDbDocument),
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
                    col.type === CollectionType.DOCUMENT_COLLECTION
                        ? CollectionType.DOCUMENT_COLLECTION
                        : CollectionType.EDGE_COLLECTION;

                await dbService.dropCollection(col.name, colType);
                // TODO: clear linked arango views
            }
        },
    };

    return ret;
}
