// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Modal} from 'antd';
import {ComponentProps, FunctionComponent, ReactNode, useRef} from 'react';
import {closeKitSnackBar, KitButton, KitSpace} from 'aristid-ds';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {Explorer} from '../Explorer';
import {IEntrypointLink} from '../_types';
import {useAddLinkMassAction} from '../useAddLinkMassAction';
import {useViewSettingsContext} from '../manage-view-settings/store-view-settings/useViewSettingsContext';
import {EditSettingsContextProvider} from '../manage-view-settings';

interface IAddLinkModalProps {
    open: boolean;
    library: string;
    onClose?: () => void;
}

const modalWidth = 1200;
const StyledModal = styled(Modal)`
    && {
        .ant-modal-content {
            display: flex;
            flex-direction: column;
            padding: calc(var(--general-spacing-xs) * 1px);
            overflow: hidden;
        }

        .ant-modal-footer {
            flex: 0 0 auto;
            margin-top: 0;
        }
    }
`;

const ModalMainStyledDiv = styled.div`
    padding: calc(var(--general-spacing-m) * 1px);
    height: 100%;
    position: relative;
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    padding: calc(var(--general-spacing-xs) * 1px) calc(var(--general-spacing-s) * 1px);
    border-top: 1px solid var(--general-utilities-border);
`;

export const AddLinkModal: FunctionComponent<IAddLinkModalProps> = ({open, library, onClose}) => {
    const {t} = useSharedTranslation();
    const explorerContainerRef = useRef<HTMLDivElement>(null);
    const {view, dispatch} = useViewSettingsContext();

    const {addLinkMassAction} = useAddLinkMassAction({
        isEnabled: true,
        store: {view, dispatch},
        linkAttributeId: (view.entrypoint as IEntrypointLink).linkAttributeId,
        libraryId: view.libraryId
    });

    const _handleClose = () => {
        closeKitSnackBar();
        onClose?.();
    };

    const _closeButtonLabel: string = t('global.close');

    const _footerButtons: ReactNode = [
        <KitButton
            aria-label={_closeButtonLabel}
            key="close"
            icon={<FontAwesomeIcon icon={faXmark} />}
            onClick={_handleClose}
        >
            {_closeButtonLabel}
        </KitButton>
    ];

    const _footer: ComponentProps<typeof Modal>['footer'] = (
        <ModalFooter>
            <KitSpace>{_footerButtons}</KitSpace>
        </ModalFooter>
    );

    return (
        <StyledModal
            open={open}
            onCancel={_handleClose}
            destroyOnClose
            closable={false}
            cancelText={t('global.cancel')}
            width="90vw"
            centered
            style={{maxWidth: `${modalWidth}px`}}
            styles={{body: {height: 'calc(100vh - 12rem)', overflowY: 'auto'}, content: {padding: 0}}}
            footer={_footer}
        >
            <ModalMainStyledDiv ref={explorerContainerRef}>
                <EditSettingsContextProvider>
                    <Explorer
                        entrypoint={{
                            type: 'library',
                            libraryId: library
                        }}
                        primaryActions={[]}
                        defaultActionsForItem={[]}
                        defaultMassActions={[]}
                        massActions={addLinkMassAction ? [addLinkMassAction] : []}
                        itemActions={[]}
                        defaultPrimaryActions={[]}
                        panelElement={() => explorerContainerRef.current ?? document.body}
                    />
                </EditSettingsContextProvider>
            </ModalMainStyledDiv>
        </StyledModal>
    );
};
