import {AwilixContainer} from 'awilix';
import {GraphQLResolveInfo, GraphQLSchema, Kind} from 'graphql';
import {maskErrors} from 'graphql-errors';
import {makeExecutableSchema} from 'graphql-tools';
import {merge} from 'lodash';
import {IUtils} from 'utils/utils';
import * as uuid from 'uuid';
import * as winston from 'winston';
import {IQueryInfos} from '_types/queryInfos';
import {IQueryField} from '_types/record';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';

export interface IGraphqlApp {
    schema: GraphQLSchema;
    generateSchema(): Promise<void>;
    getQueryFields(info: GraphQLResolveInfo): IQueryField[];
    ctxToQueryInfos(ctx: any): IQueryInfos;
}

export interface IAppGraphQLSchema {
    typeDefs: string;
    resolvers: any;
}

export default function(
    depsManager: AwilixContainer,
    logger: winston.Winston,
    utils: IUtils,
    config: any
): IGraphqlApp {
    let _fullSchema: GraphQLSchema;

    function _handleError(err: Error | ValidationError) {
        if (err instanceof ValidationError || err instanceof PermissionError) {
            return err;
        }

        const errId = uuid.v4();

        // Error is logged with original message
        err.message = `[${errId}] ${err.message}`;
        logger.error(err.stack);

        if (config.env !== 'development' && config.env !== 'test') {
            err.message = `[${errId}] Internal Error`;
        }

        return err;
    }

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
                maskErrors(schema, _handleError);

                _fullSchema = schema;
            } catch (e) {
                utils.rethrow(e, 'Error generating schema:');
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
                    // Field refers to an inline fragment, let's fetch sub fields
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
        ctxToQueryInfos(ctx: any): IQueryInfos {
            const infos: IQueryInfos = {};

            infos.userId = !!ctx.auth && ctx.auth.userId ? ctx.auth.userId : null;

            return infos;
        }
    };
}
