import {useContext} from 'react';
import {IframeMessengerClientContext} from './iFrameMessengerClientContext';

export const useIFrameMessengerClient = () => {
    const context = useContext(IframeMessengerClientContext);
    if (!context) {
        throw new Error('IframeMessengerClientContext must be used within an IframeMessengerClient');
    }
    return context;
};
