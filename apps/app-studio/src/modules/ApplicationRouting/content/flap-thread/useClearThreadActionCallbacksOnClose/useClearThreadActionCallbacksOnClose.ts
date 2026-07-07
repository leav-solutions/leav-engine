import {useEffect} from 'react';
import {clearThreadActionCallbacks} from '../../../stores/threadActionCallbacks';

/**
 * Thread action callbacks are not consumed on read: they must be cleared explicitly.
 * Registering happens on navigation (`useNavigateToPanel`); clearing happens here
 * when the thread flap unmounts (close button, esc, navigation away…), which keeps the store from leaking one entry per opened flap.
 */
export const useClearThreadActionCallbacksOnClose = (where: string | undefined): void => {
    useEffect(
        () => () => {
            if (where !== undefined) {
                clearThreadActionCallbacks({where});
            }
        },
        [where],
    );
};
