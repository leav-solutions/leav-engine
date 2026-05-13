import {createContext} from 'react';
import {type useIFrameMessenger} from '../useIFrameMessenger/useIFrameMessenger';

type IframeMessengerContextType = ReturnType<typeof useIFrameMessenger>;

export const IframeMessengerClientContext = createContext<IframeMessengerContextType | null>(null);
