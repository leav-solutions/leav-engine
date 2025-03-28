// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useRef, useState} from 'react';
import {KitButton, KitModal, KitSpace, KitTypography} from 'aristid-ds';
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
import {v4 as uuidv4} from 'uuid';

export interface IEditRecordModalProps {
    className?: string;
    open: boolean;
    record: RecordIdentityFragment['whoAmI'] | null;
    creationFormId?: string;
    editionFormId?: string;
    library: string;
    onClose: () => void;
    onCreate?: (newRecord: RecordIdentityFragment['whoAmI']) => void; // Called after submitting via the "create" button
    onCreateAndEdit?: (newRecord: RecordIdentityFragment['whoAmI']) => void; // Called after submitting via the "create and edit" button
    submitButtons?: possibleSubmitButtons;
    withInfoButton?: boolean;
    valuesVersion?: IValueVersion;
}

const MODAL_HEIGHT = '80vh';
const MODAL_WIDTH = '90vw';
const MODAL_MAX_WIDTH = '1200px';

const KitModalStyled = styled(KitModal)`
    && {
        & > div {
            max-width: ${MODAL_MAX_WIDTH};

            .kit-modal-header {
                border-bottom: 1px solid var(--general-utilities-border);

                .kit-modal-title {
                    padding-right: calc(var(--general-spacing-xs) * 1px);

                    .ant-space {
                        width: 100%;
                        justify-content: space-between;
                    }
                }
            }

            .kit-modal-content-wrapper {
                padding: 0;

                .kit-modal-content {
                    height: 100%;

                    & > div {
                        height: 100%;
                    }
                }
            }
        }
    }
`;

export const EditRecordModal: FunctionComponent<IEditRecordModalProps> = ({
    className,
    open,
    record,
    creationFormId,
    editionFormId,
    library,
    onClose,
    onCreate,
    onCreateAndEdit,
    valuesVersion,
    submitButtons = ['create'],
    withInfoButton = true
}) => {
    const {t} = useSharedTranslation();
    const [antdForm] = useForm();
    const [currentRecord, setCurrentRecord] = useState<RecordIdentityFragment['whoAmI'] | null>(record);
    const [clickedSubmitButton, setClickedSubmitButton] = useState<submitButtonsName | null>(null);

    // Create refs for the buttons to pass them to the EditRecord component
    const refreshButtonRef = useRef<HTMLButtonElement>(null);
    const valuesVersionsButtonRef = useRef<HTMLButtonElement>(null);

    const formElementId = useRef(uuidv4());
    const isCreation = !currentRecord;
    const closeButtonLabel = isCreation ? t('global.cancel') : t('global.close');
    const formId = isCreation ? creationFormId : editionFormId;

    const _handleClickSubmit = (button: submitButtonsName) => {
        setClickedSubmitButton(button);
    };

    const showCancelConfirm = useCreateCancelConfirm(onClose);

    const displayedSubmitButtons = useGetSubmitButtons(
        submitButtons,
        formElementId.current,
        isCreation,
        _handleClickSubmit
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

    const _handleClose = () => {
        if (isCreation && antdForm.isFieldsTouched()) {
            return showCancelConfirm();
        }

        return onClose();
    };

    return (
        <KitModalStyled
            className={className}
            height={MODAL_HEIGHT}
            width={MODAL_WIDTH}
            isOpen={open}
            close={_handleClose}
            title={
                <KitSpace>
                    <KitTypography.Title level="h2" style={{margin: 0}}>
                        {currentRecord?.label ?? t('record_edition.new_record')}
                    </KitTypography.Title>
                    <KitSpace size="xxs">
                        <KitButton
                            ref={valuesVersionsButtonRef}
                            type="tertiary"
                            icon={<FontAwesomeIcon icon={faLayerGroup} />}
                        />
                        <KitButton
                            ref={refreshButtonRef}
                            type="tertiary"
                            icon={<FontAwesomeIcon icon={faRotateRight} />}
                        />
                    </KitSpace>
                </KitSpace>
            }
            footer={
                <KitSpace>
                    {[
                        <KitButton
                            aria-label={closeButtonLabel}
                            key="close"
                            icon={<FontAwesomeIcon icon={faXmark} />}
                            onClick={_handleClose}
                        >
                            {closeButtonLabel}
                        </KitButton>,
                        ...displayedSubmitButtons
                    ]}
                </KitSpace>
            }
            closeIcon={<FontAwesomeIcon icon={faXmark} />}
            showCloseIcon
            destroyOnClose
        >
            <EditRecord
                antdForm={antdForm}
                formId={formId}
                formElementId={formElementId.current}
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
            />
        </KitModalStyled>
    );
};
