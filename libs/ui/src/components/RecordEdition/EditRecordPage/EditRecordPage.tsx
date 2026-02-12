// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent, type ReactNode, useEffect, useRef, useState} from 'react';
import {KitButton, KitDivider, KitLoader, KitSpace, KitTypography} from 'aristid-ds';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type IValueVersion} from '_ui/types';
import {type RecordIdentityFragment, useCreateRecordMutation, usePurgeRecordMutation} from '_ui/_gqlTypes';
import {EditRecord} from '../EditRecord';
import {type PossibleSubmitButtons, type SubmitButtonsName} from '../_types';
import {useGetSubmitButtons} from '../hooks/useGetSubmitButtons';
import {useForm} from 'antd/lib/form/Form';
import {useCreateCancelConfirm} from '../hooks/useCreateCancelConfirm';
import {EDIT_RECORD_MODAL_HEADER_CONTAINER_BUTTONS} from '../constants';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {createPortal} from 'react-dom';
import {SUBMIT_BUTTONS_PORTAL} from '_ui/constants';
import {ErrorBoundary} from '_ui/components/ErrorBoundary';
import {ErrorComponent} from './ErrorComponent';
import {useGetInitialRecordValues} from './getInitialRecordValues';

interface IEditRecordPageProps {
    record: RecordIdentityFragment['whoAmI'] | null;
    creationFormId?: string;
    editionFormId?: string;
    library: string;
    title?: ReactNode;
    onCreate?: (newRecord: RecordIdentityFragment['whoAmI']) => void; // Called after submitting via the "create" button
    onCreateAndEdit?: (newRecord: RecordIdentityFragment['whoAmI']) => void; // Called after submitting via the "create and edit" button
    submitButtons?: PossibleSubmitButtons;
    valuesVersion?: IValueVersion;
    showRefreshButton?: boolean;
    showHeader?: boolean;
    withInfoButton?: boolean;
    onClose?: () => void;
    showSidebar?: boolean;
    enableSidebar?: boolean;
    sidebarContainer?: HTMLElement;
    isSubmitButtonsPortal?: boolean;
    removePadding?: boolean;
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
    sidebarContainer,
    isSubmitButtonsPortal = false,
    removePadding = false,
}) => {
    const {t} = useSharedTranslation();
    const [currentRecord, setCurrentRecord] = useState<RecordIdentityFragment['whoAmI'] | null>(record);
    const clickedSubmitButton = useRef<SubmitButtonsName | null>(null);
    const formElementId = useRef(window.crypto.randomUUID());
    const [isCreation, setIsCreation] = useState(!record);
    const [isReady, setIsReady] = useState(!!record);
    const [isError, setIsError] = useState(false);
    const [createRecord] = useCreateRecordMutation();
    const [purgeRecordMutation] = usePurgeRecordMutation();
    const [formId, setFormId] = useState<string>(
        isCreation ? (creationFormId ?? 'creation') : (editionFormId ?? 'edition'),
    );
    const [formCreateButtonsContainer, setFormCreateButtonsContainer] = useState<HTMLElement>();
    const values = useGetInitialRecordValues();

    useEffect(() => {
        if (isSubmitButtonsPortal) {
            const formCreateButtonsElement = document.getElementById(SUBMIT_BUTTONS_PORTAL);
            if (formCreateButtonsElement) {
                setFormCreateButtonsContainer(formCreateButtonsElement);
            }
        }
    }, []);

    useEffect(() => {
        const createEmptyRecordFunction = async () => {
            const {data} = await createRecord({
                variables: {
                    library,
                    skipActivate: true,
                    data: {values},
                },
            });
            const recordId = data?.createRecord.record?.id;
            setCurrentRecord(data?.createRecord.record.whoAmI ?? null);
            if (!recordId) {
                setIsError(true);
                return;
            }

            setIsReady(true);
        };

        if (isCreation && !isReady) {
            createEmptyRecordFunction();
        }
    }, []);

    const _handleClickSubmit = (button: SubmitButtonsName) => {
        clickedSubmitButton.current = button;
    };

    const _purgeRecordOnCreationCancel = () =>
        purgeRecordMutation({
            errorPolicy: 'ignore',
            variables: {
                libraryId: currentRecord?.library?.id,
                recordId: currentRecord?.id,
            },
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
        _handleClickSubmit,
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

        if (onCreateAndEdit && clickedSubmitButton.current === 'createAndEdit') {
            setFormId(editionFormId ?? 'edition');
            setIsCreation(false);
            onCreateAndEdit(newRecord);
            return;
        }

        if (onCreate && clickedSubmitButton.current === 'create') {
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
            {isSubmitButtonsPortal &&
                formCreateButtonsContainer &&
                createPortal(displayedSubmitButtons, formCreateButtonsContainer)}
            <ErrorBoundary>
                {isError && <ErrorComponent />}
                {!isReady && <KitLoader />}
                {isReady && (
                    <EditRecord
                        antdForm={antdForm}
                        formId={formId}
                        isFormCreationMode={isCreation}
                        formElementId={formElementId.current}
                        record={currentRecord}
                        library={library}
                        valuesVersion={valuesVersion}
                        onCreate={_handleCreate}
                        containerStyle={showHeader ? {height: 'calc(100% - 82px)'} : {height: '100%'}}
                        withInfoButton={withInfoButton}
                        enableSidebar={enableSidebar}
                        showSidebar={showSidebar}
                        sidebarContainer={sidebarContainer}
                        removePadding={removePadding}
                    />
                )}
            </ErrorBoundary>
        </>
    );
};
