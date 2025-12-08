// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent, useContext, useEffect} from 'react';
import {LangContext, useIFrameMessenger} from '@leav/ui';
import {useOpenNotification} from './message-handlers/useOpenNotification';
import {useOpenAlert} from './message-handlers/useOpenAlert';
import {useOpenConfirmModal} from './message-handlers/useOpenConfirmModal';
import {useNavigateToPanel} from './message-handlers/useNavigateToPanel';
import {useNavigateToIframe} from './message-handlers/useNavigateToIframe';
import {useOpenFlapPanel} from './message-handlers/useOpenFlapPanel';
import {useClosePanel} from './message-handlers/useClosePanel';
import {useCloseFlapPanel} from './message-handlers/useCloseFlapPanel';
import {iframe} from './panelCustom.module.css';

interface IPanelCustomProps {
    source: string;
    title: string;
    recordId: string | null;
}

export const PanelCustom: FunctionComponent<IPanelCustomProps> = ({source, title, recordId}) => {
    const {navigateToPanel} = useNavigateToPanel();
    const {closePanel} = useClosePanel();
    const {navigateToIframe} = useNavigateToIframe();
    const {openNotification} = useOpenNotification();
    const {openAlert} = useOpenAlert();
    const {openConfirmModal} = useOpenConfirmModal();
    const {openFlapPanel} = useOpenFlapPanel();
    const {closeFlapPanel} = useCloseFlapPanel();

    const {changeLangInAllFrames} = useIFrameMessenger({
        handlers: {
            onModalConfirm: openConfirmModal,
            onAlert: openAlert,
            onNotification: openNotification,
            onNavigateToPanel: navigateToPanel,
            onNavigateToIframe: navigateToIframe,
            onOpenFlapPanel: openFlapPanel,
            onCloseFlapPanel: closeFlapPanel,
            onClosePanel: closePanel,
        },
    });

    const {lang} = useContext(LangContext);

    useEffect(() => {
        changeLangInAllFrames(lang[0]);
    }, [lang]);

    return (
        <>
            <iframe
                className={iframe}
                name="testFrame"
                src={source + (recordId ? '?' + new URLSearchParams({recordId}).toString() : '')}
                title={title}
                width="100%"
                height="100%"
            />
        </>
    );
};
