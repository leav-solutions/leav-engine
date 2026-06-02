import {createContext} from 'react';
import {type usePanelMessenger} from '_ui/hooks/usePanelMessenger/usePanelMessenger';

type IframeMessengerContextType = ReturnType<typeof usePanelMessenger>;

export const IFrameMessengerClientContext = createContext<IframeMessengerContextType | null>(null);
