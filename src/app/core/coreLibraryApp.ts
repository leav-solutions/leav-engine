import {IAppGraphQLSchema} from '../graphql/graphqlApp';
import {ILibraryDomain} from 'domain/libraryDomain';
import {IUtils} from 'utils/utils';
import {ILibrary} from '_types/library';
import {IRecord} from '_types/record';
import {ICoreAttributeApp} from './coreAttributeApp';

export interface ICoreLibraryApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(
    libraryDomain: ILibraryDomain,
    coreAttributeApp: ICoreAttributeApp,
    utils: IUtils
): ICoreLibraryApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const libraries = await libraryDomain.getLibraries();

            const baseSchema = {
                typeDefs: `
                    enum LibraryId {
                        ${libraries.map(lib => lib.id).join(' ')}
                    }

                    # Application Library
                    type Library {
                        id: LibraryId,
                        system: Boolean,
                        label: SystemTranslation,
                        attributes: [Attribute]
                    }

                    input LibraryInput {
                        id: LibraryId!
                        label: SystemTranslationInput,
                        attributes: [AttributeId]
                    }

                    type Query {
                        libraries(id: LibraryId): [Library]
                    }

                    type Mutation {
                        saveLibrary(library: LibraryInput): Library
                        deleteLibrary(id: LibraryId): Library
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
                            library.attributes = library.attributes.map(attrName => ({
                                id: attrName
                            }));
                            return libraryDomain.saveLibrary(library);
                        },
                        async deleteLibrary(parent, {id}): Promise<ILibrary> {
                            return libraryDomain.deleteLibrary(id);
                        }
                    }
                }
            };
            for (const lib of libraries) {
                const libQueryName = utils.libNameToQueryName(lib.id);
                const libTypeName = utils.libNameToTypeName(lib.id);

                baseSchema.typeDefs += `
                    type ${libTypeName} implements Record {
                        ${lib.attributes.map(attr => `${attr.id}: ${coreAttributeApp.getGraphQLFormat(attr)}`)}
                    }

                    extend type Query {
                        ${libQueryName}: [${libTypeName}]
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
