// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ICoreImportApp} from 'app/core/importApp';
import program from 'commander';

interface IDeps {
    'core.app.core.import'?: ICoreImportApp;
}

export default function ({'core.app.core.import': importApp = null}: IDeps = {}) {
    return {
        run(args) {
            program
                .command('import <file>')
                .description('Import data from a JSON file')
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

            program.parse(process.argv);

            if (!process.argv.slice(2).length) {
                program.outputHelp();
            }
        }
    };
}
