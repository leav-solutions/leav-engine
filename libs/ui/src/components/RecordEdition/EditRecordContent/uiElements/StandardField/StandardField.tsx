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
import {DeleteAllValuesButton} from '../shared/DeleteAllValuesButton';
import {computeCalculatedFlags, computeInheritedFlags} from '../shared/calculatedInheritedFlags';
import {useGetPresentationValues} from './useGetPresentationValues';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {getAntdDisplayedValue, getEmptyInitialValue} from '../../antdUtils';
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
    }
> = ({element, antdForm, readonly, onValueSubmit, onValueDelete, onDeleteMultipleValues, metadataEdit = false}) => {
    const {t} = useSharedTranslation();
    const {lang} = useLang();

    const [elementValuesWithoutCalculatedOrInherited, setElementValuesWithoutCalculatedOrInherited] = useState<
        RecordFormElementsValueStandardValue[]
    >([]);

    const antdListFieldsRef = useRef<{
        add: FormListOperation['add'];
        remove: FormListOperation['remove'];
        indexes: number[];
    } | null>(null);

    const {attribute} = element;

    useEffect(() => {
        if (element?.values?.length && antdForm && attribute) {
            if (attribute.multiple_values) {
                const antdDisplayedValues = element.values
                    .sort((a, b) => Number(a.id_value) - Number(b.id_value))
                    .map(v => getAntdDisplayedValue([v], attribute));
                antdForm.setFieldValue(attribute.id, antdDisplayedValues);
            } else {
                antdForm.setFieldValue(attribute.id, getAntdDisplayedValue(element.values, attribute));
            }
        }
    }, [element.values]);

    if (!attribute) {
        return <ErrorDisplay message={t('record_edition.missing_attribute')} />;
    }

    const {state, dispatch} = useEditRecordReducer();

    const calculatedFlags = computeCalculatedFlags(element.values ?? []);
    const inheritedFlags = computeInheritedFlags(element.values ?? []);
    const defaultValueToAddInAntdForm = getEmptyInitialValue(attribute);

    useEffect(() => {
        if (state.activeAttribute?.attribute.id === attribute.id) {
            dispatch({
                type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
                values: element.values
            });
        }

        // Refresh elementValuesWithoutCalculatedOrInherited that depends on element.values
        // Todo, ideally refactor this part
        // If the backend send back inherited value as an attribute of the value and not as another value
        // it would simplify the code and permit to use element.values as it is
        setElementValuesWithoutCalculatedOrInherited(
            (element.values ?? [])
                .filter(elementValue => !elementValue.isCalculated && !elementValue.isInherited)
                .sort((a, b) => Number(a.id_value) - Number(b.id_value))
        );
    }, [element.values]);

    useOutsideInteractionDetector({
        attribute,
        activeAttribute: state.activeAttribute,
        attributePrefix: STANDARD_FIELD_ID_PREFIX,
        dispatch,
        elementValues: element.values ?? [],
        allowedSelectors: ['.ant-popover.ant-color-picker', '.ant-picker-dropdown', '.kit-modal-wrapper.link-modal']
    });

    const {presentationValues} = useGetPresentationValues({
        //TODO fix type
        values: elementValuesWithoutCalculatedOrInherited as unknown as ValueDetailsFragment[],
        format: attribute.format,
        calculatedValue: calculatedFlags.calculatedValue,
        inheritedValue: inheritedFlags.inheritedValue
    });

    const _handleSubmit =
        (idValue?: string, fieldName?: number) =>
        async (valueToSave: AnyPrimitive): Promise<ISubmitMultipleResult> => {
            const shouldSpecifyFieldName = attribute.multiple_values && fieldName !== undefined;
            const name = shouldSpecifyFieldName ? [attribute.id, fieldName] : attribute.id;

            // Clear error on the input
            if (antdForm) {
                antdForm.setFields([{name, errors: undefined}]);
            }

            // Send request to api
            let submitRes;

            if (attribute.multiple_values) {
                submitRes = await onValueSubmit([{value: valueToSave, idValue: idValue ?? null, attribute}], null);
            } else {
                if (!valueToSave) {
                    submitRes = await onValueDelete({id_value: idValue, payload: null}, attribute.id);
                } else {
                    submitRes = await onValueSubmit([{value: valueToSave, idValue: idValue ?? null, attribute}], null);
                }
            }

            if (!submitRes) {
                return;
            }

            if (submitRes.status === APICallStatus.SUCCESS) {
                return submitRes;
            }

            // Parse errors from api response
            if (!submitRes.error && submitRes.errors) {
                const attributeError = submitRes.errors.filter(err => err.attribute === attribute.id)?.[0];

                if (attributeError) {
                    submitRes.error =
                        attributeError.type === ErrorTypes.VALIDATION_ERROR
                            ? attributeError.message
                            : t(`errors.${attributeError.type}`);
                }
            }

            // Display errors on input if found
            if (submitRes.error && antdForm) {
                antdForm.setFields([{name, errors: [submitRes.error]}]);
            }

            return submitRes;
        };

    const resetErrors = (fieldName?: number) => {
        // Re check error if we click in the input
        if (attribute.multiple_values && fieldName !== undefined) {
            antdForm?.setFields([{name: [attribute.id, fieldName], errors: undefined}]);
        } else {
            antdForm?.setFields([{name: attribute.id, errors: undefined}]);
        }
    };

    const _handleDeleteValue = async (
        idValue: string,
        antdRemove: FormListOperation['remove'],
        deletedFieldIndex: number
    ) => {
        if (idValue) {
            await onValueDelete({id_value: idValue}, attribute.id);

            // remove the value from element.values
            setElementValuesWithoutCalculatedOrInherited(
                elementValuesWithoutCalculatedOrInherited
                    .filter(elementValue => elementValue.id_value !== idValue)
                    .sort((a, b) => Number(a.id_value) - Number(b.id_value))
            );
        }

        antdRemove(deletedFieldIndex);
    };

    const _handleDeleteAllValues = async () => {
        const deleteRes = await onDeleteMultipleValues(
            attribute.id,
            (element.values ?? []).filter(b => b.id_value),
            null
        );

        if (deleteRes.status === APICallStatus.SUCCESS) {
            antdListFieldsRef.current.remove(antdListFieldsRef.current.indexes);
            antdListFieldsRef.current.add(defaultValueToAddInAntdForm);

            setElementValuesWithoutCalculatedOrInherited([]);
            return;
        }
    };

    let isFieldInError = false;

    if (antdForm) {
        const hasErrorsInFormList = element.values?.some((_, index) => {
            const errors = antdForm.getFieldError([attribute.id, index]);
            return errors.length > 0;
        });

        const multipleFieldRequiredInError =
            attribute.multiple_values && attribute.required && antdForm.getFieldError([attribute.id, 0])?.length > 0;

        isFieldInError =
            antdForm.getFieldError(attribute.id).length > 0 || hasErrorsInFormList || multipleFieldRequiredInError;
    }

    const isMultipleValues = element.attribute?.multiple_values;
    const hasValue = isMultipleValues && (element.values ?? []).length > 0;
    const canAddAnotherValue =
        !readonly &&
        isMultipleValues &&
        !isFieldInError &&
        attribute.format !== AttributeFormat.boolean &&
        attribute.format !== AttributeFormat.encrypted;
    const canDeleteAllValues = hasValue && element.values.length > 1 && !attribute.required;

    const label = localizedTranslation(element.settings.label, lang);
    const isReadOnly = attribute.readonly || !attribute.permissions.edit_value || readonly;

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
                            <DeleteAllValuesButton
                                handleDelete={_handleDeleteAllValues}
                                disabled={isReadOnly}
                                danger={isFieldInError}
                            />
                        )}
                    </>
                }
                htmlFor={attribute.id}
            >
                {!attribute.multiple_values && (
                    <StandardFieldValue
                        presentationValue={presentationValues[0] ?? ''}
                        handleSubmit={_handleSubmit(elementValuesWithoutCalculatedOrInherited[0]?.id_value)}
                        attribute={attribute}
                        readonly={isReadOnly}
                        label={label}
                        onFocus={resetErrors}
                        calculatedFlags={calculatedFlags}
                        inheritedFlags={inheritedFlags}
                    />
                )}
                {attribute.multiple_values && (
                    <Form.List name={attribute.id}>
                        {(fields, {add, remove}) => {
                            antdListFieldsRef.current = {add, remove, indexes: fields.map((_, index) => index)};

                            const shouldDisabledAddValueButton =
                                fields.length > elementValuesWithoutCalculatedOrInherited.length;

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
                                                            elementValuesWithoutCalculatedOrInherited[index]?.id_value,
                                                            field.name
                                                        )}
                                                        attribute={attribute}
                                                        label={label}
                                                        readonly={isReadOnly}
                                                        onFocus={() => resetErrors(field.name)}
                                                        calculatedFlags={calculatedFlags}
                                                        inheritedFlags={inheritedFlags}
                                                        isLastValueOfMultivalues={
                                                            index === fields.length - 1 && index !== 0
                                                        }
                                                        removeLastValueOfMultivalues={() => remove(index)}
                                                    />
                                                </StandardFieldValueWrapper>
                                                {fields.length > 1 && (
                                                    <KitDeleteValueButton
                                                        type="tertiary"
                                                        title={t('record_edition.delete_value')}
                                                        icon={<FaTrash />}
                                                        onClick={() =>
                                                            _handleDeleteValue(
                                                                elementValuesWithoutCalculatedOrInherited[index]
                                                                    .id_value,
                                                                remove,
                                                                index
                                                            )
                                                        }
                                                        disabled={isReadOnly}
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
                )}
            </KitInputWrapperStyled>
        </Wrapper>
    );
};

export default StandardField;
