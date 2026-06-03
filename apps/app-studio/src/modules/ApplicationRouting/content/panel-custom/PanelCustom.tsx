import {type FunctionComponent, useContext, useEffect, useRef} from 'react';
import {LangContext, usePanelIFrameHandlers} from '@leav/ui';
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

interface IPanelCustomProps {
    source: string;
    title: string;
    recordId: string | null;
}

export const PanelCustom: FunctionComponent<IPanelCustomProps> = ({source, title, recordId}) => {
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

    const {changeLangInFrame} = usePanelIFrameHandlers(iframeRef, {
        onModalConfirm: openConfirmModal,
        onAlert: openAlert,
        onNotification: openNotification,
        onNavigateToPanel: navigateToPanel,
        onNavigateToIframe: navigateToIframe,
        onOpenFlapPanel: openFlapPanel,
        onCloseFlapPanel: closeFlapPanel,
        onClosePanel: closePanel,
        onGetPanelConfig: getPanelConfig,
        onGetUrl: getURL,
        onMessage: trackMatomoEvent,
    });

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
