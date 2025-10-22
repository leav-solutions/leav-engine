// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as z from 'zod/v4';

export const FONT_AWESOME_ICON_REGEX = /^fa-/;

export const PanelIdSchema = z.string();
export const LanguageSchema = z.string();
export const LibraryIdSchema = z.string();
export const FontAwesomeIconSchema = z.string().regex(FONT_AWESOME_ICON_REGEX).optional();

export const WhereSchema = z.union([z.literal('popup'), z.literal('slider'), z.literal('fullpage')]);

const CommonExplorerPropsSchema = z.object({
    showSearch: z.boolean().optional(),
    showFilters: z.boolean().optional(),
    showSorts: z.boolean().optional(),
    freezeView: z.boolean().optional(),
    showAttributeLabels: z.boolean().optional(),
    creationFormId: z.string().optional(),
    noPagination: z.literal(true).optional(),
    showActionsLabels: z.boolean().optional()
});

const LinkExplorerPropsSchema = CommonExplorerPropsSchema;

export const LibraryExplorerPropsSchema = CommonExplorerPropsSchema.extend({
    defaultPrimaryActions: z.array(z.union([z.literal('create')])).optional(),
    defaultActionsForItem: z
        .array(z.union([z.literal('replaceLink'), z.literal('remove'), z.literal('activate')]))
        .optional(),
    defaultMassActions: z.array(z.union([z.literal('deactivate')])).optional()
});

export const ItemActionsSchema = z
    .array(
        z.object({
            where: WhereSchema,
            what: z.literal('record'),
            icon: FontAwesomeIconSchema,
            label: z.record(LanguageSchema, z.string()),
            onRowClick: z.boolean().optional()
        })
    )
    .refine(actions => actions.reduce((acc, action) => (action.onRowClick ? acc + 1 : acc), 0) <= 1, {
        message: 'At most one action must have onRowClick set to true'
    });

export const basePanelSchema = z.object({
    id: PanelIdSchema,
    name: z.record(LanguageSchema, z.string()).optional(),
    isStandalone: z.boolean().optional()
});

export const iframePanelSchema = z.object({
    type: z.literal('custom'),
    iframeSource: z.string(),
    isSelfContaining: z.boolean().optional()
});

const editionPanelSchema = z.object({
    type: z.literal('editionForm'),
    formId: z.string()
});

const creationPanelSchema = z.object({
    type: z.literal('creationForm'),
    formId: z.string()
});

const baseExplorerPanelSchema = z.object({
    type: z.literal('explorer'),
    viewId: z.string().optional(),
    actions: ItemActionsSchema
});

const linkExplorerPanelSchema = z.object({
    attributeSource: z.string(),
    libraryId: LibraryIdSchema.optional(),
    explorerProps: LinkExplorerPropsSchema.optional()
});

const libraryExplorerPanelSchema = z.object({
    explorerProps: LibraryExplorerPropsSchema.optional()
});

const explorerPanelSchema = baseExplorerPanelSchema.and(z.union([linkExplorerPanelSchema, libraryExplorerPanelSchema]));

export const PanelSchema = basePanelSchema.and(
    z.union([explorerPanelSchema, iframePanelSchema, editionPanelSchema, creationPanelSchema])
);

export const PanelIFrameSchema = basePanelSchema.and(iframePanelSchema);
