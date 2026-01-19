// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type i18n} from 'i18next';
import {type IPluginInitModule} from '_types/plugin';
import {PermissionTypes} from '../../../../../_types/permissions';
import {ActionsListIOTypes} from '../../../../../_types/actionsList';
import {type IValueRepo} from '../../../../../infra/value/valueRepo';
import {type IAttributeDomain} from '../../../../../domain/attribute/attributeDomain';
import {type IAttribute} from '../../../../../_types/attribute';
import {type ITasksManagerDomain} from 'domain/tasksManager/tasksManagerDomain';
import {FakePluginTaskType} from './_types/_types';
import {type IFakeDomain} from './domain/fakeDomain';

interface IDeps {
    translator: i18n;
    'core.infra.value': IValueRepo;
    'core.domain.attribute': IAttributeDomain;
    'core.domain.tasksManager': ITasksManagerDomain;
    'fakeplugin.domain': IFakeDomain;
}

enum FakePluginActions {
    FAKE_PLUGIN_ACTION = 'fakeplugin_FAKE_PLUGIN_ACTION',
    FAKE_PLUGIN_ACTION2 = 'fakeplugin_FAKE_PLUGIN_ACTION2',
}

export default function ({
    translator,
    'core.infra.value': valueRepo,
    'core.domain.attribute': attributeDomain,
    'core.domain.tasksManager': tasksManagerDomain,
    'fakeplugin.domain': fakeDomain,
}: IDeps): IPluginInitModule {
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
            if (!!attribute.reverse_link) {
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
            extensionPoints.registerGraphQLSchema({
                typeDefs: `
                    extend type Query {
                        fakePluginQuery: String!
                        fakePluginTranslation: String!
                        fakePluginTask(taskName: String!): String!
                        hasFakePluginStarted: Boolean!
                    }
                `,
                resolvers: {
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
                                        args: {fromTask: taskName},
                                    },
                                    role: {
                                        type: FakePluginTaskType.FAKE_TYPE,
                                    },
                                    priority: 1,
                                },
                                ctx,
                            ),
                        hasFakePluginStarted: () => fakeDomain.getPluginStarted(),
                    },
                },
            });

            extensionPoints.registerPermissionActions(PermissionTypes.LIBRARY, ['fake_plugin_permission']);

            extensionPoints.registerEventActions(Object.values(FakePluginActions), 'fakeplugin');

            extensionPoints.registerActions([_fakeReplaceValueAction]);

            extensionPoints.registerTaskTypes([FakePluginTaskType.FAKE_TYPE]);

            extensionPoints.registerStart(async () => fakeDomain.startPlugin());
        },
    };
}
