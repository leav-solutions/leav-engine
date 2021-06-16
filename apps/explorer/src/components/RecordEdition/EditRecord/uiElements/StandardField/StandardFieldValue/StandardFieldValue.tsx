// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined, DeleteOutlined, ExclamationCircleOutlined} from '@ant-design/icons';
import {AnyPrimitive} from '@leav/types';
import {Button, Form, Popconfirm, Popover, Space, Tooltip} from 'antd';
import {PrimaryBtn} from 'components/app/StyledComponent/PrimaryBtn';
import {IStandardInputProps} from 'components/RecordEdition/EditRecord/_types';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {AttributeFormat} from '_types/types';
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
import ValueDetails from './ValueDetails';

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

const Dimmer = styled.div`
    position: fixed;
    z-index: 1;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.2);
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
    }

    ${FormWrapper}:not(:last-child) & input {
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

    &.editing .field-wrapper,
    &.editing .nested-input {
        width: 60%;
        line-height: 2.5em;
        z-index: 0;
    }

    &.format-boolean label {
        margin-right: 1em;
    }

    &:not(.format-boolean) label {
        position: absolute;
        left: 5px;
        top: 5px;
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
        top: -10px;
        font-size: 0.9em;
        background: ${p => (p.isEditing ? 'transparent' : themingVar['@default-bg'])};
        color: ${p => (p.isEditing ? 'rgba(0, 0, 0, 1)' : 'rgba(0,0,0,0.5)')};
        text-shadow: 0px 0px 4px #fff;
        z-index: 1;
    }
`;

const ButtonsWrapper = styled(Space)`
    position: absolute;
    top: 45px;
    right: 40%;
    float: right;
    margin: 0.5em 0;
`;

const ValueDetailsWrapper = styled.div`
    position: absolute;
    right: 0;
    top: 0;
    width: 40%;
    padding-left: 1em;
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

    const {attribute} = state.formElement;

    const _handleSubmit = async (valueToSave: AnyPrimitive) => {
        onSubmit(fieldValue.idValue, valueToSave);
    };

    const _handleDelete = async () => {
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
                settings={state.formElement.settings}
            />
        );
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

    const canDeleteValue = fieldValue.idValue !== newValueId;

    return (
        <>
            {fieldValue.isEditing && <Dimmer onClick={_handleCancel} />}
            <FormWrapper isEditing={fieldValue.isEditing}>
                <Form>
                    <Form.Item style={{margin: 0}}>
                        {
                            <Popover placement="topLeft" visible={isErrorVisible} content={errorContent}>
                                <InputWrapper isEditing={fieldValue.isEditing} className={wrapperClasses}>
                                    {!fieldValue.index && (
                                        <label onClick={_handleFocus}>{state.formElement.settings.label}</label>
                                    )}
                                    {_getInput()}
                                </InputWrapper>
                            </Popover>
                        }
                        {fieldValue.isEditing && (
                            <ButtonsWrapper size="small">
                                <Button size="small" onClick={_handleCancel} style={{background: '#FFF'}}>
                                    {t('global.cancel')}
                                </Button>
                                <PrimaryBtn size="small" onClick={_handleClickSubmit}>
                                    {t('global.submit')}
                                </PrimaryBtn>
                                {canDeleteValue && (
                                    <Tooltip placement="bottom" title={t('global.delete')}>
                                        <Popconfirm
                                            placement="leftTop"
                                            title={t('record_edition.delete_value_confirm')}
                                            onConfirm={_handleDelete}
                                            okText={t('global.submit')}
                                            okButtonProps={{'aria-label': 'delete-confirm-btn'}}
                                            cancelText={t('global.cancel')}
                                        >
                                            <Button
                                                size="small"
                                                icon={<DeleteOutlined />}
                                                style={{background: '#FFF'}}
                                                danger
                                            />
                                        </Popconfirm>
                                    </Tooltip>
                                )}
                            </ButtonsWrapper>
                        )}
                        {fieldValue.isEditing && (
                            <ValueDetailsWrapper>
                                <ValueDetails state={state} fieldValue={fieldValue} />
                            </ValueDetailsWrapper>
                        )}
                    </Form.Item>
                </Form>
            </FormWrapper>
        </>
    );
}

export default StandardFieldValue;
