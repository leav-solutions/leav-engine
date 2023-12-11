// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {i18n} from 'i18next';
import {IPluginInitModule} from '_types/plugin';
import {PermissionTypes} from '../../../../../_types/permissions';

interface IDeps {
    translator?: i18n;
}

enum FakePluginActions {
    FAKE_PLUGIN_ACTION = 'FAKE_PLUGIN_ACTION',
    FAKE_PLUGIN_ACTION2 = 'FAKE_PLUGIN_ACTION2'
}

export default function ({translator = null}: IDeps): IPluginInitModule {
    return {
        async init(extensionPoints) {
            await extensionPoints.registerTranslations(__dirname + '/locales');
            extensionPoints.registerGraphQLSchema({
                typeDefs: `
                    extend type Query {
                        fakePluginQuery: String!
                        fakePluginTranslation: String!
                    }
                `,
                resolvers: {
                    Query: {
                        fakePluginQuery: () => 'ok!',
                        fakePluginTranslation: () => translator.t('fakeplugin.testtranslation', {lng: 'fr'})
                    }
                }
            });

            extensionPoints.registerPermissionActions(PermissionTypes.LIBRARY, ['fake_plugin_permission']);

            extensionPoints.registerEventActions(Object.values(FakePluginActions), 'fakeplugin');
        }
    };
}
