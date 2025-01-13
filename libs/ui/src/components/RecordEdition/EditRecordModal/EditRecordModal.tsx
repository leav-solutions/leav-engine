// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Modal} from 'antd';
import {FunctionComponent, useRef, useState} from 'react';
import {KitButton, KitSpace, KitTypography} from 'aristid-ds';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IValueVersion} from '_ui/types';
import {RecordIdentityFragment} from '_ui/_gqlTypes';
import {EditRecord} from '../EditRecord';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faXmark, faRotateRight, faLayerGroup} from '@fortawesome/free-solid-svg-icons';
import {possibleSubmitButtons, submitButtonsName} from '../_types';
import {useGetSubmitButtons} from '../hooks/useGetSubmitButtons';
import {useForm} from 'antd/lib/form/Form';
import {useCreateCancelConfirm} from '../hooks/useCreateCancelConfirm';

export interface IEditRecordModalProps {
    open: boolean;
    record: RecordIdentityFragment['whoAmI'] | null;
    library: string;
    onClose: () => void;
    onCreate?: (newRecord: RecordIdentityFragment['whoAmI']) => void; // Called after submitting via the "create" button
    onCreateAndEdit?: (newRecord: RecordIdentityFragment['whoAmI']) => void; // Called after submitting via the "create and edit" button
    submitButtons?: possibleSubmitButtons;
    withInfoButton?: boolean;
    valuesVersion?: IValueVersion;
}

const modalWidth = 1200;
const StyledModal = styled(Modal)`
    && {
        .ant-modal-content {
            padding: 0;
        }

        .ant-modal-footer {
            margin-top: 0;
        }
    }
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

export const EditRecordModal: FunctionComponent<IEditRecordModalProps> = ({
    open,
    record,
    library,
    onClose,
    onCreate,
    onCreateAndEdit,
    submitButtons = ['create'],
    valuesVersion,
    withInfoButton = true
}) => {
    const {t} = useSharedTranslation();
    const showCancelConfirm = useCreateCancelConfirm(onClose);

    const [currentRecord, setCurrentRecord] = useState<RecordIdentityFragment['whoAmI'] | null>(record);
    const [clickedSubmitButton, setClickedSubmitButton] = useState<submitButtonsName | null>(null);
    const isCreation = !currentRecord;

    const _handleClickSubmit = (button: submitButtonsName) => {
        setClickedSubmitButton(button);
    };

    const displayedSubmitButtons = useGetSubmitButtons(submitButtons, isCreation, _handleClickSubmit);
    const [antdForm] = useForm();

    const _handleClose = () => {
        if (isCreation && antdForm.isFieldsTouched()) {
            return showCancelConfirm();
        }

        return onClose();
    };

    // Create refs for the buttons to pass them to the EditRecord component
    const refreshButtonRef = useRef<HTMLButtonElement>(null);
    const valuesVersionsButtonRef = useRef<HTMLButtonElement>(null);

    const closeButtonLabel = isCreation ? t('global.cancel') : t('global.close');

    const footerButtons = [
        <KitButton
            aria-label={closeButtonLabel}
            key="close"
            icon={<FontAwesomeIcon icon={faXmark} />}
            onClick={_handleClose}
        >
            {closeButtonLabel}
        </KitButton>,
        ...displayedSubmitButtons
    ];

    const footer = (
        <ModalFooter>
            <KitSpace>{footerButtons}</KitSpace>
        </ModalFooter>
    );

    const _handleCreate = (newRecord: RecordIdentityFragment['whoAmI']) => {
        setCurrentRecord(newRecord);

        if (onCreateAndEdit && clickedSubmitButton === 'createAndEdit') {
            onCreateAndEdit(newRecord);
            return;
        }

        if (onCreate && clickedSubmitButton === 'create') {
            onCreate(newRecord);
            return;
        }
    };

    return (
        <StyledModal
            open={open}
            onCancel={_handleClose}
            destroyOnClose
            cancelText={t('global.cancel')}
            width="90vw"
            centered
            style={{maxWidth: `${modalWidth}px`}}
            styles={{body: {height: 'calc(100vh - 12rem)', overflowY: 'auto'}, content: {padding: 0}}}
            footer={footer}
            closeIcon={<FontAwesomeIcon icon={faXmark} />}
        >
            <Header>
                <KitTypography.Title level="h2" style={{margin: 0}}>
                    {currentRecord?.label ?? t('record_edition.new_record')}
                </KitTypography.Title>
                <KitSpace size="xxs">
                    <KitButton
                        ref={valuesVersionsButtonRef}
                        type="tertiary"
                        icon={<FontAwesomeIcon icon={faLayerGroup} />}
                    />
                    <KitButton ref={refreshButtonRef} type="tertiary" icon={<FontAwesomeIcon icon={faRotateRight} />} />
                </KitSpace>
            </Header>
            <EditRecord
                antdForm={antdForm}
                record={currentRecord}
                library={library}
                onCreate={_handleCreate}
                valuesVersion={valuesVersion}
                buttonsRefs={{
                    refresh: refreshButtonRef,
                    valuesVersions: valuesVersionsButtonRef
                }}
                showSidebar
                withInfoButton={withInfoButton}
                containerStyle={{height: 'calc(100% - 3.5rem)'}}
            />
        </StyledModal>
    );
};
