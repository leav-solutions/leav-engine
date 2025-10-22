// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {generatePath, Navigate, useParams} from 'react-router-dom';
import {useApplicationSettingsContext} from '../../../config/application-instance/application-settings/ApplicationSettingsContext';
import {retrievePanelDetails} from '../utils/retrievePanelDetails';
import {AbsolutePaths} from '../router/paths';

export const RedirectToFirstRecordPanel: FunctionComponent = () => {
    const [application] = useApplicationSettingsContext();
    const {workspaceId, panelId, recordId} = useParams();

    const {libraryId} = retrievePanelDetails({application, panelId});

    const panelRecordId = application.libraries[libraryId].recordPanels[0].id;

    return (
        <Navigate
            replace
            to={generatePath(AbsolutePaths.recordPanel, {
                workspaceId,
                panelId,
                recordId,
                where: 'fullpage',
                recordPanelId: panelRecordId
            })}
        />
    );
};
