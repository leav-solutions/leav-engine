// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useLocation, useNavigate} from 'react-router-dom';
import {type IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';
import {deleteRecordPanelFromURL} from '../../utils/deleteRecordPanelFromURL';

/**
 * Close the panel from an iframe panel.
 *
 * Example: From `/:where/:panelId/:recordId/:where/:panelId`, close the panel to go back to `/:where/:panelId`
 *
 * @returns The function to close the panel
 */
export const useClosePanel = (): {
    closePanel: IUseIFrameMessengerOptions['handlers']['onClosePanel'];
} => {
    const navigate = useNavigate();
    const location = useLocation();

    return {
        closePanel: ({recordId, where, recordPanelId}) =>
            navigate(deleteRecordPanelFromURL(location.pathname, {recordId, where, recordPanelId}))
    };
};
