// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IApplication, IWorkspace, Panel} from 'modules/ApplicationRouting/types';
import {getAllPanels} from '../ApplicationRouting/utils';
import {useMemo} from 'react';

export const useGetWorkspacesAndPanels = (application: IApplication, panelId: string | null) => {
    const {currentPanel, currentWorkspace, currentParentTuple} = useMemo(() => {
        if (!application || !panelId) {
            return {
                currentPanel: null,
                currentWorkspace: null,
                currentParentTuple: undefined
            };
        }
        const _workspaces: IWorkspace[] = application?.workspaces ?? [];
        const tuplesPanelByWorkspace = _workspaces
            .map<[Panel[], IWorkspace]>(workspace => {
                const panels = getAllPanels(workspace);
                return [panels, workspace];
            })
            .flatMap(([panels, workspace]) => panels.map<[Panel, IWorkspace]>(panel => [panel, workspace]));

        const _currentParentTuple = tuplesPanelByWorkspace.find(([panel]) =>
            'children' in panel ? panel.children.find(({id}) => id === panelId) : false
        );

        const [_currentPanel, _currentWorkspace] = tuplesPanelByWorkspace.find(([panel]) => panel.id === panelId);
        return {
            currentPanel: _currentPanel,
            currentWorkspace: _currentWorkspace,
            currentParentTuple: _currentParentTuple
        };
    }, [application, panelId]);

    return {currentPanel, currentWorkspace, currentParentTuple};
};
