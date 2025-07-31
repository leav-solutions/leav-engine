// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useContext} from 'react';
import {IframeMessengerClientContext} from './iFrameMessengerClientContext';

export const useIFrameMessengerClient = () => {
    const context = useContext(IframeMessengerClientContext);
    if (!context) {
        throw new Error('IframeMessengerClientContext must be used within an IframeMessengerClient');
    }
    return context;
};
