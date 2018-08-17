import {IAppGraphQLSchema, IGraphqlApp} from '../graphql/graphqlApp';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IUtils} from 'utils/utils';
import {ILibrary} from '../../_types/library';
import {IRecord} from '../../_types/record';
import {ICoreAttributeApp} from './coreAttributeApp';
import {IRecordDomain} from 'domain/record/recordDomain';

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
                    # Application Library
                    type Library {
                        id: ID,
                        system: Boolean,
                        label: SystemTranslation,
                        attributes: [Attribute],
                        permissionsConf: TreePermissionsConf
                    }

                    input LibraryInput {
                        id: ID!
                        label: SystemTranslationInput,
                        attributes: [ID],
                        permissionsConf: TreePermissionsConfInput
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
                        async libraries(parent, args, ctx) {
                            return libraryDomain.getLibraries(args);
                        }
                    },
                    Mutation: {
                        async saveLibrary(parent, {library}, ctx): Promise<ILibrary> {
                            if (typeof library.attributes !== 'undefined') {
                                library.attributes = library.attributes.map(attrName => ({
                                    id: attrName
                                }));
                            }

                            const savedLib = await libraryDomain.saveLibrary(library, graphqlApp.ctxToQueryInfos(ctx));
                            graphqlApp.generateSchema();

                            return savedLib;
                        },
                        async deleteLibrary(parent, {id}, ctx): Promise<ILibrary> {
                            const deletedLib = await libraryDomain.deleteLibrary(id, graphqlApp.ctxToQueryInfos(ctx));
                            graphqlApp.generateSchema();

                            return deletedLib;
                        }
                    }
                }
            };

            for (const lib of libraries) {
                const libQueryName = utils.libNameToQueryName(lib.id);
                const libTypeName = utils.libNameToTypeName(lib.id);

                baseSchema.typeDefs += `
                    type ${libTypeName} implements Record {
                        ${lib.attributes.map(
                            attr =>
                                `${attr.id}:
                                ${coreAttributeApp.getGraphQLFormat(attr)}`
                        )}
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
