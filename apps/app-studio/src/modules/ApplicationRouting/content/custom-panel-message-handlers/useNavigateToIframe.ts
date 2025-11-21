// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';
import {generatePath, useNavigate} from 'react-router-dom';
import {useApplicationSettingsContext} from '../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {addRecordPanelToApplication} from '../../utils/addRecordPanelToApplication';
import {RelativePaths} from '../../router/paths';

/**
 * Navigate to a custom panel from an iframe panel, providing the panel definition.
 *
 * Example: From `:where/:panelId`, navigate to `/:where/:panelId/:recordId/:where/:panelId`
 */
export const useNavigateToIframe = (): {
    navigateToIframe: IUseIFrameMessengerOptions['handlers']['onNavigateToIframe'];
} => {
    const navigate = useNavigate();

    const [_, setApplication] = useApplicationSettingsContext();

    return {
        navigateToIframe: ({panel, destination, recordId, where, recordPanelId}) => {
            setApplication(prevApplication => addRecordPanelToApplication(panel, prevApplication, destination));
            navigate(generatePath(RelativePaths.nextLevelPanel, {recordId, where, recordPanelId}));
        },
    };
};
