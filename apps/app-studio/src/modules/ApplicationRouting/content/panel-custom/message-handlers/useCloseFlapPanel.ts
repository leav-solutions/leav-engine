import {type IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';
import {RelativePaths} from '../../../router/paths';
import {useNavigate} from 'react-router-dom';

/**
 * Close the flap panel from an iframe panel.
 *
 * Example:
 * - From `/:recordId/:where/:recordPanelId/flap/:flapRecordId/:flapLibraryId/:flapPanelId`, navigate to `/:recordId/:where/:recordPanelId`
 */
export const useCloseFlapPanel = (): {
    closeFlapPanel: IUseIFrameMessengerOptions['handlers']['onCloseFlapPanel'];
} => {
    const navigate = useNavigate();

    return {
        closeFlapPanel: () => navigate(RelativePaths.closeFlapPanel, {relative: 'path'}),
    };
};
