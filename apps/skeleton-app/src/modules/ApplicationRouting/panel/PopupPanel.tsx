// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {PanelContent} from '../PanelContent';
import {AddPanel, ApplicationMatchingContextWithoutParentTuple} from '../types';
import {useOutletContext} from 'react-router-dom';

interface IPopupPanelProps {
    addPanel: AddPanel;
}

export const PopupPanel: FunctionComponent<IPopupPanelProps> = ({addPanel}) => {
    const {currentPopupPanel, currentWorkspace} = useOutletContext<ApplicationMatchingContextWithoutParentTuple>();

    return <PanelContent panel={currentPopupPanel} workspace={currentWorkspace} addPanel={addPanel} />;
};
