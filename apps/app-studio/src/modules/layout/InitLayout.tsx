import {type FunctionComponent, type PropsWithChildren, useRef} from 'react';
import {Explorer} from '@leav/ui';
import {RootLayout} from './RootLayout';

export const InitLayout: FunctionComponent<PropsWithChildren> = ({children}) => {
    const explorerContainerRef = useRef<HTMLDivElement>(null);

    return (
        <RootLayout ref={explorerContainerRef}>
            <Explorer.EditSettingsContextProvider panelElement={() => explorerContainerRef.current}>
                {children}
            </Explorer.EditSettingsContextProvider>
        </RootLayout>
    );
};
