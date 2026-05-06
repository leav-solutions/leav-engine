// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useEffect, useRef, useState} from 'react';

const LOADER_SHOW_DELAY_MS = 200;
const LOADER_MIN_DURATION_MS = 300;

/**
 * Prevents loader flickering by applying two UX rules:
 *
 * 1. **Show delay (200 ms)** — if loading ends before 200 ms, the loader is never shown.
 *    Avoids a flash for fast requests.
 *
 * 2. **Minimum display duration (300 ms)** — once the loader has appeared,
 *    it stays visible for at least 300 ms. Avoids a jarring disappearance for slightly slow requests.
 *
 * @param loading - raw loading state (e.g. `queryResult.loading`)
 * @returns `true` only when the loader should be rendered
 *
 * @example
 * const isLoaderVisible = useDelayedLoading(loading);
 * return isLoaderVisible ? <KitLoader /> : <Content />;
 */
export const useDelayedLoading = (loading: boolean): boolean => {
    const loadingStartRef = useRef<number | null>(null);
    const [isLoaderVisible, setIsLoaderVisible] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (loadingStartRef.current === null) {
                return;
            }
            const elapsed = Date.now() - loadingStartRef.current;
            const loaderHasBeenShown = elapsed >= LOADER_SHOW_DELAY_MS;

            if (!loaderHasBeenShown) {
                loadingStartRef.current = null;
                return;
            }

            const remaining = LOADER_SHOW_DELAY_MS + LOADER_MIN_DURATION_MS - elapsed;
            loadingStartRef.current = null;

            if (remaining <= 0) {
                setIsLoaderVisible(false);
            } else {
                const timer = setTimeout(() => setIsLoaderVisible(false), remaining);
                return () => clearTimeout(timer);
            }
            return;
        }

        loadingStartRef.current = Date.now();

        const showTimer = setTimeout(() => setIsLoaderVisible(true), LOADER_SHOW_DELAY_MS);
        return () => clearTimeout(showTimer);
    }, [loading]);

    return isLoaderVisible;
};
