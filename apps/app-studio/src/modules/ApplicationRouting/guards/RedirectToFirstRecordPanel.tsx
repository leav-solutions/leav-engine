import {type FunctionComponent} from 'react';
import {generatePath, Navigate} from 'react-router-dom';
import {useRouteParams} from '../router/useRouteParams';
import {useApplicationSettingsContext} from '../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {retrievePanelDetails} from '../utils/retrievePanelDetails';
import {AbsolutePaths} from '../router/paths';

export const RedirectToFirstRecordPanel: FunctionComponent = () => {
    const [application] = useApplicationSettingsContext();
    const {workspaceId, panelId, recordId, where} = useRouteParams();

    const {libraryId} = retrievePanelDetails({application, panelId});

    if (!libraryId) {
        console.error(`Library not found for panel with id ${panelId}`);
        return <Navigate replace to={AbsolutePaths.notFound} />;
    }

    const panelRecordId = application.libraries[libraryId]?.recordPanels?.[0]?.id;

    if (!panelRecordId) {
        console.error(`No record panel found for library with id ${libraryId}`);
        return <Navigate replace to={AbsolutePaths.notFound} />;
    }

    return (
        <Navigate
            replace
            to={generatePath(AbsolutePaths.recordPanel, {
                workspaceId,
                panelId,
                recordId,
                where: where ?? 'fullpage',
                recordPanelId: panelRecordId,
            })}
        />
    );
};
