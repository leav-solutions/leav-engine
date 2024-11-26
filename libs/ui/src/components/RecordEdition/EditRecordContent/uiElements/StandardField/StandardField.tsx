// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AnyPrimitive, ErrorTypes, ICommonFieldsSettings, localizedTranslation} from '@leav/utils';
import {FunctionComponent, useContext, useEffect, useMemo, useReducer, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {ErrorDisplay} from '_ui/components';
import CreationErrorContext from '_ui/components/RecordEdition/EditRecord/creationErrorContext';
import {EditRecordReducerActionsTypes} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {useEditRecordReducer} from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {RecordFormElementsValueStandardValue} from '_ui/hooks/useGetRecordForm/useGetRecordForm';
import {useRefreshFieldValues} from '_ui/hooks/useRefreshFieldValues';
import {AttributeFormat, ValueDetailsValueFragment} from '_ui/_gqlTypes';
import {useRecordEditionContext} from '../../hooks/useRecordEditionContext';
import standardFieldReducer, {
    computeInitialState,
    IdValue,
    IStandardFieldValue,
    newValueId,
    StandardFieldReducerActionsTypes
} from '../../reducers/standardFieldReducer/standardFieldReducer';
import FieldFooter from '../../shared/FieldFooter';
import ValuesVersionBtn from '../../shared/ValuesVersionBtn';
import {APICallStatus, VersionFieldScope, IFormElementProps, FormErrors, ISubmitMultipleResult} from '../../_types';
import StandardFieldValue from './StandardFieldValue';
import {Form, FormInstance, FormListOperation} from 'antd';
import {StandardFieldReducerContext} from '../../reducers/standardFieldReducer/standardFieldReducerContext';
import {KitButton, KitInputWrapper, KitSpace} from 'aristid-ds';
import {useLang} from '_ui/hooks';
import {useValueDetailsButton} from '../../shared/ValueDetailsBtn/useValueDetailsButton';
import {TFunction} from 'i18next';
import {FaPlus, FaTrash} from 'react-icons/fa';
import {StoreValue} from 'antd/es/form/interface';
import {DeleteAllValuesButton} from './DeleteAllValuesButton';

const Wrapper = styled.div<{$metadataEdit: boolean}>`
    margin-bottom: ${props => (props.$metadataEdit ? 0 : '1.5em')};
`;

const KitSpaceStyled = styled(KitSpace)`
    width: 100%;
`;

const RowValueWrapper = styled.div`
    display: flex;
    flex-direction: row;
`;

const StandardFieldValueWrapper = styled.div`
    flex: 1;
`;

const _isDateRangeValue = (value: any): value is {from: string; to: string} =>
    !!value && typeof value === 'object' && 'from' in value && 'to' in value;

const _getPresentationValue = ({
    t,
    format,
    value,
    calculatedValue,
    inheritedValue
}: {
    t: TFunction;
    format: AttributeFormat;
    value: ValueDetailsValueFragment['payload'];
    calculatedValue: RecordFormElementsValueStandardValue;
    inheritedValue: RecordFormElementsValueStandardValue;
}): string => {
    let presentationValue = value || calculatedValue?.payload || inheritedValue?.payload || '';

    switch (format) {
        case AttributeFormat.date_range:
            if (!_isDateRangeValue(presentationValue)) {
                presentationValue = '';
            } else {
                const {from, to} = presentationValue;
                presentationValue = t('record_edition.date_range_value', {from, to});
            }
            break;
        case AttributeFormat.color:
            if (!presentationValue) {
                presentationValue = '#00000000';
            } else {
                presentationValue = '#' + presentationValue;
            }
            break;
    }

    return presentationValue;
};

const StandardField: FunctionComponent<
    IFormElementProps<ICommonFieldsSettings, RecordFormElementsValueStandardValue> & {
        antdForm?: FormInstance;
        formErrors?: FormErrors;
    }
> = ({element, antdForm, formErrors, onValueSubmit, onValueDelete, onDeleteMultipleValues, metadataEdit = false}) => {
    const {t} = useTranslation();

    const {readOnly: isRecordReadOnly, record} = useRecordEditionContext();
    const {state: editRecordState, dispatch: editRecordDispatch} = useEditRecordReducer();

    const antdListFieldsRef = useRef<{
        add: FormListOperation['add'];
        remove: FormListOperation['remove'];
        indexes: number[];
    } | null>(null);

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

    const [presentationValues, setPresentationValues] = useState(
        element.values.map(value =>
            _getPresentationValue({
                t,
                format: attribute.format,
                value: value.payload,
                calculatedValue: state.calculatedValue,
                inheritedValue: state.inheritedValue
            })
        )
    );

    console.log('presentationValues', presentationValues);

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

    const _handleSubmit = async (
        idValue: IdValue,
        valueToSave: AnyPrimitive,
        fieldName?: number,
        addNewValue?: boolean
    ): Promise<void | ISubmitMultipleResult> => {
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

        if (submitRes.status === APICallStatus.SUCCESS || addNewValue) {
            const submitResValue = submitRes.values[0] as ValueDetailsValueFragment;

            let resultValue: ValueDetailsValueFragment;

            if (state.metadataEdit || addNewValue) {
                resultValue = {
                    id_value: null,
                    created_at: null,
                    modified_at: null,
                    created_by: null,
                    modified_by: null,
                    version: null,
                    raw_payload: '',
                    payload: '',
                    metadata: null,
                    attribute
                };

                if (state.metadataEdit) {
                    const metadataValue =
                        (submitResValue.metadata ?? []).find(({name}) => name === element.attribute.id)?.value ?? null;

                    resultValue.raw_payload = metadataValue.raw_payload ?? metadataValue.payload;
                    resultValue.payload = metadataValue.payload;
                }
            } else {
                resultValue = submitResValue;
            }

            dispatch({
                type: StandardFieldReducerActionsTypes.UPDATE_AFTER_SUBMIT,
                newValue: resultValue,
                idValue
            });

            const index = fieldName ?? 0;
            setPresentationValues(previousPresentationValues => {
                const nextPresentationValues = [...previousPresentationValues];
                nextPresentationValues[index] = _getPresentationValue({
                    t,
                    format: attribute.format,
                    value: resultValue.payload,
                    calculatedValue: state.calculatedValue,
                    inheritedValue: state.inheritedValue
                });
                return nextPresentationValues;
            });

            const newActiveValue = state.metadataEdit
                ? {
                      ...editRecordState.activeValue,
                      value: {
                          ...editRecordState.activeValue.value,
                          metadata: [
                              ...(editRecordState.activeValue?.value?.metadata ?? []),
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

            editRecordDispatch({
                type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
                value: newActiveValue
            });

            return submitRes;
        }

        let errorMessage = submitRes.error;
        if (!errorMessage && submitRes.errors) {
            const attributeError = (submitRes?.errors ?? []).filter(err => err.attribute === attribute.id)?.[0];

            if (attributeError) {
                errorMessage =
                    attributeError.type === ErrorTypes.VALIDATION_ERROR
                        ? attributeError.message
                        : t(`errors.${attributeError.type}`);

                if (antdForm) {
                    const shouldSpecifyFieldName = attribute.multiple_values && fieldName !== undefined;
                    const name = shouldSpecifyFieldName ? [attribute.id, fieldName] : attribute.id;

                    antdForm.setFields([
                        {
                            name,
                            errors: [errorMessage]
                        }
                    ]);
                }
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

    const _handleAddValue = async (antdAdd: FormListOperation['add']) => {
        await _handleSubmit(newValueId, '', valuesToDisplay.length, true);
        antdAdd();
    };

    const _handleDeleteValue = async (
        field: IStandardFieldValue,
        antdRemove: FormListOperation['remove'],
        deletedFieldIndex: number
    ) => {
        await onValueDelete({id_value: field.idValue}, attribute.id);
        antdRemove(deletedFieldIndex);
        setPresentationValues(previousPresentationValues =>
            previousPresentationValues.filter((_, index) => index !== deletedFieldIndex)
        );
        dispatch({
            type: StandardFieldReducerActionsTypes.UPDATE_AFTER_DELETE,
            idValue: field.idValue
        });
    };

    const _handleScopeChange = (scope: VersionFieldScope) => {
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
            antdListFieldsRef.current.remove(antdListFieldsRef.current.indexes);
            antdListFieldsRef.current.add();
            setPresentationValues(['']);
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
    const canAddAnotherValue = !state.isReadOnly && isMultipleValues && attribute.format !== AttributeFormat.boolean;
    const canDeleteAllValues = !state.isReadOnly && hasValue && valuesToDisplay.length > 1;
    const isAttributeVersionable = attribute?.versions_conf?.versionable;

    const versions = {
        [VersionFieldScope.CURRENT]: state.values[VersionFieldScope.CURRENT]?.version ?? null,
        [VersionFieldScope.INHERITED]: state.values[VersionFieldScope.INHERITED]?.version ?? null
    };

    // -------- Added
    const {lang: availableLang} = useLang();

    const label = localizedTranslation(state.formElement.settings.label, availableLang);

    const {onValueDetailsButtonClick} = useValueDetailsButton({
        value: valuesToDisplay[0]?.value,
        attribute: state.attribute
    });

    const shouldShowValueDetailsButton = editRecordState.withInfoButton;

    const _getFormattedValueForHelper = (valueToFormat: RecordFormElementsValueStandardValue) => {
        switch (state.attribute.format) {
            case AttributeFormat.date_range:
                return t('record_edition.date_range_from_to', {
                    from: valueToFormat.payload.from,
                    to: valueToFormat.payload.to
                });
            case AttributeFormat.encrypted:
                return valueToFormat.payload ? '●●●●●●●' : '';
            case AttributeFormat.color:
                return '#' + valueToFormat.payload;
            default:
                return valueToFormat.payload;
        }
    };

    const _getHelper = () => {
        if (attribute.multiple_values) {
            return;
        }

        if (state.isInheritedOverrideValue) {
            return t('record_edition.inherited_input_helper', {
                inheritedValue: _getFormattedValueForHelper(state.inheritedValue)
            });
        }

        if (state.isCalculatedOverrideValue) {
            return t('record_edition.calculated_input_helper', {
                calculatedValue: _getFormattedValueForHelper(state.calculatedValue)
            });
        }

        return;
    };

    const hasErrorsInFormList = valuesToDisplay.some((_, index) => {
        const errors = antdForm.getFieldError([attribute.id, index]);
        return errors.length > 0;
    });

    const isFieldInError =
        antdForm.getFieldError(attribute.id).length > 0 || hasErrorsInFormList || formErrors?.length > 0;

    // Use watch to update the component when the value changes (useful for errors)
    Form.useWatch(attribute.id, antdForm); //TODO: multi ?

    // TODO:
    // - Gérer le allowclear qui vide la valeur mais ne supprime pas => DONE
    // - Gérer la corbeille qui supprime la valeur => DONE
    // - Gérer le supprimer tout => DONE
    // - Gérer le allowClear => DONE
    // - Gérer placeholder sur tous les formats => DONE

    // - Errors & Required:
    //  - isFieldInError (faire fonctionner avec les multivalués) => DONE
    //  - si je ré-edite un champ il enlève l'erreur jusqu'au onBlur (useWatch)
    //  - si un attriut mono est requis et est vide, il apparait en erreur => DONE
    //  - si un attriut multi est requis et est vide, il apparait en erreur => TO IMPROVE (Soucis de name ? Même soucis que useWatch ?)

    // - Vérifier les calculs:
    //   - Afficher la liste de toutes les valeurs dans des inputs
    //   - Quand on surchage, on enlève toutes les valeurs sauf celle qu'on surcharge
    //   - Quand on supprime toute les valeurs, on réaffiche bien les valeurs calculées

    // - A faire:
    //   - Afficher un maximum de 7 inputs, au delà, on scroll (prendre l'équivalent de la hauteur de 7 inputs en pixel, cf cas du richText)
    //   - Vérifier que la création fonctionne bien (sans regex car traité dans un autre ticket)

    // Bugs:
    //  - Quand on ajoute des valeurs, au bout d'un moment on se retrouve avec un champ vide ??
    //  - Quand on édite plusieurs fois une valeur, cela édite les autres valeurs aussi ?? (lié au problème d'ordre des inputs ??)
    return (
        <StandardFieldReducerContext.Provider value={{state, dispatch}}>
            <Wrapper $metadataEdit={metadataEdit}>
                <KitInputWrapper
                    label={label}
                    onInfoClick={shouldShowValueDetailsButton ? onValueDetailsButtonClick : null}
                    helper={_getHelper()}
                    required={state.formElement.settings.required}
                    disabled={state.isReadOnly}
                    bordered={attribute.multiple_values}
                    status={isFieldInError ? 'error' : undefined}
                    actions={
                        canDeleteAllValues
                            ? [<DeleteAllValuesButton handleDelete={_handleDeleteAllValues} />]
                            : undefined
                    }
                >
                    {!attribute.multiple_values && (
                        <StandardFieldValue
                            key={valuesToDisplay[0].idValue}
                            value={valuesToDisplay[0]}
                            presentationValue={presentationValues[0]}
                            state={state}
                            dispatch={dispatch}
                            onSubmit={_handleSubmit}
                            onDelete={_handleDelete}
                            onScopeChange={_handleScopeChange}
                        />
                    )}
                    {attribute.multiple_values && (
                        <KitSpaceStyled direction="vertical">
                            <Form.List name={attribute.id}>
                                {(fields, {add, remove}) => {
                                    antdListFieldsRef.current = {add, remove, indexes: fields.map((_, index) => index)};

                                    return (
                                        <KitSpaceStyled direction="vertical">
                                            {fields.map((field, index) => {
                                                // console.log('------- field --------');
                                                // console.log('field', field);
                                                // console.log('value', valuesToDisplay[index]);
                                                // console.log('presentationValues', presentationValues[index]);
                                                return (
                                                    <RowValueWrapper key={field.key}>
                                                        <StandardFieldValueWrapper>
                                                            <StandardFieldValue
                                                                listField={field}
                                                                value={valuesToDisplay[index]}
                                                                presentationValue={presentationValues[index]}
                                                                state={state}
                                                                dispatch={dispatch}
                                                                onSubmit={_handleSubmit}
                                                                onDelete={_handleDelete}
                                                                onScopeChange={_handleScopeChange}
                                                            />
                                                        </StandardFieldValueWrapper>
                                                        {fields.length > 1 && (
                                                            <KitButton
                                                                type="tertiary"
                                                                icon={<FaTrash />}
                                                                onClick={() =>
                                                                    _handleDeleteValue(
                                                                        valuesToDisplay[index],
                                                                        remove,
                                                                        index
                                                                    )
                                                                }
                                                            />
                                                        )}
                                                    </RowValueWrapper>
                                                );
                                            })}
                                            {canAddAnotherValue && (
                                                <KitButton
                                                    type="secondary"
                                                    size="m"
                                                    icon={<FaPlus />}
                                                    onClick={() => _handleAddValue(add)}
                                                >
                                                    {t('record_edition.add_value')}
                                                </KitButton>
                                            )}
                                        </KitSpaceStyled>
                                    );
                                }}
                            </Form.List>
                        </KitSpaceStyled>
                    )}
                </KitInputWrapper>
                {attribute?.versions_conf?.versionable && (
                    <FieldFooter
                        bordered
                        style={{
                            flexDirection: !isAttributeVersionable ? 'row' : 'row-reverse'
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
                        </div>
                    </FieldFooter>
                )}
            </Wrapper>
        </StandardFieldReducerContext.Provider>
    );
};

export default StandardField;
