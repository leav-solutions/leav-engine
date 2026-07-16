import {type FunctionComponent, type ReactNode, useEffect} from 'react';
import {usePanelMessenger} from '_ui/hooks/usePanelMessenger/usePanelMessenger';
import {IFrameMessengerClientContext} from './IFrameMessengerClientContext';

interface IFrameMessengerClientProps {
    children: ReactNode;
    id?: string;
}

export const IFrameMessengerClientProvider: FunctionComponent<IFrameMessengerClientProps> = ({children, id}) => {
    const iFrameMessenger = usePanelMessenger({id});

    useEffect(() => () => iFrameMessenger.unregister(), []);

    // A cross-origin iframe swallows keyboard events once focused, so the host never sees Escape. Forward
    // it up so the host can react (e.g. exit fullscreen).
    const {notifyEscape} = iFrameMessenger;
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                notifyEscape();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [notifyEscape]);

    if (!iFrameMessenger.isRegistered) {
        return null;
    }

    return (
        <IFrameMessengerClientContext.Provider value={iFrameMessenger}>
            {children}
        </IFrameMessengerClientContext.Provider>
    );
};
