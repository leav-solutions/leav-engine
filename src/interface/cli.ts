import {IBenchmarkApp} from 'app/benchmark/benchmarkApp';
import {IImporterApp} from 'app/importer/importerApp';
import program from 'commander';

interface IDeps {
    'core.app.importer'?: IImporterApp;
    'core.app.benchmark'?: IBenchmarkApp;
}

export default function({
    'core.app.importer': importerApp = null,
    'core.app.benchmark': benchmarkApp = null
}: IDeps = {}) {
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

            program
                .command('benchmark <file>')
                .description('Run benchmarks')
                .action(async (file, options) => {
                    try {
                        await benchmarkApp.run(file);
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
