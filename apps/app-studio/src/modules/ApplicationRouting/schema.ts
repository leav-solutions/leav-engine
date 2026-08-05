import * as z from 'zod/v4';
import {
    FontAwesomeIconSchema,
    LanguageSchema,
    LibraryIdSchema,
    PanelIdSchema,
    PanelSchema,
} from '_ui/hooks/usePanelMessenger/schema';
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
            z.object({
                type: z.literal('tree'),
                treeId: z.string(),
            }),
        ]),
    );

/**
 * A creation panel is one "way of creating a record" for a library: the ordered `creationPanels`
 * list drives the explorer's `+` button (1 entry → simple button, N entries → dropdown menu).
 * Clicking an entry opens its LEAV form (`formId`) as a top-level creation popup.
 * `type` and `isStandalone` are forced by default so the entry is structurally a `creationForm`
 * panel (routable by id like any other panel) without config boilerplate.
 */
export const CreationPanelEntrySchema = z.object({
    id: PanelIdSchema,
    formId: z.string().min(1),
    // Required: it is the label of the creation button / dropdown entry.
    name: z.record(LanguageSchema, z.string()).refine(labels => Object.keys(labels).length > 0, {
        message: 'creationPanels entries must define a name with at least one language',
    }),
    // Defaulted here (not in the consumers) so the resolved config is self-describing, like `type`.
    icon: FontAwesomeIconSchema.default('fa-plus'),
    type: z.literal('creationForm').default('creationForm'),
    isStandalone: z.literal(true).default(true),
});

export const ApplicationSchema = z
    .object({
        workspaces: z.array(WorkspaceSchema),
        libraries: z.record(
            LibraryIdSchema,
            z.object({
                libraryPanels: z.array(PanelSchema),
                recordPanels: z.array(PanelSchema), // TODO: refine to have at least one creation and one edition panels (when explorer will use panels instead of modal form)
                creationPanels: z.array(CreationPanelEntrySchema).optional(),
            }),
        ),
        enableViewSettings: z.boolean().optional(),
        // Only effective when `enableViewSettings` is also on: kanban is built on the V2 views system.
        enableKanbanView: z.boolean().optional(),
        enableMatomoTracking: z.boolean().optional(),
    })
    .check(ctx => {
        checkWorkspaceIdsUniqueness(ctx);
        checkPanelIdsUniqueness(ctx);
        checkExplorerItemActionTargetPanelIdExistence(ctx);
    });
