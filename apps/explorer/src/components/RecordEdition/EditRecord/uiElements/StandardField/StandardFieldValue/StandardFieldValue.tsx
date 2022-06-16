// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined, ExclamationCircleOutlined} from '@ant-design/icons';
import {AnyPrimitive} from '@leav/utils';
import {Button, Form, Input, InputRef, Popover, Space} from 'antd';
import {PrimaryBtn} from 'components/app/StyledComponent/PrimaryBtn';
import DeleteValueBtn from 'components/RecordEdition/EditRecord/shared/DeleteValueBtn';
import ValueDetailsBtn from 'components/RecordEdition/EditRecord/shared/ValueDetailsBtn';
import {
    InputRefPossibleTypes,
    IStandardInputProps,
    StandardValueTypes
} from 'components/RecordEdition/EditRecord/_types';
import {EditRecordReducerActionsTypes} from 'components/RecordEdition/editRecordReducer/editRecordReducer';
import {useEditRecordReducer} from 'components/RecordEdition/editRecordReducer/useEditRecordReducer';
import Dimmer from 'components/shared/Dimmer';
import FloatingMenu, {FloatingMenuAction} from 'components/shared/FloatingMenu/FloatingMenu';
import moment from 'moment';
import React, {MutableRefObject, useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {stringifyDateRangeValue} from 'utils';
import {AttributeFormat} from '_gqlTypes/globalTypes';
import {
    RECORD_FORM_recordForm_elements_attribute_StandardAttribute,
    RECORD_FORM_recordForm_elements_attribute_StandardAttribute_values_list_StandardDateRangeValuesListConf,
    RECORD_FORM_recordForm_elements_attribute_StandardAttribute_values_list_StandardStringValuesListConf
} from '_gqlTypes/RECORD_FORM';
import {IDateRangeValue} from '_types/types';
import {
    IdValue,
    IStandardFieldReducerState,
    IStandardFieldValue,
    newValueId,
    StandardFieldDispatchFunc,
    StandardFieldReducerActionsTypes,
    StandardFieldValueState
} from '../standardFieldReducer/standardFieldReducer';
import CheckboxInput from './Inputs/CheckboxInput';
import DateInput from './Inputs/DateInput';
import DateRangeInput from './Inputs/DateRangeInput';
import EncryptedInput from './Inputs/EncryptedInput';
import NumberInput from './Inputs/NumberInput';
import TextInput from './Inputs/TextInput';
import ValuesList from './ValuesList';
import {IValueOfValuesList} from './ValuesList/ValuesList';

interface IStandardFieldValueProps {
    value: IStandardFieldValue;
    state: IStandardFieldReducerState;
    dispatch: StandardFieldDispatchFunc;
    onSubmit: (idValue: IdValue, value: AnyPrimitive) => void;
    onDelete: (idValue: IdValue) => void;
}

type IStringValuesListConf = RECORD_FORM_recordForm_elements_attribute_StandardAttribute_values_list_StandardStringValuesListConf;
type IDateRangeValuesListConf = RECORD_FORM_recordForm_elements_attribute_StandardAttribute_values_list_StandardDateRangeValuesListConf;

const ErrorMessage = styled.div`
    color: ${themingVar['@error-color']};
    font-weight: bold;
`;

const FormWrapper = styled.div<{isEditing: boolean}>`
    position: relative;
    z-index: ${p => (p.isEditing ? 2 : 0)};
`;

const InputWrapper = styled.div<{isEditing: boolean}>`
    position: relative;

    && input {
        background: ${themingVar['@default-bg']};
        transition: none;
        border-radius: 0;
        line-height: 2.5em;
    }

    ${FormWrapper}:not(:last-child) & input:not(:hover) {
        border-bottom: none;
    }

    ${FormWrapper}:first-child & input {
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
    }

    ${FormWrapper}:last-child & input {
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
    }

    &.editing input {
        border-radius: 5px;
    }

    &.editing .field-wrapper,
    &.editing .nested-input {
        z-index: 0;
    }

    &.format-boolean label {
        margin-right: 1em;
    }

    &:not(.format-boolean) label {
        position: absolute;
        left: 5px;
        top: calc(50% - 0.9em);
        font-size: 1.1em;
        background: transparent;
        padding: 0 0.5em;
        color: ${themingVar['@leav-secondary-font-color']};
        transition: all 0.2s ease;
        transition-property: left, top, font-size;
        z-index: 1;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        width: 100%;
    }

    &:not(.format-boolean):not(.editing):not(.has-value) label {
        padding-right: 3rem;
    }

    input:disabled {
        background: ${themingVar['@default-bg']};
    }

    &.has-value:not(.format-boolean) label,
    &.editing:not(.format-boolean) label {
        top: 0px;
        font-size: 0.9em;
        background: transparent;
        text-shadow: 0px 0px 4px #fff;
        z-index: 2;
        border-radius: 5px;
    }

    ${FormWrapper}.first-value &.has-value:not(.format-boolean) input:not(:first-child),
    ${FormWrapper}.first-value &.editing:not(.format-boolean) input:not(:only-child),
    ${FormWrapper}.first-value &.editing.format-date_range input,
    ${FormWrapper}.first-value &.editing.format-date_range .ant-picker-range-separator {
        padding-top: 1em;
    }

    &:not(.has-value):not(.editing):not(.format-boolean) input {
        padding: 9px 0;
    }

    &:not(:hover) .floating-menu {
        display: none;
    }

    .floating-menu {
        top: 50%;
        transform: translateY(-50%);
    }
`;

const ActionsWrapper = styled.div`
    position: absolute;
    display: flex;
    width: 100%;
    flex-direction: column;
`;

const ButtonsWrapper = styled.div`
    display: flex;
    margin: 0.5em 0;
    justify-content: flex-end;

    & > button {
        margin-left: 0.5em;
    }
`;

const FormItem = styled(Form.Item)`
    && {
        margin: 0;
    }
`;

const inputComponentByFormat: {[format in AttributeFormat]: (props: IStandardInputProps) => JSX.Element} = {
    [AttributeFormat.text]: TextInput,
    [AttributeFormat.date]: DateInput,
    [AttributeFormat.date_range]: DateRangeInput,
    [AttributeFormat.boolean]: CheckboxInput,
    [AttributeFormat.numeric]: NumberInput,
    [AttributeFormat.encrypted]: EncryptedInput,
    [AttributeFormat.extended]: TextInput
};

function StandardFieldValue({
    value: fieldValue,
    onSubmit,
    onDelete,
    state,
    dispatch
}: IStandardFieldValueProps): JSX.Element {
    const {t} = useTranslation();
    const actionsWrapperRef = useRef<HTMLDivElement>();
    const inputRef = useRef<InputRefPossibleTypes>();

    const {dispatch: editRecordDispatch} = useEditRecordReducer();

    const attribute = state.formElement.attribute as RECORD_FORM_recordForm_elements_attribute_StandardAttribute;

    const isValuesListEnabled = !!attribute?.values_list?.enable;
    const isValuesListOpen = !!attribute?.values_list?.allowFreeEntry;

    useEffect(() => {
        if (fieldValue.isEditing) {
            actionsWrapperRef?.current?.scrollIntoView({block: 'nearest'});
        }
    }, [fieldValue.isEditing]);

    const _handleSubmit = async (valueToSave: StandardValueTypes) => {
        if (valueToSave === '') {
            return _handleDelete();
        }

        const convertedValue = typeof valueToSave === 'object' ? JSON.stringify(valueToSave) : valueToSave;
        onSubmit(fieldValue.idValue, convertedValue);

        if (!state.metadataEdit) {
            editRecordDispatch({
                type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
                value: null
            });
        } else {
            dispatch({type: StandardFieldReducerActionsTypes.UNEDIT_FIELD, idValue: fieldValue.idValue});
        }
    };

    const _handlePressEnter = async () => {
        if (!isValuesListEnabled) {
            return _handleSubmit(fieldValue.editingValue);
        }

        const valuesList = _getFilteredValuesList();
        if (!valuesList.length) {
            return;
        }

        return _handleSubmit(valuesList[0].value);
    };

    const _handleDelete = async () => {
        if (fieldValue.idValue === newValueId) {
            return _handleCancel();
        }

        onDelete(fieldValue.idValue);
    };

    const _handleFocus = () => {
        if (state.isReadOnly || fieldValue.isEditing || attribute.format === AttributeFormat.boolean) {
            return;
        }

        dispatch({
            type: StandardFieldReducerActionsTypes.FOCUS_FIELD,
            idValue: fieldValue.idValue
        });

        if (!state.metadataEdit) {
            editRecordDispatch({
                type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
                value: {value: fieldValue.value, attribute}
            });
        }
    };

    const _handleValueChange = (value: AnyPrimitive | IDateRangeValue) => {
        dispatch({
            type: StandardFieldReducerActionsTypes.CHANGE_VALUE,
            idValue: fieldValue.idValue,
            value
        });
    };

    const _handleCloseError = () =>
        dispatch({
            type: StandardFieldReducerActionsTypes.SET_ERROR_DISPLAY,
            displayError: false,
            idValue: fieldValue.idValue
        });

    const _handleCancel = () => {
        dispatch({
            type: StandardFieldReducerActionsTypes.CANCEL_EDITING,
            idValue: fieldValue.idValue
        });

        if (!state.metadataEdit) {
            editRecordDispatch({
                type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
                value: null
            });
        }
    };

    const _handleClickSubmit = () => {
        _handleSubmit(fieldValue.editingValue);
    };

    const _handleValueCopy = (value: AnyPrimitive | IDateRangeValue) => {
        (inputRef as MutableRefObject<InputRef>)?.current?.focus();

        _handleValueChange(value);
    };

    const _getInput = (): JSX.Element => {
        if (!fieldValue.isEditing && attribute.format !== AttributeFormat.boolean) {
            let displayedValue = String(fieldValue.displayValue);

            if (fieldValue.displayValue) {
                switch (attribute.format) {
                    case AttributeFormat.date_range:
                        const dateRangeValue = fieldValue.displayValue as IDateRangeValue;
                        displayedValue = stringifyDateRangeValue(dateRangeValue, t);
                        break;
                    case AttributeFormat.encrypted:
                        displayedValue = '•••••••••';
                        break;
                }
            }

            return (
                <Input
                    key="display"
                    className={fieldValue.displayValue ? 'has-value' : ''}
                    value={displayedValue}
                    onFocus={_handleFocus}
                    disabled={state.isReadOnly}
                />
            );
        }

        const InputComponent = inputComponentByFormat[attribute.format];

        // This should never happen, unless we have some bad settings in DB
        if (!InputComponent) {
            return <div>{t('record_edition.invalid_format')}</div>;
        }

        return (
            <InputComponent
                state={state}
                fieldValue={fieldValue}
                onChange={_handleValueChange}
                onFocus={_handleFocus}
                onSubmit={_handleSubmit}
                onPressEnter={_handlePressEnter}
                settings={state.formElement.settings}
                inputRef={inputRef}
            />
        );
    };

    const _getFilteredValuesList = (): IValueOfValuesList[] => {
        let values: Array<Pick<IValueOfValuesList, 'value' | 'rawValue'>> = [];

        if (isValuesListEnabled) {
            if (attribute.format === AttributeFormat.date_range) {
                const valuesList = (attribute?.values_list as IDateRangeValuesListConf)?.dateRangeValues ?? [];

                values = valuesList
                    .filter(val => {
                        return fieldValue.state === StandardFieldValueState.PRISTINE || !fieldValue.editingValue;
                    })
                    .map(v => {
                        const rangeValue = {
                            from: moment(Number(v.from) * 1000).format('L'),
                            to: moment(Number(v.to) * 1000).format('L')
                        };
                        return {
                            value: stringifyDateRangeValue(rangeValue, t),
                            rawValue: {from: v.from, to: v.to}
                        };
                    });
            } else {
                const valuesList = (attribute?.values_list as IStringValuesListConf)?.values ?? [];

                values = valuesList
                    .filter(val => {
                        return (
                            fieldValue.state === StandardFieldValueState.PRISTINE ||
                            !fieldValue.editingValue ||
                            attribute.format === AttributeFormat.date ||
                            val.match(new RegExp(String(fieldValue.editingValue), 'i'))
                        );
                    })
                    .map(v => ({value: v, rawValue: v}));
            }
        }

        const hydratedValues: IValueOfValuesList[] = values.map(value => ({
            ...value,
            isNewValue: false,
            canCopy:
                isValuesListOpen &&
                attribute.format !== AttributeFormat.date &&
                attribute.format !== AttributeFormat.date_range
        }));

        // Display current value on top of values list as "new value". Don't do that for date range attribute as it
        // doesn't make much sense
        if (
            isValuesListOpen &&
            String(fieldValue.editingValue) &&
            attribute.format !== AttributeFormat.date_range &&
            !((attribute?.values_list as IStringValuesListConf)?.values ?? []).some(v => v === fieldValue.editingValue)
        ) {
            hydratedValues.unshift({
                value: String(fieldValue.editingValue),
                rawValue: String(fieldValue.editingValue),
                isNewValue: true,
                canCopy: false
            });
        }

        return hydratedValues;
    };

    const errorContent = (
        <ErrorMessage>
            <Space size="small">
                <ExclamationCircleOutlined />
                {fieldValue.error}
                <Button onClick={_handleCloseError} size="small" icon={<CloseOutlined />} style={{border: 'none'}} />
            </Space>
        </ErrorMessage>
    );

    const isErrorVisible =
        (fieldValue.isEditing || attribute.format === AttributeFormat.boolean || !state.record) &&
        fieldValue.isErrorDisplayed;

    const wrapperClasses = `
        ${attribute.format ? `format-${attribute.format}` : ''}
        ${fieldValue.value?.value ? 'has-value' : ''}
        ${fieldValue.isEditing ? 'editing' : ''}
    `;

    const canDeleteValue =
        !state.isReadOnly && fieldValue.idValue !== newValueId && attribute.format !== AttributeFormat.boolean;

    const valuesList = _getFilteredValuesList();

    const valueActions: FloatingMenuAction[] = [
        {
            title: t('record_edition.value_details'),
            button: <ValueDetailsBtn value={fieldValue.value} attribute={attribute} shape="circle" />
        }
    ];

    if (canDeleteValue && !fieldValue.isEditing && fieldValue.displayValue) {
        valueActions.push({
            title: t('global.delete'),
            button: <DeleteValueBtn onDelete={_handleDelete} shape="circle" />
        });
    }

    return (
        <>
            {fieldValue.isEditing && <Dimmer onClick={_handleCancel} />}
            <FormWrapper isEditing={fieldValue.isEditing} className={!fieldValue.index ? 'first-value' : ''}>
                <Form>
                    <FormItem>
                        <Popover placement="topLeft" visible={isErrorVisible} content={errorContent}>
                            <InputWrapper
                                isEditing={fieldValue.isEditing}
                                className={wrapperClasses}
                                data-testid="input-wrapper"
                            >
                                {!fieldValue.index && (
                                    <label className="attribute-label" onClick={_handleFocus}>
                                        {state.formElement.settings.label}
                                    </label>
                                )}
                                {_getInput()}
                                {!state.metadataEdit && <FloatingMenu actions={valueActions} />}
                            </InputWrapper>
                        </Popover>
                        <ActionsWrapper ref={actionsWrapperRef}>
                            {fieldValue.isEditing && attribute?.values_list?.enable && (
                                <ValuesList
                                    attribute={attribute}
                                    valuesList={valuesList}
                                    onValueSelect={_handleSubmit}
                                    onValueCopy={_handleValueCopy}
                                />
                            )}
                            {fieldValue.isEditing && (
                                <ButtonsWrapper>
                                    <Button size="small" onClick={_handleCancel} style={{background: '#FFF'}}>
                                        {t('global.cancel')}
                                    </Button>
                                    {(!isValuesListEnabled || isValuesListOpen) && (
                                        <PrimaryBtn size="small" onClick={_handleClickSubmit}>
                                            {t('global.submit')}
                                        </PrimaryBtn>
                                    )}
                                </ButtonsWrapper>
                            )}
                        </ActionsWrapper>
                    </FormItem>
                </Form>
            </FormWrapper>
        </>
    );
}

export default StandardFieldValue;
