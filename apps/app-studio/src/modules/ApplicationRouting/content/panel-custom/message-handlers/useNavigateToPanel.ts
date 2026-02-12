// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import {type IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';
import {useApplicationSettingsContext} from '../../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {RelativePaths} from '../../../router/paths';

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
    navigateToPanel: IUseIFrameMessengerOptions['handlers']['onNavigateToPanel'];
} => {
    const navigate = useNavigate();
    const {where: currentWhere} = useParams();

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
        }) => {
            if (recordId === undefined) {
                // TODO: manage panels without recordId
                return;
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

            let path = '';

            if (panelId === undefined) {
                if (
                    application.libraries[libraryId] === undefined ||
                    application.libraries[libraryId].recordPanels[0] === undefined
                ) {
                    // TODO: manage panels without recordPanelId (ex: structure_item with comment)
                    return;
                }
                const firstRecordPanelId = application.libraries[libraryId].recordPanels[0].id;

                path = generatePath(panelPath, {
                    recordId,
                    where,
                    recordPanelId: firstRecordPanelId,
                    flapRecordId,
                    flapLibraryId,
                    flapPanelId,
                });
                return navigate(`${path}${search !== '?' ? search : ''}`);
            } else {
                path = generatePath(panelPath, {
                    recordId,
                    where,
                    recordPanelId: panelId,
                    flapRecordId,
                    flapLibraryId,
                    flapPanelId,
                });
            }

            const panelPathWithQueryParams = `${path}${search !== '?' ? search : ''}`;

            return navigate(panelPathWithQueryParams, isInSlider ? {relative: 'path'} : undefined);
        },
    };
};
