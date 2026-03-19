// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type AvailableLanguage, type GetHistoryDataQuery} from '_gqlTypes';
import {type HistoryData} from './useGetHistoryData';
import {getTopicEntityFromAction} from './getTopicEntityFromAction';

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
        };
    });
};
