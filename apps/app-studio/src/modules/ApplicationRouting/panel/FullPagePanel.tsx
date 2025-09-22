// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {type AddPanel, type ApplicationMatchingContextWithoutFullpageParentTuple} from '../types';
import {PanelContent} from './content/PanelContent';
import {Outlet, useOutletContext} from 'react-router-dom';

interface IFullPagePanelProps {
    addPanel: AddPanel;
}

export const FullPagePanel: FunctionComponent<IFullPagePanelProps> = ({addPanel}) => {
    const {
        currentWorkspace,
        recordId,
        currentFullpagePanel,
        currentPopupPanel,
        currentSliderPanel,
        currentPopupParentTuple,
        currentSliderParentTuple
    } = useOutletContext<ApplicationMatchingContextWithoutFullpageParentTuple>();

    return (
        <>
            <PanelContent
                panel={currentFullpagePanel}
                workspace={currentWorkspace}
                addPanel={addPanel}
                recordId={recordId}
            />
            <Outlet
                context={{
                    currentWorkspace,
                    currentFullpagePanel,
                    currentPopupPanel,
                    currentSliderPanel,
                    currentPopupParentTuple,
                    currentSliderParentTuple
                }}
            />
        </>
    );
};
