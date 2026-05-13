import {type FunctionComponent} from 'react';
import {Navigate, useParams} from 'react-router-dom';
import {retrievePanelDetails} from '../utils/retrievePanelDetails';
import {useApplicationSettingsContext} from '../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {RelativePaths} from '../router/paths';

export const RedirectToPreviousPanel: FunctionComponent = ({children}) => {
    const [application] = useApplicationSettingsContext();
    const {workspaceId, panelId, recordId, where, recordPanelId, flapRecordId, flapLibraryId, flapPanelId} =
        useParams();

    const {currentPanel} = retrievePanelDetails({application, recordPanelId, panelId});

    return currentPanel === null && !flapRecordId && !flapLibraryId && !flapPanelId ? (
        <Navigate to={RelativePaths.closeCurrentPanel} relative="path" replace />
    ) : (
        <>{children}</>
    );
};
