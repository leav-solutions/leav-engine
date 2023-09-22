// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorDisplay} from '@leav/ui';
import {AnyPrimitive, ErrorTypes, ICommonFieldsSettings} from '@leav/utils';
import CreationErrorContext from 'components/RecordEdition/EditRecordModal/creationErrorContext';
import {EditRecordReducerActionsTypes} from 'components/RecordEdition/editRecordModalReducer/editRecordModalReducer';
import {useEditRecordModalReducer} from 'components/RecordEdition/editRecordModalReducer/useEditRecordModalReducer';
import {RecordFormElementsValueStandardValue} from 'hooks/useGetRecordForm/useGetRecordForm';
import useRefreshFieldValues from 'hooks/useRefreshFieldValues';
import {useContext, useEffect, useMemo, useReducer} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {AttributeFormat} from '_gqlTypes/globalTypes';
import {RECORD_FORM_recordForm_elements_values} from '_gqlTypes/RECORD_FORM';
import {SAVE_VALUE_BATCH_saveValueBatch_values_Value} from '_gqlTypes/SAVE_VALUE_BATCH';
import {useRecordEditionContext} from '../../hooks/useRecordEditionContext';
import standardFieldReducer, {
    computeInitialState,
    IdValue,
    newValueId,
    StandardFieldReducerActionsTypes
} from '../../reducers/standardFieldReducer/standardFieldReducer';
import AddValueBtn from '../../shared/AddValueBtn';
import DeleteAllValuesBtn from '../../shared/DeleteAllValuesBtn';
import FieldFooter from '../../shared/FieldFooter';
import ValuesVersionBtn from '../../shared/ValuesVersionBtn';
import {APICallStatus, FieldScope, IFormElementProps} from '../../_types';
import StandardFieldValue from './StandardFieldValue';

const Wrapper = styled.div<{metadataEdit: boolean}>`
    margin-bottom: ${props => (props.metadataEdit ? 0 : '1.5em')};
`;

export const emptyValue: RECORD_FORM_recordForm_elements_values = {
    id_value: null,
    created_at: null,
    modified_at: null,
    created_by: null,
    modified_by: null,
    metadata: null,
    raw_value: null,
    value: null,
    version: null
};

