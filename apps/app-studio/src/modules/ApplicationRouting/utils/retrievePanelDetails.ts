import {type Application} from '../types';

export const retrievePanelDetails = ({
    application,
    recordPanelId,
    panelId,
}: {
    application: Application;
    panelId?: string;
    recordPanelId?: string;
}) => {
    const [currentPanel, libraryId, panelType] = Object.entries(application.libraries)
        .flatMap(([libId, {libraryPanels, recordPanels}]) => [
            ...libraryPanels.map(
                panel =>
                    [
                        panel,
                        libId,
                        'libraryPanels', // Keep origin to know the panel type, if needed downstream
                    ] as const, // Tells to TypeScript that is a tuple
            ),
            ...recordPanels.map(
                panel =>
                    [
                        panel,
                        libId,
                        'recordPanels', // Keep origin to know the panel type, if needed downstream
                    ] as const, // Tells to TypeScript that is a tuple
            ),
        ])
        .find(([panel]) => panel.id === (recordPanelId ?? panelId)) ?? [null, null, null];

    // The library whose VIEWS the explorer shows. For a record-panel link explorer this is the linked
    // library carried on the panel (`panel.libraryId`), NOT the owner library under which the panel is
    // configured (`libraryId`, e.g. the parent record's library). For a library panel both coincide.
    const displayedLibraryId =
        currentPanel?.type === 'explorer' && 'attributeSource' in currentPanel ? currentPanel.libraryId : libraryId;

    return {currentPanel, libraryId, panelType, displayedLibraryId};
};
