import {useContext} from 'react';
import {IFrameMessengerClientContext} from './IFrameMessengerClientContext';

export const useIFrameMessengerClient = () => {
    const context = useContext(IFrameMessengerClientContext);
    if (!context) {
        throw new Error('IframeMessengerClientContext must be used within an IframeMessengerClient');
    }
    return context;
};
