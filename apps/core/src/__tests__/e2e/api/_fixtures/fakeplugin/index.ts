import {type i18n} from 'i18next';
import {z} from 'zod';
import {type IPluginInitModule} from '../../../../../_types/plugin';
import {PermissionTypes} from '../../../../../_types/permissions';
import {ActionsListIOTypes} from '../../../../../_types/actionsList';
import {type IValueRepo} from '../../../../../infra/value/valueRepo';
import {type IAttributeDomain} from '../../../../../domain/attribute/attributeDomain';
import {type IAttribute} from '../../../../../_types/attribute';
import {type ITasksManagerDomain} from '../../../../../domain/tasksManager/tasksManagerDomain';
import {FakePluginTaskType} from './_types/_types';
import {type IFakeDomain} from './domain/fakeDomain';
import {type INotificationDomain} from '../../../../../domain/notification/notificationDomain';
import {TaskPriority} from '../../../../../_types/tasksManager';
import {type TTrpc} from '../../../../../app/trpc/trpcApp';
import {type IEventsManagerDomain} from '../../../../../domain/eventsManager/eventsManagerDomain';
import {type IRecordDomain} from '../../../../../domain/record/recordDomain';
import {type IExtendSDOFunction} from '../../../../../_types/sdo';
import {AttributeCondition} from '../../../../../_types/record';
import {fakePluginAutomationAction} from './domain/fakeAutomationAction';
import {
    SDO_EXPORTS_EXTEND_FUNCTION_NAME,
    SDO_EXPORTS_EXTEND_TRIGGER_LIBRARY_ID,
    SDO_EXPORTS_EXTEND_TRIGGER_LINK_ATTRIBUTE_ID,
    SDO_EXPORTS_EXTEND_UNMAPPED_ATTRIBUTE_ID,
} from '../../sdo/sdoConfig';

interface IDeps {
    translator: i18n;
    'core.infra.value': IValueRepo;
    'core.domain.attribute': IAttributeDomain;
    'core.domain.tasksManager': ITasksManagerDomain;
    'core.domain.notification': INotificationDomain;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.domain.record': IRecordDomain;
    'fakeplugin.domain': IFakeDomain;
}

export enum FakePluginActions {
    FAKE_PLUGIN_ACTION = 'fakeplugin_FAKE_PLUGIN_ACTION',
    FAKE_PLUGIN_ACTION2 = 'fakeplugin_FAKE_PLUGIN_ACTION2',
}

const STATUS_UPDATE_EVENT = 'fakeplugin.status.update';

const toAsyncIterable = <T>(asyncIterator: AsyncIterator<T>): AsyncIterable<T> => ({
    [Symbol.asyncIterator]: () => asyncIterator,
});

function createTrpcRouter(t: TTrpc, eventsManagerDomain: IEventsManagerDomain) {
    return t.router({
        getStatus: t.procedure.input(z.string()).query(({input, ctx}) => ({input, ctx})),
        updateStatus: t.procedure
            .input(
                z.object({
                    campaignId: z.string(),
                    status: z.enum(['pending', 'in_progress', 'done']),
                }),
            )
            .mutation(({input, ctx}) => {
                const data = {
                    ...input,
                    updatedAt: new Date().toISOString(),
                };
                eventsManagerDomain.sendPubSubEvent({triggerName: STATUS_UPDATE_EVENT, data}, ctx);
                return data;
            }),
        onStatusChange: t.procedure.subscription(async function* () {
            const iterable = toAsyncIterable(eventsManagerDomain.subscribe([STATUS_UPDATE_EVENT]));
            for await (const value of iterable) {
                yield value;
            }
        }),
    });
}

export type FakePluginRouter = ReturnType<typeof createTrpcRouter>;

