import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IUtils} from 'utils/utils';
import {ILibrary} from '../../_types/library';
import {IRecord} from '../../_types/record';
import {IAppGraphQLSchema, IGraphqlApp} from '../graphql/graphqlApp';
import {ICoreApp} from './coreApp';
import {ICoreAttributeApp} from './coreAttributeApp';

export interface ICoreLibraryApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(
    libraryDomain: ILibraryDomain,
    recordDomain: IRecordDomain,
    coreAttributeApp: ICoreAttributeApp,
    graphqlApp: IGraphqlApp,
    utils: IUtils,
    coreApp: ICoreApp
): ICoreLibraryApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const libraries = await libraryDomain.getLibraries();

            const baseSchema = {
                typeDefs: `
                    # Application Library
                    type Library {
                        id: ID!,
                        system: Boolean,
                        label(lang: [AvailableLanguage!]): SystemTranslation,
                        attributes: [Attribute!],
                        permissionsConf: TreePermissionsConf,
                        recordIdentityConf: RecordIdentityConf
                    }

                    input LibraryInput {
                        id: ID!
                        label: SystemTranslationInput,
                        attributes: [ID!],
                        permissionsConf: TreePermissionsConfInput,
                        recordIdentityConf: RecordIdentityConfInput
                    }

                    type Query {
                        libraries(id: ID, label: String, system: Boolean): [Library!]
                    }

                    type Mutation {
                        saveLibrary(library: LibraryInput): Library!
                        deleteLibrary(id: ID): Library!
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
                    },
                    Library: {
                        attributes: async (parent, args, ctx, info) => {
                            return libraryDomain.getLibraryAttributes(parent.id);
                        },
                        /**
                         * Return library label, potentially filtered by requested language
                         */
                        label: async (libData, args) => {
                            return coreApp.filterSysTranslationField(libData.label, args.lang || []);
                        }
                    }
                }
            };

            for (const lib of libraries) {
                const libQueryName = utils.libNameToQueryName(lib.id);
                const libTypeName = utils.libNameToTypeName(lib.id);

                baseSchema.typeDefs += `
                    type ${libTypeName} implements Record {
                        library: Library!,
                        whoAmI: RecordIdentity!,
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
                        ${libQueryName}(filters: [${libTypeName}Filter], version: ValueVersionInput): [${libTypeName}!]
                    }
                `;

                baseSchema.resolvers.Query[libQueryName] = async (
                    parent,
                    {filters, version},
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

                    const formattedVersion = typeof version !== 'undefined' ? {[version.name]: version.value} : {};

                    return recordDomain.find(lib.id, filters, queryFields, {version: formattedVersion});
                };
                baseSchema.resolvers[libTypeName] = {
                    library: async rec => (rec.library ? libraryDomain.getLibraryProperties(rec.library) : null),
                    whoAmI: recordDomain.getRecordIdentity
                };
            }

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
