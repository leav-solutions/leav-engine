import {useMemo} from 'react';
import {KitSidePanel} from 'aristid-ds';
import cn from 'classnames';
import {useRouteParams} from './router/useRouteParams';
import {type UIFilter, ThroughConditionFilter, usePanelEventHandlers} from '@leav/ui';
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
import {AttributeType, RecordFilterCondition} from '../../__generated__';
import {fullscreenVolet} from './viewSettingsContainer.module.css';

export const ViewSettingsContainer = () => {
    const [application, setApplication] = useApplicationSettingsContext();
    const {workspaceId, panelId, recordId, where, recordPanelId} = useRouteParams();
    const {fullscreenPanelId} = useFullscreen();

    const {currentPanel, libraryId, panelType, displayedLibraryId} = retrievePanelDetails({
        application,
        recordPanelId,
        panelId,
    });

    // Same resolution as Panel.tsx's `currentRecordId`: for a `record`-type workspace's first panel
    // (e.g. a "PAC 2027" shortcut workspace), the PAC id is NOT in the URL — it's implicit in the
    // workspace config. `ViewSettingsContainer` is a sibling of `Panel`'s content (not a child), so it
    // cannot reuse that computed value and must re-derive it identically, or `recordId` below silently
    // resolves to `undefined` for this workspace shape.
    const isFirstPanel = where === undefined;
    const currentWorkspace = application.workspaces.find(({id}) => id === workspaceId);
    const currentRecordId = isFirstPanel && currentWorkspace?.type === 'record' ? currentWorkspace.recordId : recordId;

    // Mirrors PanelAttributeExplorer.tsx's `linkPreFilter`: for an `explorer` panel scoped to records
    // linked to the parent record via `attributeSource` (record-panel link explorer), the volet must see
    // the same masked pre-filter as the panel's own content, or a smart-filter dropdown opened from the
    // volet computes its `listDistinctValues` across the whole library instead of just the linked records.
    // `attributeSource` is a required field of the explorer (attribute-linked) panel schema only.
    const attributeSource =
        currentPanel?.type === 'explorer' && 'attributeSource' in currentPanel
            ? currentPanel.attributeSource
            : undefined;
    const builtHiddenFilters = useMemo<UIFilter[]>(
        () =>
            attributeSource && currentRecordId
                ? [
                      {
                          id: 'filter_to_linked_records',
                          hidden: true as const,
                          field: attributeSource,
                          subField: 'id',
                          attribute: {
                              id: attributeSource,
                              type: AttributeType.simple_link,
                              label: 'SHOULD BE HIDDEN',
                          },
                          condition: ThroughConditionFilter.THROUGH,
                          subCondition: RecordFilterCondition.EQUAL,
                          value: currentRecordId,
                      },
                  ]
                : [],
        [attributeSource, currentRecordId],
    );

    // A `custom` panel (iframe, e.g. planning/cadrage) knows its own scoping and pushes the exact masked
    // pre-filters via the `open-view-settings` message (stored on the panel state). Prefer those over the
    // built one: the iframe expresses arbitrary pre-filters, not just the single `simple_link` shape above.
    const storedHiddenFilters = currentPanel?.type === 'custom' ? currentPanel.hiddenFilters : undefined;
    const hiddenFilters = storedHiddenFilters ?? builtHiddenFilters;

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
            <VoletFiltersProvider hiddenFilters={hiddenFilters}>
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
