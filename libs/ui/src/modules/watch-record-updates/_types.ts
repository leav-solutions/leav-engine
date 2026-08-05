export interface IWatchLibraryRecordUpdatesParams {
    libraryId: string;
    /** When true, no subscription is opened at all. */
    skip: boolean;
    /**
     * Ids of the records currently displayed by the consumer (table page, kanban cards…).
     * Read at event time: passing a fresh array on each render is fine.
     */
    visibleRecordIds?: string[];
    /**
     * Return true to swallow an event before classification — e.g. the echo of a write this
     * client just made and already reconciled optimistically (kanban drag & drop).
     */
    shouldIgnoreEvent?: (recordId: string) => boolean;
    /**
     * Called (debounced) with the visible records touched since the last flush. The payload
     * carries no data: fetch the fresh records through a query, which enforces permissions.
     */
    onVisibleRecordsTouched: (recordIds: string[]) => void | Promise<unknown>;
    /**
     * Called (debounced) when a record NOT currently visible switched `active`: a record
     * appeared in (creation, activation) or disappeared from (deactivation) the library's
     * visible content, so the consumer's list/board/count may have changed. Takes precedence
     * over onVisibleRecordsTouched in a flush: a full reload also refreshes visible records.
     */
    onListContentMaybeChanged: () => void | Promise<unknown>;
    /** Trailing debounce applied before flushing accumulated events. */
    debounceMs?: number;
}
