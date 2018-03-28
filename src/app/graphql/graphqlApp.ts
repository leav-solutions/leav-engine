import {AwilixContainer} from 'awilix';
import {GraphQLSchema, Kind, ASTNode, GraphQLResolveInfo} from 'graphql';
import {makeExecutableSchema} from 'graphql-tools';
import {merge} from 'lodash';
import {IQueryField} from '_types/record';

export interface IGraphqlApp {
    schema: GraphQLSchema;
    generateSchema(): Promise<void>;
    getQueryFields(info: GraphQLResolveInfo): IQueryField[];
}

export interface IAppGraphQLSchema {
    typeDefs: string;
    resolvers: any;
}

export default function(depsManager: AwilixContainer): IGraphqlApp {
    let _fullSchema: GraphQLSchema;

    return {
        get schema(): GraphQLSchema {
            return _fullSchema;
        },
        async generateSchema(): Promise<void> {
            try {
                const appSchema = {typeDefs: [], resolvers: {}};
                const modules = Object.keys(depsManager.registrations).filter(modName => modName.indexOf('App') !== -1);

                for (const modName of modules) {
                    const appModule = depsManager.cradle[modName];

                    if (typeof appModule.getGraphQLSchema === 'function') {
                        const schemaToAdd = await appModule.getGraphQLSchema();

                        appSchema.typeDefs.push(schemaToAdd.typeDefs);
                        appSchema.resolvers = merge(appSchema.resolvers, schemaToAdd.resolvers);
                    }
                }

                // Put together a schema
                const schema = makeExecutableSchema(appSchema);

                _fullSchema = schema;
            } catch (e) {
                throw new Error('Error generating schema: ' + e);
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
        }
    };
}
