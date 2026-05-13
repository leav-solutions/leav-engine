import {type FunctionComponent} from 'react';
import {WORKSPACE_PANEL_CONTAINER_ID} from '../../constants';
import {workspacePanelContainer} from './workspacePanelContainer.module.css';

export const WorkspacePanelContainer: FunctionComponent = ({children}) => (
    <div id={WORKSPACE_PANEL_CONTAINER_ID} className={workspacePanelContainer}>
        {children}
    </div>
);
