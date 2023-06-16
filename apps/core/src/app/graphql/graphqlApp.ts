// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IConfig} from '_types/config';
import {IAppGraphQLSchema} from '_types/graphql';
import {IAppModule} from '_types/shared';
import {ConfirmChannel, ConsumeMessage} from 'amqplib';
import {makeExecutableSchema} from 'apollo-server';
import {AwilixContainer} from 'awilix';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {EventEmitter} from 'events';
import {GraphQLResolveInfo, GraphQLSchema, Kind} from 'graphql';
import {merge} from 'lodash';
import {IUtils} from 'utils/utils';
import * as winston from 'winston';
import {EventAction, IDbEvent} from '../../_types/event';
import {IQueryField} from '../../_types/record';

export interface IGraphqlApp extends IAppModule {
    schema: GraphQLSchema;
    schemaUpdateEmitter: EventEmitter;
    SCHEMA_UPDATE_EVENT: string;
    generateSchema(): Promise<void>;
    getQueryFields(info: GraphQLResolveInfo): IQueryField[];
    initSchemaUpdateConsumer(): Promise<void>;
}

interface IDeps {
    'core.depsManager'?: AwilixContainer;
    'core.domain.eventsManager'?: IEventsManagerDomain;
    'core.utils.logger'?: winston.Winston;
    'core.utils'?: IUtils;
    config?: IConfig;
}

export default function ({
    'core.depsManager': depsManager = null,
    'core.domain.eventsManager': eventsManagerDomain = null,
    'core.utils': utils = null,
    config = null
}: IDeps = {}): IGraphqlApp {
    let _fullSchema: GraphQLSchema;
    const _pluginsSchema: IAppGraphQLSchema[] = [];

    const schemaUpdateEmitter = new EventEmitter();
    const SCHEMA_UPDATE_EVENT = 'schemaUpdate';

    const _generateSchema = async (): Promise<void> => {
        try {
            const appSchema = {typeDefs: [], resolvers: {}};
            const modules = Object.keys(depsManager.registrations).filter(modName => modName.match(/^core\.app*/));

            for (const modName of modules) {
                const appModule = depsManager.cradle[modName];

                if (typeof appModule.getGraphQLSchema === 'function') {
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
            const schema = makeExecutableSchema(appSchema);

            _fullSchema = schema;

            schemaUpdateEmitter.emit(SCHEMA_UPDATE_EVENT, schema);
        } catch (e) {
            utils.rethrow(e, 'Error generating schema:');
        }
    };

    return {
        SCHEMA_UPDATE_EVENT,
        schemaUpdateEmitter,
        get schema(): GraphQLSchema {
            return _fullSchema;
        },
        generateSchema: _generateSchema,
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
        async initSchemaUpdateConsumer() {
            // Consumer that update GraphQL schema when a library or attribute is saved/deleted
            await eventsManagerDomain.initCustomConsumer(
                'schema_update_events',
                config.eventsManager.routingKeys.data_events,
                async (msg: ConsumeMessage, channel: ConfirmChannel) => {
                    channel.ack(msg);
                    const msgContent: IDbEvent = JSON.parse(msg.content.toString());
                    if (msgContent.emitter === utils.getProcessIdentifier()) {
                        // No need to refresh if we are the emitter. Refresh has already been done
                        return;
                    }

                    const handledActions: EventAction[] = [
                        EventAction.LIBRARY_SAVE,
                        EventAction.LIBRARY_DELETE,
                        EventAction.ATTRIBUTE_SAVE,
                        EventAction.ATTRIBUTE_DELETE
                    ];

                    if (!handledActions.includes(msgContent.payload.action)) {
                        return;
                    }

                    await _generateSchema();
                }
            );
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
