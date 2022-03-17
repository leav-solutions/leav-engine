// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AnyPrimitive, ErrorTypes, ICommonFieldsSettings, IKeyValue} from '@leav/utils';
import CreationErrorContext from 'components/RecordEdition/EditRecordModal/creationErrorContext';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import React, {useContext, useEffect, useReducer} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {AttributeFormat} from '_gqlTypes/globalTypes';
import {RECORD_FORM_recordForm_elements_values_Value} from '_gqlTypes/RECORD_FORM';
import {SAVE_VALUE_BATCH_saveValueBatch_values_Value} from '_gqlTypes/SAVE_VALUE_BATCH';
import {useRecordEditionContext} from '../../hooks/useRecordEditionContext';
import AddValueBtn from '../../shared/AddValueBtn';
import {APICallStatus, IFormElementProps} from '../../_types';
import standardFieldReducer, {
    IdValue,
    IStandardFieldReducerState,
    IStandardFieldValue,
    newValueId,
    StandardFieldReducerActionsTypes,
    virginValue
} from './standardFieldReducer/standardFieldReducer';
import StandardFieldValue from './StandardFieldValue';

const Wrapper = styled.div`
    margin-bottom: 1.5em;
`;

function StandardField({
    element,
    record,
    onValueSubmit,
    onValueDelete
}: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    const {t} = useTranslation();
    const {readOnly: isRecordReadOnly} = useRecordEditionContext();

    const fieldValues = (element.values as RECORD_FORM_recordForm_elements_values_Value[]) ?? [];
    const isMultipleValues = element.attribute.multiple_values;
    const {attribute} = element;
    const creationErrors = useContext(CreationErrorContext);

    const initialValues = fieldValues.length
        ? fieldValues.reduce(
              (allValues, fieldValue, index): IKeyValue<IStandardFieldValue> => ({
                  ...allValues,
                  [fieldValue.id_value]: {
                      ...virginValue,
                      idValue: fieldValue?.id_value ?? null,
                      index,
                      value: fieldValue ?? null,
                      displayValue: fieldValue?.value ?? '',
                      editingValue: attribute.format === AttributeFormat.encrypted ? '' : fieldValue?.raw_value ?? '',
                      originRawValue: attribute.format === AttributeFormat.encrypted ? '' : fieldValue?.raw_value ?? ''
                  }
              }),
              {}
          )
        : {
              [newValueId]: {
                  ...virginValue,
                  idValue: newValueId
              }
          };

    const initialState: IStandardFieldReducerState = {
        attribute,
        record,
        formElement: element,
        isReadOnly: attribute?.system || isRecordReadOnly || !attribute.permissions.edit_value,
        values: initialValues
    };

    const [state, dispatch] = useReducer(standardFieldReducer, initialState);

    useEffect(() => {
        if (creationErrors[attribute.id]) {
            const idValue =
                Object.values(state.values).filter(val => val.editingValue === creationErrors[attribute.id].input)?.[0]
                    .idValue ?? null;
            dispatch({
                type: StandardFieldReducerActionsTypes.SET_ERROR,
                idValue,
                error: creationErrors[attribute.id].message
            });
        }
    }, [creationErrors, attribute.id, state.values]);

    const _handleSubmit = async (idValue: IdValue, valueToSave: AnyPrimitive) => {
        const isSavingNewValue = idValue === newValueId;
        dispatch({
            type: StandardFieldReducerActionsTypes.CLEAR_ERROR,
            idValue
        });

        const submitRes = await onValueSubmit([
            {value: valueToSave, idValue: isSavingNewValue ? null : idValue, attribute}
        ]);

        if (submitRes.status === APICallStatus.SUCCESS) {
            dispatch({
                type: StandardFieldReducerActionsTypes.UPDATE_AFTER_SUBMIT,
                newValue: submitRes.values[0] as SAVE_VALUE_BATCH_saveValueBatch_values_Value,
                idValue
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

            return;
        }

        dispatch({
            type: StandardFieldReducerActionsTypes.SET_ERROR,
            idValue,
            error: deleteRes.error
        });
    };

    const _handleAddValue = () => {
        dispatch({
            type: StandardFieldReducerActionsTypes.ADD_VALUE
        });
    };

    if (!element.attribute) {
        return <ErrorDisplay message={t('record_edition.missing_attribute')} />;
    }

    const valuesToDisplay = Object.values(state.values).sort((valueA, valueB) => valueA.index - valueB.index);
    const hasValue = valuesToDisplay[0].idValue !== newValueId && valuesToDisplay[0].idValue !== null;
    const canAddAnotherValue = isMultipleValues && hasValue && attribute.format !== AttributeFormat.boolean;

    return (
        <Wrapper>
            {valuesToDisplay.map(value => (
                <StandardFieldValue
                    key={value.idValue}
                    value={value}
                    state={state}
                    dispatch={dispatch}
                    onSubmit={_handleSubmit}
                    onDelete={_handleDelete}
                />
            ))}
            {canAddAnotherValue && (
                <AddValueBtn
                    onClick={_handleAddValue}
                    style={{borderTopLeftRadius: 0, borderTopRightRadius: 0, width: '100%'}}
                    bordered
                />
            )}
        </Wrapper>
    );
}

export default StandardField;
