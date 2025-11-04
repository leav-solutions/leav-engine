// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

export const AbsolutePaths = {
    panel: '/:workspaceId/:panelId/*',
    recordPanel: '/:workspaceId/:panelId/:recordId/:where/:recordPanelId/*'
};

export const UnreachablePaths = {
    workspace: '/:workspaceId/*',
    record: ':recordId',
    recordWherePanel: ':recordId/:where/:recordPanelId/*'
};

export const RelativePaths = {
    nextLevelPanel: ':recordId/:where/:recordPanelId',
    closeCurrentPanel: '../../..',
    changeLastRecordPanel: '../:recordPanelId',
    openCurrentPanelInFullpage: '../../../:recordId/fullpage/:recordPanelId'
};
