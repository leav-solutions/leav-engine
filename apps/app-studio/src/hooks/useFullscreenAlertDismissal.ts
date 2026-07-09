import {useCallback, useState} from 'react';

const STORAGE_KEY = 'fullscreenAlertDismissed';

/**
 * Handles the display of the fullscreen alert.
 * The flag is persisted to `localStorage` on dismissal; once set,
 * `isDismissed` stays `true` for every subsequent session.
 */
export const useFullscreenAlertDismissal = () => {
    const [isDismissed, setIsDismissed] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');

    const dismiss = useCallback(() => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setIsDismissed(true);
    }, []);

    return {isDismissed, dismiss};
};
