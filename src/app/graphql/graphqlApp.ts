import {AwilixContainer} from 'awilix';
import {GraphQLSchema} from 'graphql';
import {makeExecutableSchema} from 'graphql-tools';
import {merge} from 'lodash';

export interface IGraphqlApp {
    schema: GraphQLSchema;
    generateSchema(): Promise<void>;
}

export interface IAppGraphQLSchema {
    typeDefs: string;
    resolvers: any;
}

export default function(depsManager: AwilixContainer): IGraphqlApp {
    let _fullSchema: GraphQLSchema;

    return {
        get schema(): GraphQLSchema {
            return _fullSchema;
        },
        async generateSchema(): Promise<void> {
            try {
                const appSchema = {typeDefs: [], resolvers: {}};
                const modules = Object.keys(depsManager.registrations).filter(modName => modName.indexOf('App') !== -1);

                for (const modName of modules) {
                    const appModule = depsManager.cradle[modName];

                    if (typeof appModule.getGraphQLSchema === 'function') {
                        const schemaToAdd = await appModule.getGraphQLSchema();

                        appSchema.typeDefs.push(schemaToAdd.typeDefs);
                        appSchema.resolvers = merge(appSchema.resolvers, schemaToAdd.resolvers);
                    }
                }

                // Put together a schema
                const schema = makeExecutableSchema(appSchema);

                _fullSchema = schema;
            } catch (e) {
                throw new Error('Error generating schema: ' + e);
            }
        }
    };
}
