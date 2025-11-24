// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent, useContext} from 'react';
import {LangContext} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {useParams} from 'react-router-dom';
import {useApplicationSettingsContext} from '../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {retrievePanelDetails} from '../utils/retrievePanelDetails';
import {LibraryIdCard} from './LibraryIdCard';
import {RecordIdCard} from './RecordIdCard';
import {KitSpace} from 'aristid-ds';
import {panelHeaderActionPositionRight} from './panelHeader.module.css';
import {ExpandCollapseCurrentPanelButton} from './ExpandCollapseCurrentPanelButton';
import {ToggleFlapButton} from './ToggleFlapButton';
import {FLAP_THREAD_PANEL_ID, FLAP_INFO_AND_HISTORY_PANEL_ID} from '../../../constants';
import cn from 'classnames';

export const PanelHeader: FunctionComponent<{
    enabled: boolean;
    currentRecordId?: string;
    hideExpandCollapseButton?: boolean;
    actionPosition?: 'left' | 'right';
}> = ({enabled, currentRecordId, hideExpandCollapseButton = false, actionPosition = 'left'}) => {
    const [application] = useApplicationSettingsContext();
    const {lang} = useContext(LangContext);
    const {workspaceId, panelId, recordId, where, recordPanelId} = useParams();
    const {libraryId, panelType, currentPanel} = retrievePanelDetails({application, recordPanelId, panelId});

    const isLibraryPanel = panelType === 'libraryPanels';
    const isFullpagePanel = !where || where === 'fullpage';

    if (!enabled) {
        return null;
    }

    return (
        <KitSpace
            className={cn({
                [panelHeaderActionPositionRight]: actionPosition === 'right',
            })}
            direction="horizontal"
            align="center"
        >
            {isLibraryPanel ? (
                <LibraryIdCard
                    libraryId={libraryId}
                    title={localizedTranslation(currentPanel.name, lang)}
                    avatarSize="l"
                />
            ) : (
                <RecordIdCard libraryId={libraryId} currentRecordId={currentRecordId ?? recordId} avatarSize="l" />
            )}
            {!isLibraryPanel && (
                <KitSpace direction="horizontal">
                    <ToggleFlapButton targetFlapPanelId={FLAP_INFO_AND_HISTORY_PANEL_ID} libraryId={libraryId} />
                    <ToggleFlapButton targetFlapPanelId={FLAP_THREAD_PANEL_ID} libraryId={libraryId} />
                    {!isFullpagePanel && !hideExpandCollapseButton && <ExpandCollapseCurrentPanelButton />}
                </KitSpace>
            )}
        </KitSpace>
    );
};
