// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {generatePath, useNavigate} from 'react-router-dom';
import {type IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';
import {useApplicationSettingsContext} from '../../../../config/application-instance/application-settings/ApplicationSettingsContext';
import {RelativePaths} from '../../router/paths';

/**
 * Navigate to an already defined panel from an iframe panel.
 *
 * Do nothing if panelId is `undefined` in the current application configuration.
 *
 * Example: From `:where/:panelId`, navigate to `/:where/:panelId/:recordId/:where/:panelId`
 */
export const useNavigateToPanel = (): {
    navigateToPanel: IUseIFrameMessengerOptions['handlers']['onNavigateToPanel'];
} => {
    const navigate = useNavigate();

    const [application] = useApplicationSettingsContext();

    return {
        navigateToPanel: ({libraryId, recordId, where, panelId}) => {
            if (recordId === undefined) {
                // TODO: manage panels without recordId
                return;
            }

            if (panelId === undefined) {
                if (
                    application.libraries[libraryId] === undefined ||
                    application.libraries[libraryId].recordPanels[0] === undefined
                ) {
                    return;
                }
                const firstRecordPanelId = application.libraries[libraryId].recordPanels[0].id;

                return navigate(
                    generatePath(RelativePaths.nextLevelPanel, {
                        recordId,
                        where,
                        recordPanelId: firstRecordPanelId,
                    }),
                );
            }

            return navigate(
                generatePath(RelativePaths.nextLevelPanel, {
                    recordId,
                    where,
                    recordPanelId: panelId,
                }),
            );
        },
    };
};
