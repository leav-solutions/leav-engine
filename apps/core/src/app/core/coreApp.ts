// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ISystemTranslationGenerator} from 'app/graphql/customScalars/systemTranslation/systemTranslation';
import {type ICoreDomain} from 'domain/core/coreDomain';
import {type IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import * as fs from 'fs';
import {type GraphQLScalarType, Kind} from 'graphql';
import GraphQLJSON, {GraphQLJSONObject} from 'graphql-type-json';
import {GraphQLUpload} from 'graphql-upload';
import {type i18n} from 'i18next';
import {type IAppGraphQLSchema} from '_types/graphql';
import {type IQueryInfos} from '_types/queryInfos';
import {type IAppModule} from '_types/shared';
import {type ISystemTranslation} from '_types/systemTranslation';
import {type IGraphqlAppModule} from '../graphql/graphqlApp';

export interface ICoreApp extends IAppModule, IGraphqlAppModule {
    filterSysTranslationField(fieldData: ISystemTranslation, requestedLangs: string[]): ISystemTranslation | null;
    initPubSubEventsConsumer(): Promise<void>;
}

export interface ICoreAppDeps {
    'core.domain.core': ICoreDomain;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.app.graphql.customScalars.systemTranslation': ISystemTranslationGenerator;
    'core.app.graphql.customScalars.dateTime': GraphQLScalarType;
    'core.app.graphql.customScalars.any': GraphQLScalarType;
    config: any;
    translator: i18n;
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

export default function ({
    'core.domain.core': coreDomain,
    'core.domain.eventsManager': eventsManagerDomain,
    'core.app.graphql.customScalars.systemTranslation': systemTranslation,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'core.app.graphql.customScalars.dateTime': DateTime,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'core.app.graphql.customScalars.any': Any,
    config,
    translator,
}: ICoreAppDeps): ICoreApp {
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
                        langs: (parent, args, ctx: IQueryInfos) => config.lang.available,
                    } as any,
                    Mutation: {} as any,
                    Upload: GraphQLUpload,
                    JSON: GraphQLJSON,
                    JSONObject: GraphQLJSONObject,
                    Any,
                    SystemTranslation: systemTranslation.getScalarType(),
                    SystemTranslationOptional: systemTranslation.getScalarType(true),
                    DateTime,
                },
            };

            return {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};
        },
        filterSysTranslationField(fieldData: ISystemTranslation, requestedLangs: string[] = []) {
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
                    await fs.promises.access(path, fs.constants.R_OK);
                } catch (e) {
                    throw new Error('Translations folder unknown or not readable: ' + path);
                }

                const lngFolders = await fs.promises.readdir(path);

                for (const lngFolder of lngFolders) {
                    const nsFiles = await fs.promises.readdir(path + '/' + lngFolder);

                    for (const nsFile of nsFiles) {
                        const fileContent = await import(path + '/' + lngFolder + '/' + nsFile);
                        const ns = nsFile.substring(0, nsFile.indexOf('.json'));
                        translator.addResourceBundle(lngFolder, ns, fileContent, true);
                    }
                }
            },
        },
    };
}
