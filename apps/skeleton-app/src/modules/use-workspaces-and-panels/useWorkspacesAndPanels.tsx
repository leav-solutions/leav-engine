// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMemo} from 'react';
import {getAllPanels} from '../ApplicationRouting/utils';
import {IWorkspace, Panel} from '../ApplicationRouting/types';

export const useWorkspacesAndPanels = (workspaces: IWorkspace[], panelId: string) => {
    const {currentParentTuple, currentPanel, currentWorkspace} = useMemo(() => {
        const _tuplesPanelByWorkspace: Array<[Panel, IWorkspace]> = workspaces
            .map<[Panel[], IWorkspace]>(workspace => [getAllPanels(workspace), workspace])
            .flatMap(([panels, workspace]) => panels.map<[Panel, IWorkspace]>(panel => [panel, workspace]));

        const _currentParentTuple = _tuplesPanelByWorkspace.find(([panel]) =>
            'children' in panel ? panel.children.find(({id}) => id === panelId) : false
        );

        const [_currentPanel, _currentWorkspace] = _tuplesPanelByWorkspace.find(([panel]) => panel.id === panelId);

        return {
            currentParentTuple: _currentParentTuple ?? undefined,
            currentPanel: _currentPanel ?? undefined,
            currentWorkspace: _currentWorkspace ?? undefined
        };
    }, [workspaces, panelId]);

    return {
        currentParentTuple,
        currentPanel,
        currentWorkspace
    };
};
