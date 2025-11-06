// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {asFunction, type AwilixContainer} from 'awilix';
import {type ILogger} from '@leav/logger';
import {type IMigration} from '_types/migration';
import {type IQueryInfos} from '_types/queryInfos';
import {type IDbService} from '../dbService';
import {MIGRATIONS_COLLECTION_NAME} from '../dbUtils';
import loadMigrationFile from './loadMigrationFile';

interface IExecuteMigrationParams {
    files: string[];
    executedMigrations: string[];
    migrationsDir: string;
    prefix?: string;
    deps?: {
        depsManager: AwilixContainer;
        dbService: IDbService;
        logger: ILogger;
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
            } catch (err) {
                err.message = `[DB Migration Error] ${fileKey}: } ${err.message}`;
                throw err;
            }
        }
    }
};
