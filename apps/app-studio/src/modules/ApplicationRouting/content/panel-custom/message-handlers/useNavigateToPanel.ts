import {generatePath, useNavigate, useParams} from 'react-router-dom';
import {type IUsePanelMessengerOptions} from '_ui/hooks/usePanelMessenger/types';
import {useApplicationSettingsContext} from '../../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {RelativePaths} from '../../../router/paths';
import {type Application} from '../../../types';
import {registerPanelCloseCallback} from '../../../utils/panelCloseCallbacks';
import {registerThreadActionCallbacks} from '../../../stores/threadActionCallbacks';

export const REDIRECT_URL_QUERY_PARAM = 'redirectUrl';
export const INIIAL_VALUES_QUERY_PARAMS = 'formInitialValues';

/**
 * Navigate to an already defined panel from an iframe panel.
 * If flapRecordId, flapLibraryId and flapPanelId are provided, open record panel with a flap panel.
 *
 * Do nothing if panelId is `undefined` in the current application configuration.
 *
 * Example:
 * - From `:where/:panelId`, navigate to `/:where/:panelId/:recordId/:where/:panelId`
 * - From `:where/:panelId`, navigate to `/:where/:panelId/:recordId/:where/:panelId/flap/:flapRecordId/:flapLibraryId/:flapPanelId`
 */
export const useNavigateToPanel = (): {
    navigateToPanel: IUsePanelMessengerOptions['handlers']['onNavigateToPanel'];
} => {
    const navigate = useNavigate();
    const {workspaceId, panelId: currentPanelId, recordId: currentRecordId, where: currentWhere} = useParams();

    const [application] = useApplicationSettingsContext();

    // Check if the current component is in slider
    const isInSlider = currentWhere === 'slider';

    return {
        navigateToPanel: ({
            libraryId,
            recordId,
            where,
            panelId,
            flapRecordId,
            flapLibraryId,
            flapPanelId,
            queryParams,
            onClose,
            onCommentSubmitted,
            onCommentMentionAdded,
            onDiscussionStatusChanged,
        }) => {
            const recordPanelId = getWithFallback(panelId, {libraryId, application});

            if (recordId === undefined || recordPanelId === undefined) {
                // TODO: manage panels without recordId
                return;
            }

            if (onClose) {
                registerPanelCloseCallback({recordId, where, recordPanelId}, onClose);
            }

            if (onCommentSubmitted || onCommentMentionAdded || onDiscussionStatusChanged) {
                registerThreadActionCallbacks(
                    {where},
                    {onCommentSubmitted, onCommentMentionAdded, onDiscussionStatusChanged},
                );
            }

            const shouldOpenFlap =
                flapRecordId !== undefined && flapLibraryId !== undefined && flapPanelId !== undefined;
            const nextLevelPanelPath = isInSlider
                ? '../../../' + RelativePaths.nextLevelPanel
                : RelativePaths.nextLevelPanel;
            const panelPath = shouldOpenFlap ? nextLevelPanelPath + '/' + RelativePaths.openFlap : nextLevelPanelPath;
            const searchParams: Record<string, string> = queryParams ?? {};
            if (searchParams[INIIAL_VALUES_QUERY_PARAMS]) {
                searchParams[INIIAL_VALUES_QUERY_PARAMS] = JSON.stringify(searchParams[INIIAL_VALUES_QUERY_PARAMS]);
            }
            const search =
                '?' +
                Object.entries(searchParams)
                    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
                    .join('&');
            const path = generatePath(panelPath, {
                recordId,
                where,
                recordPanelId,
                flapRecordId,
                flapLibraryId,
                flapPanelId,
            });

            return navigate(`${path}${search !== '?' ? search : ''}`, isInSlider ? {relative: 'path'} : undefined);
        },
    };
};

function getWithFallback(
    panelId: string,
    {
        libraryId,
        application,
    }: {
        libraryId: string;
        application: Application;
    },
) {
    if (panelId !== undefined) {
        return panelId;
    }

    // TODO: manage panels without recordPanelId (ex: structure_item with comment) and without flap data
    if (
        application.libraries[libraryId] !== undefined &&
        application.libraries[libraryId].recordPanels[0] !== undefined
    ) {
        return application.libraries[libraryId].recordPanels[0].id;
    }
}
