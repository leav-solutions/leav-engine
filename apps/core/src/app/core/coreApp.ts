// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ISystemTranslationGenerator} from 'app/graphql/customScalars/systemTranslation/systemTranslation';
import {ICoreDomain} from 'domain/core/coreDomain';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {constants, promises as fs} from 'fs';
import {GraphQLScalarType, Kind} from 'graphql';
import GraphQLJSON, {GraphQLJSONObject} from 'graphql-type-json';
import {GraphQLUpload} from 'graphql-upload';
import {i18n} from 'i18next';
import {IAppGraphQLSchema} from '_types/graphql';
import {IQueryInfos} from '_types/queryInfos';
import {IAppModule} from '_types/shared';
import {ISystemTranslation} from '_types/systemTranslation';
import {IGraphqlApp} from '../graphql/graphqlApp';

export interface ICoreApp extends IAppModule {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
    filterSysTranslationField(fieldData: ISystemTranslation, requestedLangs: string[]): ISystemTranslation;
    initPubSubEventsConsumer(): Promise<void>;
}

interface IDeps {
    'core.domain.core'?: ICoreDomain;
    'core.domain.eventsManager'?: IEventsManagerDomain;
    'core.app.graphql'?: IGraphqlApp;
    'core.app.graphql.customScalars.systemTranslation'?: ISystemTranslationGenerator;
    'core.app.graphql.customScalars.dateTime'?: GraphQLScalarType;
    'core.app.graphql.customScalars.any'?: GraphQLScalarType;
    config?: any;
    translator?: i18n;
}

const _parseLiteralAny = ast => {
    switch (ast.kind) {
        case Kind.BOOLEAN:
        case Kind.STRING:
            return ast.value;
        case Kind.INT:
        case Kind.FLOAT:
            return Number(ast.value);
        case Kind.LIST:
            return ast.values.map(_parseLiteralAny);
        case Kind.OBJECT:
            return ast.fields.reduce((accumulator, field) => {
                accumulator[field.name.value] = _parseLiteralAny(field.value);
                return accumulator;
            }, {});
        case Kind.NULL:
            return null;
        default:
            return ast.value;
    }
};

export default function (
    {
        'core.domain.core': coreDomain = null,
        'core.domain.eventsManager': eventsManagerDomain = null,
        'core.app.graphql': graphqlApp = null,
        'core.app.graphql.customScalars.systemTranslation': systemTranslation = null,
        'core.app.graphql.customScalars.dateTime': DateTime = null,
        'core.app.graphql.customScalars.any': Any = null,
        config = null,
        translator = null
    }: IDeps = ({} = {})
): ICoreApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    scalar JSON
                    scalar JSONObject
                    scalar Any
                    scalar DateTime
                    scalar SystemTranslation
                    scalar SystemTranslationOptional

                    enum AvailableLanguage {
                        ${config.lang.available.join(' ')}
                    }

                    input Pagination {
                        limit: Int!,
                        offset: Int!
                    }

                    enum SortOrder {
                        asc
                        desc
                    }

                    extend type Query {
                        version: String!
                        langs: [String]!
                    }
                `,
                resolvers: {
                    Query: {
                        version: (parent, args, ctx: IQueryInfos) => coreDomain.getVersion(),
                        langs: (parent, args, ctx: IQueryInfos) => config.lang.available
                    } as any,
                    Mutation: {} as any,
                    Upload: GraphQLUpload,
                    JSON: GraphQLJSON,
                    JSONObject: GraphQLJSONObject,
                    Any,
                    SystemTranslation: systemTranslation.getScalarType(),
                    SystemTranslationOptional: systemTranslation.getScalarType(true),
                    DateTime
                }
            };

            if (config.env === 'test') {
                baseSchema.typeDefs += `
                    extend type Mutation {
                        refreshSchema: Boolean
                    }
                `;

                baseSchema.resolvers.Mutation.refreshSchema = async () => {
                    return graphqlApp.generateSchema();
                };
            }

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        },
        filterSysTranslationField(fieldData: ISystemTranslation, requestedLangs: string[] = []): ISystemTranslation {
            if (!fieldData) {
                return null;
            }

            if (!requestedLangs.length) {
                return fieldData;
            }

            return Object.keys(fieldData)
                .filter(labelLang => requestedLangs.includes(labelLang))
                .reduce((allLabel: ISystemTranslation, labelLang: string) => {
                    allLabel[labelLang] = fieldData[labelLang];
                    return allLabel;
                }, {});
        },
        async initPubSubEventsConsumer() {
            return eventsManagerDomain.initPubSubEventsConsumer();
        },
        extensionPoints: {
            /**
             * Load some additional translations, afterwards available through the regular translator
             * Path given is the foler containing all translations for this plugin.
             * We consider foler is organized like so:
             * - first level is one folder per language
             * - in each folder, we have a json file for each namespace to load
             *
             * For example, if I want to load some translations for lang 'en' and namespace 'translation', I have:
             * [path]/en/translation.json
             *
             */
            registerTranslations: async (path: string) => {
                try {
                    await fs.access(path, constants.R_OK);
                } catch (e) {
                    throw new Error('Translations folder unknown or not readable: ' + path);
                }

                const lngFolders = await fs.readdir(path);

                for (const lngFolder of lngFolders) {
                    const nsFiles = await fs.readdir(path + '/' + lngFolder);

                    for (const nsFile of nsFiles) {
                        const fileContent = await import(path + '/' + lngFolder + '/' + nsFile);
                        const ns = nsFile.substring(0, nsFile.indexOf('.json'));
                        await translator.addResourceBundle(lngFolder, ns, fileContent, true);
                    }
                }
            }
        }
    };
}
