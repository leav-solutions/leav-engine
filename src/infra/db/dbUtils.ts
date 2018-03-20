import * as fs from 'fs';
import * as path from 'path';
import {IDbService} from 'infra/db/dbService';
import * as winston from 'winston';
import {AwilixContainer, asFunction} from 'awilix';

const COLLECTION_NAME = 'core_db_migrations';

export interface IDbUtils {
    migrate?(depsManager: AwilixContainer): Promise<void>;
    cleanup?(record: {}): any;
    convertToDoc?(obj: {}): any;
    isCollectionExists?(name: string): Promise<boolean>;
}

export interface IMigration {
    run(): Promise<void>;
}
export default function(dbService: IDbService, logger: winston.Winston): IDbUtils {
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

    return {
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
            const migrationFiles = fs.readdirSync(migrationsDir);

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
        }
    };
}
