// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined, ExclamationCircleOutlined} from '@ant-design/icons';
import {themeVars} from '@leav/ui';
import {AnyPrimitive} from '@leav/utils';
import {Button, Form, Input, InputRef, Popover, Space, theme} from 'antd';
import DeleteValueBtn from 'components/RecordEdition/EditRecord/shared/DeleteValueBtn';
import InheritedFieldLabel from 'components/RecordEdition/EditRecord/shared/InheritedFieldLabel';
import ValueDetailsBtn from 'components/RecordEdition/EditRecord/shared/ValueDetailsBtn';
import ValuesVersionBtn from 'components/RecordEdition/EditRecord/shared/ValuesVersionBtn';
import ValuesVersionIndicator from 'components/RecordEdition/EditRecord/shared/ValuesVersionIndicator';
import {
    FieldScope,
    InputRefPossibleTypes,
    IStandardInputProps,
    StandardValueTypes
} from 'components/RecordEdition/EditRecord/_types';
import {EditRecordReducerActionsTypes} from 'components/RecordEdition/editRecordModalReducer/editRecordModalReducer';
import {useEditRecordModalReducer} from 'components/RecordEdition/editRecordModalReducer/useEditRecordModalReducer';
import Dimmer from 'components/shared/Dimmer';
import FloatingMenu, {FloatingMenuAction} from 'components/shared/FloatingMenu/FloatingMenu';
import moment from 'moment';
import {MutableRefObject, useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import styled, {CSSObject} from 'styled-components';
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
} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import CheckboxInput from './Inputs/CheckboxInput';
import DateInput from './Inputs/DateInput';
import DateRangeInput from './Inputs/DateRangeInput';
import EncryptedInput from './Inputs/EncryptedInput';
import NumberInput from './Inputs/NumberInput';
import TextInput from './Inputs/TextInput';
import ValuesList from './ValuesList';
import {IValueOfValuesList} from './ValuesList/ValuesList';

const ErrorMessage = styled.div`
    color: ${themeVars.errorColor};
    font-weight: bold;
`;

const FormWrapper = styled.div<{isEditing: boolean}>`
    position: relative;
    z-index: ${p => (p.isEditing ? 2 : 0)};
`;

