// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PlusOutlined} from '@ant-design/icons';
import {AnyPrimitive, ICommonFieldsSettings, IKeyValue} from '@leav/utils';
import CreationErrorContext from 'components/RecordEdition/EditRecordModal/creationErrorContext';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {IRecordPropertyStandard} from 'graphQL/queries/records/getRecordPropertiesQuery';
import React, {useContext, useEffect, useReducer} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {AttributeFormat} from '_gqlTypes/globalTypes';
import {SAVE_VALUE_BATCH_saveValueBatch_values_Value} from '_gqlTypes/SAVE_VALUE_BATCH';
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

const AddValueWrapper = styled.div`
    && {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        color: #999;
        cursor: pointer;
    }
`;

function StandardField({
    element,
    recordValues,
    record,
    onValueSubmit,
    onValueDelete
}: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    const {t} = useTranslation();

    const fieldValues = (recordValues[element.settings.attribute] as IRecordPropertyStandard[]) ?? [];
    const isMultipleValues = element.attribute.multiple_values;
    const {attribute} = element;
    const creationErrors = useContext(CreationErrorContext);

    const initialValues = fieldValues.length
        ? fieldValues.reduce(
              (allValues, fieldValue, index): IKeyValue<IStandardFieldValue> => ({
                  ...allValues,
                  [fieldValue.id_value]: {
                      idValue: fieldValue?.id_value ?? null,
                      index,
                      value: fieldValue ?? null,
                      displayValue: fieldValue?.value ?? '',
                      editingValue: attribute.format === AttributeFormat.encrypted ? '' : fieldValue?.raw_value ?? '',
                      originRawValue: attribute.format === AttributeFormat.encrypted ? '' : fieldValue?.raw_value ?? '',
                      error: '',
                      isErrorDisplayed: false,
                      isEditing: false
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
        isReadOnly: attribute?.system,
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

        dispatch({
            type: StandardFieldReducerActionsTypes.SET_ERROR,
            idValue,
            error:
                submitRes.error || (submitRes?.errors ?? []).filter(err => err.attribute === attribute.id)?.[0].message
        });
    };

    const _handleDelete = async (idValue: IdValue) => {
        dispatch({
            type: StandardFieldReducerActionsTypes.UNEDIT_FIELD,
            idValue
        });

        const deleteRes = await onValueDelete(idValue, attribute.id);

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
                <AddValueWrapper className="ant-input" onClick={_handleAddValue}>
                    <PlusOutlined />
                    {t('record_edition.add_value')}
                </AddValueWrapper>
            )}
        </Wrapper>
    );
}

export default StandardField;
