import {useCallback, useContext, useEffect, type RefObject} from 'react';
import {IFrameMessengerContext} from './iFrameMessengerContext';
import {encodeMessage} from './messageHandlers';
import {type ChangeLanguageMessage, type IUseIFrameMessengerOptions} from './types';

/**
 * Per-iframe hook for `PanelCustom`. Registers the iframe's handlers into the singleton
 * `IFrameMessengerProvider` and cleans them up on unmount.
 *
 * Returns `changeLangInFrame` which posts `change-language` directly to this specific iframe's
 * `contentWindow` — intentionally NOT using the shared registry to avoid broadcasting the language
 * change to all other open iframes (which would cause unintended refreshes).
 */
export const useIFrameMessengerHandlers = (
    iframeRef: RefObject<HTMLIFrameElement>,
    handlers: IUseIFrameMessengerOptions['handlers'],
) => {
    const {registerHandlers} = useContext(IFrameMessengerContext);

    // Register on mount, deregister on unmount via the returned cleanup function.
    useEffect(() => registerHandlers(iframeRef, handlers), []);

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

    return {changeLangInFrame};
};
