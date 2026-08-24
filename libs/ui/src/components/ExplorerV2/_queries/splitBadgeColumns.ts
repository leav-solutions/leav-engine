import {AttributeType, MultiDisplayOption} from '_ui/_gqlTypes';
import {type AttributesPropertiesById, type CellAttributeProperties} from '../_types';

const isLinkType = (type: CellAttributeProperties['type']): boolean =>
    type === AttributeType.simple_link || type === AttributeType.advanced_link;

// Mono-valued badge_qty is excluded: TableCell falls back to the IdCard rendering there, which
// needs the full identity, not a count.
export const isCountOnlyColumn = (attribute: CellAttributeProperties): boolean =>
    Boolean(attribute.multiple_values) &&
    ((isLinkType(attribute.type) && attribute.multi_link_display_option === MultiDisplayOption.badge_qty) ||
        (attribute.type === AttributeType.tree &&
            attribute.multi_tree_display_option === MultiDisplayOption.badge_qty));

// The grouping axis never goes to the badge side, even if configured as badge_qty:
// buildKanbanColumns reads it from propertiesById. A stale/deleted attribute id also stays on the
// values side — TableView/KanbanView's own missing-id guards handle it from there.
export const splitBadgeColumns = ({
    attributeIds,
    attributesProperties,
    groupByAttributeId,
}: {
    attributeIds: string[];
    attributesProperties: AttributesPropertiesById;
    groupByAttributeId?: string;
}): {dataAttributeIds: string[]; badgeAttributeIds: string[]} => {
    const dataAttributeIds: string[] = [];
    const badgeAttributeIds: string[] = [];

    for (const attributeId of attributeIds) {
        const attribute = attributesProperties[attributeId];
        if (attribute && attributeId !== groupByAttributeId && isCountOnlyColumn(attribute)) {
            badgeAttributeIds.push(attributeId);
        } else {
            dataAttributeIds.push(attributeId);
        }
    }

    return {dataAttributeIds, badgeAttributeIds};
};
