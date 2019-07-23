import {ApolloServerBase} from 'apollo-server-core';
import {createTestClient} from 'apollo-server-testing';
import {IGraphqlApp} from 'app/graphql/graphqlApp';
import {IImporterApp} from 'app/importer/importerApp';
import {AwilixContainer} from 'awilix';
import {promises as fs} from 'fs';
import {IDbUtils} from 'infra/db/dbUtils';

export interface IBenchmarkApp {
    run(filepath: string): Promise<any>;
}

enum executionTypes {
    PARALLEL = 'parralel',
    SEQUENCE = 'sequence'
}

interface IBenchmarkActions {
    [key: string]: IBenchmarkAction;
}

interface IBenchmarkAction {
    reps: number;
    query: string;
    executionType: executionTypes;
}

interface IBenchmarkStats {
    [key: string]: IBenchmarkActionStat;
}

interface IBenchmarkActionStat {
    reps: number;
    average: number;
    max: number;
    min: number;
}

export default function(
    importerApp: IImporterApp = null,
    dbUtils: IDbUtils,
    depsManager: AwilixContainer,
    graphqlApp: IGraphqlApp,
    config: any
) {
    let server: ApolloServerBase;
    let runQuery;
    let runMutation;

    const _initDb = async (dataFile: string = null): Promise<void> => {
        await dbUtils.clearDatabase();
        return dataFile ? importerApp.import(dataFile, false) : dbUtils.migrate(depsManager);
    };

    const _runActions = async (actions: IBenchmarkActions): Promise<IBenchmarkStats> => {
        const stats = {};
        for (const actionKey of Object.keys(actions)) {
            console.info(`Running query "${actionKey}"...`);
            const actionData = actions[actionKey];

            const execTimes = [];
            for (let i = 0; i < actionData.reps; i++) {
                execTimes.push(await _execQuery(actionData.query));
            }

            const totalTime = execTimes.reduce((total: number, time: number): number => total + time, 0);
            const stat: IBenchmarkActionStat = {
                reps: actionData.reps,
                average: _roundDuration(totalTime / execTimes.length),
                max: _roundDuration(Math.max(...execTimes)),
                min: _roundDuration(Math.min(...execTimes))
            };

            stats[actionKey] = stat;
        }

        return stats;
    };

    const _execQuery = async (queryString: string): Promise<number> => {
        const isMutation = queryString.match(/^mutation/);

        const res = await (isMutation ? runMutation({mutation: queryString}) : runQuery({query: queryString}));

        return res.extensions.tracing.duration / 1000000; // Convert duration to ms
    };

    const _roundDuration = (duration: number): number => Number(duration.toFixed(2));

    return {
        async run(filepath): Promise<IBenchmarkStats> {
            if (config.env === 'production') {
                throw new Error("Don't run benchmarks in production!");
            }

            // Read file
            const fileContent = await fs.readFile(filepath, {encoding: 'utf8'});
            const data = JSON.parse(fileContent);

            // Init database
            console.info('Preparing database...');
            await _initDb(data.dataFile);
            await graphqlApp.generateSchema();

            // Init graphql server
            server = new ApolloServerBase({
                schema: graphqlApp.schema,
                context: () => ({user: {id: 1, email: 'admin@example.com'}}),
                tracing: true,
                cacheControl: false
            });
            const testClient = createTestClient(server);
            runQuery = testClient.query;
            runMutation = testClient.mutate;

            // Run
            const stats = await _runActions(data.actions);

            console.info('Results (in ms):');
            console.info(stats);

            return stats;
        }
    };
}
