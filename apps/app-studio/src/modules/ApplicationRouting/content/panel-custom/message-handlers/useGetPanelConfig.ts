// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type PanelIFrame, type IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';
import {useApplicationSettingsContext} from '../../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {retrievePanelDetails} from '../../../../ApplicationRouting/utils/retrievePanelDetails';

/**
 * Send Panel config data to an iframe requiring it
 */
export const useGetPanelConfig = (): {
    getPanelConfig: IUseIFrameMessengerOptions['handlers']['onGetPanelConfig'];
} => {
    const [application] = useApplicationSettingsContext();

    return {
        getPanelConfig: ({panelId, onGetPanelConfig}) => {
            const {currentPanel} = retrievePanelDetails({application, recordPanelId: null, panelId});
            console.log('currentPanel on app-studio', currentPanel, onGetPanelConfig);
            onGetPanelConfig(currentPanel as PanelIFrame);
        },
    };
};
