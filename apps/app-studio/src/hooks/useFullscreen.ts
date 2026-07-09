import {useCallback, useEffect, useSyncExternalStore} from 'react';

/**
 * Plein écran « CSS » (pas l'API Fullscreen native du navigateur).
 *
 * L'API native place uniquement le sous-arbre de l'élément dans le top layer : les portails de
 * l'app-studio (dropdowns/tooltips/modales du design system, portails de l'Explorer montés sur
 * `document.body`) sortent de cet élément et deviennent invisibles/non cliquables. On bascule donc
 * une simple classe CSS (`position: fixed`) sur le panneau, ce qui garde tout le DOM et les portails
 * fonctionnels.
 *
 * Le store retient l'**id du panneau** en plein écran : ainsi le panneau reste en plein écran
 * quand un panneau enfant s'ouvre par-dessus.
 */
let fullscreenPanelId: string | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach(listener => listener());

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

const getSnapshot = () => fullscreenPanelId;

const setFullscreenPanelId = (panelId: string | null) => {
    if (fullscreenPanelId === panelId) {
        return;
    }
    fullscreenPanelId = panelId;
    emit();
};

export const useFullscreen = () => {
    const activePanelId = useSyncExternalStore(subscribe, getSnapshot);

    const enterFullscreen = useCallback((panelId: string) => setFullscreenPanelId(panelId), []);
    const exitFullscreen = useCallback(() => setFullscreenPanelId(null), []);

    useEffect(() => {
        if (activePanelId === null) {
            return;
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setFullscreenPanelId(null);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [activePanelId]);

    return {fullscreenPanelId: activePanelId, enterFullscreen, exitFullscreen};
};
