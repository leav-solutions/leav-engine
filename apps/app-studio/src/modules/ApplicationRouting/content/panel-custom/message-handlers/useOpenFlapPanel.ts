// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';
import {RelativePaths} from '../../../router/paths';
import {generatePath, useNavigate, useParams} from 'react-router-dom';

export const REDIRECT_URL_QUERY_PARAM = 'redirectUrl';

/**
 * Navigate to a flap panel from an iframe panel.
 * If already in a flap, replace the current flap instead of adding a new one.
 *
 * Example:
 * - From `/:recordId/:where/:recordPanelId`, navigate to `/:recordId/:where/:recordPanelId/flap/:flapRecordId/:flapLibraryId/:flapPanelId`
 */
export const useOpenFlapPanel = (): {
    openFlapPanel: IUseIFrameMessengerOptions['handlers']['onOpenFlapPanel'];
} => {
    const navigate = useNavigate();
    const {flapPanelId: currentFlapPanelId} = useParams();

    // Check if the current component is already in a flap
    const isInFlap = currentFlapPanelId !== undefined;

    return {
        openFlapPanel: ({flapRecordId, flapLibraryId, flapPanelId, redirectUrl}) => {
            // If already in a flap, go back 4 levels (flap/:flapRecordId/:flapLibraryId/:flapPanelId) before opening new flap
            const flapPath = isInFlap ? '../../../../' + RelativePaths.openFlap : RelativePaths.openFlap;
            const path = generatePath(flapPath, {flapRecordId, flapLibraryId, flapPanelId});
            const search = redirectUrl ? `?${REDIRECT_URL_QUERY_PARAM}=${encodeURIComponent(redirectUrl)}` : '';
            navigate(`${path}${search}`, {
                relative: 'path',
            });
        },
    };
};
