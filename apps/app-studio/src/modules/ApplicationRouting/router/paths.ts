export const AbsolutePaths = {
    panel: '/:workspaceId/:panelId/*',
    panelWithFlap: '/:workspaceId/:panelId/flap/:flapRecordId/:flapLibraryId/:flapPanelId/*',
    recordPanel: '/:workspaceId/:panelId/:recordId/:where/:recordPanelId/*',
    notFound: '/not-found',
    home: '/',
};

export const UnreachablePaths = {
    workspace: '/:workspaceId/*',
    record: ':recordId',
    recordWhere: ':recordId/:where',
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
