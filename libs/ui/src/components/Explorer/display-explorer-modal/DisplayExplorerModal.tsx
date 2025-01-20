// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Modal} from 'antd';
import {FunctionComponent, useRef} from 'react';
import {KitButton, KitModal, KitSpace} from 'aristid-ds';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {Explorer, IExplorerProps} from '../Explorer';
import {possibleSubmitButtons} from '_ui/components/RecordEdition/_types';
import {IEntrypointLibrary, IEntrypointLink} from '../_types';
import {FaPlus} from 'react-icons/fa';
import useSaveValueBatchMutation from '_ui/components/RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import {EditSettingsContextProvider} from '../manage-view-settings';

export interface IDisplayExplorerModalProps extends Omit<IExplorerProps, 'entrypoint'> {
    open: boolean;
    library: string;
    entrypoint: IEntrypointLink;
    onClose: () => void;
    submitButtons?: possibleSubmitButtons;
}

const modalWidth = 1200;
const StyledModal = styled(Modal)`
    && {
        .ant-modal-content {
            display: flex;
            flex-direction: column;
            padding: 10px;
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

const Header = styled.div`
    height: 3.5rem;
    grid-area: title;
    align-self: center;
    font-size: 1rem;
    padding: 10px 50px 10px 10px;
    border-bottom: 1px solid var(--general-utilities-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    padding: 0.5rem 1rem;
    border-top: 1px solid var(--general-utilities-border);
`;

export const DisplayExplorerModal: FunctionComponent<IDisplayExplorerModalProps> = ({
    open,
    library,
    entrypoint,
    title,
    defaultViewSettings,
    onClose
}) => {
    const {t} = useSharedTranslation();
    const explorerContainerRef = useRef<HTMLDivElement>(null);
    const {saveValues} = useSaveValueBatchMutation();

    const _handleClose = () => onClose();

    const _closeButtonLabel = t('global.close');

    const _footerButtons = [
        <KitButton
            aria-label={_closeButtonLabel}
            key="close"
            icon={<FontAwesomeIcon icon={faXmark} />}
            onClick={_handleClose}
        >
            {_closeButtonLabel}
        </KitButton>
    ];

    const _footer = (
        <ModalFooter>
            <KitSpace>{_footerButtons}</KitSpace>
        </ModalFooter>
    );

    const _internalEntrypoint: IEntrypointLibrary = {
        type: 'library',
        libraryId: library
    };

    const addItemAction = {
        label: t('filters.add'),
        icon: <FaPlus />,
        callback: ({itemId}) =>
            saveValues(
                {
                    id: entrypoint.parentRecordId,
                    library: {
                        id: entrypoint.parentLibraryId
                    }
                },
                [
                    {
                        attribute: entrypoint.linkAttributeId,
                        idValue: null,
                        value: itemId
                    }
                ]
            )
    };

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
                        entrypoint={_internalEntrypoint}
                        primaryActions={[]}
                        title={title}
                        defaultActionsForItem={[]}
                        itemActions={[addItemAction]}
                        defaultPrimaryActions={[]}
                        panelElement={() => explorerContainerRef.current ?? document.body}
                        defaultViewSettings={defaultViewSettings}
                    />
                </EditSettingsContextProvider>
            </ModalMainStyledDiv>
        </StyledModal>
    );
};
