import {AvailableLanguage, LogAction} from '../../../../_gqlTypes';
import {getTopicEntityFromAction} from './getTopicEntityFromAction';

const lang = [AvailableLanguage.en, AvailableLanguage.fr];

const baseTopic = {
    apiKey: null,
    filename: null,
    attribute: null,
    library: null,
    permission: null,
    profile: null,
    record: null,
    tree: null,
    application: null,
};

describe('getTopicEntityFromAction', () => {
    test.each([LogAction.LIBRARY_SAVE, LogAction.LIBRARY_DELETE, LogAction.LIBRARY_PURGE])(
        'Should return library id and label for %s',
        action => {
            const result = getTopicEntityFromAction(
                action,
                {...baseTopic, library: {id: 'lib-id', label: {en: 'My Library', fr: 'Ma Bibliothèque'}}},
                lang,
            );

            expect(result).toEqual({id: 'lib-id', label: 'My Library'});
        },
    );

    test.each([LogAction.ATTRIBUTE_SAVE, LogAction.ATTRIBUTE_DELETE])(
        'Should return attribute id and label for %s',
        action => {
            const result = getTopicEntityFromAction(
                action,
                {...baseTopic, attribute: {id: 'attr-id', label: {en: 'My Attribute', fr: 'Mon Attribut'}}},
                lang,
            );

            expect(result).toEqual({id: 'attr-id', label: 'My Attribute'});
        },
    );

    test.each([
        LogAction.TREE_SAVE,
        LogAction.TREE_DELETE,
        LogAction.TREE_ADD_ELEMENT,
        LogAction.TREE_DELETE_ELEMENT,
        LogAction.TREE_MOVE_ELEMENT,
    ])('Should return tree id and label for %s', action => {
        const result = getTopicEntityFromAction(
            action,
            {...baseTopic, tree: {id: 'tree-id', label: {en: 'My Tree', fr: 'Mon Arbre'}}},
            lang,
        );

        expect(result).toEqual({id: 'tree-id', label: 'My Tree'});
    });

    test.each([LogAction.VERSION_PROFILE_SAVE, LogAction.VERSION_PROFILE_DELETE])(
        'Should return profile id for %s',
        action => {
            const result = getTopicEntityFromAction(action, {...baseTopic, profile: {id: 'profile-id'}}, lang);

            expect(result).toEqual({id: 'profile-id'});
        },
    );

    test('Should return permission applyTo and type for PERMISSION_SAVE', () => {
        const result = getTopicEntityFromAction(
            LogAction.PERMISSION_SAVE,
            {...baseTopic, permission: {type: 'record', applyTo: 'library-id'}},
            lang,
        );

        expect(result).toEqual({id: 'library-id', label: 'record'});
    });

    test.each([LogAction.API_KEY_SAVE, LogAction.API_KEY_DELETE])('Should return apiKey id for %s', action => {
        const result = getTopicEntityFromAction(action, {...baseTopic, apiKey: 'my-api-key'}, lang);

        expect(result).toEqual({id: 'my-api-key'});
    });

    test.each([LogAction.APP_SAVE, LogAction.APP_DELETE])('Should return application id and label for %s', action => {
        const result = getTopicEntityFromAction(
            action,
            {...baseTopic, application: {id: 'app-id', label: {en: 'My App', fr: 'Mon App'}}},
            lang,
        );

        expect(result).toEqual({id: 'app-id', label: 'My App'});
    });

    test.each([
        LogAction.EXPORT_START,
        LogAction.EXPORT_END,
        LogAction.DATA_IMPORT_START,
        LogAction.DATA_IMPORT_END,
        LogAction.CONFIG_IMPORT_START,
        LogAction.CONFIG_IMPORT_END,
    ])('Should return filename for %s', action => {
        const result = getTopicEntityFromAction(action, {...baseTopic, filename: 'export.csv'}, lang);

        expect(result).toEqual({id: 'export.csv'});
    });

    describe('RECORD_SAVE / VALUE_SAVE', () => {
        test('Should use whoAmI.label when record has whoAmI', () => {
            const result = getTopicEntityFromAction(
                LogAction.RECORD_SAVE,
                {
                    ...baseTopic,
                    record: {id: 'record-id', whoAmI: {label: 'My Record'}},
                    attribute: {id: 'attr-id', label: {en: 'My Attribute', fr: 'Mon Attribut'}},
                },
                lang,
            );

            expect(result).toEqual({id: 'record-id', label: 'My Record', details: 'My Attribute'});
        });

        test('Should use localizedTranslation label when record has no whoAmI', () => {
            const result = getTopicEntityFromAction(
                LogAction.VALUE_SAVE,
                {
                    ...baseTopic,
                    record: {id: 'record-id', label: {en: 'Record Label', fr: 'Libellé'}},
                    attribute: {id: 'attr-id', label: {en: 'My Attribute', fr: 'Mon Attribut'}},
                },
                lang,
            );

            expect(result).toEqual({id: 'record-id', label: 'Record Label', details: 'My Attribute'});
        });

        test('Should return empty label when record has whoAmI with null label', () => {
            const result = getTopicEntityFromAction(
                LogAction.RECORD_DELETE,
                {...baseTopic, record: {id: 'record-id', whoAmI: {label: null}}},
                lang,
            );

            expect(result).toEqual({id: 'record-id', label: '', details: ''});
        });
    });

    test('Should return empty id for unknown action', () => {
        const result = getTopicEntityFromAction(undefined, baseTopic, lang);

        expect(result).toEqual({id: ''});
    });
});
