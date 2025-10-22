// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as z from 'zod/v4';
import {FontAwesomeIconSchema, LanguageSchema, LibraryIdSchema, PanelSchema} from '_ui/hooks/useIFrameMessenger/schema';

const WorkspaceId = z.string();

const WorkspaceSchema = z
    .object({
        id: WorkspaceId,
        icon: FontAwesomeIconSchema,
        title: z.record(LanguageSchema, z.string())
    })
    .and(
        z.union([
            z.object({
                type: z.literal('library'),
                libraryId: LibraryIdSchema
            }),
            z.object({
                type: z.literal('record'),
                recordId: z.string(),
                libraryId: LibraryIdSchema
            })
        ])
    );

export const ApplicationSchema = z.object({
    workspaces: z.array(WorkspaceSchema),
    libraries: z.record(
        LibraryIdSchema,
        z.object({
            libraryPanels: z.array(PanelSchema),
            recordPanels: z.array(PanelSchema) // TODO: refine to have at least one creation and one edition panels
        })
    )
});
