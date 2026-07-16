import {KitSidePanel} from 'aristid-ds';
import cn from 'classnames';
import {useParams} from 'react-router-dom';
import {usePanelEventHandlers} from '@leav/ui';
import {PanelViewSettings} from './content/panel-view-settings/PanelViewSettings';
import {VoletFiltersProvider} from './content/panel-view-settings/store-current-view/VoletFiltersProvider';
import {useApplicationSettingsContext} from '../../config/application-instance/application-settings/useApplicationSettingsContext';
import {useFullscreen} from '../../hooks/useFullscreen';
import {retrievePanelDetails} from './utils/retrievePanelDetails';
import {
    resetPanelViewSettingsInApplication,
    updatePanelViewSettingsInApplication,
} from './utils/updatePanelViewSettingsInApplication';
import {type AppStudioInternalEvent} from './types';
import {fullscreenVolet} from './viewSettingsContainer.module.css';

export const ViewSettingsContainer = () => {
    const [application, setApplication] = useApplicationSettingsContext();
    const {workspaceId, panelId, recordId, where, recordPanelId} = useParams();
    const {fullscreenPanelId} = useFullscreen();

    const {currentPanel, libraryId, panelType, displayedLibraryId} = retrievePanelDetails({
        application,
        recordPanelId,
        panelId,
    });

    usePanelEventHandlers<AppStudioInternalEvent>({
        'view-settings-select-view': ({viewId}) => {
            if (
                currentPanel === null ||
                libraryId === null ||
                panelType === null ||
                (currentPanel.type !== 'explorer' && currentPanel.type !== 'custom')
            ) {
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

    if (
        currentPanel === null ||
        libraryId === null ||
        panelType === null ||
        (currentPanel.type !== 'explorer' && currentPanel.type !== 'custom')
    ) {
        return null;
    }

    const resetViewSettings = () => {
        setApplication(prev =>
            resetPanelViewSettingsInApplication(prev, {libraryId, panelType, panelId: currentPanel.id}),
        );
    };

    const isCurrentPanelFullscreen = fullscreenPanelId === currentPanel.id;

    return (
        <KitSidePanel
            className={cn({[fullscreenVolet]: isCurrentPanelFullscreen})}
            floating
            closable={false}
            closeOnEsc
            initialOpen={true}
            size="l"
            useChildrenOnly={true}
            onCloseAfterAnimation={resetViewSettings}
        >
            {/* Spoke A: the volet's own filter store, scoped here (descendant of CurrentViewStoreProvider,
                NOT wrapping the explorer). Mounts only while the volet is open. */}
            <VoletFiltersProvider>
                <PanelViewSettings
                    libraryId={displayedLibraryId ?? undefined}
                    currentTab={currentPanel.selectedTab}
                    hiddenTabs={currentPanel.hiddenTabs}
                    onClose={resetViewSettings}
                />
            </VoletFiltersProvider>
        </KitSidePanel>
    );
};
