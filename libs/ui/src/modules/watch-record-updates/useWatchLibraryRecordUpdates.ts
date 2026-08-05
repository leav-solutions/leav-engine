import {useEffect, useMemo, useRef} from 'react';
import {useRecordUpdateLightSubscription} from '_ui/_gqlTypes';
import {classifyRecordUpdateEvent} from './classifyRecordUpdateEvent';
import {type IWatchLibraryRecordUpdatesParams} from './_types';

const DEFAULT_DEBOUNCE_MS = 300;

/**
 * Watches a whole library through the light `recordUpdate` subscription (record id + touched
 * attribute ids, no business data) and tells the consumer, debounced, either that visible
 * records were touched or that the library's visible content may have changed (a record
 * switched `active`: creation, activation, deactivation).
 *
 * The debounce collapses event storms — a mass (de)activation or an import emits one event
 * per record — into a single flush. Callback rejections are swallowed: the trigger is another
 * user's action, there is nothing for the current user to retry.
 */
export const useWatchLibraryRecordUpdates = ({
    libraryId,
    skip,
    visibleRecordIds,
    shouldIgnoreEvent,
    onVisibleRecordsTouched,
    onListContentMaybeChanged,
    debounceMs = DEFAULT_DEBOUNCE_MS,
}: IWatchLibraryRecordUpdatesParams) => {
    // Everything the subscription's onData reads goes through refs, so consumers can pass
    // fresh arrays/closures on every render without tearing down the websocket subscription.
    const visibleRecordIdsRef = useRef(visibleRecordIds);
    visibleRecordIdsRef.current = visibleRecordIds;
    const shouldIgnoreEventRef = useRef(shouldIgnoreEvent);
    shouldIgnoreEventRef.current = shouldIgnoreEvent;
    const onVisibleRecordsTouchedRef = useRef(onVisibleRecordsTouched);
    onVisibleRecordsTouchedRef.current = onVisibleRecordsTouched;
    const onListContentMaybeChangedRef = useRef(onListContentMaybeChanged);
    onListContentMaybeChangedRef.current = onListContentMaybeChanged;

    const pendingRef = useRef<{touchedVisibleIds: Set<string>; isListContentDirty: boolean}>({
        touchedVisibleIds: new Set(),
        isListContentDirty: false,
    });
    const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const _flush = () => {
        flushTimerRef.current = null;
        const {touchedVisibleIds, isListContentDirty} = pendingRef.current;
        pendingRef.current = {touchedVisibleIds: new Set(), isListContentDirty: false};

        // A full content reload also refreshes the touched visible records: never do both.
        const callbackResult = isListContentDirty
            ? onListContentMaybeChangedRef.current()
            : onVisibleRecordsTouchedRef.current([...touchedVisibleIds]);

        // Swallow rejections (e.g. transient network error on a refetch): the data stays
        // stale until the next event, and there is no user action to retry.
        Promise.resolve(callbackResult).catch(() => undefined);
    };

    // A fresh object literal each render would tear down and re-open the subscription.
    const variables = useMemo(() => ({filters: {libraries: [libraryId]}}), [libraryId]);

    useRecordUpdateLightSubscription({
        skip: skip || !libraryId,
        variables,
        onData: ({data: subscriptionResult}) => {
            const recordUpdate = subscriptionResult.data?.recordUpdate;
            if (!recordUpdate) {
                return;
            }

            const recordId = recordUpdate.record.id;
            if (shouldIgnoreEventRef.current?.(recordId)) {
                return;
            }

            const classification = classifyRecordUpdateEvent({
                recordId,
                updatedAttributeIds: recordUpdate.updatedValues.map(({attribute}) => attribute),
                visibleRecordIds: visibleRecordIdsRef.current ?? [],
            });

            if (classification === 'irrelevant') {
                return;
            }

            if (classification === 'visibleRecordTouched') {
                pendingRef.current.touchedVisibleIds.add(recordId);
            } else {
                pendingRef.current.isListContentDirty = true;
            }

            // Trailing debounce: reset the timer on every relevant event, flush once quiet.
            if (flushTimerRef.current !== null) {
                clearTimeout(flushTimerRef.current);
            }
            flushTimerRef.current = setTimeout(_flush, debounceMs);
        },
    });

    useEffect(
        () => () => {
            if (flushTimerRef.current !== null) {
                clearTimeout(flushTimerRef.current);
            }
        },
        [],
    );
};
