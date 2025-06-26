// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Panel} from '_ui/hooks/useIFrameMessenger/types';
import type {IApplication, IWorkspace} from './types';

export const getAllPanels = (workspace: IWorkspace): Panel[] => {
    const getPanelsIntoPanel = (panel: Panel): Panel[] => {
        if ('children' in panel) {
            return panel.children.flatMap(getPanelsIntoPanel).concat(panel);
        }
        if ('child' in panel) {
            return getPanelsIntoPanel(panel.child).concat(panel);
        }
        if (panel.content.type === 'explorer') {
            return panel.content.actions
                .map(({what}) => what)
                .flatMap(getPanelsIntoPanel)
                .concat(panel);
        }
        return [panel];
    };

    return workspace.panels.flatMap(getPanelsIntoPanel);
};

/**
 * This function search through an array of panels to find a specific panel given its id
 * It is reccursive because a panel can be composed of others panels etc...
 */
const findPanelInPanels = (panels: Panel[], panelId: string): Panel | undefined => {
    for (const panel of panels) {
        let found: Panel;
        if (panel.id === panelId) {
            found = panel;
        } else if ('children' in panel) {
            found = findPanelInPanels(panel.children, panelId);
        } else if ('actions' in panel.content) {
            found = findPanelInPanels(
                panel.content.actions.map(p => p.what),
                panelId
            );
        }
        if (found) {
            return found;
        }
    }
};

export const updateApplication = (
    prevApplication: IApplication,
    panel: Panel,
    workspaceId: string,
    panelId: string
): IApplication => {
    const newApplication = JSON.parse(JSON.stringify(prevApplication)) as IApplication;
    const workspace = newApplication.workspaces.find(w => w.id === workspaceId);
    if (!workspace) {
        return prevApplication;
    }

    const currentPanel = findPanelInPanels(workspace.panels, panelId);
    if (!currentPanel || !('content' in currentPanel)) {
        return prevApplication;
    }

    if (currentPanel && !('children' in currentPanel)) {
        currentPanel.child = panel;
    }

    return newApplication;
};
