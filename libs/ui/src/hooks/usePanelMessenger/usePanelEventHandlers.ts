import {useContext, useEffect} from 'react';
import {PanelMessengerContext} from './panelMessengerContext';
import {type InternalEventHandler, type InternalEventMessage} from './types';

type InternalEventHandlerMap<TMessage extends InternalEventMessage> = {
    [K in TMessage['type']]?: (data: Extract<TMessage, {type: K}>['data']) => void;
};

export const usePanelEventHandlers = <TMessage extends InternalEventMessage = InternalEventMessage>(
    handlers?: InternalEventHandlerMap<TMessage>,
) => {
    const {addInternalEventHandler, dispatchToSelf} = useContext(PanelMessengerContext);

    useEffect(() => {
        if (handlers) {
            const unregisters = Object.entries(handlers as Record<string, InternalEventHandler>).map(
                ([type, handler]) => addInternalEventHandler(type, handler),
            );
            return () => unregisters.forEach(unregister => unregister());
        }
    }, []);

    return {
        dispatch: (message: TMessage) => dispatchToSelf(message),
    };
};
