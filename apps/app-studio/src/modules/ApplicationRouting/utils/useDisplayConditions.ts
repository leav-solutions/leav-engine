// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useLocation, useMatch, useParams} from 'react-router-dom';
import {AbsolutePaths} from '../router/paths';

export const useDisplayConditions = () => {
    const location = useLocation();
    const {
        params: {'*': nextLevelPaths}
    } = useMatch(AbsolutePaths.panel);
    const {recordId, where, recordPanelId} = useParams();

    // :workspaceId/:panelId
    const isFirstPanel = where === undefined;

    // :workspaceId/:panelId/(*):recordId/fullpage/:recordPanelId(*)
    const _isFullpageRecordPanel = where === 'fullpage';

    // :workspaceId/:panelId/(*):recordId/:where/:recordPanelId
    const _isLastRecordPanel = location.pathname.split(`/${recordId}/${where}/${recordPanelId}`)[1] === '';

    // (*):recordId/fullpage/:recordPanelId(*)
    const _hasOtherFullpagePanelInNextLevels = nextLevelPaths.includes('fullpage');

    // (*)recordId/where/recordPanelId(*)/:recordPanelId/fullpage/:recordPanelId(*)
    const _hasOtherFullpagePanelInNextLevelsAfterCurrent =
        location.pathname.split(`/${recordId}/${where}/${recordPanelId}`)[1]?.includes('fullpage') ?? false;

    const isLastFullpagePanel =
        (isFirstPanel && !_hasOtherFullpagePanelInNextLevels) ||
        (_isFullpageRecordPanel && (_isLastRecordPanel || !_hasOtherFullpagePanelInNextLevelsAfterCurrent));

    // :workspaceId/:panelId/(*)recordId/where/recordPanelId
    const isLastLevelRecordPanel = !isFirstPanel && _isLastRecordPanel;

    return {isLastFullpagePanel, isLastLevelRecordPanel, isFirstPanel};
};
