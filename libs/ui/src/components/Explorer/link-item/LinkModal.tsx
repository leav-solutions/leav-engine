// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, FunctionComponent, useRef} from 'react';
import {closeKitSnackBar, KitButton, KitSpace, AntModal} from 'aristid-ds';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {Explorer} from '../Explorer';
import {IEntrypointLink} from '../_types';
import {useLinkMassAction} from './useLinkMassAction';
import {useViewSettingsContext} from '../manage-view-settings/store-view-settings/useViewSettingsContext';
import {EditSettingsContextProvider} from '../manage-view-settings';

interface IAddLinkModalProps {
    open: boolean;
    onClose: () => void;
}

const modalMaxWidth = 1200;

// TODO: use KitModal instead for explorer first
const StyledModal = styled(AntModal)`
    && {
        width: 90vw;
        max-width: ${modalMaxWidth}px;

        .ant-modal-body {
            height: 80vh;
            overflow-y: auto;
        }

        .ant-modal-content {
            display: flex;
            flex-direction: column;
            overflow: hidden;
            padding: 0;
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

const ModalFooterStyledDiv = styled.div`
    display: flex;
    justify-content: flex-end;
    padding: calc(var(--general-spacing-xs) * 1px) calc(var(--general-spacing-s) * 1px);
    border-top: 1px solid var(--general-utilities-border);
`;

export const LinkModal: FunctionComponent<IAddLinkModalProps> = ({open, onClose}) => {
    const {t} = useSharedTranslation();
    const explorerContainerRef = useRef<HTMLDivElement>(null);
    const {view, dispatch} = useViewSettingsContext();

    const {addLinkMassAction} = useLinkMassAction({
        isEnabled: true,
        store: {view, dispatch},
        linkAttributeId: (view.entrypoint as IEntrypointLink).linkAttributeId,
        libraryId: view.libraryId,
        closeModal: onClose
    });

    const _handleClose: ComponentProps<typeof KitButton>['onClick'] = () => {
        closeKitSnackBar();
        onClose();
    };

    const _closeButtonLabel: ComponentProps<typeof KitButton>['aria-label'] = String(t('global.close'));

    const _footer: ComponentProps<typeof AntModal>['footer'] = (
        <ModalFooterStyledDiv>
            <KitSpace>
                <KitButton
                    aria-label={_closeButtonLabel}
                    key="close"
                    icon={<FontAwesomeIcon icon={faXmark} />}
                    onClick={_handleClose}
                >
                    {_closeButtonLabel}
                </KitButton>
            </KitSpace>
        </ModalFooterStyledDiv>
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
            footer={_footer}
        >
            <ModalMainStyledDiv ref={explorerContainerRef}>
                <EditSettingsContextProvider panelElement={() => explorerContainerRef.current ?? document.body}>
                    <Explorer
                        entrypoint={{
                            type: 'library',
                            libraryId: view.libraryId
                        }}
                        primaryActions={[]}
                        defaultActionsForItem={[]}
                        defaultMassActions={[]}
                        massActions={addLinkMassAction ? [addLinkMassAction] : []}
                        itemActions={[]}
                        defaultPrimaryActions={[]}
                    />
                    {/* TODO: avoid getting last view for user */}
                </EditSettingsContextProvider>
            </ModalMainStyledDiv>
        </StyledModal>
    );
};
