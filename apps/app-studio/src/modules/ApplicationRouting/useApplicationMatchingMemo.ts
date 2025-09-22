// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMemo} from 'react';
import {type Panel} from '_ui/hooks/useIFrameMessenger/types';
import {getAllPanels} from './utils';
import {type IApplicationMatchingContext, type Workspace} from './types';

export const useApplicationMatchingMemo = (
    workspaces: Workspace[],
    panelId: string,
    popupPanelId?: string,
    sliderPanelId?: string
): IApplicationMatchingContext =>
    useMemo(() => {
        const _tuplesPanelByWorkspace: Array<[Panel, Workspace]> = workspaces
            .map<[Panel[], Workspace]>(workspace => [getAllPanels(workspace), workspace])
            .flatMap(([panels, workspace]) => panels.map<[Panel, Workspace]>(panel => [panel, workspace]));

        const _currentFullpageParentTuple = _tuplesPanelByWorkspace.find(([panel]) =>
            'children' in panel ? panel.children.find(({id}) => id === panelId) : false
        );
        const _currentPopupParentTuple = _tuplesPanelByWorkspace.find(([panel]) =>
            'children' in panel ? panel.children.find(({id}) => id === popupPanelId) : false
        );
        const _currentSliderParentTuple = _tuplesPanelByWorkspace.find(([panel]) =>
            'children' in panel ? panel.children.find(({id}) => id === sliderPanelId) : false
        );

        const [_currentPanel, _currentWorkspace] = _tuplesPanelByWorkspace.find(([panel]) => panel.id === panelId) ?? [
            null,
            null
        ];
        /** `_ignoredWorkspace` should be the same as `_currentPanel` */
        const [_currentPopupPanel, _ignoredWorkspace] = _tuplesPanelByWorkspace.find(
            ([panel]) => panel.id === popupPanelId
        ) ?? [null, null];
        /** `_ignoredWorkspace2` should be the same as `_currentPanel` */
        const [_currentSliderPanel, _ignoredWorkspace2] = _tuplesPanelByWorkspace.find(
            ([panel]) => panel.id === sliderPanelId
        ) ?? [null, null];

        return {
            currentFullpageParentTuple: _currentFullpageParentTuple ?? null,
            currentPopupParentTuple: _currentPopupParentTuple ?? null,
            currentSliderParentTuple: _currentSliderParentTuple ?? null,
            currentFullpagePanel: _currentPanel ?? null,
            currentPopupPanel: _currentPopupPanel ?? null,
            currentSliderPanel: _currentSliderPanel ?? null,
            currentWorkspace: _currentWorkspace ?? null
        };
    }, [workspaces, panelId, popupPanelId, sliderPanelId]);
