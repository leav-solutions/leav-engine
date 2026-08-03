import {type IItemData} from '../_types';

export interface IKanbanColumnState {
    cards: IItemData[];
    /** Total records of the column (listDistinctValues count) — "Voir plus" shows while cards.length < count. */
    count: number;
    isLoadingMore: boolean;
    /**
     * A page came back short/empty: the server has no more records for this column, even if `count`
     * still says otherwise — `listDistinctValues` ignores the fulltext search (V1 limitation), so a
     * search can inflate `count` beyond what the (search-narrowed) card pages will ever return.
     * Hides "Voir plus" so it cannot become a dead button in that case.
     */
    isExhausted?: boolean;
}

/** Column states keyed by column id (axis node RECORD id, or the no-value sentinel). */
export type KanbanColumnsState = Record<string, IKanbanColumnState>;

export type KanbanColumnsAction =
    | {type: 'reset'}
    | {type: 'countsLoaded'; countByColumnId: Record<string, number>}
    | {type: 'cardsLoadStarted'; columnId: string}
    | {type: 'cardsLoaded'; columnId: string; cards: IItemData[]; isLastPage: boolean}
    | {type: 'cardsLoadFailed'; columnId: string}
    | {type: 'cardMoved'; card: IItemData; fromColumnId: string; toColumnId: string}
    | {type: 'columnsReset'; columnIds: string[]};

const emptyColumnState: IKanbanColumnState = {cards: [], count: 0, isLoadingMore: false};

/**
 * Pure state of the per-column kanban loading. Cards are owned here (not by an Apollo query),
 * appended page by page; the next page offset is always `cards.length`.
 */
export const kanbanColumnsReducer = (state: KanbanColumnsState, action: KanbanColumnsAction): KanbanColumnsState => {
    switch (action.type) {
        case 'reset': {
            return {};
        }
        case 'countsLoaded': {
            // Counts define the column set; cards already loaded for a still-existing column are kept.
            return Object.entries(action.countByColumnId).reduce<KanbanColumnsState>((acc, [columnId, count]) => {
                acc[columnId] = {...(state[columnId] ?? emptyColumnState), count};

                return acc;
            }, {});
        }
        case 'cardsLoadStarted': {
            return {
                ...state,
                [action.columnId]: {...(state[action.columnId] ?? emptyColumnState), isLoadingMore: true},
            };
        }
        case 'cardsLoaded': {
            const columnState = state[action.columnId] ?? emptyColumnState;
            const loadedCardIds = new Set(columnState.cards.map(existingCard => existingCard.itemId));
            const appendedCards = action.cards.filter(pageCard => !loadedCardIds.has(pageCard.itemId));

            return {
                ...state,
                [action.columnId]: {
                    ...columnState,
                    cards: [...columnState.cards, ...appendedCards],
                    isLoadingMore: false,
                    // Sticky until the column reloads from scratch (reset/columnsReset): once the server
                    // returned a short page, later loadMore calls could only replay the same dead offset.
                    isExhausted: columnState.isExhausted || action.isLastPage,
                },
            };
        }
        case 'cardsLoadFailed': {
            return {
                ...state,
                [action.columnId]: {...(state[action.columnId] ?? emptyColumnState), isLoadingMore: false},
            };
        }
        case 'cardMoved': {
            // Optimistic reconciliation of a drag & drop write on the per-column path: the card leaves its
            // source column and joins the target, keeping both cards and counts consistent (the overlay is
            // presentation-only and would otherwise leave stale counts until the next view change).
            if (action.fromColumnId === action.toColumnId) {
                return state;
            }

            const fromState = state[action.fromColumnId] ?? emptyColumnState;
            const toState = state[action.toColumnId] ?? emptyColumnState;

            const remainingFromCards = fromState.cards.filter(
                existingCard => existingCard.itemId !== action.card.itemId,
            );
            const wasInFrom = remainingFromCards.length !== fromState.cards.length;
            const isAlreadyInTo = toState.cards.some(existingCard => existingCard.itemId === action.card.itemId);

            return {
                ...state,
                [action.fromColumnId]: {
                    ...fromState,
                    cards: remainingFromCards,
                    count: wasInFrom ? Math.max(0, fromState.count - 1) : fromState.count,
                },
                [action.toColumnId]: {
                    ...toState,
                    cards: isAlreadyInTo ? toState.cards : [...toState.cards, action.card],
                    count: isAlreadyInTo ? toState.count : toState.count + 1,
                },
            };
        }
        case 'columnsReset': {
            // Clears the cards of specific columns (keeping their count) so they can be reloaded from
            // the server in isolation — used to recover the source and target columns after a move the
            // engine refused, without resetting the whole board.
            return action.columnIds.reduce<KanbanColumnsState>(
                (acc, columnId) => {
                    const columnState = acc[columnId];
                    if (columnState) {
                        acc[columnId] = {...columnState, cards: [], isLoadingMore: true, isExhausted: false};
                    }

                    return acc;
                },
                {...state},
            );
        }
        default: {
            return state;
        }
    }
};
