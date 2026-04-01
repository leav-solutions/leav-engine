// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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

    if (!iFrameMessenger.ready) {
        return null;
    }

    return (
        <IframeMessengerClientContext.Provider value={iFrameMessenger}>
            {children}
        </IframeMessengerClientContext.Provider>
    );
};
