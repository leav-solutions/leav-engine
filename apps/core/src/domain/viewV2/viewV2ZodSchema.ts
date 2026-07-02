import {z} from 'zod';
import {SortOrder} from '../../_types/list';
import {AttributeCondition, TreeCondition} from '../../_types/record';
import {ViewV2Shortcut, ViewV2Types} from '../../_types/viewsV2';

// May be latter check attribute and library exist same as in domain/automation/triggers/automationTriggersTopics.ts

const systemTranslationSchema = z.record(z.string(), z.string());

const viewV2DisplayAttributeSchema = z.object({
    attributeId: z.string(),
    visible: z.boolean(),
});

const viewV2DisplaySchema = z.object({
    type: z.enum(ViewV2Types),
    attributes: z.array(viewV2DisplayAttributeSchema),
});

const viewV2FilterSchema = z.object({
    pinned: z.boolean(),
    attributes: z.array(z.string()).min(1),
    values: z.array(z.string().nullable()),
    condition: z.union([z.enum(AttributeCondition), z.enum(TreeCondition)]),
    withEmptyValues: z.boolean().optional(),
});

const viewV2SortSchema = z.object({
    pinned: z.boolean(),
    attributes: z.array(z.string()).min(1),
    order: z.enum(SortOrder),
});

const viewV2ValuesVersionSchema = z.record(z.string(), z.string());

export const viewV2UserFieldsSchema = z.object({
    library: z.string(),
    label: systemTranslationSchema,
    display: viewV2DisplaySchema,
    shared: z.boolean(),
    filters: z.array(viewV2FilterSchema),
    sorts: z.array(viewV2SortSchema),
    shortcuts: z.array(z.enum(ViewV2Shortcut)).optional(),
    valuesVersions: viewV2ValuesVersionSchema.optional().nullable(),
});

export const viewV2UpdateFieldsSchema = viewV2UserFieldsSchema.partial();
