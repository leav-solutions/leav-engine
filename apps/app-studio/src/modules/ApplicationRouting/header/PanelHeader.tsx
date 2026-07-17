import {type FunctionComponent, useContext} from 'react';
import {LangContext} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {useParams} from 'react-router-dom';
import {useApplicationSettingsContext} from '../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {retrievePanelDetails} from '../utils/retrievePanelDetails';
import {LibraryIdCard} from './id-card/LibraryIdCard';
import {RecordIdCard} from './id-card/RecordIdCard';
import {KitSpace} from 'aristid-ds';
import {panelHeader, panelHeaderTabs, panelHeaderActionPositionRight} from './panelHeader.module.css';
import {PanelDisplayModeSelector} from './action-button/PanelDisplayModeSelector';
import {ToggleFlapButton} from './action-button/ToggleFlapButton';
import {FLAP_THREAD_PANEL_ID, FLAP_INFO_AND_HISTORY_PANEL_ID, BLANK_PANEL_ID} from '../../../constants';
import cn from 'classnames';
import {PanelsTabs} from './tabs/PanelsTabs';

export const PanelHeader: FunctionComponent<{
    currentRecordId?: string;
    currentLibraryId?: string;
    hidePanelDisplayModeSelector?: boolean;
    hidePanelTabs?: boolean;
    actionPosition?: 'left' | 'right';
}> = ({
    currentRecordId,
    currentLibraryId,
    hidePanelDisplayModeSelector = false,
    hidePanelTabs = false,
    actionPosition = 'left',
}) => {
    const [application] = useApplicationSettingsContext();
    const {lang} = useContext(LangContext);
    const {workspaceId, panelId, recordId, where, recordPanelId, flapRecordId, flapLibraryId, flapPanelId} =
        useParams();

    const {libraryId, panelType, currentPanel} = retrievePanelDetails({application, recordPanelId, panelId});

    const isBlankPanel = currentPanel.id === BLANK_PANEL_ID;
    const isLibraryPanel = panelType === 'libraryPanels';
    const isFirstPanel = where === undefined;
    const hasFlapPanel = flapPanelId !== undefined;
    const computedRecordId = isBlankPanel ? flapRecordId : (currentRecordId ?? recordId);
    const computedLibraryId = isBlankPanel ? flapLibraryId : (currentLibraryId ?? libraryId);

    return (
        <div className={panelHeader}>
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
                    <RecordIdCard libraryId={computedLibraryId} currentRecordId={computedRecordId} avatarSize="l" />
                )}
                {!isLibraryPanel && currentPanel.type !== 'creationForm' && (
                    <KitSpace direction="horizontal" size="xxs">
                        <ToggleFlapButton
                            targetFlapPanelId={FLAP_INFO_AND_HISTORY_PANEL_ID}
                            targetRecordId={computedRecordId}
                            targetLibraryId={computedLibraryId}
                            currentPanel={currentPanel}
                            lang={lang}
                        />
                        <ToggleFlapButton
                            targetFlapPanelId={FLAP_THREAD_PANEL_ID}
                            targetRecordId={computedRecordId}
                            targetLibraryId={computedLibraryId}
                            currentPanel={currentPanel}
                            lang={lang}
                        />
                        {!isFirstPanel && !hidePanelDisplayModeSelector && !isBlankPanel && (
                            <PanelDisplayModeSelector />
                        )}
                    </KitSpace>
                )}
            </KitSpace>
            {!hidePanelTabs && (
                <PanelsTabs
                    enabled={!currentPanel.isStandalone}
                    workspaceId={workspaceId}
                    libraryId={libraryId}
                    panelType={panelType}
                    recordId={recordId}
                    hasFlapPanel={hasFlapPanel}
                    where={where}
                    currentPanelId={currentPanel.id}
                    className={panelHeaderTabs}
                />
            )}
        </div>
    );
};
