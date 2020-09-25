import {GraphQLScalarType, Kind} from 'graphql';
import GraphQLJSON, {GraphQLJSONObject} from 'graphql-type-json';
import {IUtils} from 'utils/utils';
import {ISystemTranslation} from '_types/systemTranslation';
import {IAppGraphQLSchema, IGraphqlApp} from '../graphql/graphqlApp';

export interface ICoreApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
    filterSysTranslationField(fieldData: ISystemTranslation, requestedLangs: string[]): ISystemTranslation;
}

interface IDeps {
    'core.app.graphql'?: IGraphqlApp;
    'core.utils'?: IUtils;
    config?: any;
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

export default function(
    {'core.app.graphql': graphqlApp = null, 'core.utils': utils = null, config = null}: IDeps = ({} = {})
): ICoreApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    scalar JSON
                    scalar JSONObject
                    scalar Any
                    scalar DateTime

                    enum AvailableLanguage {
                        ${config.lang.available.join(' ')}
                    }

                    scalar SystemTranslation

                    input Pagination {
                        limit: Int!,
                        offset: Int!
                    }

                    enum SortOrder {
                        asc
                        desc
                    }

                    input SystemTranslationInput {
                        ${config.lang.available.map(l => `${l}: String${l === config.lang.default ? '!' : ''}`)}
                    }
                `,
                resolvers: {
                    Query: {} as any,
                    Mutation: {} as any,
                    JSON: GraphQLJSON,
                    JSONObject: GraphQLJSONObject,
                    Any: new GraphQLScalarType({
                        name: 'Any',
                        description: 'Can be anything',
                        serialize: val => val,
                        parseValue: val => val,
                        parseLiteral: _parseLiteralAny
                    }),
                    SystemTranslation: new GraphQLScalarType({
                        name: 'SystemTranslation',
                        description: 'System entities fields translation (label...)',
                        serialize: val => val,
                        parseValue: val => val,
                        parseLiteral: ast => ast
                    }),
                    DateTime: new GraphQLScalarType({
                        name: 'DateTime',
                        description: `The DateTime scalar type represents time data,
                            represented as an ISO-8601 encoded UTC date string.`,
                        parseValue(value: string) {
                            return new Date(value); // value from the client
                        },
                        serialize(value: Date | number | string) {
                            if (!(value instanceof Date) && typeof value !== 'string' && typeof value !== 'number') {
                                throw new Error(`Invalid date ${value}`);
                            }

                            const dateValue = value instanceof Date ? value : utils.timestampToDate(value);

                            return dateValue.toISOString(); // value sent to the client
                        },
                        parseLiteral(ast) {
                            if (ast.kind === Kind.STRING) {
                                return ast.value;
                            }
                            return null;
                        }
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
