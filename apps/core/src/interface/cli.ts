// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ICoreImportApp} from 'app/core/importApp';
import program from 'commander';

interface IDeps {
    'core.app.core.import': ICoreImportApp;
}

export default function ({'core.app.core.import': importApp}: IDeps) {
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
                    console.error(e);
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
                    console.error(e);
                    process.exit(1);
                }
            });
    };

    return {
        run() {
            defineImportDataCommand();
            defineImportConfigCommand();

            program.parse(process.argv);

            if (!process.argv.slice(2).length) {
                program.outputHelp();
            }
        }
    };
}