const InputWrapper = styled.div<{isEditing: boolean}>`
    position: relative;

    && input {
        background: ${themeVars.defaultBg};
        transition: none;
        border-radius: 0;
        line-height: 2.5em;
        padding-left: 17px;
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
        left: 11px;
        top: calc(50% - 0.9em);
        font-size: 1.1em;
        background: transparent;
        padding: 0 0.5em;
        color: ${themeVars.secondaryTextColor};
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
        background: ${themeVars.defaultBg};
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

type IStringValuesListConf = RECORD_FORM_recordForm_elements_attribute_StandardAttribute_values_list_StandardStringValuesListConf;

type IDateRangeValuesListConf = RECORD_FORM_recordForm_elements_attribute_StandardAttribute_values_list_StandardDateRangeValuesListConf;

interface IStandardFieldValueProps {
    value: IStandardFieldValue;
    state: IStandardFieldReducerState;
    dispatch: StandardFieldDispatchFunc;
    onSubmit: (idValue: IdValue, value: AnyPrimitive) => void;
    onDelete: (idValue: IdValue) => void;
    onScopeChange: (scope: FieldScope) => void;
}

function StandardFieldValue({
    value: fieldValue,
    onSubmit,
    onDelete,
    onScopeChange,
    state,
    dispatch
}: IStandardFieldValueProps): JSX.Element {
    const {t} = useTranslation();
    const {token} = theme.useToken();

    const actionsWrapperRef = useRef<HTMLDivElement>();
    const inputRef = useRef<InputRefPossibleTypes>();

    const {state: editRecordState, dispatch: editRecordDispatch} = useEditRecordModalReducer();

    const attribute = state.formElement.attribute as RECORD_FORM_recordForm_elements_attribute_StandardAttribute;

    const isValuesListEnabled = !!attribute?.values_list?.enable;
    const isValuesListOpen = !!attribute?.values_list?.allowFreeEntry;

    // Scroll to input when editing field
    useEffect(() => {
        if (fieldValue.isEditing) {
            actionsWrapperRef?.current?.scrollIntoView({block: 'nearest'});
        }
    }, [fieldValue.isEditing]);

    // Cancel value editing if value details panel is closed
    useEffect(() => {
        if (editRecordState.activeValue === null && fieldValue.isEditing) {
            dispatch({
                type: StandardFieldReducerActionsTypes.CANCEL_EDITING,
                idValue: fieldValue.idValue
            });
        }
    }, [editRecordState.activeValue]);

    useEffect(() => {
        if (fieldValue.isEditing) {
            editRecordDispatch({
                type: EditRecordReducerActionsTypes.SET_EDITING_VALUE,
                value: fieldValue.editingValue
            });
        }
    }, [fieldValue.isEditing, fieldValue.editingValue]);

    const _handleSubmit = async (valueToSave: StandardValueTypes) => {
        if (valueToSave === '') {
            return _handleDelete();
        }

        const convertedValue = typeof valueToSave === 'object' ? JSON.stringify(valueToSave) : valueToSave;
        onSubmit(fieldValue.idValue, convertedValue);
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
                value: {value: fieldValue.value, editingValue: fieldValue.editingValue, attribute}
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
            const hasValue = fieldValue.value !== null;

            if (hasValue) {
                switch (attribute.format) {
                    case AttributeFormat.date_range:
                        const dateRangeValue = fieldValue.displayValue as IDateRangeValue;
                        displayedValue =
                            dateRangeValue?.from && dateRangeValue?.to
                                ? stringifyDateRangeValue(dateRangeValue, t)
                                : '';
                        break;
                    case AttributeFormat.encrypted:
                        displayedValue = '•••••••••';
                        break;
                }
            }

            return (
                <Input
                    key="display"
                    className={hasValue ? 'has-value' : ''}
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

    const isErrorVisible = fieldValue.isErrorDisplayed;

    const wrapperClasses = `
        ${attribute.format ? `format-${attribute.format}` : ''}
        ${fieldValue?.value?.value ? 'has-value' : ''}
        ${fieldValue.isEditing ? 'editing' : ''}
    `;

    const canDeleteValue =
        !state.isReadOnly && fieldValue.idValue !== newValueId && attribute.format !== AttributeFormat.boolean;

    const valuesList = _getFilteredValuesList();

    const valueActions: FloatingMenuAction[] = [];

    if (!fieldValue.isEditing) {
        valueActions.push({
            button: <ValueDetailsBtn value={fieldValue.value} attribute={attribute} shape="circle" />
        });
    }

    const hasMultipleValuesDisplay =
        attribute.multiple_values && !!Object.keys(state.values[state.activeScope].values).length;

    if (attribute?.versions_conf?.versionable) {
        const versions = {
            [FieldScope.CURRENT]: state.values[FieldScope.CURRENT]?.version ?? null,
            [FieldScope.INHERITED]: state.values[FieldScope.INHERITED]?.version ?? null
        };

        if (!hasMultipleValuesDisplay) {
            valueActions.push({
                title: t('values_version.title'),
                button: (
                    <ValuesVersionBtn
                        versions={versions}
                        activeScope={state.activeScope}
                        onScopeChange={onScopeChange}
                    />
                )
            });
        }
    }

    if (canDeleteValue && !fieldValue.isEditing && fieldValue.displayValue) {
        valueActions.push({
            title: t('global.delete'),
            button: <DeleteValueBtn onDelete={_handleDelete} shape="circle" />
        });
    }

    const valuesVersionIndicatorStyle: CSSObject = {
        top: '1px',
        left: '1px',
        bottom: hasMultipleValuesDisplay ? '0' : '1px',
        borderRadius: hasMultipleValuesDisplay ? 'none' : token.borderRadius
    };

    return (
        <>
            {fieldValue.isEditing && <Dimmer onClick={_handleCancel} />}
            <FormWrapper isEditing={fieldValue.isEditing} className={!fieldValue.index ? 'first-value' : ''}>
                <Form>
                    <FormItem>
                        <Popover placement="topLeft" open={isErrorVisible} content={errorContent}>
                            <InputWrapper
                                isEditing={fieldValue.isEditing}
                                className={wrapperClasses}
                                data-testid="input-wrapper"
                            >
                                <ValuesVersionIndicator
                                    activeScope={state.activeScope}
                                    style={valuesVersionIndicatorStyle}
                                />
                                {!fieldValue.index && (
                                    <label className="attribute-label" onClick={_handleFocus}>
                                        {state.formElement.settings.label}
                                        {state.activeScope === FieldScope.INHERITED && (
                                            <InheritedFieldLabel version={state.values[FieldScope.INHERITED].version} />
                                        )}
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
                                        <Button type="primary" size="small" onClick={_handleClickSubmit}>
                                            {t('global.submit')}
                                        </Button>
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
