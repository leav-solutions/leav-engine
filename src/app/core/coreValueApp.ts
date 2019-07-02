import {IValueDomain} from 'domain/value/valueDomain';
import {GraphQLScalarType} from 'graphql';
import {IValue} from '_types/value';
import {IAppGraphQLSchema, IGraphqlApp} from '../graphql/graphqlApp';

export interface ICoreValueApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(valueDomain: IValueDomain, graphqlApp: IGraphqlApp): ICoreValueApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    scalar ValueVersion

                    input ValueVersionInput {
                        name: String!,
                        value: TreeElementInput!
                    }

                    type Value {
                        id_value: ID,
                        value: String,
                        raw_value: String,
                        modified_at: Int,
                        created_at: Int,
                        version: ValueVersion
                    }

                    type linkValue {
                        id_value: ID,
                        value: Record!,
                        modified_at: Int,
                        created_at: Int,
                        version: ValueVersion
                    }

                    type treeValue {
                        id_value: ID!,
                        modified_at: Int!,
                        created_at: Int!
                        value: TreeNode!,
                        version: ValueVersion
                    }

                    input ValueInput {
                        id_value: ID,
                        value: String,
                        version: [ValueVersionInput]
                    }

                    extend type Mutation {
                        saveValue(library: ID, recordId: ID, attribute: ID, value: ValueInput): Value!
                        deleteValue(library: ID, recordId: ID, attribute: ID, value: ValueInput): Value!
                    }
                `,
                resolvers: {
                    Mutation: {
                        async saveValue(parent, {library, recordId, attribute, value}, ctx): Promise<IValue> {
                            // Convert version
                            if (!!value.version) {
                                value.version = value.version.reduce((formattedVers, valVers) => {
                                    formattedVers[valVers.name] = valVers.value;

                                    return formattedVers;
                                }, {});
                            }

                            const savedVal = await valueDomain.saveValue(
                                library,
                                recordId,
                                attribute,
                                value,
                                graphqlApp.ctxToQueryInfos(ctx)
                            );

                            let formattedVersion = null;
                            if (savedVal.version) {
                                const versionsNames = Object.keys(savedVal.version);
                                formattedVersion = [];

                                for (const versName of versionsNames) {
                                    formattedVersion.push({name: versName, value: savedVal.version[versName]});
                                }
                            }

                            return {...savedVal, version: formattedVersion};
                        },
                        async deleteValue(parent, {library, recordId, attribute, value}, ctx): Promise<IValue> {
                            return valueDomain.deleteValue(
                                library,
                                recordId,
                                attribute,
                                value,
                                graphqlApp.ctxToQueryInfos(ctx)
                            );
                        }
                    },
                    ValueVersion: new GraphQLScalarType({
                        name: 'ValueVersion',
                        description: `Value version, object looking like:
                            {versionTreeName: {library: "tree_element_library", id: "tree_element_id"}`,
                        serialize: val => val,
                        parseValue: val => val,
                        parseLiteral: ast => ast
                    })
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
