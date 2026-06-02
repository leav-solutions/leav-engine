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

    if (!iFrameMessenger.isRegistered) {
        return null;
    }

    return (
        <IFrameMessengerClientContext.Provider value={iFrameMessenger}>
            {children}
        </IFrameMessengerClientContext.Provider>
    );
};
