import {asFunction} from 'awilix';
import {type ILogger} from '@leav/logger';
import {type IDepsManager} from '../../../depsManager';
import {type IMigration} from '../../../_types/migration';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IDbService} from '../dbService';
import {MIGRATIONS_COLLECTION_NAME} from '../dbUtils';
import loadMigrationFile from './loadMigrationFile';
import {ECacheType, type ICachesService} from '../../../infra/cache/cacheService';

interface IExecuteMigrationParams {
    files: string[];
    executedMigrations: string[];
    migrationsDir: string;
    prefix?: string;
    deps?: {
        depsManager: IDepsManager;
        dbService: IDbService;
        logger: ILogger;
        cacheService: ICachesService;
    };
    ctx: IQueryInfos;
}

export default async (params: IExecuteMigrationParams): Promise<void> => {
    const FILE_EXTENSION_REGEX = /\.[^/.]+$/;
    const {files, executedMigrations, migrationsDir, prefix = null, deps, ctx} = params;

    for (const file of files) {
        const fileKey = prefix ? [prefix, file].join('/') : file;

        const fileKeyWithoutExtension = fileKey.replace(FILE_EXTENSION_REGEX, '');

        // Check if it's been run before
        if (
            !executedMigrations.find(
                executedFileKey => executedFileKey.replace(FILE_EXTENSION_REGEX, '') === fileKeyWithoutExtension,
            )
        ) {
            const importedFile = await loadMigrationFile(migrationsDir + '/' + file);

            if (typeof importedFile.default !== 'function') {
                throw new Error(`[DB Migration Error] ${fileKey}: Migration files' default export must be a function`);
            }

            try {
                deps.logger.info(`[DB Migration] Executing ${fileKey}...`);

                // Run migration
                const migration: IMigration = deps.depsManager.build(asFunction(importedFile.default));
                await migration.run(ctx);

                // Store migration execution to DB
                const collection = deps.dbService.db.collection(MIGRATIONS_COLLECTION_NAME);
                await collection.save({
                    file: fileKeyWithoutExtension,
                    date: Date.now(),
                });

                // Clear cache after each migrations to ensure consistency
                // If db was modified by migrations, cached data may be stale
                await Promise.all(
                    Object.values(ECacheType).map(cacheType =>
                        params.deps.cacheService.getCache(cacheType).deleteAll(),
                    ),
                );
            } catch (err) {
                err.message = `[DB Migration Error] ${fileKey}: } ${err.message}`;
                throw err;
            }
        }
    }
};
