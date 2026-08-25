import {useCallback, useEffect, useMemo, useState} from 'react';
import {type AttributesPropertiesById, type IItemData} from '../_types';
import {getValueKeys} from './getValueKeys';

/** The expected option keys of ONE record, by attribute id — the very object handed to the item as
 *  `optimisticSplitKeys`, hence kept stable as long as its content does not change. */
type OverlayEntry = {[attributeId: string]: string[]};

const _sameKeySet = (a: string[], b: string[]): boolean => a.length === b.length && a.every(key => b.includes(key));

export interface IOptimisticSplitValues {
    /** The rows to hand to the table: the loaded records, with the overlay merged INTO the touched
     *  ones. Untouched rows keep their identity, so only the clicked one redraws its split cells. */
    items: IItemData[];
    /** Records the EXPECTED keys for a cell right after issuing a write, before the server confirms it. */
    setOptimisticKeys: (item: IItemData, attributeId: string, keys: string[]) => void;
    /** Drops the overlay entry for a cell — the rollback of a refused write (falls back to server data,
     *  which never changed). */
    clearOptimisticKeys: (item: IItemData, attributeId: string) => void;
}

/**
 * Optimistic layer over the loaded records: `Map<recordId, {[attributeId]: string[]}>` holding the
 * EXPECTED option keys of the cells being written.
 *
 * ⚠️ The overlay is **merged into the data** rather than read beside it: `items` is the record list
 * with `optimisticSplitKeys` set on the touched rows only. That is what makes a toggle observable
 * through `(record, prevRecord)` — the only thing antd's `shouldCellUpdate` ever sees — so the split
 * sub-columns can compare instead of forcing `true` and redrawing every cell of every split column
 * (rows × sub-columns) on every render. Reads go through `getSelectedKeys(item, attribute)`.
 *
 * Reconciliation: an effect on `dataGroupedFilteredSorted` (the SERVER data, never `items`) drops every
 * entry whose expected set now equals the set derived from the fresh data. The fresh data comes on its
 * own — `useExplorerData` watches record updates and refetches the touched record in place — so NO
 * manual `refetch()` is triggered after a write. An entry that never reconciles simply stays, which is
 * harmless: it holds the value we successfully wrote.
 */
export const useOptimisticSplitValues = (
    dataGroupedFilteredSorted: IItemData[],
    attributesProperties: AttributesPropertiesById,
): IOptimisticSplitValues => {
    const [overlay, setOverlay] = useState<Map<string, OverlayEntry>>(new Map());

    useEffect(() => {
        setOverlay(previous => {
            if (previous.size === 0) {
                return previous;
            }

            let next = previous;

            for (const item of dataGroupedFilteredSorted) {
                const entry = previous.get(item.itemId);
                if (!entry) {
                    continue;
                }

                const remaining: OverlayEntry = {};
                let hasReconciled = false;

                for (const [attributeId, expectedKeys] of Object.entries(entry)) {
                    const attribute = attributesProperties[attributeId];
                    const actualKeys = attribute ? getValueKeys(item.propertiesById[attributeId], attribute) : null;

                    if (actualKeys && _sameKeySet(expectedKeys, actualKeys)) {
                        hasReconciled = true;
                    } else {
                        remaining[attributeId] = expectedKeys;
                    }
                }

                if (!hasReconciled) {
                    continue;
                }

                if (next === previous) {
                    next = new Map(previous);
                }

                if (Object.keys(remaining).length === 0) {
                    next.delete(item.itemId);
                } else {
                    next.set(item.itemId, remaining);
                }
            }

            return next;
        });
    }, [dataGroupedFilteredSorted, attributesProperties]);

    // An empty overlay — the normal state of the table — hands back the very array it was given: no
    // copy, no new identity, nothing for antd to diff.
    const items = useMemo(
        () =>
            overlay.size === 0
                ? dataGroupedFilteredSorted
                : dataGroupedFilteredSorted.map(item => {
                      const optimisticSplitKeys = overlay.get(item.itemId);
                      return optimisticSplitKeys ? {...item, optimisticSplitKeys} : item;
                  }),
        [dataGroupedFilteredSorted, overlay],
    );

    const setOptimisticKeys = useCallback((item: IItemData, attributeId: string, keys: string[]) => {
        setOverlay(previous => new Map(previous).set(item.itemId, {...previous.get(item.itemId), [attributeId]: keys}));
    }, []);

    const clearOptimisticKeys = useCallback((item: IItemData, attributeId: string) => {
        setOverlay(previous => {
            const entry = previous.get(item.itemId);
            if (!entry || !(attributeId in entry)) {
                return previous;
            }

            const remaining = {...entry};
            delete remaining[attributeId];

            const next = new Map(previous);
            if (Object.keys(remaining).length === 0) {
                next.delete(item.itemId);
            } else {
                next.set(item.itemId, remaining);
            }
            return next;
        });
    }, []);

    return {items, setOptimisticKeys, clearOptimisticKeys};
};