export default function ({
    translator,
    'core.infra.value': valueRepo,
    'core.domain.attribute': attributeDomain,
    'core.domain.tasksManager': tasksManagerDomain,
    'core.domain.notification': notificationDomain,
    'core.domain.eventsManager': eventsManagerDomain,
    'core.domain.record': recordDomain,
    'fakeplugin.domain': fakeDomain,
}: IDeps): IPluginInitModule {
    const _extendSdoWithTriggers: IExtendSDOFunction = async ({record, sdo, config, ctx}) => {
        const {list} = await recordDomain.find({
            params: {
                library: SDO_EXPORTS_EXTEND_TRIGGER_LIBRARY_ID,
                filters: [
                    {
                        field: SDO_EXPORTS_EXTEND_TRIGGER_LINK_ATTRIBUTE_ID,
                        value: record.id,
                        condition: AttributeCondition.EQUAL,
                    },
                ],
            },
            ctx,
        });

        return {
            ...sdo,
            content: {
                ...sdo.content,
                info: {
                    ...((sdo.content.info as Record<string, unknown>) ?? {}),
                    triggeredBy: list.map(triggerRecord => triggerRecord.uuid),
                    // Read straight off the record: this attribute is in no SDO path, it only reaches
                    // the export through `additionalAttributeTriggers`.
                    unmappedValue: record[SDO_EXPORTS_EXTEND_UNMAPPED_ATTRIBUTE_ID] ?? null,
                    extendConfig: config ?? null,
                },
            },
        };
    };

    const _fakeReplaceValueAction = {
        id: 'fakeReplaceValue',
        name: 'replace saved value',
        description: 'Action to replace the saved value',
        input_types: [ActionsListIOTypes.STRING],
        output_types: [ActionsListIOTypes.STRING],
        compute: false,
        action: async (values, _params, ctx) => {
            const {library, recordId, attribute} = ctx;

            let reverseLink: IAttribute;
            if (attribute.reverse_link) {
                reverseLink = await attributeDomain.getAttributeProperties({
                    id: attribute.reverse_link as string,
                    ctx,
                });
            }

            await valueRepo.updateValue({
                library,
                recordId,
                attribute: {...attribute, reverse_link: reverseLink},
                value: {payload: `This value has been replaced by the fakeplugin on ${ctx.actionEvent}`},
                ctx,
            });

            return {
                values,
                errors: [],
            };
        },
    };

    return {
        async init(extensionPoints) {
            await extensionPoints.registerTranslations(__dirname + '/locales');
            extensionPoints.registerTRPCRouter(t => createTrpcRouter(t, eventsManagerDomain));
            extensionPoints.registerGraphQLSchema({
                typeDefs: `
                    extend type Query {
                        fakePluginQuery: String!
                        fakePluginTranslation: String!
                        fakePluginTask(taskName: String!): String!
                        hasFakePluginStarted: Boolean!
                        hasFakePluginCronTaskExecuted: Boolean!
                    }
                    
                    extend type Mutation {
                        fakePluginCreateNotification(title: String!, withTracking: Boolean): ID!
                    }
                `,
                resolvers: {
                    Mutation: {
                        fakePluginCreateNotification: async (_parent, {title, withTracking}, ctx): Promise<string> =>
                            (
                                await notificationDomain.createNotification(
                                    {
                                        emitterUserId: ctx.userId,
                                        recipients: {
                                            userIds: [ctx.userId],
                                            groupIds: [],
                                        },
                                        metadata: {
                                            priority: 'normal',
                                            ...(withTracking
                                                ? {
                                                      trackingEvents: [
                                                          {
                                                              category: 'Planning - Reconduction',
                                                              action: 'Reconduction Campagne Effectuée',
                                                              value: 1,
                                                          },
                                                      ],
                                                  }
                                                : {}),
                                        },
                                        content: {
                                            level: 'info',
                                            title,
                                            message: 'message',
                                            ...(withTracking
                                                ? {
                                                      attachments: [
                                                          {
                                                              label: 'report',
                                                              url: 'https://example.com/report.csv',
                                                              trackingEvent: {
                                                                  category: 'Planning - Reconduction',
                                                                  action: 'Rapport Erreur Reconduction Ouvert',
                                                              },
                                                          },
                                                      ],
                                                  }
                                                : {}),
                                        },
                                    },
                                    ctx,
                                )
                            )[0].id,
                    },
                    Query: {
                        fakePluginQuery: () => 'ok!',
                        fakePluginTranslation: () => translator.t('fakeplugin.testtranslation', {lng: 'fr'}),
                        fakePluginTask: async (_parent, {taskName}, ctx) =>
                            tasksManagerDomain.createTask(
                                {
                                    label: {
                                        en: taskName,
                                    },
                                    func: {
                                        path: 'fakeplugin.domain',
                                        name: 'execWorker',
                                        args: {ctx, fromTask: taskName},
                                    },
                                    role: {
                                        type: FakePluginTaskType.FAKE_TYPE,
                                    },
                                    priority: 1,
                                },
                                ctx,
                            ),
                        hasFakePluginStarted: () => fakeDomain.getPluginStarted(),
                        hasFakePluginCronTaskExecuted: () => fakeDomain.getCronTaskExecuted(),
                    },
                },
            });

            extensionPoints.registerPermissionActions(PermissionTypes.LIBRARY, ['fake_plugin_permission']);

            extensionPoints.registerEventActions(Object.values(FakePluginActions), 'fakeplugin');

            extensionPoints.registerActions([_fakeReplaceValueAction]);

            extensionPoints.registerTaskTypes([FakePluginTaskType.FAKE_TYPE]);

            extensionPoints.registerCronTask({
                name: 'fakeCronTask',
                schedule: '*/1 * * * *', // every minute
                createTask: async ctx => ({
                    label: {
                        en: 'Fake Cron Task',
                    },
                    func: {path: 'fakeplugin.domain', name: 'execCronTask', args: {ctx}},
                    role: {
                        type: FakePluginTaskType.FAKE_TYPE,
                    },
                    priority: TaskPriority.LOW,
                }),
            });

            extensionPoints.registerStart(async () => fakeDomain.startPlugin());

            extensionPoints.registerAutomationAction(fakePluginAutomationAction);

            extensionPoints.registerExtendSDOFunctions({
                [SDO_EXPORTS_EXTEND_FUNCTION_NAME]: _extendSdoWithTriggers,
            });
        },
    };
}
