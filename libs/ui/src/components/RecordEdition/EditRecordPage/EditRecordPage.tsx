// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent, type ReactNode, useEffect, useRef, useState} from 'react';
import {KitButton, KitDivider, KitSpace, KitTypography} from 'aristid-ds';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type IValueVersion} from '_ui/types';
import {type RecordIdentityFragment, usePurgeRecordMutation} from '_ui/_gqlTypes';
import {EditRecord} from '../EditRecord';
import {type possibleSubmitButtons, type submitButtonsName} from '../_types';
import {useGetSubmitButtons} from '../hooks/useGetSubmitButtons';
import {useForm} from 'antd/lib/form/Form';
import {useCreateCancelConfirm} from '../hooks/useCreateCancelConfirm';
import {v4 as uuidv4} from 'uuid';
import {EDIT_RECORD_MODAL_HEADER_CONTAINER_BUTTONS} from '../constants';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {APICallStatus} from '../EditRecordContent/_types';
import useExecuteCreateEmptyRecordMutation from '../EditRecordContent/hooks/useCreateEmptyRecordMutation';

interface IEditRecordPageProps {
    record: RecordIdentityFragment['whoAmI'] | null;
    creationFormId?: string;
    editionFormId?: string;
    library: string;
    title?: ReactNode;
    onCreate?: (newRecord: RecordIdentityFragment['whoAmI']) => void; // Called after submitting via the "create" button
    onCreateAndEdit?: (newRecord: RecordIdentityFragment['whoAmI']) => void; // Called after submitting via the "create and edit" button
    submitButtons?: possibleSubmitButtons;
    valuesVersion?: IValueVersion;
    showRefreshButton?: boolean;
    showHeader?: boolean;
    withInfoButton?: boolean;
    onClose?: () => void;
    showSidebar?: boolean;
    enableSidebar?: boolean;
    sidebarContainer?: HTMLElement;
}

const Header = styled.div`
    grid-area: title;
    align-self: center;
    font-size: 1rem;
    padding: 16px 32px;
    height: 82px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const emptyFunction = () => null;

export const EditRecordPage: FunctionComponent<IEditRecordPageProps> = ({
    record,
    library,
    creationFormId,
    editionFormId,
    onCreate,
    onCreateAndEdit,
    valuesVersion,
    title,
    showHeader = true,
    submitButtons = ['create'],
    withInfoButton,
    onClose = emptyFunction,
    enableSidebar,
    showSidebar,
    sidebarContainer
}) => {
    const {t} = useSharedTranslation();
    const [currentRecord, setCurrentRecord] = useState<RecordIdentityFragment['whoAmI'] | null>(record);
    const [clickedSubmitButton, setClickedSubmitButton] = useState<submitButtonsName | null>(null);
    const formElementId = useRef(uuidv4());
    const [isCreation, setIsCreation] = useState(!record);
    const {createEmptyRecord} = useExecuteCreateEmptyRecordMutation();
    const [purgeRecordMutation] = usePurgeRecordMutation();
    const [formId, setFormId] = useState<string>(
        isCreation ? (creationFormId ?? 'creation') : (editionFormId ?? 'edition')
    );

    useEffect(() => {
        const createEmptyRecordFunction = async () => {
            const res = await createEmptyRecord(library);
            if (res?.status === APICallStatus.ERROR) {
                // TODO : call KitNotification error
                return null;
            }
            setCurrentRecord(res?.record ?? null);
        };

        if (isCreation) {
            createEmptyRecordFunction();
        }
    }, []);

    const _handleClickSubmit = (button: submitButtonsName) => {
        setClickedSubmitButton(button);
    };

    const _purgeRecordOnCreationCancel = () =>
        purgeRecordMutation({
            errorPolicy: 'ignore',
            variables: {
                libraryId: currentRecord?.library?.id,
                recordId: currentRecord?.id
            }
        });

    const _closeAfterConfirm = async () => {
        if (currentRecord?.id && currentRecord?.library?.id) {
            _purgeRecordOnCreationCancel();
        }
        return onClose();
    };

    const showCancelConfirm = useCreateCancelConfirm(_closeAfterConfirm);

    const displayedSubmitButtons = useGetSubmitButtons(
        submitButtons,
        formElementId.current,
        isCreation,
        _handleClickSubmit
    );
    const [antdForm] = useForm();

    const _handleClose = () => {
        if (isCreation) {
            if (antdForm.isFieldsTouched()) {
                return showCancelConfirm();
            } else {
                _purgeRecordOnCreationCancel();
            }
        }

        return onClose();
    };

    const closeButtonLabel = isCreation ? t('global.cancel') : t('global.close');

    const _handleCreate = (newRecord: RecordIdentityFragment['whoAmI']) => {
        setCurrentRecord(newRecord);

        if (onCreateAndEdit && clickedSubmitButton === 'createAndEdit') {
            setFormId(editionFormId ?? 'edition');
            setIsCreation(false);
            onCreateAndEdit(newRecord);
            return;
        }

        if (onCreate && clickedSubmitButton === 'create') {
            onCreate(newRecord);
            return;
        }
    };

    return (
        <>
            {showHeader && (
                <>
                    <Header>
                        {title !== undefined ? (
                            title
                        ) : (
                            <KitTypography.Title level="h2" style={{margin: 0}}>
                                {currentRecord?.label ?? t('record_edition.new_record')}
                            </KitTypography.Title>
                        )}
                        <div
                            id={EDIT_RECORD_MODAL_HEADER_CONTAINER_BUTTONS}
                            data-testid={EDIT_RECORD_MODAL_HEADER_CONTAINER_BUTTONS}
                        />
                        <KitButton onClick={_handleClose} icon={<FontAwesomeIcon icon={faXmark} />}>
                            {closeButtonLabel}
                        </KitButton>
                        <KitSpace>{displayedSubmitButtons}</KitSpace>
                    </Header>
                    <KitDivider noMargin color="lightGrey" />
                </>
            )}
            <EditRecord
                antdForm={antdForm}
                formId={formId}
                isFormCreationMode={isCreation}
                formElementId={formElementId.current}
                record={currentRecord}
                library={library}
                valuesVersion={valuesVersion}
                onCreate={_handleCreate}
                containerStyle={{height: 'calc(100% - 82px)'}}
                withInfoButton={withInfoButton}
                enableSidebar={enableSidebar}
                showSidebar={showSidebar}
                sidebarContainer={sidebarContainer}
            />
        </>
    );
};
