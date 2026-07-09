import {type IItemData} from '../_types';

/** Sentinel id of the synthetic column holding records that carry no axis value. */
export const NO_AXIS_VALUE_COLUMN_ID = '__no_axis_value__';

/**
 * A grouping-axis node, projected from the axis tree's root children. A card is matched to its column
 * by the id of the RECORD attached to the tree node (a tree attribute value stores a node, whose payload
 * is that record) — the same key the core uses to filter (`attr.<nodeLib>.id EQUAL nodeRecordId`).
 */
export interface IKanbanAxisNode {
    recordId: string;
    label: string;
    color: string | null;
}

export interface IKanbanColumn {
    id: string;
    label: string;
    color: string | null;
    cards: IItemData[];
}

const getCardAxisRecordId = (card: IItemData, groupByAttributeId: string): string | null => {
    const value = card.propertiesById[groupByAttributeId]?.[0];
    return value && 'treePayload' in value ? (value.treePayload?.record.id ?? null) : null;
};

/**
 * Distributes the loaded records into kanban columns, client-side.
 *
 * - One column per axis node, **always shown** even with zero cards (like the proto's empty columns).
 * - A leading "no value" column, shown **only when it actually holds cards** (plan decision #3).
 *
 * Card order within a column follows the incoming (already sorted server-side) records order.
 */
export const buildKanbanColumns = ({
    records,
    groupByAttributeId,
    axisNodes,
    noValueLabel,
}: {
    records: IItemData[];
    groupByAttributeId: string;
    axisNodes: IKanbanAxisNode[];
    noValueLabel: string;
}): IKanbanColumn[] => {
    const axisRecordIds = new Set(axisNodes.map(node => node.recordId));
    const cardsByAxisRecordId = new Map<string, IItemData[]>();
    const noValueCards: IItemData[] = [];

    for (const card of records) {
        const axisRecordId = getCardAxisRecordId(card, groupByAttributeId);
        if (axisRecordId !== null && axisRecordIds.has(axisRecordId)) {
            const bucket = cardsByAxisRecordId.get(axisRecordId) ?? [];
            bucket.push(card);
            cardsByAxisRecordId.set(axisRecordId, bucket);
        } else {
            noValueCards.push(card);
        }
    }

    const axisColumns: IKanbanColumn[] = axisNodes.map(node => ({
        id: node.recordId,
        label: node.label,
        color: node.color,
        cards: cardsByAxisRecordId.get(node.recordId) ?? [],
    }));

    return noValueCards.length > 0
        ? [{id: NO_AXIS_VALUE_COLUMN_ID, label: noValueLabel, color: null, cards: noValueCards}, ...axisColumns]
        : axisColumns;
};
