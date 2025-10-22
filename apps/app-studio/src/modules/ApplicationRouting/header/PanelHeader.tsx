// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent, useContext} from 'react';
import {LangContext} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {useParams} from 'react-router-dom';
import {useApplicationSettingsContext} from '../../../config/application-instance/application-settings/ApplicationSettingsContext';
import {retrievePanelDetails} from '../utils/retrievePanelDetails';
import {LibraryIdCard} from './LibraryIdCard';
import {RecordIdCard} from './RecordIdCard';

export const PanelHeader: FunctionComponent<{enabled: boolean; currentRecordId?: string}> = ({
    enabled,
    currentRecordId
}) => {
    const [application] = useApplicationSettingsContext();
    const {lang} = useContext(LangContext);
    const {workspaceId, panelId, recordId, where, recordPanelId} = useParams();

    const {libraryId, panelType, currentPanel} = retrievePanelDetails({application, recordPanelId, panelId});

    const avatarSize = where === 'fullpage' ? 'l' : 'm';

    if (!enabled) {
        return null;
    }

    return panelType === 'libraryPanels' ? (
        <LibraryIdCard
            libraryId={libraryId}
            title={localizedTranslation(currentPanel.name, lang)}
            avatarSize={avatarSize}
        />
    ) : (
        <RecordIdCard libraryId={libraryId} currentRecordId={currentRecordId ?? recordId} avatarSize={avatarSize} />
    );
};
