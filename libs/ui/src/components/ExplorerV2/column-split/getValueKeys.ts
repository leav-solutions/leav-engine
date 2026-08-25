import {AttributeType, type PropertyValueFragment} from '_ui/_gqlTypes';
import {type AttributeProperties, type IItemData} from '../_types';

/**
 * The option keys currently set on a record for this attribute. Mirrors how the options themselves are
 * keyed (`getColumnSplitOptions` / `mapTreeNodesToSplitSource`): a standard attribute's key is its raw
 * value, a link's is the linked record's id, a tree's is the NODE's id — not the linked record's id,
 * since one record can sit on several nodes (identity pitfall documented on `mapTreeNodesToSplitSource`).
 */
export const getValueKeys = (values: PropertyValueFragment[] | undefined, attribute: AttributeProperties): string[] => {
    if (!values?.length) {
        return [];
    }

    if (attribute.type === AttributeType.tree) {
        return values
            .map(value => ('treePayload' in value ? value.treePayload?.id : undefined))
            .filter((key): key is string => Boolean(key));
    }

    if (([AttributeType.simple_link, AttributeType.advanced_link] as AttributeType[]).includes(attribute.type)) {
        return values
            .map(value => ('linkPayload' in value ? value.linkPayload?.whoAmI.id : undefined))
            .filter((key): key is string => Boolean(key));
    }

    // Standard attribute: the raw value itself is the key.
    return values
        .map(value => ('valuePayload' in value ? value.valuePayload : undefined))
        .filter((key): key is NonNullable<typeof key> => key !== undefined && key !== null)
        .map(String);
};

/**
 * The option keys currently shown for a cell: the optimistic overlay's expected set while a write is in
 * flight, the record's own (server) values otherwise. A pure read on the item — the overlay travels IN
 * the item (`optimisticSplitKeys`, set by `useOptimisticSplitValues` on a copy of the touched row), so
 * neither the cell nor the column builder needs to reach for state living beside the data.
 */
export const getSelectedKeys = (item: IItemData, attribute: AttributeProperties): string[] =>
    item.optimisticSplitKeys?.[attribute.id] ?? getValueKeys(item.propertiesById[attribute.id], attribute);

/**
 * The `id_value` of the property value matching this option's key — needed to remove ONE value out of
 * several on a multivalued attribute (a mono-valued attribute's engine finds the value to clear on its
 * own, no `id_value` required).
 */
export const findValueIdForKey = (
    values: PropertyValueFragment[] | undefined,
    attribute: AttributeProperties,
    key: string,
): string | null => {
    const match = values?.find(value => getValueKeys([value], attribute)[0] === key);
    return match?.id_value ?? null;
};
