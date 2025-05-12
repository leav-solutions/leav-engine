// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useRef} from 'react';
import {Explorer} from '@leav/ui';
import {SIDEBAR_CONTENT_ID} from '../../constants';
import {RootLayout} from './RootLayout';

export const InitLayout: FunctionComponent = ({children}) => {
    const explorerContainerRef = useRef<HTMLDivElement>(null);

    return (
        <RootLayout ref={explorerContainerRef}>
            <Explorer.EditSettingsContextProvider
                panelElement={() => document.getElementById(SIDEBAR_CONTENT_ID) ?? explorerContainerRef.current}
            >
                {children}
            </Explorer.EditSettingsContextProvider>
        </RootLayout>
    );
};
