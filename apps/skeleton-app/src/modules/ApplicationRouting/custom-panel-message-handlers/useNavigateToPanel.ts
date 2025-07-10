// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {generatePath, useNavigate, useOutletContext} from 'react-router-dom';
import {IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';
import {routes} from '../routes';
import {AddPanel, IApplicationMatchingContext} from '../types';

export const useNavigateToPanel = (addPanel: AddPanel) => {
    const navigate = useNavigate();
    const {currentPanel, currentWorkspace} = useOutletContext<IApplicationMatchingContext>();

    const navigateToPanel: IUseIFrameMessengerOptions['handlers']['onNavigateToPanel'] = data => {
        if ('panel' in data) {
            addPanel(data.panel, {workspaceId: currentWorkspace.id, panelId: currentPanel.id});
        }

        return navigate(generatePath(routes.panel, {panelId: data.panelId}));
    };

    return {
        navigateToPanel
    };
};
