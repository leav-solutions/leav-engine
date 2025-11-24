// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';
import {RelativePaths} from '../../router/paths';
import {generatePath, useNavigate} from 'react-router-dom';

/**
 * Navigate to a flap panel from an iframe panel.
 * *
 * Example:
 * - From `/:recordId/:where/:recordPanelId`, navigate to `/:recordId/:where/:recordPanelId/flap/:flapRecordId/:flapLibraryId/:flapPanelId`
 */
export const useOpenFlapPanel = (): {
    openFlapPanel: IUseIFrameMessengerOptions['handlers']['onOpenFlapPanel'];
} => {
    const navigate = useNavigate();

    return {
        openFlapPanel: ({flapRecordId, flapLibraryId, flapPanelId}) =>
            navigate(generatePath(RelativePaths.openFlap, {flapRecordId, flapLibraryId, flapPanelId}), {
                relative: 'path',
            }),
    };
};
