// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {PanelContent} from './content/PanelContent';
import {type AddPanel, type ApplicationMatchingContextWithoutFullpageParentTuple} from '../types';
import {useOutletContext} from 'react-router-dom';

interface IPopupPanelProps {
    addPanel: AddPanel;
}

export const PopupPanel: FunctionComponent<IPopupPanelProps> = ({addPanel}) => {
    const {currentPopupPanel, currentWorkspace, recordId} =
        useOutletContext<ApplicationMatchingContextWithoutFullpageParentTuple>();

    return (
        <PanelContent panel={currentPopupPanel} workspace={currentWorkspace} addPanel={addPanel} recordId={recordId} />
    );
};
