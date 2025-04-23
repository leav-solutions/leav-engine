// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import type {IWorkspace, Panel} from './types';

export const getAllPanels = (workspace: IWorkspace): Panel[] => {
    const getPanelsIntoPanel = (panel: Panel): Panel[] => {
        if ('children' in panel) {
            return panel.children.flatMap(getPanelsIntoPanel).concat(panel);
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
