// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {generatePath, useNavigate, useOutletContext} from 'react-router-dom';
import {IUseIFrameMessengerOptions, Panel} from '_ui/hooks/useIFrameMessenger/types';
import {routes} from '../routes';
import {IApplicationMatchingContext} from '../types';

export const useNavigateToPanel = ({
    addPanel
}: {
    addPanel: (panel: Panel, workspaceId: string, panelId: string) => void;
}) => {
    const navigate = useNavigate();
    const {currentPanel, currentWorkspace} =
        useOutletContext<Omit<IApplicationMatchingContext, 'currentParentTuple'>>();

    const navigateToPanel: IUseIFrameMessengerOptions['handlers']['onNavigateToPanel'] = data => {
        if ('panel' in data) {
            addPanel(data.panel, currentWorkspace.id, currentPanel.id);
        }

        return navigate(generatePath(routes.panel, {panelId: data.panelId}));
    };

    return {
        navigateToPanel
    };
};
