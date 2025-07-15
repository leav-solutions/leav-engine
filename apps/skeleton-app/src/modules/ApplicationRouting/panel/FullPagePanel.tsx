// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {AddPanel, ApplicationMatchingContextWithoutParentTuple} from '../types';
import {PanelContent} from '../PanelContent';
import {Outlet, useLocation, useOutletContext, useParams} from 'react-router-dom';

interface IFullPagePanelProps {
    addPanel: AddPanel;
}

export const FullPagePanel: FunctionComponent<IFullPagePanelProps> = ({addPanel}) => {
    const {currentPanel, currentPopupPanel, currentWorkspace} =
        useOutletContext<ApplicationMatchingContextWithoutParentTuple>();

    const {search} = useLocation();
    const params = useParams();
    const searchParams = new URLSearchParams(search);

    console.log('FullPagePanel', params);

    return (
        <>
            <PanelContent panel={currentPanel} workspace={currentWorkspace} addPanel={addPanel} />
            <Outlet context={{currentPanel, currentPopupPanel, currentWorkspace}} />
        </>
    );
};
