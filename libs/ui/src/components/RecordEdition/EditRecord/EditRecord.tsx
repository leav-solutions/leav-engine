import isEqual from 'lodash/isEqual';
import {type FunctionComponent, useEffect, useReducer} from 'react';
import styled, {type CSSObject} from 'styled-components';
import {ErrorDisplayTypes} from '../../../constants';
import {useCanEditRecord} from '../../../hooks/useCanEditRecord';
import {type IValueVersion} from '../../../types/values';
import {
    AttributeType,
    type RecordFormAttributeStandardAttributeFragment,
    type RecordIdentityFragment,
    useActivateNewRecordMutation,
    useGetRecordIdCardQuery,
} from '../../../_gqlTypes';
import {ErrorBoundary} from '../../ErrorBoundary';
import {ErrorDisplay} from '../../ErrorDisplay';
import EditRecordContent from '../EditRecordContent';
import useExecuteDeleteValueMutation from '../EditRecordContent/hooks/useExecuteDeleteValueMutation';
import useSaveValueBatchMutation from '../EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import {
    type DeleteMultipleValuesFunc,
    type ISubmittedValueLink,
    type ISubmittedValueStandard,
    type ISubmittedValueTree,
    type IValueToSubmit,
    type SubmitValueFunc,
} from '../EditRecordContent/_types';
import editRecordReducer, {EditRecordReducerActionsTypes, initialState} from '../editRecordReducer/editRecordReducer';
import {EditRecordReducerContext} from '../editRecordReducer/editRecordReducerContext';
import {type FormInstance} from 'antd/lib/form/Form';
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
    showSidebar?: boolean; // TODO: Should be removed when sidebar is fully removed from EditRecord
    scrollAllRecordSummary?: boolean;
    enableSidebar?: boolean; // TODO: Should be removed when sidebar is fully removed from EditRecord
    sidebarContainer?: HTMLElement; // TODO: Should be removed when sidebar is fully removed from EditRecord
    forceDisableSidebarInAppStudio?: boolean; // TODO: Should be removed when sidebar is fully removed from EditRecord
    containerStyle?: CSSObject;
    withInfoButton: boolean;
    removePadding?: boolean; // TODO: This prop should be remove when EditRecord will be moved to app-studio or data-studio deleted
}

const sidebarWidth = '352px';

const Container = styled.div<{$shouldUseLayoutWithSidebar: boolean; style: CSSObject}>`
    display: grid;
    grid-template-columns: ${props => (props.$shouldUseLayoutWithSidebar ? `minmax(0, auto) ${sidebarWidth}` : '1fr')};
    grid-template-areas: ${props => (props.$shouldUseLayoutWithSidebar ? '"content sidebar"' : '"content"')};
    overflow: hidden;
`;

const Content = styled.div<{$shouldUseLayoutWithSidebar: boolean; $removePadding: boolean}>`
    grid-area: content;
    padding: ${props => (props.$removePadding ? 'unset' : '24px')};
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
    scrollAllRecordSummary = false,
    sidebarContainer,
    forceDisableSidebarInAppStudio = false,
    containerStyle,
    withInfoButton,
    removePadding = false,
}) => {
    const [state, dispatch] = useReducer(editRecordReducer, {
        ...initialState,
        record,
        libraryId,
        libraryLabel: null,
        valuesVersion,
        originValuesVersion: valuesVersion,
        withInfoButton,
    });

    const {
        loading: permissionsLoading,
        canEdit,
        isReadOnly,
    } = useCanEditRecord({...record?.library, id: libraryId}, record?.id);

    const {data: libraryData} = useQuery(getLibraryByIdQuery, {
        variables: {id: [libraryId]},
    });

    const {refetch: refetchRecordIdCardQuery} = useGetRecordIdCardQuery({
        variables: {
            id: record?.id ?? '',
            libraryId,
        },
    });

    const {saveValues} = useSaveValueBatchMutation();
    const {deleteValue} = useExecuteDeleteValueMutation(record);
    const [activateNewRecordMutation] = useActivateNewRecordMutation();

    // Update record in reducer when it changes. Might happen on record identity change (after value save)
    useEffect(() => {
        if (libraryData) {
            dispatch({
                type: EditRecordReducerActionsTypes.SET_LIBRARY_LABEL,
                label: libraryData.libraries.list[0].label,
            });
        }
    }, [libraryData]);

    useEffect(() => {
        if (record && !isEqual(record, state.record)) {
            dispatch({
                type: EditRecordReducerActionsTypes.SET_RECORD,
                record,
            });
        }
    }, [record]);

    useEffect(() => {
        dispatch({
            type: EditRecordReducerActionsTypes.SET_ENABLE_SIDEBAR,
            enabled: enableSidebar,
        });
    }, [enableSidebar]);

    useEffect(() => {
        dispatch({
            type: EditRecordReducerActionsTypes.SET_SIDEBAR_IS_OPEN,
            isOpen: showSidebar,
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
            true, // deleteEmpty
        );

    /**
     * Submit the whole record: create record and batch save all stored values
     */
    const _handleRecordSubmit = async (attributes: RecordFormAttributeStandardAttributeFragment[]) => {
        const activateNewRecordResult = await activateNewRecordMutation({
            fetchPolicy: 'network-only',
            variables: {
                libraryId,
                recordId: record.id,
                formId,
            },
        });
        const errors = activateNewRecordResult?.data?.activateNewRecord.valuesErrors;
        if (errors == null || errors?.length === 0) {
            if (onCreate) {
                onCreate(activateNewRecordResult?.data?.activateNewRecord?.record?.whoAmI);
                refetchRecordIdCardQuery(); // Force apollo to set cache with correct whoAmI instead of empty record
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
                    errors: [error.message],
                };
            }),
        );
    };

    const _handleDeleteAllValues: DeleteMultipleValuesFunc = async (attribute, values, version) => {
        const valuesToSave = values.map(value => ({
            idValue: value.id_value,
            attribute,
            value: null,
        }));

        return saveValues(record, valuesToSave, version, true);
    };

    const shouldUseLayoutWithSidebar =
        state.enableSidebar && state.isOpenSidebar && sidebarContainer === undefined && !forceDisableSidebarInAppStudio;

    return (
        <ErrorBoundary>
            <EditRecordReducerContext.Provider value={{state, dispatch}}>
                <Container $shouldUseLayoutWithSidebar={shouldUseLayoutWithSidebar} style={containerStyle}>
                    <EditRecordButtons />
                    <Content
                        className="edit-record-content-container"
                        $shouldUseLayoutWithSidebar={shouldUseLayoutWithSidebar}
                        $removePadding={removePadding}
                    >
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
                    {!forceDisableSidebarInAppStudio && (
                        <EditRecordSidebar
                            sidebarContainer={sidebarContainer}
                            scrollAllRecordSummary={scrollAllRecordSummary}
                        />
                    )}
                </Container>
            </EditRecordReducerContext.Provider>
        </ErrorBoundary>
    );
};
