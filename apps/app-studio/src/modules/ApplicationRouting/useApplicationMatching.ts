// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMemo} from 'react';
import {Panel} from '_ui/hooks/useIFrameMessenger/types';
import {getAllPanels} from './utils';
import {IApplicationMatchingContext, Workspace} from './types';

export const useApplicationMatching = (
    workspaces: Workspace[],
    panelId: string,
    popupPanelId?: string,
    sliderPanelId?: string
): IApplicationMatchingContext =>
    useMemo(() => {
        const _tuplesPanelByWorkspace: Array<[Panel, Workspace]> = workspaces
            .map<[Panel[], Workspace]>(workspace => [getAllPanels(workspace), workspace])
            .flatMap(([panels, workspace]) => panels.map<[Panel, Workspace]>(panel => [panel, workspace]));

        const _currentParentTuple = _tuplesPanelByWorkspace.find(([panel]) =>
            'children' in panel ? panel.children.find(({id}) => id === panelId) : false
        );

        const [_currentPopupPanel] = _tuplesPanelByWorkspace.find(([panel]) => panel.id === popupPanelId) ?? [null];

        const [_currentSliderPanel] = _tuplesPanelByWorkspace.find(([panel]) => panel.id === sliderPanelId) ?? [null];

        const [_currentPanel, _currentWorkspace] = _tuplesPanelByWorkspace.find(([panel]) => panel.id === panelId) ?? [
            null,
            null
        ];

        return {
            currentParentTuple: _currentParentTuple ?? null,
            currentPanel: _currentPanel ?? null,
            currentPopupPanel: _currentPopupPanel ?? null,
            currentSliderPanel: _currentSliderPanel ?? null,
            currentWorkspace: _currentWorkspace ?? null
        };
    }, [workspaces, panelId, popupPanelId, sliderPanelId]);
