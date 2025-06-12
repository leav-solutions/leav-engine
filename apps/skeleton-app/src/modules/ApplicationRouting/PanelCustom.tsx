// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useContext, useEffect} from 'react';
import {iframe} from './PanelCustom.module.css';
import {LangContext, useIFrameMessenger} from '@leav/ui';
import {useNavigateToPanel} from './custom-panel-message-handlers/useNavigateToPanel';
import {useOpenNotification} from './custom-panel-message-handlers/useOpenNotification';
import {useOpenAlert} from './custom-panel-message-handlers/useOpenAlert';
import {useOpenConfirmModal} from './custom-panel-message-handlers/useOpenConfirmModal';
import {useSidePanelForm} from './custom-panel-message-handlers/useSidePanelForm';
import {useModalForm} from './custom-panel-message-handlers/useModalForm';

interface IPanelCustomProps {
    source: string;
    searchQuery: string;
    title: string;
}

export const PanelCustom: FunctionComponent<IPanelCustomProps> = ({source, searchQuery, title}) => {
    const {navigateToPanel} = useNavigateToPanel();
    const {openNotification} = useOpenNotification();
    const {openAlert} = useOpenAlert();
    const {openConfirmModal} = useOpenConfirmModal();
    const {openSidePanelForm, CustomSidePanelForm} = useSidePanelForm();
    const {openModalForm, CustomModalForm} = useModalForm();

    const {changeLangInAllFrames} = useIFrameMessenger({
        handlers: {
            onSidePanelForm: openSidePanelForm,
            onModalConfirm: openConfirmModal,
            onModalForm: openModalForm,
            onAlert: openAlert,
            onNotification: openNotification,
            onNavigateToPanel: navigateToPanel
        }
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
                src={source + searchQuery}
                title={title}
                width="100%"
                height="100%"
            />
            {CustomSidePanelForm}
            {CustomModalForm}
        </>
    );
};
