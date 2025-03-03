// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AnyPrimitive, ErrorTypes, IRequiredFieldsSettings, localizedTranslation} from '@leav/utils';
import {FunctionComponent, useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {ErrorDisplay} from '_ui/components';
import {RecordFormElementsValueStandardValue} from '_ui/hooks/useGetRecordForm/useGetRecordForm';
import {AttributeFormat, ValueDetailsFragment} from '_ui/_gqlTypes';
import {APICallStatus, IFormElementProps, ISubmitMultipleResult} from '../../_types';
import StandardFieldValue from './StandardFieldValue';
import {Form, FormInstance, FormListOperation} from 'antd';
import {KitButton, KitInputWrapper, KitTooltip} from 'aristid-ds';
import {useLang} from '_ui/hooks';
import {FaPlus, FaTrash} from 'react-icons/fa';
import {DeleteAllValuesButton} from './DeleteAllValuesButton';
import {computeCalculatedFlags, computeInheritedFlags} from './calculatedInheritedFlags';
import {useGetPresentationValues} from './useGetPresentationValues';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ComputeIndicator} from './ComputeIndicator';
import {getAntdDisplayedValue, getEmptyInitialValue} from '../../antdUtils';
import {GetRecordColumnsValuesRecord, IRecordColumnValueStandard} from '_ui/_queries/records/getRecordColumnsValues';
import {useEditRecordReducer} from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {EditRecordReducerActionsTypes} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {EDIT_RECORD_SIDEBAR_ID, STANDARD_FIELD_ID_PREFIX} from '_ui/constants';

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
    antdForm,
    readonly,
    onValueSubmit,
    onValueDelete,
    onDeleteMultipleValues,
    metadataEdit = false
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
        if (computedValues && computedValues[attribute.id]) {
            setBackendValues(computedValues[attribute.id]);
            antdForm.setFieldValue(attribute.id, getAntdDisplayedValue(computedValues[attribute.id], attribute));
        }
    }, [computedValues]);

    if (!attribute) {
        return <ErrorDisplay message={t('record_edition.missing_attribute')} />;
    }

    const {state, dispatch} = useEditRecordReducer();

    useEffect(() => {
        const _handleClickOutside = (event: MouseEvent | FocusEvent) => {
            if (state.activeAttribute?.attribute?.id !== attribute.id) {
                return;
            }

            const target = event.target as HTMLElement;

            const sideBarSelector = '#' + EDIT_RECORD_SIDEBAR_ID;
            const inputWrapperSelector = '#' + STANDARD_FIELD_ID_PREFIX + attribute.id;
            const colorDropdownSelector = '.ant-popover.ant-color-picker';
            const pickerDropdownSelector = '.ant-picker-dropdown';
            const richTextModalSelector = '.kit-modal-wrapper.link-modal';

            const allowedElementsToKeepValueDetailsDisplayed = target.closest(
                `${sideBarSelector}, ${inputWrapperSelector}, ${colorDropdownSelector}, ${pickerDropdownSelector}, ${richTextModalSelector}`
            );

            if (!allowedElementsToKeepValueDetailsDisplayed) {
                dispatch({
                    type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
                    attribute: null
                });
            }
        };

        document.addEventListener('mousedown', _handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', _handleClickOutside);
        };
    }, [state.activeAttribute, attribute.id, dispatch]);

    const [backendValues, setBackendValues] = useState<RecordFormElementsValueStandardValue[]>(element.values);

    const calculatedFlags = computeCalculatedFlags(backendValues);
    const inheritedFlags = computeInheritedFlags(backendValues);
    const defaultValueToAddInAntdForm = getEmptyInitialValue(attribute);

    const backendWithoutCalculatedOrInheritedValues = backendValues
        .filter(backendValue => !backendValue.isCalculated && !backendValue.isInherited)
        .sort((a, b) => Number(a.id_value) - Number(b.id_value));

    useEffect(() => {
        if (state.activeAttribute?.attribute.id === attribute.id) {
            dispatch({
                type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
                values: backendValues
            });
        }
    }, [backendValues]);

    const {presentationValues} = useGetPresentationValues({
        //TODO fix type
        values: backendWithoutCalculatedOrInheritedValues as unknown as ValueDetailsFragment[],
        format: attribute.format,
        calculatedValue: calculatedFlags.calculatedValue,
        inheritedValue: inheritedFlags.inheritedValue
    });

    const _handleSubmit =
        (idValue?: string, fieldName?: number) =>
        async (valueToSave: AnyPrimitive): Promise<ISubmitMultipleResult> => {
            const shouldSpecifyFieldName = attribute.multiple_values && fieldName !== undefined;
            const name = shouldSpecifyFieldName ? [attribute.id, fieldName] : attribute.id;
            if (antdForm) {
                antdForm.setFields([
                    {
                        name,
                        errors: null
                    }
                ]);
            }

            let submitRes;
            if (attribute.multiple_values) {
                submitRes = await onValueSubmit([{value: valueToSave, idValue: idValue ?? null, attribute}], null);
                if (submitRes.status === APICallStatus.SUCCESS) {
                    setBackendValues(previousBackendValues => {
                        const newBackendValues = [...previousBackendValues, ...submitRes.values].reduce(
                            (acc, backendValue) => {
                                const existingValue = acc.find(
                                    o =>
                                        o.id_value === backendValue.id_value &&
                                        o.isCalculated === backendValue.isCalculated &&
                                        o.isInherited === backendValue.isInherited
                                );

                                if (existingValue) {
                                    Object.assign(existingValue, backendValue);
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
                                        (value.isInherited !== null && value.isInherited !== undefined)
                                )
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
                        errors: [submitRes.error]
                    }
                ]);
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

    const setActiveValue = () => {
        dispatch({
            type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
            attribute,
            values: backendValues
        });
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
    const canDeleteAllValues = hasValue && backendValues.length > 1 && !attribute.required;

    const label = localizedTranslation(element.settings.label, lang);

    const isReadOnly = attribute.readonly || readonly;

    return (
        <Wrapper $metadataEdit={metadataEdit}>
            <KitInputWrapperStyled
                id={STANDARD_FIELD_ID_PREFIX + attribute.id}
                label={label}
                required={attribute.required}
                disabled={isReadOnly}
                bordered={attribute.multiple_values}
                status={isFieldInError ? 'error' : undefined}
                extra={
                    <>
                        <KitInputExtraAlignLeft>
                            <ComputeIndicator calculatedFlags={calculatedFlags} inheritedFlags={inheritedFlags} />
                        </KitInputExtraAlignLeft>
                        {canDeleteAllValues && (
                            <DeleteAllValuesButton handleDelete={_handleDeleteAllValues} disabled={isReadOnly} />
                        )}
                    </>
                }
                htmlFor={attribute.id}
            >
                {!attribute.multiple_values && (
                    <StandardFieldValue
                        presentationValue={presentationValues[0] ?? ''}
                        handleSubmit={_handleSubmit(backendWithoutCalculatedOrInheritedValues[0]?.id_value)}
                        attribute={attribute}
                        readonly={isReadOnly}
                        label={label}
                        calculatedFlags={calculatedFlags}
                        inheritedFlags={inheritedFlags}
                        setActiveValue={setActiveValue}
                    />
                )}
                {attribute.multiple_values && (
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
                                                            field.name
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
                                                        setActiveValue={setActiveValue}
                                                    />
                                                </StandardFieldValueWrapper>
                                                {fields.length > 1 && (
                                                    <KitDeleteValueButton
                                                        type="tertiary"
                                                        title={t('record_edition.delete_value')}
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
                                                disabled={shouldDisabledAddValueButton}
                                            >
                                                {t('record_edition.add_value')}
                                            </KitAddValueButton>
                                        </KitTooltip>
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
