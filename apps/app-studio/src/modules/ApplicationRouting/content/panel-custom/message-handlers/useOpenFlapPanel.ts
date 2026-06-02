import {type IUsePanelMessengerOptions} from '_ui/hooks/usePanelMessenger/types';
import {RelativePaths} from '../../../router/paths';
import {generatePath, useNavigate, useParams} from 'react-router-dom';

/**
 * Navigate to a flap panel from an iframe panel.
 * If already in a flap, replace the current flap instead of adding a new one.
 *
 * Example:
 * - From `/:recordId/:where/:recordPanelId`, navigate to `/:recordId/:where/:recordPanelId/flap/:flapRecordId/:flapLibraryId/:flapPanelId`
 */
export const useOpenFlapPanel = (): {
    openFlapPanel: IUsePanelMessengerOptions['handlers']['onOpenFlapPanel'];
} => {
    const navigate = useNavigate();
    const {flapPanelId: currentFlapPanelId} = useParams();

    // Check if the current component is already in a flap
    const isInFlap = currentFlapPanelId !== undefined;

    return {
        openFlapPanel: ({flapRecordId, flapLibraryId, flapPanelId}) => {
            // If already in a flap, go back 4 levels (flap/:flapRecordId/:flapLibraryId/:flapPanelId) before opening new flap
            const flapPath = isInFlap ? '../../../../' + RelativePaths.openFlap : RelativePaths.openFlap;
            return navigate(generatePath(flapPath, {flapRecordId, flapLibraryId, flapPanelId}), {
                relative: 'path',
            });
        },
    };
};
