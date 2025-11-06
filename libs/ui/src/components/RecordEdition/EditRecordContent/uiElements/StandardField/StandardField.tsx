// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type AnyPrimitive, ErrorTypes, type IRequiredFieldsSettings, localizedTranslation} from '@leav/utils';
import {type FunctionComponent, useEffect, useRef, useState} from 'react';
import styled, {css} from 'styled-components';
import {ErrorDisplay} from '_ui/components';
import {type RecordFormElementsValueStandardValue} from '_ui/hooks/useGetRecordForm/useGetRecordForm';
import {AttributeFormat, type ValueDetailsFragment} from '_ui/_gqlTypes';
import {APICallStatus, type IFormElementProps, type ISubmitMultipleResult} from '../../_types';
import StandardFieldValue from './StandardFieldValue';
import {Form, type FormInstance, type FormListOperation} from 'antd';
import {KitButton, KitInputWrapper, KitTooltip} from 'aristid-ds';
import {useLang} from '_ui/hooks';
import {FaPlus, FaTrash} from 'react-icons/fa';
import {DeleteAllValuesButton} from '../shared/DeleteAllValuesButton';
import {computeCalculatedFlags, computeInheritedFlags} from '../shared/calculatedInheritedFlags';
import {useGetPresentationValues} from './useGetPresentationValues';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {getAntdDisplayedValue, getEmptyInitialValue} from '../../antdUtils';
import {
    type GetRecordColumnsValuesRecord,
    type IRecordColumnValueStandard,
} from '_ui/_queries/records/getRecordColumnsValues';
import {useEditRecordReducer} from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {STANDARD_FIELD_ID_PREFIX} from '_ui/constants';
import {ComputeIndicator} from '../shared/ComputeIndicator';
import {useOutsideInteractionDetector} from '../shared/useOutsideInteractionDetector';
import {EditRecordReducerActionsTypes} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {INPUT_MAX_HEIGHT} from '../../formConstants';

const Wrapper = styled.div<{$metadataEdit: boolean}>`
    margin-bottom: ${props => (props.$metadataEdit ? 0 : '1.5em')};
`;

const KitFieldsWrapper = styled.div`
    max-height: ${INPUT_MAX_HEIGHT};
    overflow-y: scroll;
`;

const RowValueWrapper = styled.div`
    display: flex;
    flex-direction: row;
`;

const StandardFieldValueWrapper = styled.div`
    flex: 1;
`;

const KitInputWrapperStyled = styled(KitInputWrapper)<{$readonlyBackground: boolean}>`
    &.bordered > .kit-input-wrapper-content {
        padding: calc((var(--general-spacing-xs) - 3) * 1px);

        .kit-input-wrapper-content {
            margin: 3px;
        }
    }

    ${props =>
        props.$readonlyBackground &&
        css`
            .kit-input-wrapper-content {
                background-color: var(--general-utilities-neutral-light);
            }
        `}
`;

const KitInputExtraAlignLeft = styled.div`
    margin-right: auto;
    line-height: 12px;
`;

const KitDeleteValueButton = styled(KitButton)`
    margin: 3px;
`;

const KitAddValueButton = styled(KitButton)`
    margin-top: calc((var(--general-spacing-xs) - 3) * 1px);
    margin-bottom: 3px;
`;

const StandardField: FunctionComponent<
    IFormElementProps<IRequiredFieldsSettings, RecordFormElementsValueStandardValue> & {
        antdForm?: FormInstance;
        computedValues?: GetRecordColumnsValuesRecord<IRecordColumnValueStandard>;
    }
