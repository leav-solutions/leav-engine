import {IAppGraphQLSchema, IGraphqlApp} from '../graphql/graphqlApp';
import {ILibraryDomain} from 'domain/libraryDomain';
import {IUtils} from 'utils/utils';
import {ILibrary} from '_types/library';
import {IRecord} from '_types/record';
import {ICoreAttributeApp} from './coreAttributeApp';
import {IRecordDomain} from 'domain/recordDomain';

export interface ICoreLibraryApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(
    libraryDomain: ILibraryDomain,
    recordDomain: IRecordDomain,
    coreAttributeApp: ICoreAttributeApp,
    graphqlApp: IGraphqlApp,
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
                        id: String!
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
                            return libraryDomain.getLibraries(args);
                        }
                    },
                    Mutation: {
                        async saveLibrary(parent, {library}): Promise<ILibrary> {
                            if (typeof library.attributes !== 'undefined') {
                                library.attributes = library.attributes.map(attrName => ({
                                    id: attrName
                                }));
                            }

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

                    enum ${libTypeName}SearchableFields {
                        ${lib.attributes.map(attr => attr.id).join(' ')}
                    }

                    input ${libTypeName}Filter {
                        field: ${libTypeName}SearchableFields!,
                        value: String!
                    }

                    extend type Query {
                        ${libQueryName}(filters: [${libTypeName}Filter]): [${libTypeName}]
                    }
                `;

                baseSchema.resolvers.Query[libQueryName] = async (
                    parent,
                    {filters},
                    context,
                    info
                ): Promise<IRecord[]> => {
                    const queryFields = graphqlApp.getQueryFields(info);

                    if (typeof filters !== 'undefined') {
                        filters = filters.reduce((allFilters, filter) => {
                            allFilters[filter.field] = filter.value;

                            return allFilters;
                        }, {});
                    } else {
                        filters = {};
                    }

                    return recordDomain.find(lib.id, filters, queryFields);
                };
            }

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
