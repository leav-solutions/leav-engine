import {i18n} from 'i18next';
import {IPluginInitModule} from '_types/plugin';
import {PermissionTypes} from '../../../../../_types/permissions';

interface IDeps {
    translator?: i18n;
}
export default function({translator = null}: IDeps): IPluginInitModule {
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
        }
    };
}
