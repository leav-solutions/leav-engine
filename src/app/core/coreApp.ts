import {AwilixContainer} from 'awilix';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {GraphQLScalarType} from 'graphql';
import {ISystemTranslation} from '_types/systemTranslation';
import {IAppGraphQLSchema, IGraphqlApp} from '../graphql/graphqlApp';

export interface ICoreApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
    filterSysTranslationField(fieldData: ISystemTranslation, requestedLangs: string[]): ISystemTranslation;
}

export default function(
    libraryDomain: ILibraryDomain = null,
    attributeDomain: IAttributeDomain = null,
    recordDomain: IRecordDomain = null,
    valueDomain: IValueDomain = null,
    depsManager: AwilixContainer = null,
    graphqlApp: IGraphqlApp = null,
    config: any = null
): ICoreApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    enum AvailableLanguage {
                        ${config.lang.available.join(' ')}
                    }

                    scalar SystemTranslation

                    input SystemTranslationInput {
                        ${config.lang.available.map(l => `${l}: String${l === config.lang.default ? '!' : ''}`)}
                    }
                `,
                resolvers: {
                    Query: {} as any,
                    Mutation: {} as any,
                    SystemTranslation: new GraphQLScalarType({
                        name: 'SystemTranslation',
                        description: 'System entities fields translation (label...)',
                        serialize: val => val,
                        parseValue: val => val,
                        parseLiteral: ast => ast
                    })
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
        }
    };
}
