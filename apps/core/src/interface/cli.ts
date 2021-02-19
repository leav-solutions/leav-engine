// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IImporterApp} from 'app/importer/importerApp';
import program from 'commander';

interface IDeps {
    'core.app.importer'?: IImporterApp;
}

export default function ({'core.app.importer': importerApp = null}: IDeps = {}) {
    return {
        run(args) {
            program
                .command('import <file>')
                .description('Import data from a JSON file')
                .option('--clear', 'Empty database before import')
                .action(async (file, options) => {
                    try {
                        await importerApp.import(file, options.clear);
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
