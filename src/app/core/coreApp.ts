import {merge} from 'lodash';
import {ILibraryDomain, ILibrary} from 'domain/libraryDomain';
import {IAppGraphQLSchema} from '../graphql/graphqlApp';

export interface ICoreApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(libraryDomain: ILibraryDomain): ICoreApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    # Application Library
                    type Library {
                        id: String,
                        system: Boolean
                    }

                    input LibraryInput {
                        id: String!
                    }

                    type Query {
                        libraries(id: String): [Library]
                    }

                    type Mutation {
                        saveLibrary(library: LibraryInput): Library
                    }
                `,
                resolvers: {
                    Query: {
                        async libraries(parent, args) {
                            return libraryDomain.getLibraries();
                        }
                    },
                    Mutation: {
                        async saveLibrary(parent, {library}): Promise<ILibrary> {
                            return libraryDomain.saveLibrary(library);
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
