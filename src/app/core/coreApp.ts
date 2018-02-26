import {merge} from 'lodash';
import {ILibraryDomain, ILibrary} from 'domain/libraryDomain';
import {IAppGraphQLSchema} from '../graphql/graphqlApp';
import {IAttributeDomain, IAttribute} from 'domain/attributeDomain';
import {IRecord, IRecordDomain} from 'domain/recordDomain';
import {IUtils} from 'utils/utils';

export interface ICoreApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(
    libraryDomain: ILibraryDomain,
    attributeDomain: IAttributeDomain,
    recordDomain: IRecordDomain,
    utils: IUtils,
    config: any
): ICoreApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    type SystemTranslation {
                        ${config.lang.available.map(l => `${l}: String`)}
                    }

                    input SystemTranslationInput {
                        ${config.lang.available.map(l => `${l}: String${l === config.lang.default ? '!' : ''}`)}
                    }

                    # Application Library
                    type Library {
                        id: ID,
                        system: Boolean,
                        label: SystemTranslation,
                        attributes: [Attribute]
                    }

                    # Application Attribute
                    type Attribute {
                        id: ID,
                        type: String,
                        format: String,
                        system: Boolean,
                        label: SystemTranslation
                    }

                    interface Record {
                        id: ID,
                        created_at: Int,
                        modified_at: Int
                    }

                    input LibraryInput {
                        id: ID!
                        label: SystemTranslationInput,
                        attributes: [ID]
                    }

                    input AttributeInput {
                        id: ID!
                        type: String!
                        format: String
                        label: SystemTranslationInput
                    }

                    type Query {
                        libraries(id: ID): [Library]
                        attributes(id: ID): [Attribute]
                    }

                    type Mutation {
                        saveLibrary(library: LibraryInput): Library
                        deleteLibrary(id: ID): Library
                        saveAttribute(attribute: AttributeInput): Attribute
                        deleteAttribute(id: ID): Attribute
                        createRecord(library: String): Record
                    }

                `,
                resolvers: {
                    Query: {
                        async libraries(parent, args) {
                            return libraryDomain.getLibraries();
                        },
                        async attributes(parent, args) {
                            return attributeDomain.getAttributes();
                        }
                    },
                    Mutation: {
                        async saveLibrary(parent, {library}): Promise<ILibrary> {
                            return libraryDomain.saveLibrary(library);
                        },
                        async deleteLibrary(parent, {id}): Promise<ILibrary> {
                            return libraryDomain.deleteLibrary(id);
                        },
                        async saveAttribute(parent, {attribute}): Promise<IAttribute> {
                            return attributeDomain.saveAttribute(attribute);
                        },
                        async deleteAttribute(parent, {id}): Promise<IAttribute> {
                            return attributeDomain.deleteAttribute(id);
                        },
                        async createRecord(parent, {library}): Promise<IRecord> {
                            return recordDomain.createRecord(library);
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
