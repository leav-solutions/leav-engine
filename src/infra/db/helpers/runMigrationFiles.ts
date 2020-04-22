import {asFunction, AwilixContainer} from 'awilix';
import {Winston} from 'winston';
import {IMigration} from '_types/migration';
import {IDbService} from '../dbService';
import {MIGRATIONS_COLLECTION_NAME} from '../dbUtils';
import loadMigrationFile from './loadMigrationFile';
import {IQueryInfos} from '_types/queryInfos';

interface IExecuteMigrationParams {
    files: string[];
    executedMigrations: string[];
    migrationsDir: string;
    prefix?: string;
    deps?: {
        depsManager: AwilixContainer;
        dbService: IDbService;
        logger: Winston;
    };
    ctx: IQueryInfos;
}

export default async (params: IExecuteMigrationParams): Promise<void> => {
    const {files, executedMigrations, migrationsDir, prefix = null, deps, ctx} = params;

    for (const file of files) {
        // Check if it's been run before
        const fileKey = prefix ? [prefix, file].join('/') : file;
        if (typeof (executedMigrations as []).find(el => el === fileKey) === 'undefined') {
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
                    file: fileKey,
                    date: Date.now()
                });
            } catch (e) {
                throw new Error(`[DB Migration Error] ${fileKey}: ${e}`);
            }
        }
    }
};
