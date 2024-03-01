// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import isEqual from 'lodash/isEqual';
import {FunctionComponent, useEffect, useReducer, useRef, useState} from 'react';
import styled, {CSSObject} from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {themeVars} from '../../../antdTheme';
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
import EditRecordSidebar from '../EditRecordSidebar';
import CreationErrorContext, {ICreationErrorByField} from './creationErrorContext';

interface IEditRecordProps {
    record: RecordIdentityFragment['whoAmI'] | null;
    library: string;
    onClose: () => void;
    afterCreate?: (newRecord: RecordIdentityFragment['whoAmI']) => void;
    valuesVersion?: IValueVersion;
    showSidebar?: boolean;
    containerStyle?: CSSObject;

    // Here we're not in charge of buttons position. It might on a modal footer or pretty much anywhere.
    // We're using refs to still be able to handle the click on the buttons
    buttonsRefs: {
        submit?: React.RefObject<HTMLButtonElement>;
        close?: React.RefObject<HTMLButtonElement>;
        refresh?: React.RefObject<HTMLButtonElement>;
        valuesVersions?: React.RefObject<HTMLButtonElement>;
    };
}

interface IPendingValues {
    [attributeId: string]: {[idValue: string]: ValueDetailsFragment};
}

const modalWidth = 1200;
const sidebarWidth = 300;

const Container = styled.div<{$showSidebar: boolean; style: CSSObject}>`
    display: grid;
    grid-template-columns: ${props =>
        props.$showSidebar ? `minmax(0, ${modalWidth - sidebarWidth}px) ${sidebarWidth}px` : '1fr'};
    grid-template-areas: ${props => (props.$showSidebar ? '"content sidebar"' : '"content"')};
    overflow: hidden;
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

export const EditRecord: FunctionComponent<IEditRecordProps> = ({
    record,
    library,
    onClose,
    afterCreate: afterSave,
    valuesVersion,
    showSidebar = false,
    containerStyle,
    buttonsRefs
}) => {
    const {t} = useSharedTranslation();
    const isCreationMode = !record;

    const [state, dispatch] = useReducer(editRecordReducer, {
        ...initialState,
        record,
        libraryId: library,
        valuesVersion,
        originValuesVersion: valuesVersion,
        sidebarContent: showSidebar ? 'summary' : 'none',
        sidebarDefaultHidden: !showSidebar
    });

    const {loading: permissionsLoading, canEdit, isReadOnly} = useCanEditRecord(
        {...record?.library, id: library},
        record?.id
    );

    const {saveValues, loading: saveValuesLoading} = useSaveValueBatchMutation();
    const {deleteValue} = useExecuteDeleteValueMutation(record);
    const [createRecord] = useCreateRecordMutation();

    const [creationErrors, setCreationErrors] = useState<ICreationErrorByField>({});

    const [pendingValues, setPendingValues] = useState<IPendingValues>({});

    // As _handleRecordSubmit is called via the callback of an event listener, it won't have access to the latest state.
    // We use a ref to store the latest state and access it in the callback
    const pendingValuesRef = useRef(pendingValues);

    const hasPendingValues = !!Object.keys(pendingValues).length;

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

    // Handle state (disabled or not) of submit button
    useEffect(() => {
        if (!buttonsRefs?.submit?.current) {
            return;
        }

        buttonsRefs.submit.current.disabled = !hasPendingValues;
    }, [hasPendingValues, buttonsRefs.submit]);

    // Keep pendingValuesRef in sync with the state
    useEffect(() => {
        pendingValuesRef.current = pendingValues;
    }, [pendingValues]);

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
        const storedValues: ValueDetailsFragment[] = [];
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
                    (valueToStore as ValueDetailsValueFragment).value = value.value;
                    (valueToStore as ValueDetailsValueFragment).raw_value = value.value;
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
        const currentPendingValues = pendingValuesRef.current ?? {};
        if (!!!Object.keys(currentPendingValues).length) {
            return;
        }

        // Create Record
        let newRecord: RecordIdentityFragment['whoAmI'] = state.record ?? null;
        if (!newRecord) {
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
                                actualValue = (val as ValueDetailsValueFragment).raw_value;
                                break;
                        }
                        return {
                            value: actualValue,
                            id_value: val.id_value ?? null,
                            attribute: val.attribute.id,
                            metadata: val.metadata
                                ? val.metadata.map(metadataValue => ({
                                      name: metadataValue.name,
                                      value: metadataValue.value.raw_value
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

                return;
            }

            newRecord = creationResult.data.createRecord.record.whoAmI;

            if (afterSave) {
                afterSave(newRecord);
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

    const listenersByButtonsName: Record<keyof IEditRecordProps['buttonsRefs'], () => void> = {
        submit: _handleRecordSubmit,
        close: onClose,
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

    return (
        <ErrorBoundary>
            <EditRecordReducerContext.Provider value={{state, dispatch}}>
                <CreationErrorContext.Provider value={creationErrors}>
                    <Container $showSidebar={state.sidebarContent !== 'none'} style={containerStyle}>
                        <Content className="content">
                            {permissionsLoading ? (
                                <EditRecordSkeleton rows={5} />
                            ) : canEdit ? (
                                <EditRecordContent
                                    record={record}
                                    library={library}
                                    onValueSubmit={_handleValueSubmit}
                                    onValueDelete={_handleDeleteValue}
                                    onDeleteMultipleValues={_handleDeleteAllValues}
                                    readonly={isReadOnly}
                                />
                            ) : (
                                <ErrorDisplay type={ErrorDisplayTypes.PERMISSION_ERROR} showActionButton={false} />
                            )}
                        </Content>
                        <Sidebar className="sidebar">
                            <EditRecordSidebar onMetadataSubmit={_handleMetadataSubmit} />
                        </Sidebar>
                    </Container>
                </CreationErrorContext.Provider>
            </EditRecordReducerContext.Provider>
        </ErrorBoundary>
    );
};
