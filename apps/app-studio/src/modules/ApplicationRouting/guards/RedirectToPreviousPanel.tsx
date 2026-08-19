import {type FunctionComponent, type PropsWithChildren} from 'react';
import {Navigate} from 'react-router-dom';
import {useRouteParams} from '../router/useRouteParams';
import {retrievePanelDetails} from '../utils/retrievePanelDetails';
import {useApplicationSettingsContext} from '../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {RelativePaths} from '../router/paths';

export const RedirectToPreviousPanel: FunctionComponent<PropsWithChildren> = ({children}) => {
    const [application] = useApplicationSettingsContext();
    const {panelId, recordPanelId, flapRecordId, flapLibraryId, flapPanelId} = useRouteParams();

    const {currentPanel} = retrievePanelDetails({application, recordPanelId, panelId});

    return currentPanel === null && !flapRecordId && !flapLibraryId && !flapPanelId ? (
        <Navigate to={RelativePaths.closeCurrentPanel} relative="path" replace />
    ) : (
        <>{children}</>
    );
};
