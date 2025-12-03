// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import type * as z from 'zod/v4';
import {type ApplicationSchema} from './schema';
import {type LibraryId, type Panel} from '_ui/hooks/useIFrameMessenger/types';

interface ICheckContext {
    value: z.infer<typeof ApplicationSchema>;
    issues: z.core.$ZodRawIssue[];
}

const _findDuplicates = (ids: string[]): string[] => {
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    return [...new Set(duplicates)];
};

export const checkWorkspaceIdsUniqueness = (ctx: ICheckContext): void => {
    const workspaceIds = ctx.value.workspaces.map(workspace => workspace.id);
    const workspaceDuplicates = _findDuplicates(workspaceIds);

    if (workspaceDuplicates.length > 0) {
        ctx.issues.push({
            code: 'custom',
            input: ctx.value,
            message: `All workspace IDs must be unique. Duplicates: ${workspaceDuplicates.join(', ')}`,
            path: ['application.workspaces'],
        });
    }
};

export const checkPanelIdsUniqueness = (ctx: ICheckContext): void => {
    const allPanelIds = Object.values(ctx.value.libraries).flatMap(library => [
        ...library.libraryPanels.map(panel => panel.id),
        ...library.recordPanels.map(panel => panel.id),
    ]);

    const panelDuplicates = _findDuplicates(allPanelIds);

    if (panelDuplicates.length > 0) {
        ctx.issues.push({
            code: 'custom',
            input: ctx.value,
            message: `All panel IDs must be unique across all libraries. Duplicates: ${panelDuplicates.join(', ')}`,
            path: ['application.libraries'],
        });
    }
};

export const checkExplorerItemActionTargetPanelIdExistence = (ctx: ICheckContext): void => {
    const allRecordPanelIds = Object.values(ctx.value.libraries).flatMap(library => [
        ...library.recordPanels.map(panel => panel.id),
    ]);

    const checkPanels = (panels: Panel[], libraryId: LibraryId, panelType: 'libraryPanels' | 'recordPanels') => {
        panels.forEach(panel => {
            if (!('actions' in panel) || !Array.isArray(panel.actions)) {
                return;
            }

            panel.actions.forEach(action => {
                if (!('targetPanelId' in action) || !action.targetPanelId) {
                    return;
                }

                if (allRecordPanelIds.includes(action.targetPanelId)) {
                    return;
                }

                ctx.issues.push({
                    code: 'custom',
                    input: ctx.value,
                    message: `targetPanelId ${action.targetPanelId} does not reference any existing recordPanel`,
                    path: [`application.libraries.${libraryId}.${panelType}.${panel.id}.actions`],
                });
            });
        });
    };

    Object.entries(ctx.value.libraries).forEach(([libraryId, library]) => {
        checkPanels(library.libraryPanels, libraryId, 'libraryPanels');
        checkPanels(library.recordPanels, libraryId, 'recordPanels');
    });
};
