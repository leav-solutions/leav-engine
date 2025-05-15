// hooks/useDatasetObserver.ts
import {useEffect, useState, RefObject} from 'react';

/**
 * Observe a `data-*` attribute on a DOM element and sync it with local state.
 * @param ref - The element to observe
 * @param key - The dataset key (e.g., "isOpen" for data-is-open)
 * @param fallback - The default value if the dataset is undefined
 * @returns current boolean or value of the dataset[key]
 */
export function useDatasetObserver<T>(ref: RefObject<HTMLElement>, key: string, fallback: string | boolean): T {
    const parseVal = (val: string) => {
        if (val === 'true') {
            return true;
        } else if (val === 'false') {
            return false;
        }
        return val;
    };

    const [value, setValue] = useState(() => {
        const raw = ref.current?.dataset?.[key];
        const val = parseVal(raw);
        return val !== undefined ? val : fallback;
    });

    useEffect(() => {
        const el = ref.current;
        if (!el) {
            return;
        }

        const datasetKey = `data-${key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`;

        const observer = new MutationObserver(() => {
            const current = el.dataset?.[key];
            setValue(() => parseVal(current));
        });

        observer.observe(el, {
            attributes: true,
            attributeFilter: [datasetKey]
        });

        return () => observer.disconnect();
    }, [ref, key]);

    return value as T;
}
