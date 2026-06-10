import {KitSidePanel} from 'aristid-ds';
import {useParams} from 'react-router-dom';
import {usePanelEventHandlers} from '@leav/ui';
import {PanelViewSettings} from './content/panel-view-settings/PanelViewSettings';
import {useApplicationSettingsContext} from '../../config/application-instance/application-settings/useApplicationSettingsContext';
import {retrievePanelDetails} from './utils/retrievePanelDetails';
import {updatePanelViewSettingsInApplication} from './utils/updatePanelViewSettingsInApplication';
import {type AppStudioInternalEvent} from './types';

export const ViewSettingsContainer = () => {
    const [application, setApplication] = useApplicationSettingsContext();
    const {workspaceId, panelId, recordId, where, recordPanelId} = useParams();

    const {currentPanel, libraryId, panelType} = retrievePanelDetails({application, recordPanelId, panelId});

    usePanelEventHandlers<AppStudioInternalEvent>({
        'view-settings-select-view': ({viewId}) => {
            if (currentPanel === null || libraryId === null || panelType === null || currentPanel.type !== 'explorer') {
                return;
            }
            setApplication(prev =>
                updatePanelViewSettingsInApplication(
                    prev,
                    {libraryId, panelType, panelId: currentPanel.id},
                    {
                        isViewSettingsActive: true,
                        selectedTab: currentPanel.selectedTab,
                        currentViewId: viewId,
                        targetLibraryId: currentPanel.targetLibraryId,
                    },
                ),
            );
        },
    });

    if (currentPanel === null || libraryId === null || panelType === null || currentPanel.type !== 'explorer') {
        return null;
    }

    const resetViewSettings = () => {
        setApplication(prev =>
            updatePanelViewSettingsInApplication(
                prev,
                {libraryId, panelType, panelId: currentPanel.id},
                {
                    isViewSettingsActive: false,
                    selectedTab: undefined,
                    currentViewId: undefined,
                    targetLibraryId: undefined,
                },
            ),
        );
    };

    return (
        <KitSidePanel
            closable={false}
            closeOnEsc
            initialOpen={true}
            size="l"
            useChildrenOnly={true}
            onCloseAfterAnimation={resetViewSettings}
        >
            <PanelViewSettings
                libraryId={currentPanel.targetLibraryId}
                currentTab={currentPanel.selectedTab}
                currentViewId={currentPanel.currentViewId}
                onClose={resetViewSettings}
            />
        </KitSidePanel>
    );
};
