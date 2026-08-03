import {type IItemData} from '../_types';

/**
 * A grouping-axis node, projected from the axis tree's root children. A card is matched to its column
 * by the id of the RECORD attached to the tree node (a tree attribute value stores a node, whose payload
 * is that record) — the same key the core uses to filter (`attr.<nodeLib>.id EQUAL nodeRecordId`).
 */
export interface IKanbanAxisNode {
    recordId: string;
    /** Tree node id — the value written on a card when it is dropped on this column (a tree value stores a node id). */
    nodeId: string;
    /** Library of the node's record — trees can mix libraries, so it is carried per node. */
    libraryId: string;
    label: string;
    color: string | null;
}

export interface IKanbanColumn {
    id: string;
    /** Tree node id backing this column; null on the synthetic "no value" column. */
    nodeId: string | null;
    label: string;
    color: string | null;
    cards: IItemData[];
    /** Total records of the column, possibly beyond the loaded cards ("Voir plus" shows while cards.length < count). */
    count: number;
    isLoadingMore: boolean;
    /**
     * The server returned a short/empty page: no more cards to load even though `count` may still say
     * otherwise (counts ignore the fulltext search, V1) — hides "Voir plus". Per-column path only.
     */
    isExhausted?: boolean;
}
