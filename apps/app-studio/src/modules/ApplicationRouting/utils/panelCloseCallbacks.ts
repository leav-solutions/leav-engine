/**
 * The callback is registered when the navigation happens and invoked once
 * when the panel is closed by the user.
 *
 * app-studio stays domain-agnostic: it only forwards a generic "panel closed" signal; it never
 * knows what the opener does with it (e.g. emit a Matomo event).
 */

type PanelCloseCallback = () => void;

const store = new Map<string, PanelCloseCallback>();

export const getPanelCloseCallbackKey = ({
    recordId,
    where,
    recordPanelId,
}: {
    recordId?: string;
    where?: string;
    recordPanelId?: string;
}): string => `${recordId}/${where}/${recordPanelId}`;

export const registerPanelCloseCallback = (keyElements: Record<string, string>, callback: PanelCloseCallback): void => {
    const panelCloseCallbackKey = getPanelCloseCallbackKey(keyElements);
    store.set(panelCloseCallbackKey, callback);
};

export const consumePanelCloseCallback = (keyElements: Record<string, string>): PanelCloseCallback | undefined => {
    const panelCloseCallbackKey = getPanelCloseCallbackKey(keyElements);
    const callback = store.get(panelCloseCallbackKey);
    store.delete(panelCloseCallbackKey);
    return callback;
};
