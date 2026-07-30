import {type FunctionComponent, useCallback, useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {useMatch, useParams, useRoutes} from 'react-router-dom';
import cn from 'classnames';
import {type KitSidePanelRef} from 'aristid-ds/dist/Kit/Navigation/SidePanel/types';
import {useApplicationSettingsContext} from '../../config/application-instance/application-settings/useApplicationSettingsContext';
import {MODAL_EXTRA_RIGHT_PORTAL_ID} from '../../constants';
import {PanelContent} from './content/PanelContent';
import {getNextLevelRoutes} from './router/routes';
import {retrievePanelDetails} from './utils/retrievePanelDetails';
import {getIsViewSettingsVoletActive} from './utils/getIsViewSettingsVoletActive';
import {useViewSettingsAutoClose} from './useViewSettingsAutoClose';
import {PanelsTabs} from './header/tabs/PanelsTabs';
import {PanelHeader} from './header/PanelHeader';
import {AbsolutePaths} from './router/paths';
import {FlapContainer} from './FlapContainer';
import {ViewSettingsContainer} from './ViewSettingsContainer';
import {CurrentViewStoreProvider} from './content/panel-view-settings/store-current-view/CurrentViewStoreProvider';
import {FullscreenToggleButton} from './header/action-button/FullscreenToggleButton';
import {FullscreenAlert} from './content/FullscreenAlert';
import {useFullscreen} from '../../hooks/useFullscreen';
import {firstPanel, firstPanelContent, fullscreenPanel, panel, panelContent, panelHeader} from './panel.module.css';

type PanelProps = {
    sliderVoletHostElement?: HTMLElement | null;
};

export const Panel: FunctionComponent<PanelProps> = ({sliderVoletHostElement = null}) => {
    const [modalExtraRightElement, setModalExtraRightElement] = useState<HTMLElement>();
    const [application] = useApplicationSettingsContext();
    const {
        workspaceId,
        panelId,
        recordId,
        where,
        recordPanelId,
        flapRecordId,
        flapLibraryId,
        flapPanelId,
        '*': nextLevelPath,
    } = useParams();
    const {currentPanel, libraryId, panelType, displayedLibraryId} = retrievePanelDetails({
        application,
        recordPanelId,
        panelId,
    });
    const NextLevelRoutes = useRoutes(getNextLevelRoutes());
    const match = useMatch(AbsolutePaths.recordPanel);
    const {fullscreenPanelId, enterFullscreen} = useFullscreen();

    const isFirstPanel = where === undefined;
    const isPanelInSlider = where === 'slider';
    const currentWorkspace = application.workspaces.find(({id}) => id === workspaceId);
    const currentRecordId = isFirstPanel && currentWorkspace.type === 'record' ? currentWorkspace.recordId : recordId;
    const hasFlapPanel = flapPanelId !== undefined;
    const isCreationFormPanel = currentPanel.type === 'creationForm';
    // A tree workspace renders a full-page, self-contained explorer: no panel header, no tabs, no view volet.
    const isTreeExplorerPanel = currentPanel.type === 'treeExplorer';

    const isViewSettingsVoletActive = getIsViewSettingsVoletActive(currentPanel);

    // The view settings volet is a floating overlay: it never shifts the panel content and is only shown
    // while its explorer is in the foreground. A flap is an auxiliary panel over the SAME explorer, so it
    // does not hide the volet (the volet floats on top of it).
    // In a `slider` the volet is portaled into the host zone `PanelContainer` renders next to the
    // KitSidePanel (LEAVC-1089): rendering it inline would drop it inside the slider's scrollable content,
    // where it would be clipped. Until that host is published we render nothing rather than fall back
    // inline.
    const hasNextLevelPanel = NextLevelRoutes !== null;
    const canRenderViewSettings = !hasNextLevelPanel && (!isPanelInSlider || sliderVoletHostElement !== null);

    const isPanelFullscreen = fullscreenPanelId === currentPanel?.id;
    // Should this panel show its own fullscreen toggle? It depends on how the next-level panel opened.
    // Read from the splat tail `recordId/where/recordPanelId` ([1] = `where`):
    //   - slider / popup / flap  → an overlay; this panel is still visible underneath → keep the toggle.
    //   - fullpage               → replaces this panel entirely → hide the toggle (the replacing panel
    //                              renders its own). Same fullpage-vs-overlay split as the transfer below.
    const nextLevelWhere = nextLevelPath?.split('/')[1];
    const isReplacedByFullpagePanel = hasNextLevelPanel && nextLevelWhere === 'fullpage';
    // Only one level of fullscreen at a time: once a panel is fullscreen, an overlay opened over it
    // (e.g. a `popup` creation form) must not offer its own toggle.
    const showFullscreenButton =
        isPanelFullscreen || (fullscreenPanelId === null && !isPanelInSlider && !isReplacedByFullpagePanel);

    // Fullscreen is sticky across navigation: when we navigate into a *different* foreground fullpage
    // panel while fullscreen, transfer fullscreen to it.  Slider/popup/flap overlays (where !== 'fullpage')
    // // keep fullscreen on the current panel and layer above it.
    useEffect(() => {
        if (
            where === 'fullpage' &&
            !hasNextLevelPanel &&
            fullscreenPanelId !== null &&
            fullscreenPanelId !== currentPanel?.id
        ) {
            enterFullscreen(currentPanel.id);
        }
    }, [where, hasNextLevelPanel, fullscreenPanelId, currentPanel?.id, enterFullscreen]);

    useViewSettingsAutoClose(hasNextLevelPanel);

    // The extraRight div is created by PanelContainer for popup/fullpage panels. Both the flap and
    // the view settings are portaled into it, so we resolve it whenever this nested non-slider panel
    // needs the portal: flap open OR view settings active.
    const needsModalExtraRightPortal = !isFirstPanel && !isPanelInSlider && (hasFlapPanel || isViewSettingsVoletActive);

    useEffect(() => {
        if (needsModalExtraRightPortal) {
            const extraRightElement = document.getElementById(`${MODAL_EXTRA_RIGHT_PORTAL_ID}_${recordPanelId}`);
            setModalExtraRightElement(extraRightElement ?? undefined);
        } else {
            setModalExtraRightElement(undefined);
        }
    }, [needsModalExtraRightPortal, recordPanelId]);

    const viewSettingsHostElement = isPanelInSlider ? sliderVoletHostElement : modalExtraRightElement;
    const viewSettingsContainerComponent = viewSettingsHostElement ? (
        createPortal(<ViewSettingsContainer />, viewSettingsHostElement)
    ) : (
        <ViewSettingsContainer />
    );

    const setFlapRef = useCallback(
        (flapRef: KitSidePanelRef | null) => {
            if (hasFlapPanel && flapRef) {
                flapRef.open();
            }
        },
        [hasFlapPanel, match?.pathname],
    );
    const flapContainerComponent = modalExtraRightElement ? (
        createPortal(<FlapContainer ref={setFlapRef} />, modalExtraRightElement)
    ) : (
        <FlapContainer ref={setFlapRef} />
    );

    if (isPanelInSlider && hasFlapPanel) {
        return flapContainerComponent;
    }

    const content = (
        <>
            <section
                className={cn(panel, {
                    [firstPanel]: isFirstPanel,
                    [fullscreenPanel]: isPanelFullscreen,
                })}
            >
                {!isPanelFullscreen && (isFirstPanel || !currentPanel.isStandalone) && !isTreeExplorerPanel && (
                    <div className={panelHeader}>
                        {/* `fullpage`, `popup` and `slider` are managed by `<PanelContainer />` */}
                        {isFirstPanel && (
                            <PanelHeader
                                currentRecordId={currentRecordId}
                                hidePanelDisplayModeSelector={isCreationFormPanel}
                            />
                        )}
                        <PanelsTabs
                            enabled={isPanelInSlider}
                            workspaceId={workspaceId}
                            libraryId={libraryId}
                            panelType={panelType}
                            recordId={currentRecordId}
                            hasFlapPanel={hasFlapPanel}
                            where={where}
                            currentPanelId={currentPanel.id}
                        />
                    </div>
                )}
                <div
                    className={cn(panelContent, {
                        [firstPanelContent]: isFirstPanel,
                    })}
                >
                    <PanelContent
                        key={currentPanel.id}
                        panel={currentPanel}
                        recordId={currentRecordId}
                        libraryId={libraryId}
                    />
                    {NextLevelRoutes}
                </div>
                {isPanelFullscreen && <FullscreenAlert />}
            </section>
            {/* Rendered *outside* the section on purpose: when fullscreen, the section is a
                `position:fixed; z-index` stacking context that would trap this fixed button below a
                slider/popup opened over the panel. */}
            {showFullscreenButton && <FullscreenToggleButton panelId={currentPanel.id} />}
            {hasFlapPanel && flapContainerComponent}
            {isViewSettingsVoletActive && canRenderViewSettings && viewSettingsContainerComponent}
        </>
    );

    const hostsViewSettings =
        application.enableViewSettings && (currentPanel.type === 'explorer' || currentPanel.type === 'custom');

    if (hostsViewSettings) {
        return (
            <CurrentViewStoreProvider
                key={currentPanel.id}
                viewId={currentPanel.viewId}
                displayedLibraryId={displayedLibraryId}
                origin={currentPanel.type === 'custom' ? currentPanel.id : undefined}
            >
                {content}
            </CurrentViewStoreProvider>
        );
    }

    return content;
};
