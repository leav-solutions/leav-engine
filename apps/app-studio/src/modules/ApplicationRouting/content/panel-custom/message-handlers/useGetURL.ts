// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';
import {RelativePaths} from '../../../../ApplicationRouting/router/paths';
import {generatePath} from 'react-router-dom';

/**
 * @param onGetUrl Callback to return the generated URL
 * @param panelParams If provided, add this panel if not already present in the URL
 * @param flapParams If provided, put this specific flap in the URL
 *
 * When using only onGetUrl param, return full current app-studio URL
 * If flap or panel parameters are provided, update the URL accordingly
 */
export const useGetURL = (): {
    getURL: IUseIFrameMessengerOptions['handlers']['onGetUrl'];
} => ({
    getURL: ({onGetUrl, flapParams, panelParams}) => {
        let url = typeof window !== 'undefined' ? window.location.href : '';

        if (!flapParams && !panelParams) {
            onGetUrl(url);
            return;
        }

        // if there is already a flap, remove it
        const flapIndex = url.indexOf('/flap/');
        if (flapIndex !== -1) {
            url = url.substring(0, flapIndex);
        }

        // add destination panel if it's not already in url
        if (panelParams && !url.includes(`/${panelParams.recordPanelId}`)) {
            const {recordId, where, recordPanelId} = panelParams;
            const panelPath = generatePath(RelativePaths.nextLevelPanel, {recordId, where, recordPanelId});
            url += `/${panelPath}`;
        }

        // add flap if provided
        if (flapParams) {
            const {flapRecordId, flapLibraryId, flapPanelId} = flapParams;
            const flapPath = generatePath(RelativePaths.openFlap, {flapRecordId, flapLibraryId, flapPanelId});
            url += `/${flapPath}`;
        }

        onGetUrl(url);
    },
});
