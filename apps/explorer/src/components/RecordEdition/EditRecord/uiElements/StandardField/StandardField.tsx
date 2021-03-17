// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined, DeleteOutlined, ExclamationCircleOutlined} from '@ant-design/icons';
import {AnyPrimitive, ICommonFieldsSettings} from '@leav/types';
import {Button, Form, Popover, Space, Tooltip} from 'antd';
import {PrimaryBtn} from 'components/app/StyledComponent/PrimaryBtn';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import React, {useEffect, useReducer} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {AttributeFormat} from '_gqlTypes/globalTypes';
import useDeleteValueMutation from '../../hooks/useDeleteValueMutation';
import useSaveValueMutation from '../../hooks/useSaveValueMutation';
import {APICallStatus, IFormElementProps, IStandardInputProps} from '../../_types';
import CheckboxInput from './Inputs/CheckboxInput';
import DateInput from './Inputs/DateInput';
import EncryptedInput from './Inputs/EncryptedInput';
import NumberInput from './Inputs/NumberInput';
import TextInput from './Inputs/TextInput';
import standardFieldReducer from './standardFieldReducer';
import {
    IStandardFieldReducerState,
    StandardFieldReducerActionsTypes
} from './standardFieldReducer/standardFieldReducer';
import ValueDetails from './ValueDetails';

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

function StandardField({element, recordValues, record}: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    const {t} = useTranslation();

    const fieldValue = recordValues[element.settings.attribute]?.[0];

    const {attribute} = element;

    const {saveValue} = useSaveValueMutation(record, attribute.id);
    const {deleteValue} = useDeleteValueMutation(record, attribute.id);

    const initialState: IStandardFieldReducerState = {
        attribute,
        value: fieldValue ?? null,
        idValue: fieldValue?.id_value ?? null,
        displayValue: fieldValue?.value ?? '',
        editingValue: attribute.format === AttributeFormat.encrypted ? '' : fieldValue?.raw_value ?? '',
        originRawValue: attribute.format === AttributeFormat.encrypted ? '' : fieldValue?.raw_value ?? '',
        error: '',
        isErrorDisplayed: false,
        isReadOnly: attribute?.system,
        isEditing: false
    };

    const [state, dispatch] = useReducer(standardFieldReducer, initialState);

    const _getInput = (): JSX.Element => {
        const InputComponent = inputComponentByFormat[attribute.format];

        // This should never happen, unless we have some bad settings in DB
        if (!InputComponent) {
            return <div>{t('record_edition.invalid_format')}</div>;
        }

        return (
            <InputComponent
                state={state}
                value={state.isEditing ? state.editingValue : state.displayValue}
                onChange={_handleValueChange}
                onFocus={_handleFocus}
                onSubmit={_handleSubmit}
                settings={element.settings}
            />
        );
    };

    useEffect(() => {
        dispatch({
            type: StandardFieldReducerActionsTypes.SET_ERROR_DISPLAY,
            displayError: !!state.error
        });
    }, [state.error]);

    const _handleSubmit = async (valueToSave: AnyPrimitive) => {
        dispatch({
            type: StandardFieldReducerActionsTypes.CLEAR_ERROR
        });
        const submitRes = await saveValue({value: valueToSave, idValue: null});

        if (submitRes.status === APICallStatus.SUCCESS) {
            dispatch({
                type: StandardFieldReducerActionsTypes.UPDATE_AFTER_SUBMIT,
                newValue: submitRes.value
            });

            return;
        }

        dispatch({
            type: StandardFieldReducerActionsTypes.SET_ERROR,
            error: submitRes.error
        });
    };

    const _handleDelete = async () => {
        dispatch({
            type: StandardFieldReducerActionsTypes.UNEDIT_FIELD
        });

        const deleteRes = await deleteValue(fieldValue.id_value);

        if (deleteRes.status === APICallStatus.SUCCESS) {
            dispatch({
                type: StandardFieldReducerActionsTypes.UPDATE_AFTER_DELETE
            });

            return;
        }

        dispatch({
            type: StandardFieldReducerActionsTypes.SET_ERROR,
            error: deleteRes.error
        });
    };

    const _handleFocus = () => {
        dispatch({
            type: StandardFieldReducerActionsTypes.FOCUS_FIELD
        });
    };

    const _handleValueChange = (value: AnyPrimitive) => {
        dispatch({
            type: StandardFieldReducerActionsTypes.CHANGE_VALUE,
            value
        });
    };

    const _handleCloseError = () =>
        dispatch({type: StandardFieldReducerActionsTypes.SET_ERROR_DISPLAY, displayError: false});

    const _handleCancel = () => {
        dispatch({
            type: StandardFieldReducerActionsTypes.CANCEL_EDITING
        });
    };

    const _handleClickSubmit = () => {
        _handleSubmit(state.editingValue);
    };

    const errorContent = (
        <ErrorMessage>
            <Space size="small">
                <ExclamationCircleOutlined />
                {state.error}
                <Button onClick={_handleCloseError} size="small" icon={<CloseOutlined />} style={{border: 'none'}} />
            </Space>
        </ErrorMessage>
    );

    const isErrorVisible = (state.isEditing || attribute.format === AttributeFormat.boolean) && state.isErrorDisplayed;

    const wrapperClasses = `
        ${attribute.format ? `format-${attribute.format}` : ''}
        ${state.value ? 'has-value' : ''}
        ${state.isEditing ? 'editing' : ''}
    `;

    if (!attribute) {
        return <ErrorDisplay message={t('record_edition.missing_attribute')} />;
    }

    return (
        <>
            {state.isEditing && <Dimmer onClick={_handleCancel} />}
            <FormWrapper isEditing={state.isEditing}>
                <Form>
                    <Form.Item>
                        {
                            <Popover placement="topLeft" visible={isErrorVisible} content={errorContent}>
                                <InputWrapper isEditing={state.isEditing} className={wrapperClasses}>
                                    <label onClick={_handleFocus}>{element.settings.label}</label>
                                    {_getInput()}
                                </InputWrapper>
                            </Popover>
                        }
                        {state.isEditing && (
                            <ButtonsWrapper size="small">
                                <Button size="small" onClick={_handleCancel} style={{background: '#FFF'}}>
                                    {t('global.cancel')}
                                </Button>
                                <PrimaryBtn size="small" onClick={_handleClickSubmit}>
                                    {t('global.submit')}
                                </PrimaryBtn>
                                <Tooltip placement="bottom" title={t('global.delete')}>
                                    <Button
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        onClick={_handleDelete}
                                        style={{background: '#FFF'}}
                                        danger
                                    />
                                </Tooltip>
                            </ButtonsWrapper>
                        )}
                        {state.isEditing && (
                            <ValueDetailsWrapper>
                                <ValueDetails state={state} />
                            </ValueDetailsWrapper>
                        )}
                    </Form.Item>
                </Form>
            </FormWrapper>
        </>
    );
}

export default StandardField;
