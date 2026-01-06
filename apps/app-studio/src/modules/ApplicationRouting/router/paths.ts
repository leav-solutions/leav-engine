// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

export const AbsolutePaths = {
    panel: '/:workspaceId/:panelId/*',
    panelWithFlap: '/:workspaceId/:panelId/flap/:flapRecordId/:flapLibraryId/:flapPanelId/*',
    recordPanel: '/:workspaceId/:panelId/:recordId/:where/:recordPanelId/*',
};

export const UnreachablePaths = {
    workspace: '/:workspaceId/*',
    record: ':recordId',
    recordWherePanel: ':recordId/:where/:recordPanelId/*',
    recordWherePanelWithFlap: ':recordId/:where/:recordPanelId/flap/:flapRecordId/:flapLibraryId/:flapPanelId/*',
};

export const RelativePaths = {
    openFlap: 'flap/:flapRecordId/:flapLibraryId/:flapPanelId',
    nextLevelPanel: ':recordId/:where/:recordPanelId',
    closeCurrentPanel: '../../..',
    closeFlapPanel: '../../../..',
    changeLastRecordPanel: '../:recordPanelId',
    openCurrentPanelInPopup: '../../../:recordId/popup/:recordPanelId',
    openCurrentPanelInSlider: '../../../:recordId/slider/:recordPanelId',
};
