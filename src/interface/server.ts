import {graphiqlHapi, graphqlHapi} from 'apollo-server-hapi';
import {IGraphqlApp} from 'app/graphql/graphqlApp';
import * as hapi from 'hapi';

export interface IServer {
    init(): Promise<any>;
}

interface IServerDeps {
    config: any;
    graphqlApp: IGraphqlApp;
}

export default ({config, graphqlApp}: IServerDeps): IServer => {
    return {
        async init(): Promise<void> {
            const server: hapi.Server = new hapi.Server();

            try {
                server.connection({
                    host: config.server.host,
                    port: config.server.port
                });

                // GraphQL
                await server.register({
                    register: graphqlHapi,
                    options: {
                        path: '/graphql',
                        graphqlOptions: {
                            schema: graphqlApp.schema
                        },
                        route: {
                            cors: true
                        }
                    }
                });

                // GraphiQL
                await server.register({
                    register: graphiqlHapi,
                    options: {
                        path: '/graphiql',
                        graphiqlOptions: {
                            endpointURL: '/graphql'
                        }
                    }
                });

                await server.start((err) => {
                    if (err) {
                        throw err;
                    }

                    console.log(`Server running at: ${server.info.uri}`);
                });
            } catch (e) {
                console.error(e);
            }
        }
    };
};
