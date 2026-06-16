import {type FunctionComponent, useRef} from 'react';
import {Explorer, ExplorerV2} from '@leav/ui';
import {RootLayout} from './RootLayout';

export const InitLayout: FunctionComponent = ({children}) => {
    const explorerContainerRef = useRef<HTMLDivElement>(null);

    return (
        <RootLayout ref={explorerContainerRef}>
            <Explorer.EditSettingsContextProvider panelElement={() => explorerContainerRef.current}>
                <ExplorerV2.EditSettingsContextProvider panelElement={() => explorerContainerRef.current}>
                    {children}
                </ExplorerV2.EditSettingsContextProvider>
            </Explorer.EditSettingsContextProvider>
        </RootLayout>
    );
};
