// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {WORKSPACE_PANEL_CONTAINER_ID} from '../../constants';
import {workspacePanelContainer} from './workspacePanelContainer.module.css';

export const WorkspacePanelContainer: FunctionComponent = ({children}) => (
    <div id={WORKSPACE_PANEL_CONTAINER_ID} className={workspacePanelContainer}>
        {children}
    </div>
);
