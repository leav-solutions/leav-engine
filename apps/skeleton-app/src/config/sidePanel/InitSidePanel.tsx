// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useRef} from 'react';
import {SidePanelContext} from './SidePanelContext';
import {SidePanel} from '../../modules/display-sidePanel/SidePanel';

export const InitSidePanel: FunctionComponent = ({children}) => {
    const iFrameRef = useRef<HTMLIFrameElement>(null);

    return (
        <SidePanelContext.Provider value={{iFrameRef}}>
            {children}
            <SidePanel />
        </SidePanelContext.Provider>
    );
};
