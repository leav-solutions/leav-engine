// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {makeExecutableSchema} from '@graphql-tools/schema';
import {type AwilixContainer} from 'awilix';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {type GraphQLResolveInfo, type GraphQLSchema, Kind} from 'graphql';
import {merge} from 'lodash';
import {type IUtils} from 'utils/utils';
import {IConfig} from '_types/config';
import {type IAppGraphQLSchema} from '_types/graphql';
import {type IAppModule} from '_types/shared';
import {type IQueryField} from '../../_types/record';

export interface IGraphqlApp extends IAppModule {
    /**
     * Parse all registered GraphQL schemas and return a single schema
     * Very costly operation, should be called only once at application startup
     */
    getSchema(): Promise<GraphQLSchema>;
    getQueryFields(info: GraphQLResolveInfo): IQueryField[];
}

export interface IGraphqlAppModule {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

function isGraphqlAppModule(app: IAppModule | IGraphqlAppModule): app is IGraphqlAppModule {
    return typeof (app as IGraphqlAppModule).getGraphQLSchema === 'function';
}

interface IDeps {
    'core.depsManager'?: AwilixContainer;
    'core.utils'?: IUtils;
}

export default function ({
    'core.depsManager': depsManager = null,
    'core.utils': utils = null
}: IDeps = {}): IGraphqlApp {
    const _pluginsSchema: IAppGraphQLSchema[] = [];

    return {
        async getSchema() {
            try {
                const appSchema = {typeDefs: [], resolvers: {}};
                const modules = Object.keys(depsManager.registrations).filter(modName => modName.match(/^core\.app*/));
                for (const modName of modules) {
                    const appModule = depsManager.cradle[modName];

                    if (isGraphqlAppModule(appModule)) {
                        const schemaToAdd = await appModule.getGraphQLSchema();
                        appSchema.typeDefs.push(schemaToAdd.typeDefs);
                        appSchema.resolvers = merge(appSchema.resolvers, schemaToAdd.resolvers);
                    }
                }

                for (const schemaPart of _pluginsSchema) {
                    appSchema.typeDefs.push(schemaPart.typeDefs);
                    appSchema.resolvers = merge(appSchema.resolvers, schemaPart.resolvers);
                }

                // Put together a schema
                return makeExecutableSchema(appSchema);
            } catch (e) {
                return utils.rethrow(e, 'Error generating schema:');
            }
        },
        getQueryFields(info: GraphQLResolveInfo): IQueryField[] {
            const extractedFields = [];

            /**
             * Actually extract fields. Called recursively on nested fields.
             * Extracted fields are pushed to the container array
             *
             * @param  {object} selection   A requested field
             * @param  {array}  container   Extracted fields destination. Used to handle simple and nested fields
             */
            const extractFields = (selection, container) => {
                if (selection.kind === Kind.FRAGMENT_SPREAD) {
                    // Field refers to a fragment, let's fetch the fields from fragments definitions
                    for (const fragSelection of info.fragments[selection.name.value].selectionSet.selections) {
                        extractFields(fragSelection, container);
                    }
                } else if (selection.kind === Kind.INLINE_FRAGMENT) {
                    // Field refers to an inline fragment, let's fetch subfields
                    for (const fragSelection of selection.selectionSet.selections) {
                        extractFields(fragSelection, container);
                    }
                } else {
                    if (selection.name.value === '__typename') {
                        return;
                    }

                    const field = {
                        name: selection.name.value,
                        fields: [],
                        arguments: {}
                    };

                    // Fetch nested fields recursively
                    if (selection.selectionSet !== null) {
                        if (typeof selection.selectionSet !== 'undefined') {
                            for (const subSelection of selection.selectionSet.selections) {
                                extractFields(subSelection, field.fields);
                            }
                        }
                    }

                    // Extract fields arguments
                    if (typeof selection.arguments !== 'undefined' && selection.arguments.length) {
                        for (const arg of selection.arguments) {
                            field.arguments[arg.name.value] = arg.value.value;
                        }
                    }

                    container.push(field);
                }
            };

            for (const selection of info.fieldNodes[0].selectionSet.selections) {
                extractFields(selection, extractedFields);
            }

            return extractedFields;
        },
        extensionPoints: {
            registerGraphQLSchema: (schemaPart: IAppGraphQLSchema) => {
                if (typeof schemaPart.typeDefs !== 'string' || typeof schemaPart.resolvers !== 'object') {
                    throw new Error(`Invalid GraphQL Schema to register: ${schemaPart}`);
                }

                _pluginsSchema.push(schemaPart);
            }
        }
    };
}
