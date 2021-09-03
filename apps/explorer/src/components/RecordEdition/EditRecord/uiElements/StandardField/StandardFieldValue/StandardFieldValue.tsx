// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined, ExclamationCircleOutlined} from '@ant-design/icons';
import {AnyPrimitive} from '@leav/utils';
import {Button, Form, Input, Popover, Space} from 'antd';
import {PrimaryBtn} from 'components/app/StyledComponent/PrimaryBtn';
import DeleteValueBtn from 'components/RecordEdition/EditRecord/shared/DeleteValueBtn';
import {IStandardInputProps} from 'components/RecordEdition/EditRecord/_types';
import Dimmer from 'components/shared/Dimmer';
import React, {useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {GET_FORM_forms_list_elements_elements_attribute_StandardAttribute} from '_gqlTypes/GET_FORM';
import {AttributeFormat} from '_types/types';
import ValueDetails from '../../../shared/ValueDetails';
import {
    IdValue,
    IStandardFieldReducerState,
    IStandardFieldValue,
    newValueId,
    StandardFieldDispatchFunc,
    StandardFieldReducerActionsTypes
} from '../standardFieldReducer/standardFieldReducer';
import CheckboxInput from './Inputs/CheckboxInput';
import DateInput from './Inputs/DateInput';
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

    input {
        background: ${themingVar['@default-bg']};
        transition: none;
        border-radius: 0;
        line-height: 2em;
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
        width: 60%;
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
        color: rgba(0, 0, 0, 0.5);
        transition: all 0.2s ease;
        transition-property: left, top, font-size;
        z-index: 1;
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

    &.has-value:not(.format-boolean) input:not(:first-child),
    &.editing:not(.format-boolean) input:not(:only-child) {
        padding-top: 1em;
    }

    &:not(.has-value):not(.editing):not(.format-boolean) input {
        padding: 9px 0;
    }

    .delete-value-button {
        position: absolute;
        top: calc(50% - 12px);
        right: 1em;
    }

    &:not(:hover) .delete-value-button {
        display: none;
    }
`;

const ActionsWrapper = styled.div`
    position: absolute;
    display: flex;
    width: 60%;
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

const ValueDetailsWrapper = styled.div`
    position: absolute;
    right: 0;
    top: 0;
    width: 40%;
    padding-left: 1em;
`;

const FormItem = styled(Form.Item)`
    && {
        margin: 0;
    }
`;

const inputComponentByFormat: {[format in AttributeFormat]: (props: IStandardInputProps) => JSX.Element} = {
    [AttributeFormat.text]: TextInput,
    [AttributeFormat.date]: DateInput,
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

    const attribute = state.formElement.attribute as GET_FORM_forms_list_elements_elements_attribute_StandardAttribute;

    const isValuesListEnabled = !!attribute?.values_list?.enable;
    const isValuesListOpen = !!attribute?.values_list?.allowFreeEntry;

    useEffect(() => {
        actionsWrapperRef?.current?.scrollIntoView({block: 'end'});
    }, [fieldValue.isEditing]);

    const _handleSubmit = async (valueToSave: AnyPrimitive) => {
        if (valueToSave === '') {
            return _handleDelete();
        }

        onSubmit(fieldValue.idValue, valueToSave);
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
        dispatch({
            type: StandardFieldReducerActionsTypes.FOCUS_FIELD,
            idValue: fieldValue.idValue
        });
    };

    const _handleValueChange = (value: AnyPrimitive) => {
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
    };

    const _handleClickSubmit = () => {
        _handleSubmit(fieldValue.editingValue);
    };

    const _getInput = (): JSX.Element => {
        if (!fieldValue.isEditing && attribute.format !== AttributeFormat.boolean) {
            const displayedValue =
                attribute.format === AttributeFormat.encrypted && fieldValue.displayValue
                    ? '•••••••••'
                    : String(fieldValue.displayValue);
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
            />
        );
    };

    const _getFilteredValuesList = (): IValueOfValuesList[] => {
        const values =
            isValuesListEnabled && attribute?.values_list?.values
                ? attribute.values_list.values.filter(val => {
                      return (
                          !fieldValue.editingValue ||
                          attribute.format === AttributeFormat.date ||
                          val.match(new RegExp(String(fieldValue.editingValue), 'i'))
                      );
                  })
                : [];

        const hydratedValues = values.map(value => ({
            value,
            isNewValue: false,
            canCopy: isValuesListOpen
        }));

        if (isValuesListOpen && String(fieldValue.editingValue)) {
            hydratedValues.unshift({
                value: String(fieldValue.editingValue),
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
        (fieldValue.isEditing || attribute.format === AttributeFormat.boolean) && fieldValue.isErrorDisplayed;

    const wrapperClasses = `
        ${attribute.format ? `format-${attribute.format}` : ''}
        ${fieldValue.value ? 'has-value' : ''}
        ${fieldValue.isEditing ? 'editing' : ''}
    `;

    const canDeleteValue = fieldValue.idValue !== newValueId && attribute.format !== AttributeFormat.boolean;

    const valuesList = _getFilteredValuesList();

    return (
        <>
            {fieldValue.isEditing && <Dimmer onClick={_handleCancel} />}
            <FormWrapper isEditing={fieldValue.isEditing}>
                <Form>
                    <FormItem>
                        <Popover placement="topLeft" visible={isErrorVisible} content={errorContent}>
                            <InputWrapper
                                isEditing={fieldValue.isEditing}
                                className={wrapperClasses}
                                data-testid="input-wrapper"
                            >
                                {!fieldValue.index && (
                                    <label onClick={_handleFocus}>{state.formElement.settings.label}</label>
                                )}
                                {_getInput()}
                                {canDeleteValue && !fieldValue.isEditing && fieldValue.displayValue && (
                                    <DeleteValueBtn onDelete={_handleDelete} />
                                )}
                            </InputWrapper>
                        </Popover>
                        <ActionsWrapper ref={actionsWrapperRef}>
                            {fieldValue.isEditing && attribute.values_list.enable && (
                                <ValuesList
                                    attribute={attribute}
                                    valuesList={valuesList}
                                    onValueSelect={_handleSubmit}
                                    onValueCopy={_handleValueChange}
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
                        {fieldValue.isEditing && (
                            <ValueDetailsWrapper>
                                <ValueDetails value={fieldValue.value} attribute={attribute} />
                            </ValueDetailsWrapper>
                        )}
                    </FormItem>
                </Form>
            </FormWrapper>
        </>
    );
}

export default StandardFieldValue;
