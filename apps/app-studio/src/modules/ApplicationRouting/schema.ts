// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as z from 'zod/v4';
import {FontAwesomeIconSchema, LanguageSchema, PanelSchema} from '_ui/hooks/useIFrameMessenger/schema';

const WorkspaceId = z.string();

export const WorkspaceSchema = z.object({
    id: WorkspaceId,
    title: z.record(LanguageSchema, z.string()),
    description: z.string().optional(),
    color: z.string().optional(),
    icon: FontAwesomeIconSchema,
    panels: z.array(PanelSchema).min(1),
    entrypoint: z.object({
        type: z.union([z.literal('entity'), z.literal('library'), z.literal('entityValue')]),
        libraryId: z.string()
    })
});

export const ApplicationSchema = z.object({
    workspaces: z.array(WorkspaceSchema)
});
