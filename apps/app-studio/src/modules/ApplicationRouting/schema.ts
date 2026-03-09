// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as z from 'zod/v4';
import {FontAwesomeIconSchema, LanguageSchema, LibraryIdSchema, PanelSchema} from '_ui/hooks/useIFrameMessenger/schema';
import {
    checkExplorerItemActionTargetPanelIdExistence,
    checkPanelIdsUniqueness,
    checkWorkspaceIdsUniqueness,
} from './schemaValidators';

const WorkspaceId = z.string();

const WorkspaceSchema = z
    .object({
        id: WorkspaceId,
        icon: FontAwesomeIconSchema,
        title: z.record(LanguageSchema, z.string()).optional(),
    })
    .and(
        z.union([
            z.object({
                type: z.literal('library'),
                libraryId: LibraryIdSchema,
            }),
            z.object({
                type: z.literal('record'),
                recordId: z.string(),
                libraryId: LibraryIdSchema,
                subTitle: z.record(LanguageSchema, z.string()).optional(), // For now, only record workspaces can have a sub title (because they use an id card component)
            }),
        ]),
    );

export const ApplicationSchema = z
    .object({
        workspaces: z.array(WorkspaceSchema),
        libraries: z.record(
            LibraryIdSchema,
            z.object({
                libraryPanels: z.array(PanelSchema),
                recordPanels: z.array(PanelSchema), // TODO: refine to have at least one creation and one edition panels (when explorer will use panels instead of modal form)
            }),
        ),
    })
    .check(ctx => {
        checkWorkspaceIdsUniqueness(ctx);
        checkPanelIdsUniqueness(ctx);
        checkExplorerItemActionTargetPanelIdExistence(ctx);
    });
