import {type IExplorerData, type IItemData, type IKanbanDataSource} from '../_types';
import {type KanbanColumnsState} from './kanbanColumnsReducer';

export interface IKanbanColumnsDataOptions {
    dataSource: IKanbanDataSource | undefined;
    axisAttributeId: string | undefined;
    /**
     * How long (ms) a self-write keeps swallowing its own recordUpdate echoes. Defaults to
     * KANBAN_SELF_WRITE_ECHO_WINDOW_MS; overridable so tests can exercise the window's expiry fast.
     */
    selfWriteEchoWindowMs?: number;
}

export interface IKanbanColumnsData {
    isInitialLoading: boolean;
    /**
     * True from a board reset (view change or external record update) until the fresh counts land.
     * Lets consumers freeze the values they derive from `columnStatesById` (results count, visible
     * keys) during the reload window instead of flickering to 0/empty.
     */
    isReloading: boolean;
    attributesProperties: IExplorerData['attributes'];
    columnStatesById: KanbanColumnsState;
    loadMore: (columnId: string) => void;
    /** Optimistically reflects a successful drag & drop write in the column states (cards + counts). */
    applyCardMove: (params: {card: IItemData; fromColumnId: string; toColumnId: string}) => void;
    /**
     * Flags a record as being written by the current client (a drag & drop), so the recordUpdate
     * subscription recognises its own echo(es) and skips the full board reset+reload — the move is
     * already reconciled optimistically. The flag suppresses EVERY echo of that record for a bounded
     * window, then auto-expires so a later genuine external update to it is not swallowed.
     */
    markSelfWrite: (recordId: string) => void;
    /** Drops a pending self-write flag when the write failed and no subscription echo will arrive. */
    clearSelfWrite: (recordId: string) => void;
    /** Refreshes only the given columns from the server (used to recover the two columns after a failed move). */
    reloadColumns: (columnIds: string[]) => void;
}
