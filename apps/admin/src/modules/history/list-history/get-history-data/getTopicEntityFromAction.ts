import {localizedTranslation} from '@leav/utils';
import {LogAction, type AvailableLanguage, type GetHistoryDataQuery} from '../../../../_gqlTypes';

type LogTopic = NonNullable<NonNullable<GetHistoryDataQuery['logs']>['logs'][number]['topic']>;

type TopicEntity = {
    id: string;
    label?: string;
    details?: string;
};

export const getTopicEntityFromAction = (
    action?: LogAction,
    topic?: LogTopic,
    lang?: AvailableLanguage[],
): TopicEntity => {
    switch (action) {
        case LogAction.LIBRARY_SAVE:
        case LogAction.LIBRARY_DELETE:
        case LogAction.LIBRARY_PURGE:
            return {
                id: topic?.library?.id,
                label: localizedTranslation(topic?.library?.label, lang),
            };

        case LogAction.ATTRIBUTE_SAVE:
        case LogAction.ATTRIBUTE_DELETE:
            return {
                id: topic?.attribute?.id,
                label: localizedTranslation(topic?.attribute?.label, lang),
            };

        case LogAction.AUTOMATION_RULE_CREATE:
        case LogAction.AUTOMATION_RULE_UPDATE:
            return {
                id: topic?.automationRule?.id,
                label: topic?.automationRule?.label,
            };

        case LogAction.TREE_SAVE:
        case LogAction.TREE_DELETE:
        case LogAction.TREE_ADD_ELEMENT:
        case LogAction.TREE_DELETE_ELEMENT:
        case LogAction.TREE_MOVE_ELEMENT:
            return {
                id: topic?.tree?.id,
                label: localizedTranslation(topic?.tree?.label, lang),
            };

        case LogAction.VERSION_PROFILE_SAVE:
        case LogAction.VERSION_PROFILE_DELETE:
            return {
                id: topic?.profile?.id,
            };

        case LogAction.PERMISSION_SAVE:
            return {
                id: topic?.permission?.applyTo,
                label: topic?.permission?.type,
            };

        case LogAction.API_KEY_SAVE:
        case LogAction.API_KEY_DELETE:
            return {
                id: topic?.apiKey,
            };

        case LogAction.APP_SAVE:
        case LogAction.APP_DELETE:
            return {
                id: topic?.application?.id,
                label: localizedTranslation(topic?.application?.label, lang),
            };

        case LogAction.RECORD_SAVE:
        case LogAction.RECORD_DELETE:
        case LogAction.VALUE_SAVE:
        case LogAction.VALUE_DELETE:
            return {
                id: topic?.record?.id,
                label:
                    topic?.record && 'whoAmI' in topic.record
                        ? (topic.record.whoAmI.label ?? '')
                        : topic?.record && 'label' in topic.record
                          ? localizedTranslation(topic.record.label, lang)
                          : '',
                details: localizedTranslation(topic?.attribute?.label, lang),
            };

        case LogAction.EXPORT_START:
        case LogAction.EXPORT_END:
        case LogAction.DATA_IMPORT_START:
        case LogAction.DATA_IMPORT_END:
        case LogAction.CONFIG_IMPORT_START:
        case LogAction.CONFIG_IMPORT_END:
            return {
                id: topic?.filename,
            };

        default:
            return {id: ''};
    }
};
