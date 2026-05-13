import {type AvailableLanguage, type GetHistoryDataQuery} from '../../../../_gqlTypes';
import {getTopicEntityFromAction} from './getTopicEntityFromAction';
import {removeGraphqlTypename} from '../../../utils/removeGraphqlTypename';
import {type HistoryData} from '../../types';

export const mapLogsToHistoryData = (data: GetHistoryDataQuery['logs'], lang: AvailableLanguage[]): HistoryData[] => {
    const _formatDate = (date: number) => new Date(date * 1000).toLocaleString();

    return data?.logs?.map((log, index) => {
        const topicEntity = getTopicEntityFromAction(log.action, log.topic, lang);

        return {
            key: `${log.queryId}-${index}`,
            date: _formatDate(log.time),
            user: 'email' in log.user ? (log.user.email?.[0]?.payload ?? log.user.id ?? '') : (log.user.id ?? ''),
            action: log.action ?? '',
            object: topicEntity?.label ?? '',
            entity: topicEntity?.id ?? '',
            details: topicEntity?.details ?? '',
            before: log.before?.asString ?? '',
            after: log.after?.asString ?? '',
            queryId: log.queryId,
            rawJson: JSON.stringify(removeGraphqlTypename(log)),
        };
    });
};
