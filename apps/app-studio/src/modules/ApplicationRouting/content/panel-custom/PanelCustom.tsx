import {type FunctionComponent, useContext, useEffect, useRef} from 'react';
import {useRouteParams} from '../../router/useRouteParams';
import {LangContext, usePanelIFrameHandlers, type RecordCreatedMessage, type ViewSettingsUpdateMessage} from '@leav/ui';
import {CurrentViewContext} from '../panel-view-settings/store-current-view/CurrentViewContext';
import {useOpenNotification} from './message-handlers/useOpenNotification';
import {useOpenAlert} from './message-handlers/useOpenAlert';
import {useOpenConfirmModal} from './message-handlers/useOpenConfirmModal';
import {useNavigateToPanel} from './message-handlers/useNavigateToPanel';
import {useNavigateToIframe} from './message-handlers/useNavigateToIframe';
import {useOpenFlapPanel} from './message-handlers/useOpenFlapPanel';
import {useClosePanel} from './message-handlers/useClosePanel';
import {useCloseFlapPanel} from './message-handlers/useCloseFlapPanel';
import {iframe} from './panelCustom.module.css';
import {useGetPanelConfig} from './message-handlers/useGetPanelConfig';
import {useGetURL} from './message-handlers/useGetURL';
import {trackMatomoEvent} from './message-handlers/trackMatomoEvent';
import {useOpenViewSettings} from './message-handlers/useOpenViewSettings';
import {useUpdateView} from './message-handlers/useUpdateView';
import {useSyncViewToIframe} from './message-handlers/useSyncViewToIframe';
import {useFullscreen} from '../../../../hooks/useFullscreen';

interface IPanelCustomProps {
    source: string;
    title: string;
    recordId: string | null;
    // Only wired by `customCreation` panels (PanelCustomCreation): reaction to the iframe's
    // `record-created` message. Regular custom panels leave it undefined (message ignored).
    onRecordCreated?: (data: RecordCreatedMessage['data']) => void;
}

export const PanelCustom: FunctionComponent<IPanelCustomProps> = ({source, title, recordId, onRecordCreated}) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const {navigateToPanel} = useNavigateToPanel();
    const {closePanel} = useClosePanel();
    const {navigateToIframe} = useNavigateToIframe();
    const {openNotification} = useOpenNotification();
    const {openAlert} = useOpenAlert();
    const {openConfirmModal} = useOpenConfirmModal();
    const {openFlapPanel} = useOpenFlapPanel();
    const {closeFlapPanel} = useCloseFlapPanel();
    const {getPanelConfig} = useGetPanelConfig();
    const {getURL} = useGetURL();
    const {openViewSettings} = useOpenViewSettings();
    const {updateView} = useUpdateView();
    const {exitFullscreen} = useFullscreen();

    const {serializedView} = useContext(CurrentViewContext);
    const {panelId, recordPanelId} = useRouteParams();
    const targetPanelId = recordPanelId ?? panelId;

    // The `onRequestCurrentView` handler needs `pushViewSettingsUpdate`, but that pusher is produced by
    // the very hook we're passing the handler into. Break the cycle with a ref: the handler is re-read
    // each render via `handlersRef` (usePanelIFrameHandlers), so it captures an up-to-date `serializedView`.
    const pushRef = useRef<((data: ViewSettingsUpdateMessage['data']) => void) | null>(null);

    const {changeLangInFrame, pushViewSettingsUpdate} = usePanelIFrameHandlers(iframeRef, {
        onModalConfirm: openConfirmModal,
        onAlert: openAlert,
        onNotification: openNotification,
        onNavigateToPanel: navigateToPanel,
        onNavigateToIframe: navigateToIframe,
        onOpenFlapPanel: openFlapPanel,
        onCloseFlapPanel: closeFlapPanel,
        onClosePanel: closePanel,
        onRecordCreated,
        onGetPanelConfig: getPanelConfig,
        onGetUrl: getURL,
        onMessage: trackMatomoEvent,
        onOpenViewSettings: openViewSettings,
        onUpdateView: updateView,
        onEscape: () => exitFullscreen(),
        onRequestCurrentView: () => {
            // Reply to the iframe's (re)load handshake: it pulls the current view on mount, so we push our
            // current (last-used) view back so it restores the host's view instead of its own defaults. The
            // host otherwise only pushes on hub CHANGE, which races the iframe's slower mount.
            if (serializedView && targetPanelId) {
                pushRef.current?.({targetPanelId, serializedView});
            }
        },
    });
    pushRef.current = pushViewSettingsUpdate;

    // Push the hub's current view to this iframe on every change (load / volet edit / reset / select).
    useSyncViewToIframe(pushViewSettingsUpdate);

    const {lang} = useContext(LangContext);

    useEffect(() => {
        changeLangInFrame(lang[0]);
    }, [lang]);

    return (
        <iframe
            ref={iframeRef}
            className={iframe}
            name={title}
            src={source + (recordId ? '?' + new URLSearchParams({recordId}).toString() : '')}
            title={title}
            width="100%"
            height="100%"
        />
    );
};
