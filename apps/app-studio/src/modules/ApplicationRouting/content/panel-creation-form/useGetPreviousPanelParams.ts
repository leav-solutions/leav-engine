import {APP_BASE_URL} from '../../../../constants';

export const useGetPreviousPanelParams = ({currentRecordId, currentWhere, currentRecordPanelId}) => {
    const [previousRecordPanelId, previousWhere, previousRecordId] = location.pathname
        .replace(APP_BASE_URL, '')
        .split(`/${currentRecordId}/${currentWhere}/${currentRecordPanelId}`)[0] // get previous panels
        .split('/') // split all params
        .reverse(); // get only third last params

    if (previousRecordId === '') {
        return {
            previousRecordPanelId,
            previousWhere: 'fullpage',
            previousRecordId: undefined,
        };
    }

    return {
        previousRecordPanelId,
        previousWhere,
        previousRecordId,
    };
};
