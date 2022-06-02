// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import {Button} from 'antd';
import Modal from 'antd/lib/modal/Modal';
import {IconClosePanel} from 'assets/icons/IconClosePanel';
import {IconOpenPanel} from 'assets/icons/IconOpenPanel';
import {PrimaryBtn} from 'components/app/StyledComponent/PrimaryBtn';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {ErrorDisplayTypes} from 'components/shared/ErrorDisplay/ErrorDisplay';
import Loading from 'components/shared/Loading';
import RecordCard from 'components/shared/RecordCard';
import createRecordMutation from 'graphQL/mutations/records/createRecordMutation';
import {useCanEditRecord} from 'hooks/useCanEditRecord/useCanEditRecord';
import React, {useReducer, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {addNotification} from 'redux/notifications';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {CREATE_RECORD, CREATE_RECORDVariables, CREATE_RECORD_createRecord} from '_gqlTypes/CREATE_RECORD';
import {AttributeType} from '_gqlTypes/globalTypes';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {
    SAVE_VALUE_BATCH_saveValueBatch_errors,
    SAVE_VALUE_BATCH_saveValueBatch_values,
    SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue,
    SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue,
    SAVE_VALUE_BATCH_saveValueBatch_values_Value
} from '_gqlTypes/SAVE_VALUE_BATCH';
import {NotificationPriority, NotificationType, PreviewSize} from '_types/types';
import EditRecord from '../EditRecord';
import useDeleteValueMutation from '../EditRecord/hooks/useDeleteValueMutation';
import useSaveValueBatchMutation from '../EditRecord/hooks/useSaveValueBatchMutation';
import {
    APICallStatus,
    DeleteValueFunc,
    ISubmittedValueLink,
    ISubmittedValueStandard,
    ISubmittedValueTree,
    IValueToSubmit,
    SubmitValueFunc
} from '../EditRecord/_types';
import editRecordReducer from '../editRecordReducer';
import {EditRecordReducerActionsTypes} from '../editRecordReducer/editRecordReducer';
import {EditRecordReducerContext} from '../editRecordReducer/editRecordReducerContext';
import EditRecordSidebar from '../EditRecordSidebar';
import CreationErrorContext from './creationErrorContext';

interface IEditRecordModalProps {
    open: boolean;
    record: RecordIdentity_whoAmI | null;
    library: string;
    onClose: () => void;
    afterCreate?: (newRecord: RecordIdentity_whoAmI) => void;
}

interface IPendingValues {
    [attributeId: string]: {[idValue: string]: SAVE_VALUE_BATCH_saveValueBatch_values};
}

const modalWidth = 900;
const sidebarWidth = 300;

const Container = styled.div<{isSidebarCollapsed: boolean}>`
    height: calc(100vh - 12rem);
    display: grid;
    grid-template-columns: ${p =>
        p.isSidebarCollapsed ? `${modalWidth}px 0` : `minmax(0, ${modalWidth - sidebarWidth}px) ${sidebarWidth}px`};
    grid-template-rows: 5em auto;
    grid-template-areas:
        'title sidebar'
        'content sidebar';
    overflow: hidden;
`;

const Title = styled.div`
    grid-area: title;
    align-self: center;
    font-size: 1.2rem;
    padding: 1rem;
`;

const Content = styled.div`
    height: calc(100vh - 16.5rem);
    grid-area: content;
    padding: 1em;
    overflow-x: hidden;
    overflow-y: scroll;
`;

const Sidebar = styled.div`
    position: relative;
    grid-area: sidebar;
    background: ${themingVar['@leav-secondary-bg']};
    border-top-right-radius: 3px;
    z-index: 1;
`;

const ToggleExpand = styled.div`
    position: absolute;
    left: -25px;
    padding: 5px;
    background: ${themingVar['@leav-secondary-bg']};
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
    cursor: pointer;
`;

function EditRecordModal({open, record, library, onClose, afterCreate: afterSave}: IEditRecordModalProps): JSX.Element {
    const {t} = useTranslation();
    const isCreationMode = !record;

    const [state, dispatch] = useReducer(editRecordReducer, {
        record,
        activeValue: null,
        sidebarCollapsed: false
    });

    const {loading: permissionsLoading, canEdit, isReadOnly} = useCanEditRecord(
        {...record?.library, id: library},
        record?.id
    );

    const {saveValues, loading: saveValuesLoading} = useSaveValueBatchMutation();
    const {deleteValue} = useDeleteValueMutation(record);
    const [createRecord] = useMutation<CREATE_RECORD, CREATE_RECORDVariables>(createRecordMutation, {
        variables: {library}
    });
    const [creationErrors, setCreationErrors] = useState<{
        [attributeId: string]: SAVE_VALUE_BATCH_saveValueBatch_errors;
    }>({});

    const [pendingValues, setPendingValues] = useState<IPendingValues>({});
    const hasPendingValues = !!Object.keys(pendingValues).length;

    const _handleValueSubmit: SubmitValueFunc = async values => {
        if (!isCreationMode) {
            // In Editon mode, submit values immediately and send result back to children
            return saveValues(
                record,
                values.map(val => {
                    const savableValue = {...val, attribute: val.attribute.id};

                    switch (val.attribute.type) {
                        case AttributeType.advanced_link:
                        case AttributeType.simple_link:
                            savableValue.value = (val as ISubmittedValueLink).value.id;
                            break;
                        case AttributeType.tree:
                            savableValue.value = (val as ISubmittedValueTree).value.id;
                            break;
                        default:
                            savableValue.value = (val as ISubmittedValueStandard).value;
                            break;
                    }

                    return savableValue as IValueToSubmit;
                })
            );
        }

        // In creation mode, all values are stored until we submit the whole record
        const newPendingValues = {...pendingValues};
        const storedValues: SAVE_VALUE_BATCH_saveValueBatch_values[] = [];
        for (const value of values) {
            const attributeId = value.attribute.id;
            if (!newPendingValues[attributeId]) {
                newPendingValues[attributeId] = {};
            }

            // Each value is affected a fake id to handle updates
            const valueToStore: Partial<SAVE_VALUE_BATCH_saveValueBatch_values> = {
                id_value: value.idValue ?? `pending_${Object.keys(newPendingValues[attributeId]).length + 1}`,
                modified_at: null,
                modified_by: null,
                created_at: null,
                created_by: null,
                version: null,
                attribute: value.attribute
            };

            // Format value to get all props clean, based on attribute type
            switch (value.attribute.type) {
                case AttributeType.advanced_link:
                case AttributeType.simple_link:
                    (valueToStore as SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue).linkValue = (value as ISubmittedValueLink).value;
                    break;
                case AttributeType.tree:
                    const treeValue = (value as ISubmittedValueTree).value;
                    const valueRecord = treeValue.record;
                    (valueToStore as SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue).treeValue = {
                        record: valueRecord,
                        ancestors: [{record: valueRecord}]
                    };
                    break;
                default:
                    (valueToStore as SAVE_VALUE_BATCH_saveValueBatch_values_Value).value = value.value;
                    (valueToStore as SAVE_VALUE_BATCH_saveValueBatch_values_Value).raw_value = value.value;
                    break;
            }

            newPendingValues[attributeId][valueToStore.id_value] = {
                ...(valueToStore as SAVE_VALUE_BATCH_saveValueBatch_values)
            };
            storedValues.push(valueToStore as SAVE_VALUE_BATCH_saveValueBatch_values);
        }
        // Store values
        setPendingValues(newPendingValues);

        return {
            status: APICallStatus.SUCCESS,
            values: storedValues
        };
    };

    /**
     * Submit the whole record: create record and batch save all stored values
     */
    const _handleRecordSubmit = async () => {
        if (!hasPendingValues) {
            return;
        }

        // Create Record
        let newRecord: CREATE_RECORD_createRecord;
        try {
            const createdRecord = await createRecord();

            newRecord = createdRecord.data.createRecord;
        } catch (err) {
            addNotification({
                type: NotificationType.error,
                content: err.message,
                priority: NotificationPriority.high
            });
            return;
        }

        try {
            // Save values
            const valuesToSave: IValueToSubmit[] = Object.values(pendingValues).reduce((allValues, valuesById) => {
                const attributeValues = Object.values(valuesById).map(val => {
                    let actualValue;
                    switch (val.attribute.type) {
                        case AttributeType.advanced_link:
                        case AttributeType.simple_link:
                            actualValue = (val as SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue).linkValue.id;
                            break;
                        case AttributeType.tree:
                            const treeValue = (val as SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue).treeValue;
                            actualValue = `${treeValue.record.whoAmI.library.id}/${treeValue.record.id}`;
                            break;
                        default:
                            actualValue = (val as SAVE_VALUE_BATCH_saveValueBatch_values_Value).raw_value;
                            break;
                    }
                    return {
                        ...val,
                        value: actualValue,
                        id_value: null,
                        attribute: val.attribute.id
                    };
                });

                return [...allValues, ...attributeValues];
            }, []);

            const saveRes = await saveValues(newRecord.whoAmI, valuesToSave);

            // All encountered errors are available for children, grouped by attribute ID
            if (saveRes.status === APICallStatus.ERROR || saveRes.status === APICallStatus.PARTIAL) {
                setCreationErrors(
                    saveRes.errors.reduce((errors, error) => ({...errors, [error.attribute]: error}), {})
                );
                return;
            } else {
                if (afterSave) {
                    await afterSave(newRecord.whoAmI);
                }

                onClose();
            }
        } catch (err) {
            console.error(err);
            return;
        }
    };

    const _handleDeleteValue: DeleteValueFunc = async (value, attribute) => {
        if (!isCreationMode) {
            return deleteValue(value, attribute);
        }

        const newPendingValues = {...pendingValues};
        delete newPendingValues[attribute][value.id_value];

        setPendingValues(newPendingValues);

        return {
            status: APICallStatus.SUCCESS
        };
    };

    const _handleToggleSidebar = () => dispatch({type: EditRecordReducerActionsTypes.TOGGLE_SIDEBAR});

    const title = record ? (
        <RecordCard record={record} size={PreviewSize.small} withLibrary={false} withPreview={false} />
    ) : (
        t('record_edition.new_record')
    );

    const footerButtons = [
        <Button aria-label={t('global.close')} key="close" onClick={onClose}>
            {t('global.close')}
        </Button>
    ];

    if (isCreationMode) {
        footerButtons.push(
            <PrimaryBtn
                aria-label={t('global.submit')}
                key="submit"
                onClick={_handleRecordSubmit}
                disabled={!hasPendingValues || permissionsLoading}
                loading={saveValuesLoading}
            >
                {t('global.submit')}
            </PrimaryBtn>
        );
    }

    return open ? (
        <div onClick={e => e.stopPropagation()} onDoubleClick={e => e.stopPropagation()}>
            <Modal
                visible={open}
                onCancel={onClose}
                destroyOnClose
                cancelText={t('global.cancel')}
                closable={false}
                maskClosable
                width="90vw"
                centered
                style={{padding: 0, maxWidth: `${modalWidth}px`}}
                bodyStyle={{height: 'calc(100vh - 12rem)', overflowY: 'auto', padding: 0}}
                footer={footerButtons}
            >
                {permissionsLoading ? (
                    <Loading />
                ) : (
                    <EditRecordReducerContext.Provider value={{state, dispatch}}>
                        <CreationErrorContext.Provider value={creationErrors}>
                            <Container isSidebarCollapsed={state.sidebarCollapsed}>
                                <Title>{title}</Title>
                                <Content className="content">
                                    {canEdit ? (
                                        <EditRecord
                                            record={record}
                                            library={library}
                                            onValueSubmit={_handleValueSubmit}
                                            onValueDelete={_handleDeleteValue}
                                            readonly={isReadOnly}
                                        />
                                    ) : (
                                        <ErrorDisplay
                                            type={ErrorDisplayTypes.PERMISSION_ERROR}
                                            showActionButton={false}
                                        />
                                    )}
                                </Content>
                                <Sidebar className="sidebar">
                                    {canEdit && (
                                        <>
                                            <ToggleExpand onClick={_handleToggleSidebar}>
                                                {state.sidebarCollapsed ? <IconClosePanel /> : <IconOpenPanel />}
                                            </ToggleExpand>
                                            <EditRecordSidebar />{' '}
                                        </>
                                    )}
                                </Sidebar>
                            </Container>
                        </CreationErrorContext.Provider>
                    </EditRecordReducerContext.Provider>
                )}
            </Modal>
        </div>
    ) : (
        <></>
    );
}

export default EditRecordModal;
