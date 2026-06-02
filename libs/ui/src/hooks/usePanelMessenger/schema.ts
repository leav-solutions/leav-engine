import * as z from 'zod/v4';

export const FONT_AWESOME_ICON_REGEX = /^fa-/;

export const PanelIdSchema = z.string();
export const LanguageSchema = z.string();
export const LibraryIdSchema = z.string();
export const FontAwesomeIconSchema = z.string().regex(FONT_AWESOME_ICON_REGEX).optional();

export const WhereSchema = z.union([z.literal('popup'), z.literal('slider'), z.literal('fullpage')]);

export const ViewSettingsShortcutsSchema = z.union([
    z.literal('display'),
    z.literal('filters'),
    z.literal('sorts'),
    z.literal('catalog'),
]);

export const FlapPanelIdSchema = z.union([z.literal('info-history'), z.literal('thread')]);

export const ExplorerPropsSchema = z.object({
    showSearch: z.boolean().optional(),
    showFilters: z.boolean().optional(),
    showSorts: z.boolean().optional(),
    freezeView: z.boolean().optional(),
    showAttributeLabels: z.boolean().optional(),
    creationFormId: z.string().optional(),
    noPagination: z.literal(true).optional(),
    showActionsLabels: z.boolean().optional(),
    defaultPrimaryActions: z.array(z.union([z.literal('create')])).optional(),
    defaultMassActions: z
        .array(z.union([z.literal('deactivate'), z.literal('export'), z.literal('editAttribute')]))
        .optional(),
    defaultActionsForItem: z
        .array(z.union([z.literal('replaceLink'), z.literal('remove'), z.literal('activate')]))
        .optional(),
});

export const ItemActionsSchema = z
    .array(
        z.object({
            where: WhereSchema,
            what: z.literal('record'),
            targetPanelId: PanelIdSchema.optional(),
            targetFlapPanelId: FlapPanelIdSchema.optional(),
            icon: FontAwesomeIconSchema,
            label: z.record(LanguageSchema, z.string()),
            onRowClick: z.boolean().optional(),
        }),
    )
    .refine(actions => actions.reduce((acc, action) => (action.onRowClick ? acc + 1 : acc), 0) <= 1, {
        message: 'At most one action must have onRowClick set to true',
    });

export const basePanelSchema = z.object({
    id: PanelIdSchema,
    icon: FontAwesomeIconSchema,
    name: z.record(LanguageSchema, z.string()).optional(),
    isStandalone: z.boolean().optional(),
    hideInCompactMode: z.boolean().optional(),
});

export const iframePanelSchema = z.object({
    type: z.literal('custom'),
    iframeSource: z.string(),
    viewId: z.string().optional(),
    isSelfContaining: z.boolean().optional(),
    popupProps: z
        .object({
            width: z.string().optional(),
            height: z.string().optional(),
        })
        .optional(),
});

const editionPanelSchema = z.object({
    type: z.literal('editionForm'),
    formId: z.string(),
});

export const creationPanelSchema = z.object({
    type: z.literal('creationForm'),
    formId: z.string(),
    attributeSource: z.string().optional(),
    isStandalone: z.literal(true),
});

export const baseExplorerPanelSchema = z.object({
    type: z.literal('explorer'),
    viewId: z.string().optional(),
    actions: ItemActionsSchema,

    targetLibraryId: LibraryIdSchema.optional(),
    selectedTab: ViewSettingsShortcutsSchema.optional(),
    currentViewId: z.string().optional(),
    isViewSettingsActive: z.boolean().default(false),
});

export const attributeExplorerPanelSchema = z.object({
    attributeSource: z.string(),
    deactivateOnUnlink: z.boolean().optional(),
    libraryId: LibraryIdSchema,
    explorerProps: ExplorerPropsSchema.optional(),
});

const libraryExplorerPanelSchema = z.object({
    explorerProps: ExplorerPropsSchema.optional(),
});

const explorerPanelSchema = baseExplorerPanelSchema.and(
    z.union([attributeExplorerPanelSchema, libraryExplorerPanelSchema]),
);

export const PanelSchema = basePanelSchema.and(
    z.union([explorerPanelSchema, iframePanelSchema, editionPanelSchema, creationPanelSchema]),
);

export const PanelIFrameSchema = basePanelSchema.and(iframePanelSchema);
