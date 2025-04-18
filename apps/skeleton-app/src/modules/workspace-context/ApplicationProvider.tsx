// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useGetApplicationSkeletonSettingsQuery} from '../../__generated__';
import {useGetWorkspacesAndPanels} from './useGetWorkspacesAndPanels';
import {createContext, Dispatch, FunctionComponent, SetStateAction, useState} from 'react';
import {IApplication, Panel, IWorkspace} from 'modules/ApplicationRouting/types';

export const ApplicationContext = createContext<{
    application: IApplication;
    currentPanel: Panel;
    currentWorkspace: IWorkspace;
    currentParentTuple: [Panel, IWorkspace] | undefined;
    setCurrentPanelId: Dispatch<SetStateAction<string | null>>;
}>({
    application: null,
    currentPanel: null,
    currentWorkspace: null,
    currentParentTuple: undefined,
    setCurrentPanelId: () => {
        throw new Error('setCurrentPanelId not implemented');
    }
});

export const ApplicationProvider: FunctionComponent = ({children}) => {
    const [currentPanelId, setCurrentPanelId] = useState<string | null>(null);
    const {data} = useGetApplicationSkeletonSettingsQuery();
    const application = data?.applications?.list[0].settings ?? null;
    const {currentPanel, currentWorkspace, currentParentTuple} = useGetWorkspacesAndPanels(application, currentPanelId);

    return (
        <ApplicationContext.Provider
            value={{
                application,
                currentPanel,
                currentWorkspace,
                currentParentTuple,
                setCurrentPanelId
            }}
        >
            {children}
        </ApplicationContext.Provider>
    );
};
