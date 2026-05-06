// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {logger} from '@leav/logger';
import {type ICoreImportApp} from '../app/core/importApp';
import {Command} from 'commander';
import {type IDbUtils} from '../infra/db/dbUtils';
import {type AwilixContainer} from 'awilix';

interface IDeps {
    'core.app.core.import': ICoreImportApp;
    'core.infra.db.dbUtils': IDbUtils;
    'core.depsManager': AwilixContainer;
}

export default function ({
    'core.app.core.import': importApp,
    'core.infra.db.dbUtils': dbUtils,
    'core.depsManager': depsManager,
}: IDeps) {
    const program = new Command();

    const defineImportConfigCommand = () => {
        program
            .command('importConfig <file>')
            .description('Import config from a JSON file')
            .option('--clear', 'Empty database before import')
            .action(async (filepath, options) => {
                try {
                    await importApp.importConfig(filepath, options.clear);
                    process.exit(0);
                } catch (e) {
                    logger.error(`Error during config import ${e.stack}`);
                    process.exit(1);
                }
            });
    };

    const defineImportDataCommand = () => {
        program
            .command('importData <file>')
            .description('Import Data from a JSON file')
            .action(async filepath => {
                try {
                    await importApp.importData(filepath);
                    process.exit(0);
                } catch (e) {
                    logger.error(`Error during data import ${e.stack}`);
                    process.exit(1);
                }
            });
    };

    const defineDbMigrateCommand = () => {
        program
            .command('dbMigrate')
            .description('Run database migrations')
            .action(async () => {
                try {
                    await dbUtils.migrate(depsManager);
                    process.exit(0);
                } catch (e) {
                    logger.error(`Error during database migration ${e.stack}`);
                    process.exit(1);
                }
            });
    };

    return {
        run() {
            defineImportDataCommand();
            defineImportConfigCommand();
            defineDbMigrateCommand();

            program.parse(process.argv);

            if (!process.argv.slice(2).length) {
                program.outputHelp();
                process.exit(0);
            }
        },
    };
}
