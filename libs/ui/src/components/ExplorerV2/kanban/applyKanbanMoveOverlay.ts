import {type IKanbanColumn} from '../grouping/_types';

/** Pending optimistic moves: card `itemId` → target column id. */
export type KanbanMovesMap = ReadonlyMap<string, string>;

/**
 * Applies pending optimistic moves on top of the columns built from (possibly stale) server data:
 * each moved card is pulled out of the column the data still places it in and appended at the end of
 * its target column. Records load with `network-only`, so optimism lives here rather than in the
 * Apollo cache; the overlay stays applied until fresh data confirms the move (see
 * `pruneReconciledMoves`). A move whose card or target column is absent is skipped.
 */
export const applyKanbanMoveOverlay = (columns: IKanbanColumn[], moves: KanbanMovesMap): IKanbanColumn[] => {
    if (moves.size === 0) {
        return columns;
    }

    const movedCardsByTargetColumnId = new Map<string, IKanbanColumn['cards']>();
    for (const column of columns) {
        for (const card of column.cards) {
            const targetColumnId = moves.get(card.itemId);
            if (targetColumnId !== undefined && targetColumnId !== column.id) {
                const bucket = movedCardsByTargetColumnId.get(targetColumnId) ?? [];
                bucket.push(card);
                movedCardsByTargetColumnId.set(targetColumnId, bucket);
            }
        }
    }

    if (movedCardsByTargetColumnId.size === 0) {
        return columns;
    }

    const targetColumnIds = new Set(columns.map(column => column.id));

    return columns.map(column => ({
        ...column,
        cards: [
            ...column.cards.filter(card => {
                const targetColumnId = moves.get(card.itemId);
                const isMovingElsewhere =
                    targetColumnId !== undefined && targetColumnId !== column.id && targetColumnIds.has(targetColumnId);
                return !isMovingElsewhere;
            }),
            ...(movedCardsByTargetColumnId.get(column.id) ?? []),
        ],
    }));
};

/**
 * Drops the moves the fresh data has caught up with: the card now sits in its target column, or it
 * left the filtered data set entirely. Returns the same map instance when nothing changed, so memoized
 * consumers are not re-triggered.
 */
export const pruneReconciledMoves = (columns: IKanbanColumn[], moves: KanbanMovesMap): KanbanMovesMap => {
    if (moves.size === 0) {
        return moves;
    }

    const actualColumnIdByItemId = new Map<string, string>();
    for (const column of columns) {
        for (const card of column.cards) {
            actualColumnIdByItemId.set(card.itemId, column.id);
        }
    }

    const remainingMoves = new Map<string, string>();
    for (const [itemId, targetColumnId] of moves) {
        const actualColumnId = actualColumnIdByItemId.get(itemId);
        const hasLeftDataSet = actualColumnId === undefined;
        const isReconciled = actualColumnId === targetColumnId;
        if (!hasLeftDataSet && !isReconciled) {
            remainingMoves.set(itemId, targetColumnId);
        }
    }

    return remainingMoves.size === moves.size ? moves : remainingMoves;
};
