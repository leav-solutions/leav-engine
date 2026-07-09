import {useCallback, useContext, useEffect, useMemo, useRef, type RefObject} from 'react';
import {encodeMessage} from './messageHandlers';
import {type ChangeLanguageMessage, type IUsePanelMessengerOptions, type ViewSettingsUpdateMessage} from './types';
import {PanelMessengerContext} from '_ui/hooks/usePanelMessenger/panelMessengerContext';

/**
 * Per-iframe hook for `PanelCustom`. Registers the iframe's handlers into the singleton
 * `PanelMessengerProvider` and cleans them up on unmount.
 *
 * Returns `changeLangInFrame` which posts `change-language` directly to this specific iframe's
 * `contentWindow` — intentionally NOT using the shared registry to avoid broadcasting the language
 * change to all other open iframes (which would cause unintended refreshes).
 */
export const usePanelIFrameHandlers = (
    iframeRef: RefObject<HTMLIFrameElement>,
    handlers: IUsePanelMessengerOptions['handlers'],
) => {
    const {registerHandlers} = useContext(PanelMessengerContext);

    // Keep the latest handlers in a ref so the registered wrapper never calls a stale closure.
    // Handlers close over reactive state — e.g. `onUpdateView` closes over the current-view hub's
    // `view`, which is null on mount and only becomes the loaded/default view once the async
    // permission (`isAllowed`) and view queries resolve. Registering the raw `handlers` once (empty
    // deps) froze that null-`view` closure, so every later `update-view` was dropped by the
    // `if (!view) return` guard in `useUpdateView` even though the hub already held a view.
    const handlersRef = useRef(handlers);
    handlersRef.current = handlers;

    // A stable proxy registered once: each method delegates to the current handler via the ref.
    // `initClientHandlers` only ever calls `handlers?.onX?.(...)` (optional-chained, return value
    // unused), so forwarding by key is safe. Keys are enumerated from the mount-time handlers (the
    // caller passes a fixed handler shape).
    const stableHandlers = useMemo(
        () =>
            Object.keys(handlers).reduce<Record<string, (...args: unknown[]) => unknown>>((wrapper, key) => {
                wrapper[key] = (...args: unknown[]) =>
                    (handlersRef.current as Record<string, ((...args: unknown[]) => unknown) | undefined>)?.[key]?.(
                        ...args,
                    );
                return wrapper;
            }, {}),
        [],
    );

    // Register the stable wrapper on mount, deregister on unmount via the returned cleanup function.
    useEffect(() => registerHandlers(iframeRef, stableHandlers as IUsePanelMessengerOptions['handlers']), []);

    // Post directly to contentWindow instead of going through the registry,
    // which would broadcast to all registered iframes.
    const changeLangInFrame = useCallback(
        (language: string) => {
            if (iframeRef.current?.contentWindow) {
                const message: ChangeLanguageMessage = {type: 'change-language', language};
                iframeRef.current.contentWindow.postMessage(encodeMessage(message), '*');
            }
        },
        [iframeRef],
    );

    // Push the current serialized view to this specific iframe (host → frame), same direct-post
    // model as `changeLangInFrame`. Used to keep a custom panel (e.g. planning) in sync with the
    // host's current-view hub on load / volet edits / reset / view selection.
    const pushViewSettingsUpdate = useCallback(
        (data: ViewSettingsUpdateMessage['data']) => {
            if (iframeRef.current?.contentWindow) {
                const message: ViewSettingsUpdateMessage = {type: 'view-settings-update', data};
                iframeRef.current.contentWindow.postMessage(encodeMessage(message), '*');
            }
        },
        [iframeRef],
    );

    return {changeLangInFrame, pushViewSettingsUpdate};
};
