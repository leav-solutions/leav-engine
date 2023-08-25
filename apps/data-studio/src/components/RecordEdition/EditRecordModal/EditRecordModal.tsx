// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RedoOutlined} from '@ant-design/icons';
import {useMutation} from '@apollo/client';
import {ErrorDisplay, ErrorDisplayTypes, Loading, RecordCard, themeVars} from '@leav/ui';
import {Button, Modal, Space, Tooltip} from 'antd';
import ErrorBoundary from 'components/shared/ErrorBoundary';
import createRecordMutation from 'graphQL/mutations/records/createRecordMutation';
import {
    IRecordPropertyLink,
    IRecordPropertyStandard,
    IRecordPropertyTree
} from 'graphQL/queries/records/getRecordPropertiesQuery';
import {useCanEditRecord} from 'hooks/useCanEditRecord/useCanEditRecord';
import {useReducer, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {VscLayers} from 'react-icons/vsc';
import styled from 'styled-components';
import {CREATE_RECORD, CREATE_RECORDVariables, CREATE_RECORD_createRecord_record_whoAmI} from '_gqlTypes/CREATE_RECORD';
import {AttributeType, ValueBatchInput} from '_gqlTypes/globalTypes';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {
    SAVE_VALUE_BATCH_saveValueBatch_values,
    SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue,
    SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue,
    SAVE_VALUE_BATCH_saveValueBatch_values_Value
} from '_gqlTypes/SAVE_VALUE_BATCH';
import {IValueVersion, PreviewSize} from '_types/types';
import EditRecord from '../EditRecord';
import useDeleteValueMutation from '../EditRecord/hooks/useDeleteValueMutation';
import useSaveValueBatchMutation from '../EditRecord/hooks/useSaveValueBatchMutation';
import {
    APICallStatus,
    DeleteMultipleValuesFunc,
    DeleteValueFunc,
    ISubmittedValueLink,
    ISubmittedValueStandard,
    ISubmittedValueTree,
    IValueToSubmit,
    MetadataSubmitValueFunc,
    SubmitValueFunc
} from '../EditRecord/_types';
import editRecordModalReducer, {
    EditRecordReducerActionsTypes,
    initialState
} from '../editRecordModalReducer/editRecordModalReducer';
import {EditRecordModalReducerContext} from '../editRecordModalReducer/editRecordModalReducerContext';
import EditRecordSidebar from '../EditRecordSidebar';
import CreationErrorContext, {ICreationErrorByField} from './creationErrorContext';
import ValuesVersionSummary from './ValuesVersionSummary';

interface IEditRecordModalProps {
    open: boolean;
    record: RecordIdentity_whoAmI | null;
    library: string;
    onClose: () => void;
    afterCreate?: (newRecord: RecordIdentity_whoAmI) => void;
    valuesVersion?: IValueVersion;
}

interface IPendingValues {
    [attributeId: string]: {[idValue: string]: SAVE_VALUE_BATCH_saveValueBatch_values};
}

const modalWidth = 1200;
const sidebarWidth = 300;

const Container = styled.div`
    height: calc(100vh - 12rem);
    display: grid;
    grid-template-columns: minmax(0, ${modalWidth - sidebarWidth}px) ${sidebarWidth}px;
    grid-template-rows: calc(3.5rem + 1px) auto; // +1px for border
    grid-template-areas:
        'title title'
        'content sidebar';
    overflow: hidden;
    grid-gutter: 0;
`;

const Title = styled.div`
    grid-area: title;
    align-self: center;
    font-size: 1rem;
    padding: 0.5rem;
    border-bottom: 1px solid ${themeVars.borderColor};
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const HeaderIcons = styled.div`
    margin-right: 60px;
    font-size: 1.5em;
    display: flex;
    align-items: center;

    > * {
        cursor: pointer;
    }
`;

const Content = styled.div`
    grid-area: content;
    padding: 1em;
    overflow-x: hidden;
    overflow-y: scroll;
    padding-right: 1rem;
`;

const Sidebar = styled.div`
    overflow-x: hidden;
    overflow-y: scroll;
    position: relative;
    grid-area: sidebar;
    background: ${themeVars.secondaryBg};
    border-top-right-radius: 3px;
    z-index: 1;
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 1rem;
`;

const StyledModal = styled(Modal)`
    && .ant-modal-content {
        padding: 0;
    }
`;

function EditRecordModal({
    open,
    record,
    library,
    onClose,
    afterCreate: afterSave,
    valuesVersion
}: IEditRecordModalProps): JSX.Element {
    const {t} = useTranslation();
    const isCreationMode = !record;

    const [state, dispatch] = useReducer(editRecordModalReducer, {
        ...initialState,
        record,
        libraryId: library,
        valuesVersion,
        originValuesVersion: valuesVersion
    });

    const {loading: permissionsLoading, canEdit, isReadOnly} = useCanEditRecord(
        {...record?.library, id: library},
        record?.id
    );

    const {saveValues, loading: saveValuesLoading} = useSaveValueBatchMutation();
    const {deleteValue} = useDeleteValueMutation(record);
    const [createRecord] = useMutation<CREATE_RECORD, CREATE_RECORDVariables>(createRecordMutation);

    const [creationErrors, setCreationErrors] = useState<ICreationErrorByField>({});

    const [pendingValues, setPendingValues] = useState<IPendingValues>({});
    const hasPendingValues = !!Object.keys(pendingValues).length;

    const _handleValueSubmit: SubmitValueFunc = async (values, version) => {
        if (!isCreationMode) {
            // In Edition mode, submit values immediately and send result back to children
            return saveValues(
                record,
                values.map(val => {
                    const savableValue = {...val, attribute: val.attribute.id, metadata: val.metadata};

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
                }),
                version
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
            let newIdValue = value.idValue;
            if (
                !newIdValue &&
                value.attribute.type !== AttributeType.simple &&
                value.attribute.type !== AttributeType.simple_link
            ) {
                newIdValue = `pending_${Object.keys(newPendingValues[attributeId]).length + 1}`;
            }
            const valueToStore: Partial<SAVE_VALUE_BATCH_saveValueBatch_values> = {
                id_value: newIdValue,
                modified_at: null,
                modified_by: null,
                created_at: null,
                created_by: null,
                version: null,
                attribute: value.attribute,
                metadata: value.metadata
                    ? Object.keys(value.metadata).reduce((metadata, metadataAttributeId) => {
                          metadata.push({
                              name: metadataAttributeId,
                              value: {
                                  id_value: null,
                                  value: value.metadata[metadataAttributeId],
                                  raw_value: value.metadata[metadataAttributeId]
                              }
                          });
                          return metadata;
                      }, [])
                    : null
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
                        id: treeValue.id,
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

    const _handleMetadataSubmit: MetadataSubmitValueFunc = (value, attribute, metadata) => {
        let valueContent;
        switch (attribute.type) {
            case AttributeType.simple:
            case AttributeType.advanced:
                valueContent = (value as IRecordPropertyStandard).raw_value;
                break;
            case AttributeType.advanced_link:
            case AttributeType.simple_link:
                valueContent = (value as IRecordPropertyLink).linkValue;
                break;
            case AttributeType.tree:
                valueContent = (value as IRecordPropertyTree).treeValue;
                break;
        }

        return _handleValueSubmit(
            [
                {
                    idValue: value.id_value,
                    attribute,
                    value: valueContent,
                    metadata
                }
            ],
            null
        );
    };

    /**
     * Submit the whole record: create record and batch save all stored values
     */
    const _handleRecordSubmit = async () => {
        if (!hasPendingValues) {
            return;
        }

        // Create Record
        let newRecord: CREATE_RECORD_createRecord_record_whoAmI = state.record ?? null;
        if (!newRecord) {
            const valuesToSave: ValueBatchInput[] = Object.values(pendingValues).reduce((allValues, valuesById) => {
                const attributeValues = Object.values(valuesById).map(val => {
                    let actualValue;
                    switch (val.attribute.type) {
                        case AttributeType.advanced_link:
                        case AttributeType.simple_link:
                            actualValue = (val as SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue).linkValue.id;
                            break;
                        case AttributeType.tree:
                            const treeValue = (val as SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue).treeValue;
                            actualValue = treeValue.id;
                            break;
                        default:
                            actualValue = (val as SAVE_VALUE_BATCH_saveValueBatch_values_Value).raw_value;
                            break;
                    }
                    return {
                        value: actualValue,
                        id_value: val.id_value ?? null,
                        attribute: val.attribute.id,
                        metadata: val.metadata ?? null
                    };
                });

                return [...allValues, ...attributeValues];
            }, []);

            const creationResult = await createRecord({variables: {library, data: {values: valuesToSave}}});

            if (creationResult.data.createRecord.valuesErrors?.length) {
                // Extract errors by field
                const errorsByField = creationResult.data.createRecord.valuesErrors.reduce((errors, error) => {
                    if (!errors[error.attributeId]) {
                        errors[error.attributeId] = [];
                    }

                    errors[error.attributeId].push(error);

                    return errors;
                }, {});
                setCreationErrors(errorsByField);

                return;
            }

            newRecord = creationResult.data.createRecord.record.whoAmI;

            if (afterSave) {
                await afterSave(newRecord);
            }
        }

        onClose();
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

    const _handleDeleteAllValues: DeleteMultipleValuesFunc = async (attribute, values, version) => {
        if (!isCreationMode) {
            const valuesToSave = values.map(value => ({
                idValue: value.id_value,
                attribute,
                value: null
            }));

            return saveValues(record, valuesToSave, version, true);
        }

        const newPendingValues = {...pendingValues};
        newPendingValues[attribute] = {};

        setPendingValues(newPendingValues);

        return {
            status: APICallStatus.SUCCESS
        };
    };

    const _handleClickValuesVersions = () => {
        dispatch({
            type: EditRecordReducerActionsTypes.SET_SIDEBAR_CONTENT,
            content: state.sidebarContent === 'valuesVersions' ? 'summary' : 'valuesVersions'
        });
    };

    const _handleClickRefresh = () => {
        dispatch({
            type: EditRecordReducerActionsTypes.REQUEST_REFRESH
        });
    };

    const title = record ? <RecordCard record={record} size={PreviewSize.small} /> : t('record_edition.new_record');

    const footerButtons = [
        <Button aria-label={t('global.close')} key="close" onClick={onClose}>
            {t('global.close')}
        </Button>
    ];

    if (isCreationMode) {
        footerButtons.push(
            <Button
                type="primary"
                aria-label={t('global.submit')}
                key="submit"
                onClick={_handleRecordSubmit}
                disabled={!hasPendingValues || permissionsLoading}
                loading={saveValuesLoading}
            >
                {t('global.submit')}
            </Button>
        );
    }

    const footer = (
        <ModalFooter>
            {Object.values(state.valuesVersion ?? {}).filter(v => !!v).length ? (
                <ValuesVersionSummary
                    libraryId={library}
                    version={state.valuesVersion}
                    onVersionClick={_handleClickValuesVersions}
                />
            ) : (
                <div></div>
            )}
            <Space>{footerButtons}</Space>
        </ModalFooter>
    );

    return open ? (
        <div onClick={e => e.stopPropagation()} onDoubleClick={e => e.stopPropagation()}>
            <StyledModal
                open={open}
                onCancel={onClose}
                destroyOnClose
                cancelText={t('global.cancel')}
                width="90vw"
                centered
                style={{maxWidth: `${modalWidth}px`}}
                bodyStyle={{height: 'calc(100vh - 12rem)', overflowY: 'auto'}}
                footer={footer}
            >
                <ErrorBoundary showRecoveryButtons={false}>
                    {permissionsLoading ? (
                        <Loading />
                    ) : (
                        <EditRecordModalReducerContext.Provider value={{state, dispatch}}>
                            <CreationErrorContext.Provider value={creationErrors}>
                                <Container>
                                    <Title>
                                        {title}
                                        <HeaderIcons>
                                            <Tooltip title={t('values_version.title')}>
                                                <VscLayers onClick={_handleClickValuesVersions} />
                                            </Tooltip>
                                            <Tooltip title={t('global.refresh')}>
                                                <RedoOutlined onClick={_handleClickRefresh} />
                                            </Tooltip>
                                        </HeaderIcons>
                                    </Title>
                                    <Content className="content">
                                        {canEdit ? (
                                            <EditRecord
                                                record={record}
                                                library={library}
                                                onValueSubmit={_handleValueSubmit}
                                                onValueDelete={_handleDeleteValue}
                                                onDeleteMultipleValues={_handleDeleteAllValues}
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
                                        <EditRecordSidebar onMetadataSubmit={_handleMetadataSubmit} />
                                    </Sidebar>
                                </Container>
                            </CreationErrorContext.Provider>
                        </EditRecordModalReducerContext.Provider>
                    )}
                </ErrorBoundary>
            </StyledModal>
        </div>
    ) : (
        <></>
    );
}

export default EditRecordModal;
