// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent, useRef} from 'react';
import {Explorer} from '@leav/ui';
import {RootLayout} from './RootLayout';

export const InitLayout: FunctionComponent = ({children}) => {
    const explorerContainerRef = useRef<HTMLDivElement>(null);

    return (
        <RootLayout ref={explorerContainerRef}>
            <Explorer.EditSettingsContextProvider panelElement={() => explorerContainerRef.current}>
                {children}
            </Explorer.EditSettingsContextProvider>
        </RootLayout>
    );
};
