// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Application} from '../types';

export const retrievePanelDetails = ({
    application,
    recordPanelId,
    panelId
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
                        'libraryPanels' // Keep origin to know the panel type, if needed downstream
                    ] as const // Tells to TypeScript that is a tuple
            ),
            ...recordPanels.map(
                panel =>
                    [
                        panel,
                        libId,
                        'recordPanels' // Keep origin to know the panel type, if needed downstream
                    ] as const // Tells to TypeScript that is a tuple
            )
        ])
        .find(([panel]) => panel.id === (recordPanelId ?? panelId)) ?? [null, null, null];

    return {currentPanel, libraryId, panelType};
};
