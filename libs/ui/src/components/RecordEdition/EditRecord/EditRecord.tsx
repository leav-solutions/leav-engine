// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import isEqual from 'lodash/isEqual';
import {FunctionComponent, useEffect, useReducer, useRef, useState} from 'react';
import styled, {CSSObject} from 'styled-components';
import {ErrorDisplayTypes} from '../../../constants';
import {useCanEditRecord} from '../../../hooks/useCanEditRecord';
import {IValueVersion} from '../../../types/values';
import {
    AttributeType,
    RecordIdentityFragment,
    useCreateRecordMutation,
    ValueBatchInput,
    ValueDetailsFragment,
    ValueDetailsLinkValueFragment,
    ValueDetailsTreeValueFragment,
    ValueDetailsValueFragment
} from '../../../_gqlTypes';
import {
    IRecordPropertyLink,
    IRecordPropertyStandard,
    IRecordPropertyTree
} from '../../../_queries/records/getRecordPropertiesQuery';
import {ErrorBoundary} from '../../ErrorBoundary';
import {ErrorDisplay} from '../../ErrorDisplay';
import EditRecordContent from '../EditRecordContent';
import EditRecordSkeleton from '../EditRecordContent/EditRecordSkeleton';
import useExecuteDeleteValueMutation from '../EditRecordContent/hooks/useExecuteDeleteValueMutation';
import useSaveValueBatchMutation from '../EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
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
} from '../EditRecordContent/_types';
import editRecordReducer, {EditRecordReducerActionsTypes, initialState} from '../editRecordReducer/editRecordReducer';
import {EditRecordReducerContext} from '../editRecordReducer/editRecordReducerContext';
import CreationErrorContext, {ICreationErrorByField} from './creationErrorContext';
import {FormInstance} from 'antd/lib/form/Form';
import {useRunActionsListAndFormatOnValue} from '../EditRecordContent/hooks/useRunActionsListAndFormatOnValue';
import EditRecordSidebar from '../EditRecordSidebar';

interface IEditRecordProps {
    antdForm: FormInstance;
    record: RecordIdentityFragment['whoAmI'] | null;
    library: string;
    onCreate?: (newRecord: RecordIdentityFragment['whoAmI']) => void;
    valuesVersion?: IValueVersion;
    showSidebar?: boolean;
    sidebarContainer?: HTMLElement;
    containerStyle?: CSSObject;
    withInfoButton: boolean;
    // Here we're not in charge of buttons position. It might on a modal footer or pretty much anywhere.
    // We're using refs to still be able to handle the click on the buttons
    buttonsRefs: {
        refresh?: React.RefObject<HTMLButtonElement>;
        valuesVersions?: React.RefObject<HTMLButtonElement>;
    };
}

interface IPendingValues {
    [attributeId: string]: {[idValue: string]: ValueDetailsFragment};
}

const sidebarWidth = '352px';

const Container = styled.div<{$shouldUseLayoutWithSidebar: boolean; style: CSSObject}>`
    display: grid;
    grid-template-columns: ${props => (props.$shouldUseLayoutWithSidebar ? `minmax(0, auto) ${sidebarWidth}` : '1fr')};
    grid-template-areas: ${props => (props.$shouldUseLayoutWithSidebar ? '"content sidebar"' : '"content"')};
    overflow: hidden;
`;

const Content = styled.div<{$shouldUseLayoutWithSidebar: boolean}>`
    grid-area: content;
    padding: 24px;
    overflow-x: hidden;
    overflow-y: scroll;
    border-right: ${props =>
        props.$shouldUseLayoutWithSidebar ? '1px solid var(--general-utilities-border)' : 'none'};
`;

