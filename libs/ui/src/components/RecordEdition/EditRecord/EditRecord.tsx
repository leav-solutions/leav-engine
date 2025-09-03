// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import isEqual from 'lodash/isEqual';
import {FunctionComponent, useEffect, useReducer} from 'react';
import styled, {CSSObject} from 'styled-components';
import {ErrorDisplayTypes} from '../../../constants';
import {useCanEditRecord} from '../../../hooks/useCanEditRecord';
import {IValueVersion} from '../../../types/values';
import {
    AttributeType,
    RecordFormAttributeStandardAttributeFragment,
    RecordIdentityFragment,
    useActivateNewRecordMutation
} from '../../../_gqlTypes';
import {
    IRecordPropertyLink,
    IRecordPropertyStandard,
    IRecordPropertyTree
} from '../../../_queries/records/getRecordPropertiesQuery';
import {ErrorBoundary} from '../../ErrorBoundary';
import {ErrorDisplay} from '../../ErrorDisplay';
import EditRecordContent from '../EditRecordContent';
import useExecuteDeleteValueMutation from '../EditRecordContent/hooks/useExecuteDeleteValueMutation';
import useSaveValueBatchMutation from '../EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import {
    DeleteMultipleValuesFunc,
    ISubmittedValueLink,
    ISubmittedValueStandard,
    ISubmittedValueTree,
    IValueToSubmit,
    MetadataSubmitValueFunc,
    SubmitValueFunc
} from '../EditRecordContent/_types';
import editRecordReducer, {EditRecordReducerActionsTypes, initialState} from '../editRecordReducer/editRecordReducer';
import {EditRecordReducerContext} from '../editRecordReducer/editRecordReducerContext';
import {FormInstance} from 'antd/lib/form/Form';
import EditRecordSidebar from '../EditRecordSidebar';
import EditRecordSkeleton from '../EditRecordSkeleton';
import {useQuery} from '@apollo/client';
import {getLibraryByIdQuery} from '_ui/_queries/libraries/getLibraryByIdQuery';
import EditRecordButtons from '../EditRecordButtons';

interface IEditRecordProps {
    antdForm: FormInstance;
    formId: string;
    isFormCreationMode: boolean;
    formElementId?: string;
    record: RecordIdentityFragment['whoAmI'] | null;
    library: string;
    onCreate?: (newRecord: RecordIdentityFragment['whoAmI']) => void;
    valuesVersion?: IValueVersion;
    showSidebar?: boolean;
    enableSidebar?: boolean;
    sidebarContainer?: HTMLElement;
    containerStyle?: CSSObject;
    withInfoButton: boolean;
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
    formId,
    isFormCreationMode,
    formElementId,
    record,
    library: libraryId,
    onCreate,
    valuesVersion,
    enableSidebar = false,
    showSidebar = false,
    sidebarContainer,
    containerStyle,
    withInfoButton
}) => {
    const [state, dispatch] = useReducer(editRecordReducer, {
        ...initialState,
        record,
        libraryId,
        libraryLabel: null,
        valuesVersion,
        originValuesVersion: valuesVersion,
        withInfoButton
    });

    const {
        loading: permissionsLoading,
        canEdit,
        isReadOnly
    } = useCanEditRecord({...record?.library, id: libraryId}, record?.id);

    const {data: libraryData} = useQuery(getLibraryByIdQuery, {
        variables: {id: [libraryId]}
    });

    const {saveValues} = useSaveValueBatchMutation();
    const {deleteValue} = useExecuteDeleteValueMutation(record);
    const [activateNewRecordMutation] = useActivateNewRecordMutation();

    // Update record in reducer when it changes. Might happen on record identity change (after value save)
    useEffect(() => {
        if (libraryData) {
            dispatch({
                type: EditRecordReducerActionsTypes.SET_LIBRARY_LABEL,
                label: libraryData.libraries.list[0].label
            });
        }
    }, [libraryData]);

    useEffect(() => {
        if (record && !isEqual(record, state.record)) {
            dispatch({
                type: EditRecordReducerActionsTypes.SET_RECORD,
                record
            });
        }
    }, [record]);

    useEffect(() => {
        dispatch({
            type: EditRecordReducerActionsTypes.SET_ENABLE_SIDEBAR,
            enabled: enableSidebar
        });
    }, [enableSidebar]);

    useEffect(() => {
        dispatch({
            type: EditRecordReducerActionsTypes.SET_SIDEBAR_IS_OPEN,
            isOpen: showSidebar
        });
    }, [showSidebar]);

    const _handleValueSubmit: SubmitValueFunc = async (values, version) =>
        saveValues(
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
    const _handleRecordSubmit = async (attributes: RecordFormAttributeStandardAttributeFragment[]) => {
        const activateNewRecordResult = await activateNewRecordMutation({
            fetchPolicy: 'network-only',
            variables: {
                libraryId,
                recordId: record.id,
                formId
            }
        });
        const errors = activateNewRecordResult?.data?.activateNewRecord.valuesErrors;
        if (errors?.length === 0) {
            if (onCreate) {
                onCreate(activateNewRecordResult?.data?.activateNewRecord?.record?.whoAmI);
            }
            return;
        }
        antdForm.setFields(
            errors.map(error => {
                const attributeInError = attributes.find(attribute => attribute.id === error.attribute);

                const doesAttributeHaveMultipleFields =
                    attributeInError?.multiple_values &&
                    ![AttributeType.simple_link, AttributeType.advanced_link].includes(attributeInError.type);

                return {
                    name:
                        doesAttributeHaveMultipleFields && error.type === 'REQUIRED_ATTRIBUTE'
                            ? [error.attribute, 0]
                            : error.attribute,
                    errors: [error.message]
                };
            })
        );
    };

    const _handleDeleteAllValues: DeleteMultipleValuesFunc = async (attribute, values, version) => {
        const valuesToSave = values.map(value => ({
            idValue: value.id_value,
            attribute,
            value: null
        }));

        return saveValues(record, valuesToSave, version, true);
    };

    const shouldUseLayoutWithSidebar = state.enableSidebar && state.isOpenSidebar && sidebarContainer === undefined;

    return (
        <ErrorBoundary>
            <EditRecordReducerContext.Provider value={{state, dispatch}}>
                <Container $shouldUseLayoutWithSidebar={shouldUseLayoutWithSidebar} style={containerStyle}>
                    <EditRecordButtons />
                    <Content $shouldUseLayoutWithSidebar={shouldUseLayoutWithSidebar}>
                        {permissionsLoading ? (
                            <EditRecordSkeleton rows={5} />
                        ) : canEdit ? (
                            <EditRecordContent
                                antdForm={antdForm}
                                formId={formId}
                                isFormCreationMode={isFormCreationMode}
                                formElementId={formElementId}
                                record={record}
                                library={libraryId}
                                onRecordSubmit={_handleRecordSubmit}
                                onValueSubmit={_handleValueSubmit}
                                onValueDelete={deleteValue}
                                onDeleteMultipleValues={_handleDeleteAllValues}
                                readonly={isReadOnly}
                            />
                        ) : (
                            <ErrorDisplay type={ErrorDisplayTypes.PERMISSION_ERROR} showActionButton={false} />
                        )}
                    </Content>
                    <EditRecordSidebar onMetadataSubmit={_handleMetadataSubmit} sidebarContainer={sidebarContainer} />
                </Container>
            </EditRecordReducerContext.Provider>
        </ErrorBoundary>
    );
};
