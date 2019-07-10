import {IImporterApp} from 'app/importer/importerApp';
import * as program from 'commander';

export default function(importerApp: IImporterApp = null) {
    return {
        run(args) {
            program
                .command('import <file>')
                .description('Import data from a JSON file')
                .option('--clear', 'Empty database before import')
                .action(async (file, options) => {
                    try {
                        await importerApp.import(file, options.clear);
                    } catch (e) {
                        console.error(e);
                    }
                });

            program.parse(process.argv);

            if (!process.argv.slice(2).length) {
                program.outputHelp();
            }
        }
    };
}