export const EditRecord: FunctionComponent<IEditRecordProps> = ({
    antdForm,
    record,
    library,
    onCreate,
    valuesVersion,
    showSidebar = false,
    sidebarContainer,
    containerStyle,
    withInfoButton,
    buttonsRefs
}) => {
    const isCreationMode = !record;

    const [state, dispatch] = useReducer(editRecordReducer, {
        ...initialState,
        record,
        libraryId: library,
        valuesVersion,
        originValuesVersion: valuesVersion,
        sidebarContent: showSidebar ? 'summary' : 'none',
        sidebarDefaultHidden: !showSidebar,
        withInfoButton
    });

    const {
        loading: permissionsLoading,
        canEdit,
        isReadOnly
    } = useCanEditRecord({...record?.library, id: library}, record?.id);

    const {saveValues} = useSaveValueBatchMutation();
    const {deleteValue} = useExecuteDeleteValueMutation(record);
    const [createRecord] = useCreateRecordMutation();

    const [creationErrors, setCreationErrors] = useState<ICreationErrorByField>({});

    const [pendingValues, setPendingValues] = useState<IPendingValues>({});

    // As _handleRecordSubmit is called via the callback of an event listener, it won't have access to the latest state.
    // We use a ref to store the latest state and access it in the callback
    const pendingValuesRef = useRef(pendingValues);

    // Update record in reducer when it changes. Might happen on record identity change (after value save)
    useEffect(() => {
        if (record && !isEqual(record, state.record)) {
            dispatch({
                type: EditRecordReducerActionsTypes.SET_RECORD,
                record
            });
        }
    }, [record]);

    // Add events listeners on buttons (submit, close, refresh...)
    useEffect(() => {
        for (const buttonName of Object.keys(buttonsRefs)) {
            buttonsRefs[buttonName]?.current?.addEventListener('click', listenersByButtonsName[buttonName]);
        }

        return () => {
            for (const buttonName of Object.keys(buttonsRefs)) {
                buttonsRefs[buttonName]?.current?.removeEventListener('click', listenersByButtonsName[buttonName]);
            }
        };
    }, [buttonsRefs]);

    // Keep pendingValuesRef in sync with the state
    useEffect(() => {
        pendingValuesRef.current = pendingValues;
    }, [pendingValues]);

    const {runActionsListAndFormatOnValue} = useRunActionsListAndFormatOnValue();

    const _handleValueSubmit: SubmitValueFunc = async (values, version) => {
        if (!isCreationMode) {
            // In Edition mode, submit values immediately and send result back to children
            return saveValues(
                record,
                values.map(val => {
                    const savableValue = {...val, attribute: val.attribute.id, metadata: val.metadata};

                    if (val.value) {
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
                    }

                    return savableValue as IValueToSubmit;
                }),
                version,
                true // deleteEmpty
            );
        }

        // In creation mode, all values are stored until we submit the whole record
        const newPendingValues = {...pendingValues};
        const storedValues: ValueDetailsFragment[] = [];
        for (const value of values) {
            const valueToProcess = {...value, attribute: value.attribute.id, metadata: value.metadata};

            if (valueToProcess.value) {
                switch (value.attribute.type) {
                    case AttributeType.advanced_link:
                    case AttributeType.simple_link:
                        valueToProcess.value = (value as ISubmittedValueLink).value.id;
                        break;
                    case AttributeType.tree:
                        valueToProcess.value = (value as ISubmittedValueTree).value.id;
                        break;
                    default:
                        valueToProcess.value = (value as ISubmittedValueStandard).value;
                        break;
                }
            }

            const valueAfterActionsListAndFormat = await runActionsListAndFormatOnValue(
                library,
                valueToProcess as IValueToSubmit,
                version
            );

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
            // const valueToStore: Partial<SAVE_VALUE_BATCH_saveValueBatch_values> = {
            const valueToStore: Partial<ValueDetailsFragment> = {
                id_value: newIdValue,
                modified_at: null,
                modified_by: null,
                created_at: null,
                created_by: null,
                version: null,
                attribute: value.attribute,
                metadata: value.metadata
                    ? Object.keys(value.metadata).reduce((metadata, metadataAttributeId) => {
                          const metadataValue = {
                              id_value: null,
                              modified_at: null,
                              modified_by: null,
                              created_at: null,
                              created_by: null,
                              version: null,
                              value: value.metadata[metadataAttributeId],
                              raw_value: value.metadata[metadataAttributeId]
                          };

                          // If we find an existing metadata value, update it, otherwise add a new one
                          const existingMetataIndex = metadata.findIndex(
                              existingMetadata => existingMetadata.name === metadataAttributeId
                          );

                          if (existingMetataIndex !== -1) {
                              metadata[existingMetataIndex].value = metadataValue;
                          } else {
                              metadata.push({
                                  name: metadataAttributeId,
                                  value: metadataValue
                              });
                          }

                          return metadata;
                      }, newPendingValues?.[attributeId]?.[newIdValue]?.metadata ?? [])
                    : null
            };

            // Format value to get all props clean, based on attribute type
            switch (value.attribute.type) {
                case AttributeType.advanced_link:
                case AttributeType.simple_link:
                    (valueToStore as ValueDetailsLinkValueFragment).linkValue = (value as ISubmittedValueLink).value;
                    break;
                case AttributeType.tree:
                    const treeValue = (value as ISubmittedValueTree).value;
                    const valueRecord = treeValue.record;
                    (valueToStore as ValueDetailsTreeValueFragment).treeValue = {
                        id: treeValue.id,
                        record: valueRecord,
                        ancestors: [{record: valueRecord}]
                    };
                    break;
                default:
                    (valueToStore as ValueDetailsValueFragment).payload =
                        valueAfterActionsListAndFormat.payload ?? value.value;
                    (valueToStore as ValueDetailsValueFragment).raw_payload = value.value;
                    break;
            }

            newPendingValues[attributeId][valueToStore.id_value] = {
                ...(valueToStore as ValueDetailsFragment)
            };
            storedValues.push(valueToStore as ValueDetailsFragment);
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
                valueContent = (value as IRecordPropertyStandard).raw_payload;
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
        const currentPendingValues = pendingValuesRef.current ?? {};

        if (state.record) {
            return;
        }

        const valuesToSave: ValueBatchInput[] = Object.values(currentPendingValues).reduce(
            (allValues: ValueBatchInput[], valuesById) => {
                const attributeValues: ValueBatchInput[] = Object.values(valuesById).map(val => {
                    let actualValue;
                    switch (val.attribute.type) {
                        case AttributeType.advanced_link:
                        case AttributeType.simple_link:
                            actualValue = (val as ValueDetailsLinkValueFragment).linkValue.id;
                            break;
                        case AttributeType.tree:
                            const treeValue = (val as ValueDetailsTreeValueFragment).treeValue;
                            actualValue = treeValue.id;
                            break;
                        default:
                            actualValue = (val as ValueDetailsValueFragment).raw_payload;
                            break;
                    }
                    return {
                        payload: actualValue,
                        id_value: val.id_value ?? null,
                        attribute: val.attribute.id,
                        metadata: val.metadata
                            ? val.metadata.map(metadataValue => ({
                                  name: metadataValue.name,
                                  value: metadataValue.value.raw_payload
                              }))
                            : null
                    };
                });
                return [...allValues, ...attributeValues];
            },
            []
        );

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

            antdForm.setFields(
                creationResult.data.createRecord.valuesErrors.map(error => ({
                    name: error.attributeId,
                    errors: [error.message]
                }))
            );

            return;
        }

        const newRecord = creationResult.data.createRecord.record.whoAmI;

        if (onCreate) {
            onCreate(newRecord);
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

    const listenersByButtonsName: Record<keyof IEditRecordProps['buttonsRefs'], () => void> = {
        refresh: () => {
            dispatch({
                type: EditRecordReducerActionsTypes.REQUEST_REFRESH
            });
        },
        valuesVersions: () => {
            dispatch({
                type: EditRecordReducerActionsTypes.SET_SIDEBAR_CONTENT,
                content: state.sidebarContent === 'valuesVersions' ? 'summary' : 'valuesVersions'
            });
        }
    };

    const shouldUseLayoutWithSidebar = state.sidebarContent !== 'none' && sidebarContainer === undefined && showSidebar;

    return (
        <ErrorBoundary>
            <EditRecordReducerContext.Provider value={{state, dispatch}}>
                <CreationErrorContext.Provider value={creationErrors}>
                    <Container $shouldUseLayoutWithSidebar={shouldUseLayoutWithSidebar} style={containerStyle}>
                        <Content $shouldUseLayoutWithSidebar={shouldUseLayoutWithSidebar}>
                            {permissionsLoading ? (
                                <EditRecordSkeleton rows={5} />
                            ) : canEdit ? (
                                <EditRecordContent
                                    antdForm={antdForm}
                                    record={record}
                                    library={library}
                                    onRecordSubmit={_handleRecordSubmit}
                                    onValueSubmit={_handleValueSubmit}
                                    onValueDelete={_handleDeleteValue}
                                    onDeleteMultipleValues={_handleDeleteAllValues}
                                    readonly={isReadOnly}
                                />
                            ) : (
                                <ErrorDisplay type={ErrorDisplayTypes.PERMISSION_ERROR} showActionButton={false} />
                            )}
                        </Content>
                        <EditRecordSidebar
                            onMetadataSubmit={_handleMetadataSubmit}
                            open={showSidebar}
                            sidebarContainer={sidebarContainer}
                        />
                    </Container>
                </CreationErrorContext.Provider>
            </EditRecordReducerContext.Provider>
        </ErrorBoundary>
    );
};