function StandardField({
    element,
    onValueSubmit,
    onValueDelete,
    onDeleteMultipleValues,
    metadataEdit = false
}: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    const {t} = useTranslation();

    const {readOnly: isRecordReadOnly, record} = useRecordEditionContext();
    const {state: editRecordState} = useEditRecordModalReducer();
    const {state: editRecordModalState, dispatch: editRecordModalDispatch} = useEditRecordModalReducer();

    const {fetchValues} = useRefreshFieldValues(
        editRecordState.record?.library?.id,
        element.attribute?.id,
        editRecordState.record?.id
    );

    const isMultipleValues = element.attribute.multiple_values;
    const {attribute} = element;
    const creationErrors = useContext(CreationErrorContext);
    const isInCreationMode = record === null;

    const initialState = useMemo(
        () =>
            computeInitialState({
                element,
                record,
                isRecordReadOnly,
                formVersion: editRecordState.valuesVersion,
                metadataEdit
            }),
        []
    );

    const [state, dispatch] = useReducer(standardFieldReducer, initialState);

    useEffect(() => {
        if (creationErrors[attribute.id]) {
            // Affect error to each invalid value to display it on form
            for (const fieldError of creationErrors[attribute.id]) {
                const idValue = fieldError.id_value ?? null;

                dispatch({
                    type: StandardFieldReducerActionsTypes.SET_ERROR,
                    idValue,
                    error: fieldError.message
                });
            }
        }
    }, [creationErrors, attribute.id]);

    const _handleSubmit = async (idValue: IdValue, valueToSave: AnyPrimitive) => {
        const isSavingNewValue = idValue === newValueId;
        dispatch({
            type: StandardFieldReducerActionsTypes.CLEAR_ERROR,
            idValue
        });

        const valueVersion = state.values[state.activeScope].version;
        const submitRes = await onValueSubmit(
            [{value: valueToSave, idValue: isSavingNewValue ? null : idValue, attribute}],
            valueVersion
        );

        if (submitRes.status === APICallStatus.SUCCESS) {
            const submitResValue = submitRes.values[0] as SAVE_VALUE_BATCH_saveValueBatch_values_Value;

            let resultValue;
            if (state.metadataEdit) {
                const metadataValue =
                    (submitResValue.metadata ?? []).find(({name}) => name === element.attribute.id)?.value ?? null;
                resultValue = {
                    id_value: null,
                    created_at: null,
                    modified_at: null,
                    created_by: null,
                    modified_by: null,
                    version: null,
                    raw_value: metadataValue.raw_value ?? metadataValue.value,
                    value: metadataValue.value,
                    metadata: null,
                    attribute
                };
            } else {
                resultValue = submitResValue;
            }

            dispatch({
                type: StandardFieldReducerActionsTypes.UPDATE_AFTER_SUBMIT,
                newValue: resultValue,
                idValue
            });

            const newActiveValue = state.metadataEdit
                ? {
                      ...editRecordModalState.activeValue,
                      value: {
                          ...editRecordModalState.activeValue.value,
                          metadata: [
                              ...(editRecordModalState.activeValue?.value?.metadata ?? []),
                              {
                                  name: element.attribute.id,
                                  value: {
                                      ...resultValue,
                                      version: null,
                                      metadata: null
                                  }
                              }
                          ]
                      }
                  }
                : null;

            editRecordModalDispatch({
                type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
                value: newActiveValue
            });

            return;
        }

        let errorMessage = submitRes.error;
        if (!errorMessage && submitRes.errors) {
            const attributeError = (submitRes?.errors ?? []).filter(err => err.attribute === attribute.id)?.[0];

            if (attributeError) {
                errorMessage =
                    attributeError.type === ErrorTypes.VALIDATION_ERROR
                        ? attributeError.message
                        : t(`errors.${attributeError.type}`);
            }
        }

        dispatch({
            type: StandardFieldReducerActionsTypes.SET_ERROR,
            idValue,
            error: errorMessage
        });
    };

    const _handleDelete = async (idValue: IdValue) => {
        dispatch({
            type: StandardFieldReducerActionsTypes.UNEDIT_FIELD,
            idValue
        });

        const deleteRes = await onValueDelete({id_value: idValue}, attribute.id);

        if (deleteRes.status === APICallStatus.SUCCESS) {
            dispatch({
                type: StandardFieldReducerActionsTypes.UPDATE_AFTER_DELETE,
                idValue
            });

            if (!isInCreationMode) {
                const freshValues = await fetchValues(state.values[state.activeScope].version);

                dispatch({
                    type: StandardFieldReducerActionsTypes.REFRESH_VALUES,
                    formVersion: editRecordState.valuesVersion,
                    values: freshValues as RecordFormElementsValueStandardValue[]
                });
            }

            return;
        }

        dispatch({
            type: StandardFieldReducerActionsTypes.SET_ERROR,
            idValue,
            error: deleteRes.error
        });
    };

    const _handleAddValue = () => {
        editRecordModalDispatch({
            type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
            value: {
                attribute,
                value: null
            }
        });

        dispatch({
            type: StandardFieldReducerActionsTypes.ADD_VALUE
        });
    };

    const _handleScopeChange = (scope: FieldScope) => {
        dispatch({
            type: StandardFieldReducerActionsTypes.CHANGE_VERSION_SCOPE,
            scope
        });
    };

    const _handleDeleteAllValues = async () => {
        const deleteRes = await onDeleteMultipleValues(
            attribute.id,
            Object.values(state.values[state.activeScope].values).map(v => v.value),
            null
        );

        if (deleteRes.status === APICallStatus.SUCCESS) {
            dispatch({
                type: StandardFieldReducerActionsTypes.UPDATE_AFTER_DELETE,
                allDeleted: true
            });

            if (!isInCreationMode) {
                const freshValues = await fetchValues(state.values[state.activeScope].version);

                dispatch({
                    type: StandardFieldReducerActionsTypes.REFRESH_VALUES,
                    formVersion: editRecordState.valuesVersion,
                    values: freshValues as RecordFormElementsValueStandardValue[]
                });
            }

            return;
        }

        dispatch({
            type: StandardFieldReducerActionsTypes.SET_ERROR,
            idValue: state.values[state.activeScope].values[0]?.idValue,
            error: deleteRes.error
        });
    };

    if (!element.attribute) {
        return <ErrorDisplay message={t('record_edition.missing_attribute')} />;
    }

    const valuesToDisplay = Object.values(state.values[state.activeScope].values).sort(
        (valueA, valueB) => valueA.index - valueB.index
    );
    const hasValue = valuesToDisplay[0].idValue !== newValueId && valuesToDisplay[0].idValue !== null;
    const canAddAnotherValue =
        !state.isReadOnly && isMultipleValues && hasValue && attribute.format !== AttributeFormat.boolean;
    const canDeleteAllValues = !state.isReadOnly && hasValue && valuesToDisplay.length > 1;
    const isAttributeVersionable = attribute?.versions_conf?.versionable;

    const versions = {
        [FieldScope.CURRENT]: state.values[FieldScope.CURRENT]?.version ?? null,
        [FieldScope.INHERITED]: state.values[FieldScope.INHERITED]?.version ?? null
    };

    return (
        <Wrapper metadataEdit={metadataEdit}>
            {valuesToDisplay.map(value => (
                <StandardFieldValue
                    key={value.idValue}
                    value={value}
                    state={state}
                    dispatch={dispatch}
                    onSubmit={_handleSubmit}
                    onDelete={_handleDelete}
                    onScopeChange={_handleScopeChange}
                />
            ))}
            {(canDeleteAllValues || canAddAnotherValue || attribute?.versions_conf?.versionable) && (
                <FieldFooter
                    bordered
                    style={{
                        flexDirection:
                            canAddAnotherValue && !canDeleteAllValues && !isAttributeVersionable ? 'row' : 'row-reverse'
                    }}
                >
                    <div>
                        {isAttributeVersionable && (
                            <ValuesVersionBtn
                                basic
                                versions={versions}
                                activeScope={state.activeScope}
                                onScopeChange={_handleScopeChange}
                            />
                        )}
                        {canDeleteAllValues && <DeleteAllValuesBtn onDelete={_handleDeleteAllValues} />}
                    </div>
                    {canAddAnotherValue && <AddValueBtn activeScope={state.activeScope} onClick={_handleAddValue} />}
                </FieldFooter>
            )}
        </Wrapper>
    );
}

export default StandardField;
