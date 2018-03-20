import {IAppGraphQLSchema} from '../graphql/graphqlApp';
import {ILibraryDomain} from 'domain/libraryDomain';
import {IUtils} from 'utils/utils';
import {ILibrary} from '_types/library';
import {IRecord} from '_types/record';

export interface ICoreLibraryApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(libraryDomain: ILibraryDomain, utils: IUtils): ICoreLibraryApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    # Application Library
                    type Library {
                        id: ID,
                        system: Boolean,
                        label: SystemTranslation,
                        attributes: [Attribute]
                    }

                    input LibraryInput {
                        id: ID!
                        label: SystemTranslationInput,
                        attributes: [ID]
                    }

                    type Query {
                        libraries(id: ID): [Library]
                    }

                    type Mutation {
                        saveLibrary(library: LibraryInput): Library
                        deleteLibrary(id: ID): Library
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
                        },
                        async deleteLibrary(parent, {id}): Promise<ILibrary> {
                            return libraryDomain.deleteLibrary(id);
                        }
                    }
                }
            };

            const libraries = await libraryDomain.getLibraries();
            for (const lib of libraries) {
                const libQueryName = utils.libNameToQueryName(lib.id);
                const libTypeName = utils.libNameToTypeName(lib.id);

                baseSchema.typeDefs += `
                    extend type Query {
                        ${libQueryName}: [Record]
                    }
                `;

                baseSchema.resolvers.Query[libQueryName] = async (): Promise<IRecord[]> => {
                    return null;
                };
            }

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
