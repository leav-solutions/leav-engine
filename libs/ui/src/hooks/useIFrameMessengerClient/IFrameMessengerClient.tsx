import {type FunctionComponent, type ReactNode, useEffect} from 'react';
import {useIFrameMessenger} from '../useIFrameMessenger/useIFrameMessenger';
import {IframeMessengerClientContext} from './iFrameMessengerClientContext';

interface IFrameMessengerClientProps {
    children: ReactNode;
    id?: string;
}

export const IFrameMessengerClient: FunctionComponent<IFrameMessengerClientProps> = ({children, id}) => {
    const iFrameMessenger = useIFrameMessenger({id});

    useEffect(() => () => iFrameMessenger.unregister(), []);

    if (!iFrameMessenger.isRegistered) {
        return null;
    }

    return (
        <IframeMessengerClientContext.Provider value={iFrameMessenger}>
            {children}
        </IframeMessengerClientContext.Provider>
    );
};
