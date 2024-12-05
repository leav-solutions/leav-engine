// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AnyPrimitive, ErrorTypes, IRequiredFieldsSettings, localizedTranslation} from '@leav/utils';
import {FunctionComponent, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {ErrorDisplay} from '_ui/components';
import {RecordFormElementsValueStandardValue} from '_ui/hooks/useGetRecordForm/useGetRecordForm';
import {AttributeFormat, ValueDetailsValueFragment} from '_ui/_gqlTypes';
import {APICallStatus, IFormElementProps, ISubmitMultipleResult} from '../../_types';
import StandardFieldValue from './StandardFieldValue';
import {Form, FormInstance, FormListOperation} from 'antd';
import {KitButton, KitInputWrapper} from 'aristid-ds';
import {useLang} from '_ui/hooks';
import {TFunction} from 'i18next';
import {FaPlus, FaTrash} from 'react-icons/fa';
import {DeleteAllValuesButton} from './DeleteAllValuesButton';
import {computeCalculatedFlags, computeInheritedFlags} from './calculatedInheritedFlags';

const Wrapper = styled.div<{$metadataEdit: boolean}>`
    margin-bottom: ${props => (props.$metadataEdit ? 0 : '1.5em')};
`;

const KitFieldsWrapper = styled.div`
    max-height: 322px;
    overflow-y: scroll;
`;

const RowValueWrapper = styled.div`
    display: flex;
    flex-direction: row;
`;

const StandardFieldValueWrapper = styled.div`
    flex: 1;
`;

const KitInputWrapperStyled = styled(KitInputWrapper)`
    &.bordered > .kit-input-wrapper-content {
        padding: calc((var(--general-spacing-xs) - 3) * 1px);

        .kit-input-wrapper-content {
            margin: 3px;
        }
    }
`;

const KitDeleteValueButton = styled(KitButton)`
    margin: 3px;
`;

const KitAddValueButton = styled(KitButton)`
    margin-top: calc((var(--general-spacing-xs) - 3) * 1px);
    margin-bottom: 3px;
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
            if (presentationValue) {
                presentationValue = '#' + presentationValue;
            }
            break;
    }

    return presentationValue;
};

const StandardField: FunctionComponent<
    IFormElementProps<IRequiredFieldsSettings, RecordFormElementsValueStandardValue> & {
        antdForm?: FormInstance;
    }
> = ({element, antdForm, readonly, onValueSubmit, onValueDelete, onDeleteMultipleValues, metadataEdit = false}) => {
    const {t} = useTranslation();
    const {lang: availableLang} = useLang();

    const antdListFieldsRef = useRef<{
        add: FormListOperation['add'];
        remove: FormListOperation['remove'];
        indexes: number[];
    } | null>(null);

    const defaultValueToAddInAntdForm = '';

    const isMultipleValues = element.attribute.multiple_values;
    const {attribute} = element;

    const [backendValues, setBackendValues] = useState<RecordFormElementsValueStandardValue[]>(element.values);

    const calculatedFlags = computeCalculatedFlags(backendValues);
    const inheritedFlags = computeInheritedFlags(backendValues);

    const backendWithoutCalculatedOrInheritedValues = backendValues
        .filter(backendValue => !backendValue.isCalculated && !backendValue.isInherited)
        .sort((a, b) => Number(a.id_value) - Number(b.id_value));

    const presentationValues = useMemo(
        () =>
            backendWithoutCalculatedOrInheritedValues.map(value =>
                _getPresentationValue({
                    t,
                    format: attribute.format,
                    value: value.payload,
                    calculatedValue: calculatedFlags.calculatedValue,
                    inheritedValue: inheritedFlags.inheritedValue
                })
            ),
        [backendValues, calculatedFlags, inheritedFlags]
    );

    const setAntdErrorField = (error: null | string, fieldName?: number) => {
        const shouldSpecifyFieldName = attribute.multiple_values && fieldName !== undefined;
        const name = shouldSpecifyFieldName ? [attribute.id, fieldName] : attribute.id;

        antdForm.setFields([
            {
                name,
                errors: error ? [error] : null
            }
        ]);
    };

    const _handleSubmit =
        (idValue: string | undefined, fieldName?: number) =>
        async (valueToSave: AnyPrimitive): Promise<ISubmitMultipleResult> => {
            const submitRes = await onValueSubmit([{value: valueToSave, idValue: idValue ?? null, attribute}], null);

            if (submitRes.status === APICallStatus.SUCCESS) {
                if (antdForm) {
                    setAntdErrorField(null, fieldName);
                }

                setBackendValues(previousBackendValues => {
                    const newBackendValues = [...previousBackendValues, ...submitRes.values].reduce(
                        (acc, backendValue) => {
                            const index = acc.findIndex(
                                o =>
                                    o.id_value === backendValue.id_value &&
                                    o.isCalculated === backendValue.isCalculated &&
                                    o.isInherited === backendValue.isInherited
                            );
                            if (index !== -1) {
                                acc[index] = backendValue;
                            } else {
                                acc.push(backendValue);
                            }
                            return acc;
                        },
                        []
                    );

                    return newBackendValues;
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
                        setAntdErrorField(errorMessage, fieldName);
                    }
                }
            }

            return submitRes;
        };

    const _handleDeleteValue = async (
        idValue: string | undefined,
        antdRemove: FormListOperation['remove'],
        deletedFieldIndex: number
    ) => {
        if (idValue) {
            await onValueDelete({id_value: idValue}, attribute.id);

            setBackendValues(previousBackendValues =>
                previousBackendValues.filter(backendValue => backendValue.id_value !== idValue)
            );
        }
        antdRemove(deletedFieldIndex);
    };

    const _handleDeleteAllValues = async () => {
        const deleteRes = await onDeleteMultipleValues(
            attribute.id,
            backendValues.filter(b => b.id_value),
            null
        );

        if (deleteRes.status === APICallStatus.SUCCESS) {
            antdListFieldsRef.current.remove(antdListFieldsRef.current.indexes);
            antdListFieldsRef.current.add(defaultValueToAddInAntdForm);
            setBackendValues(previousBackendValues =>
                previousBackendValues.filter(backendValue => !backendValue.id_value)
            );

            return;
        }
    };

    if (!attribute) {
        return <ErrorDisplay message={t('record_edition.missing_attribute')} />;
    }

    const hasValue = isMultipleValues && backendValues.length > 0;
    const canAddAnotherValue =
        !readonly &&
        isMultipleValues &&
        attribute.format !== AttributeFormat.boolean &&
        attribute.format !== AttributeFormat.encrypted;
    const canDeleteAllValues = !readonly && hasValue && backendValues.length > 1;

    const label = localizedTranslation(element.settings.label, availableLang);

    const _getFormattedValueForHelper = (valueToFormat: RecordFormElementsValueStandardValue) => {
        switch (attribute.format) {
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

        if (inheritedFlags.isInheritedOverrideValue) {
            return t('record_edition.inherited_input_helper', {
                inheritedValue: _getFormattedValueForHelper(inheritedFlags.inheritedValue)
            });
        }

        if (calculatedFlags.isCalculatedOverrideValue) {
            return t('record_edition.calculated_input_helper', {
                calculatedValue: _getFormattedValueForHelper(calculatedFlags.calculatedValue)
            });
        }

        return;
    };

    let isFieldInError = false;
    if (antdForm) {
        const hasErrorsInFormList = backendValues.some((_, index) => {
            const errors = antdForm.getFieldError([attribute.id, index]);
            return errors.length > 0;
        });

        isFieldInError = antdForm.getFieldError(attribute.id).length > 0 || hasErrorsInFormList;
    }

    return (
        <Wrapper $metadataEdit={metadataEdit}>
            <KitInputWrapperStyled
                label={label}
                helper={_getHelper()}
                required={element.settings.required}
                disabled={readonly}
                bordered={attribute.multiple_values}
                status={isFieldInError ? 'error' : undefined}
                actions={
                    canDeleteAllValues ? [<DeleteAllValuesButton handleDelete={_handleDeleteAllValues} />] : undefined
                }
                htmlFor={attribute.id}
            >
                {!attribute.multiple_values && (
                    <StandardFieldValue
                        presentationValue={presentationValues[0]}
                        handleSubmit={_handleSubmit(backendWithoutCalculatedOrInheritedValues[0]?.id_value)}
                        attribute={attribute}
                        required={element.settings.required}
                        readonly={readonly}
                        label={label}
                        calculatedFlags={calculatedFlags}
                        inheritedFlags={inheritedFlags}
                    />
                )}
                {attribute.multiple_values && (
                    <Form.List name={attribute.id}>
                        {(fields, {add, remove}) => {
                            antdListFieldsRef.current = {add, remove, indexes: fields.map((_, index) => index)};

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
                                                            field.name
                                                        )}
                                                        attribute={attribute}
                                                        label={label}
                                                        required={element.settings.required}
                                                        readonly={readonly}
                                                        calculatedFlags={calculatedFlags}
                                                        inheritedFlags={inheritedFlags}
                                                    />
                                                </StandardFieldValueWrapper>
                                                {fields.length > 1 && (
                                                    <KitDeleteValueButton
                                                        type="tertiary"
                                                        icon={<FaTrash />}
                                                        onClick={() =>
                                                            _handleDeleteValue(
                                                                backendWithoutCalculatedOrInheritedValues[index]
                                                                    ?.id_value,
                                                                remove,
                                                                index
                                                            )
                                                        }
                                                    />
                                                )}
                                            </RowValueWrapper>
                                        ))}
                                    </KitFieldsWrapper>
                                    {canAddAnotherValue && (
                                        <KitAddValueButton
                                            type="secondary"
                                            size="m"
                                            icon={<FaPlus />}
                                            onClick={() => add(defaultValueToAddInAntdForm)}
                                            disabled={fields.length > backendWithoutCalculatedOrInheritedValues.length}
                                        >
                                            {t('record_edition.add_value')}
                                        </KitAddValueButton>
                                    )}
                                </>
                            );
                        }}
                    </Form.List>
                )}
            </KitInputWrapperStyled>
        </Wrapper>
    );
};

export default StandardField;
