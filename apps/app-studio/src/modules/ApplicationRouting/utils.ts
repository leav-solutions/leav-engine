// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Panel} from '_ui/hooks/useIFrameMessenger/types';
import  {type Application, type Workspace} from './types';

export const getAllPanels = (workspace: Workspace): Panel[] => {
    const getPanelsIntoPanel = (panel: Panel): Panel[] => {
        if ('children' in panel) {
            return panel.children.flatMap(getPanelsIntoPanel).concat(panel);
        }
        if ('child' in panel.content) {
            return getPanelsIntoPanel(panel.content.child).concat(panel);
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
 * It is recursive because a panel can be composed of others panels etc...
 */
const findPanelById = (panels: Panel[], panelId: string): Panel | undefined => {
    for (const panel of panels) {
        let found: Panel;
        if (panel.id === panelId) {
            found = panel;
        } else if ('children' in panel) {
            found = findPanelById(panel.children, panelId);
        } else if (panel.content.type === 'explorer') {
            found = findPanelById(
                panel.content.actions.map(p => p.what),
                panelId
            );
        }
        if (found) {
            return found;
        }
    }
};

export const addChildPanelToApplication = (
    panel: Panel,
    prevApplication: Application,
    destination: {workspaceId: string; panelId: string}
): Application => {
    /**
     * Cannot use destructuring due to a deep object.
     * Cannot change the initial object due to `useState` reactivity (got this error https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cant_define_property_object_not_extensible).
     */
    const newApplication = JSON.parse(JSON.stringify(prevApplication)) as Application;
    const workspace = newApplication.workspaces.find(({id}) => id === destination.workspaceId);
    if (!workspace) {
        return prevApplication;
    }

    const currentPanel = findPanelById(workspace.panels, destination.panelId);
    if (!currentPanel || !('content' in currentPanel)) {
        return prevApplication;
    }

    if (currentPanel.content.type !== 'custom') {
        return prevApplication;
    }

    currentPanel.content.child = panel;

    return newApplication;
};
