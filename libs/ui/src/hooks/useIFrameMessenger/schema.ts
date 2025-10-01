// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as z from 'zod/v4';

export const FONT_AWESOME_ICON_REGEX = /^fa-/;

export const PanelIdSchema = z.string();
export const LanguageSchema = z.string();
export const FontAwesomeIconSchema = z.string().regex(FONT_AWESOME_ICON_REGEX).optional();

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

export const ItemActionsSchema = z.array(
    z.object({
        where: z.union([z.literal('popup'), z.literal('slider'), z.literal('fullpage')]),
        what: z.lazy(() => PanelSchema),
        useItemActionOnRowClick: z.boolean().optional()
    })
);

export const PanelSchema = z.lazy(() =>
    z
        .object({
            id: PanelIdSchema,
            name: z.record(LanguageSchema, z.string()).optional(),
            icon: FontAwesomeIconSchema
        })
        .and(
            z.union([
                z.object({
                    content: z.union([
                        z
                            .object({
                                type: z.literal('explorer'), // TODO: you can split types into link-explorer and library-explorer
                                viewId: z.string().optional(),
                                actions: ItemActionsSchema
                            })
                            .and(
                                z.union([
                                    z.object({
                                        // TODO: later add behavior on click on explorer item
                                        libraryId: z.string(),
                                        attributeSource: z.string(),
                                        explorerProps: LinkExplorerPropsSchema.optional()
                                    }),
                                    z.object({
                                        libraryId: z.union([z.literal('<props>'), z.string()]),
                                        explorerProps: LibraryExplorerPropsSchema.optional()
                                    })
                                ])
                            ),
                        z.object({
                            type: z.literal('custom'),
                            iframeSource: z.string()
                        }),
                        z.object({
                            type: z.literal('editionForm'),
                            formId: z.string(),
                            libraryId: z.string()
                        }),
                        z.object({
                            type: z.literal('creationForm'),
                            formId: z.string(),
                            libraryId: z.string()
                        })
                    ])
                }),
                z.object({
                    children: z.array(z.lazy(() => PanelSchema)),
                    libraryId: z.string().optional()
                })
            ])
        )
);