> = ({
    element,
    computedValues,
    isFormCreationMode,
    antdForm,
    readonly,
    onValueSubmit,
    onValueDelete,
    onDeleteMultipleValues,
    metadataEdit = false,
}) => {
    const {t} = useSharedTranslation();
    const {lang} = useLang();

    const antdListFieldsRef = useRef<{
        add: FormListOperation['add'];
        remove: FormListOperation['remove'];
        indexes: number[];
    } | null>(null);

    const {attribute} = element;

    useEffect(() => {
        if (computedValues && computedValues[attribute.id] && Array.isArray(computedValues[attribute.id])) {
            setBackendValues(computedValues[attribute.id]);
            antdForm.setFieldValue(attribute.id, getAntdDisplayedValue(computedValues[attribute.id], attribute));
        }
    }, [computedValues]);

    if (!attribute) {
        return <ErrorDisplay message={t('record_edition.missing_attribute')} />;
    }

    const {state, dispatch} = useEditRecordReducer();

    const [backendValues, setBackendValues] = useState<RecordFormElementsValueStandardValue[]>(element.values);

    const calculatedFlags = computeCalculatedFlags(backendValues);
    const inheritedFlags = computeInheritedFlags(backendValues);
    const defaultValueToAddInAntdForm = getEmptyInitialValue(attribute);

    useEffect(() => {
        if (state.activeAttribute?.attribute.id === attribute.id) {
            dispatch({
                type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
                values: backendValues,
            });
        }
    }, [backendValues]);

    useEffect(() => {
        if (!isFormCreationMode && backendValues.length === 0 && attribute.required) {
            antdForm.setFields([{name: attribute.id, errors: [t('errors.standard_field_required')]}]);
        }
    }, []);

    useOutsideInteractionDetector({
        attribute,
        activeAttribute: state.activeAttribute,
        attributePrefix: STANDARD_FIELD_ID_PREFIX,
        dispatch,
        backendValues,
        allowedSelectors: ['.ant-popover.ant-color-picker', '.ant-picker-dropdown', '.kit-modal-wrapper.link-modal'],
    });

    const backendWithoutCalculatedOrInheritedValues = backendValues
        .filter(backendValue => !backendValue.isCalculated && !backendValue.isInherited)
        .sort((a, b) => Number(a.id_value) - Number(b.id_value));

    const {presentationValues} = useGetPresentationValues({
        //TODO fix type
        values: backendWithoutCalculatedOrInheritedValues as unknown as ValueDetailsFragment[],
        format: attribute.format,
        calculatedValue: calculatedFlags.calculatedValue,
        inheritedValue: inheritedFlags.inheritedValue,
    });

    const _handleSubmit =
        (idValue?: string, fieldName?: number, submittedFieldIndex?: number) =>
        async (valueToSave: AnyPrimitive): Promise<ISubmitMultipleResult> => {
            const shouldSpecifyFieldName = attribute.multiple_values && fieldName !== undefined;
            const name = shouldSpecifyFieldName ? [attribute.id, fieldName] : attribute.id;
            if (antdForm) {
                antdForm.setFields([
                    {
                        name,
                        errors: null,
                    },
                ]);
            }

            let submitRes;
            if (attribute.multiple_values) {
                if (valueToSave === '') {
                    _handleDeleteValue(idValue, submittedFieldIndex);
                    return;
                }
                submitRes = await onValueSubmit([{value: valueToSave, idValue: idValue ?? null, attribute}], null);
                if (submitRes.status === APICallStatus.SUCCESS) {
                    setBackendValues(previousBackendValues => {
                        const newBackendValues = [...previousBackendValues, ...submitRes.values].reduce(
                            (acc, backendValue) => {
                                const existingValue = acc.find(
                                    o =>
                                        o.id_value === backendValue.id_value &&
                                        o.isCalculated === backendValue.isCalculated &&
                                        o.isInherited === backendValue.isInherited,
                                );

                                if (existingValue) {
                                    Object.assign(existingValue, backendValue);
                                } else {
                                    acc.push(backendValue);
                                }

                                return acc;
                            },
                            [],
                        );

                        return newBackendValues;
                    });

                    return submitRes;
                }
            } else {
                if (valueToSave) {
                    submitRes = await onValueSubmit([{value: valueToSave, idValue: idValue ?? null, attribute}], null);
                    if (submitRes.status === APICallStatus.SUCCESS) {
                        setBackendValues((submitRes.values as unknown as RecordFormElementsValueStandardValue[]) ?? []);

                        return submitRes;
                    }
                } else {
                    if (backendWithoutCalculatedOrInheritedValues.length > 0) {
                        submitRes = await onValueDelete({id_value: idValue, payload: null}, attribute.id);

                        if (submitRes.status === APICallStatus.SUCCESS) {
                            setBackendValues(previousBackendValues =>
                                previousBackendValues.filter(
                                    value =>
                                        (value.isCalculated !== null && value.isCalculated !== undefined) ||
                                        (value.isInherited !== null && value.isInherited !== undefined),
                                ),
                            );
                            return submitRes;
                        }
                    }
                }
            }

            if (!submitRes) {
                return;
            }

            if (!submitRes.error && submitRes.errors) {
                const attributeError = submitRes.errors.filter(err => err.attribute === attribute.id)?.[0];

                if (attributeError) {
                    submitRes.error =
                        attributeError.type === ErrorTypes.VALIDATION_ERROR
                            ? attributeError.message
                            : t(`errors.${attributeError.type}`);
                }
            }

            if (submitRes.error && antdForm) {
                antdForm.setFields([
                    {
                        name,
                        errors: [submitRes.error],
                    },
                ]);
            }

            return submitRes;
        };

    const _handleDeleteValue = async (idValue: string | undefined, deletedFieldIndex: number) => {
        if (idValue) {
            await onValueDelete({id_value: idValue}, attribute.id);

            setBackendValues(previousBackendValues =>
                previousBackendValues.filter(backendValue => backendValue.id_value !== idValue),
            );
        }
        antdListFieldsRef.current.remove(deletedFieldIndex);
        if (backendWithoutCalculatedOrInheritedValues.length === 1) {
            antdListFieldsRef.current.add(defaultValueToAddInAntdForm);
        }
    };

    const _handleDeleteAllValues = async () => {
        const deleteRes = await onDeleteMultipleValues(
            attribute.id,
            backendValues.filter(b => b.id_value),
            null,
        );

        if (deleteRes.status === APICallStatus.SUCCESS) {
            antdListFieldsRef.current.remove(antdListFieldsRef.current.indexes);
            antdListFieldsRef.current.add(defaultValueToAddInAntdForm);
            setBackendValues(previousBackendValues =>
                previousBackendValues.filter(backendValue => !backendValue.id_value),
            );

            return;
        }
    };

    let isFieldInError = false;

    if (antdForm) {
        const hasErrorsInFormList = backendValues.some((_, index) => {
            const errors = antdForm.getFieldError([attribute.id, index]);
            return errors.length > 0;
        });

        const multipleFieldRequiredInError =
            attribute.multiple_values && attribute.required && antdForm.getFieldError([attribute.id, 0])?.length > 0;

        isFieldInError =
            antdForm.getFieldError(attribute.id).length > 0 || hasErrorsInFormList || multipleFieldRequiredInError;
    }

    const isMultipleValues = element.attribute.multiple_values;
    const hasValue = isMultipleValues && backendValues.length > 0;
    const canAddAnotherValue =
        !readonly &&
        isMultipleValues &&
        !isFieldInError &&
        attribute.format !== AttributeFormat.boolean &&
        attribute.format !== AttributeFormat.encrypted;

    const label = localizedTranslation(element.settings.label, lang);
    const isReadOnly = attribute.readonly || !attribute.permissions.edit_value || readonly;
    const canDeleteAllValues = !isReadOnly && !attribute.required && hasValue && backendValues.length > 1;
    const canDeleteSingleValue =
        !isReadOnly &&
        (!attribute.required || (attribute.required && backendWithoutCalculatedOrInheritedValues.length > 1));

    return (
        <Wrapper $metadataEdit={metadataEdit}>
            <KitInputWrapperStyled
                id={STANDARD_FIELD_ID_PREFIX + attribute.id}
                label={label}
                required={attribute.required}
                bordered={attribute.multiple_values}
                status={isFieldInError ? 'error' : undefined}
                extra={
                    <>
                        <KitInputExtraAlignLeft>
                            <ComputeIndicator calculatedFlags={calculatedFlags} inheritedFlags={inheritedFlags} />
                        </KitInputExtraAlignLeft>
                        {canDeleteAllValues && (
                            <DeleteAllValuesButton
                                handleDelete={_handleDeleteAllValues}
                                disabled={isReadOnly}
                                danger={isFieldInError}
                            />
                        )}
                    </>
                }
                htmlFor={attribute.id}
                $readonlyBackground={isReadOnly && attribute.multiple_values}
            >
                {attribute.multiple_values ? (
                    <Form.List name={attribute.id}>
                        {(fields, {add, remove}) => {
                            antdListFieldsRef.current = {add, remove, indexes: fields.map((_, index) => index)};

                            const shouldDisabledAddValueButton =
                                fields.length > backendWithoutCalculatedOrInheritedValues.length;

                            return (
                                <>
                                    <KitFieldsWrapper>
                                        {fields.map((field, index) => (
                                            <RowValueWrapper key={field.key}>
                                                <StandardFieldValueWrapper>
                                                    <StandardFieldValue
                                                        listField={field}
                                                        presentationValue={presentationValues[index] ?? ''}
                                                        handleSubmit={_handleSubmit(
                                                            backendWithoutCalculatedOrInheritedValues[index]?.id_value,
                                                            field.name,
                                                            index,
                                                        )}
                                                        attribute={attribute}
                                                        label={label}
                                                        readonly={isReadOnly}
                                                        calculatedFlags={calculatedFlags}
                                                        inheritedFlags={inheritedFlags}
                                                        isLastValueOfMultivalues={
                                                            index === fields.length - 1 && index !== 0
                                                        }
                                                        removeLastValueOfMultivalues={() => remove(index)}
                                                    />
                                                </StandardFieldValueWrapper>
                                                {canDeleteSingleValue && (
                                                    <KitDeleteValueButton
                                                        type="tertiary"
                                                        title={t('record_edition.delete_value')}
                                                        icon={<FaTrash />}
                                                        disabled={isReadOnly}
                                                        onClick={() =>
                                                            _handleDeleteValue(
                                                                backendWithoutCalculatedOrInheritedValues[index]
                                                                    ?.id_value,
                                                                index,
                                                            )
                                                        }
                                                    />
                                                )}
                                            </RowValueWrapper>
                                        ))}
                                    </KitFieldsWrapper>
                                    {canAddAnotherValue && (
                                        <KitTooltip
                                            title={
                                                shouldDisabledAddValueButton
                                                    ? t('record_edition.please_select_value_before_adding')
                                                    : undefined
                                            }
                                        >
                                            <KitAddValueButton
                                                type="secondary"
                                                size="m"
                                                icon={<FaPlus />}
                                                onClick={() => add(defaultValueToAddInAntdForm)}
                                                disabled={isReadOnly || shouldDisabledAddValueButton}
                                            >
                                                {t('record_edition.add_value')}
                                            </KitAddValueButton>
                                        </KitTooltip>
                                    )}
                                </>
                            );
                        }}
                    </Form.List>
                ) : (
                    <StandardFieldValue
                        presentationValue={presentationValues[0] ?? ''}
                        handleSubmit={_handleSubmit(backendWithoutCalculatedOrInheritedValues[0]?.id_value)}
                        attribute={attribute}
                        readonly={isReadOnly}
                        label={label}
                        calculatedFlags={calculatedFlags}
                        inheritedFlags={inheritedFlags}
                    />
                )}
            </KitInputWrapperStyled>
        </Wrapper>
    );
};

export default StandardField;
