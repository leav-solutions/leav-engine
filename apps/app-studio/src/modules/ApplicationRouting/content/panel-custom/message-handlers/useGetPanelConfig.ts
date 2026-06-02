import {type PanelIFrame, type IUsePanelMessengerOptions} from '_ui/hooks/usePanelMessenger/types';
import {useApplicationSettingsContext} from '../../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {retrievePanelDetails} from '../../../../ApplicationRouting/utils/retrievePanelDetails';

/**
 * Send Panel config data to an iframe requiring it
 */
export const useGetPanelConfig = (): {
    getPanelConfig: IUsePanelMessengerOptions['handlers']['onGetPanelConfig'];
} => {
    const [application] = useApplicationSettingsContext();

    return {
        getPanelConfig: ({panelId, onGetPanelConfig}) => {
            const {currentPanel} = retrievePanelDetails({application, recordPanelId: null, panelId});
            onGetPanelConfig(currentPanel as PanelIFrame);
        },
    };
};
