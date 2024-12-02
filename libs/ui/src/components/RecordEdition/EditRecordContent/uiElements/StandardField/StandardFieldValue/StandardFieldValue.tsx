// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined, ExclamationCircleOutlined} from '@ant-design/icons';
import {AnyPrimitive, IDateRangeValue, localizedTranslation} from '@leav/utils';
import {Button, Form, FormListFieldData, Input, InputRef, Popover, Space, theme} from 'antd';
import moment from 'moment';
import {FunctionComponent, MutableRefObject, ReactNode, useEffect, useRef, CSSProperties, lazy} from 'react';
import styled, {CSSObject} from 'styled-components';
import {themeVars} from '_ui/antdTheme';
import {FloatingMenu, FloatingMenuAction} from '_ui/components';
import Dimmer from '_ui/components/Dimmer';
import DeleteValueBtn from '_ui/components/RecordEdition/EditRecordContent/shared/DeleteValueBtn';
import InheritedFieldLabel from '_ui/components/RecordEdition/EditRecordContent/shared/InheritedFieldLabel';
import UpdatedFieldIcon from '_ui/components/RecordEdition/EditRecordContent/shared/UpdatedFieldIcon';
import ValueDetailsBtn from '_ui/components/RecordEdition/EditRecordContent/shared/ValueDetailsBtn';
import ValuesVersionBtn from '_ui/components/RecordEdition/EditRecordContent/shared/ValuesVersionBtn';
import ValuesVersionIndicator from '_ui/components/RecordEdition/EditRecordContent/shared/ValuesVersionIndicator';
import {
    InputRefPossibleTypes,
    IStandardInputProps,
    ISubmitMultipleResult,
    StandardValueTypes,
    VersionFieldScope
} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {EditRecordReducerActionsTypes} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {useEditRecordReducer} from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {
    AttributeFormat,
    RecordFormAttributeStandardAttributeFragment,
    StandardValuesListFragmentStandardDateRangeValuesListConfFragment,
    StandardValuesListFragmentStandardStringValuesListConfFragment
} from '_ui/_gqlTypes';
import {stringifyDateRangeValue} from '_ui/_utils';
import {
    IdValue,
    IStandardFieldReducerState,
    IStandardFieldValue,
    newValueId,
    StandardFieldDispatchFunc,
    StandardFieldReducerActionsTypes,
    StandardFieldValueState
} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import ColorInput from './Inputs/ColorInput';
import TextInput from './Inputs/TextInput';
import ValuesList from './ValuesList';
import {IValueOfValuesList} from './ValuesList/ValuesList';
import {useLang} from '_ui/hooks';
import {MonoValueSelect} from './ValuesList/MonoValueSelect';
import {DSInputWrapper} from './DSInputWrapper';
import {DSDatePickerWrapper} from './DSDatePickerWrapper';
import {DSRangePickerWrapper} from './DSRangePickerWrapper';
import {DSInputNumberWrapper} from './DSInputNumberWrapper';
import {DSInputEncryptedWrapper} from './DSInputEncryptedWrapper';
import {DSBooleanWrapper} from './DSBooleanWrapper';
import {DSRichTextWrapper} from './DSRichTextWrapper';
import {DSColorPickerWrapper} from './DSColorPickerWrapper';
import {IStandFieldValueContentProps} from './_types';

const ErrorMessage = styled.div`
    color: ${themeVars.errorColor};
    font-weight: bold;
`;

const FormWrapper = styled.div<{$isEditing: boolean}>`
    position: relative;
    z-index: ${p => (p.$isEditing ? 2 : 0)};
`;

const InputWrapper = styled.div<{$isEditing: boolean}>`
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

const RichTextEditorInput = lazy(() => import('./Inputs/RichTextEditorInput'));

const inputComponentByFormat: Record<AttributeFormat, FunctionComponent<IStandardInputProps>> = {
    [AttributeFormat.text]: null,
    [AttributeFormat.date]: null,
    [AttributeFormat.date_range]: null,
    [AttributeFormat.boolean]: null,
    [AttributeFormat.numeric]: null,
    [AttributeFormat.encrypted]: null,
    [AttributeFormat.extended]: TextInput,
    [AttributeFormat.color]: ColorInput, // TODO: should be clean due to support with DS?
    [AttributeFormat.rich_text]: RichTextEditorInput // TODO: should be clean due to support with DS?
};

type IStringValuesListConf = StandardValuesListFragmentStandardStringValuesListConfFragment;

type IDateRangeValuesListConf = StandardValuesListFragmentStandardDateRangeValuesListConfFragment;

interface IStandardFieldValueProps {
    'data-testid': string;
    value: IStandardFieldValue;
    presentationValue: string;
    state: IStandardFieldReducerState;
    dispatch: StandardFieldDispatchFunc;
    onSubmit: (
        idValue: IdValue,
        value: AnyPrimitive | null,
        fieldName?: number
    ) => Promise<void | ISubmitMultipleResult>;
    onDelete: (idValue: IdValue) => void;
    onScopeChange: (scope: VersionFieldScope) => void;
    listField?: FormListFieldData;
}

function StandardFieldValue({
    'data-testid': dataTestId,
    value: fieldValue,
    presentationValue,
    onSubmit,
    onDelete,
    onScopeChange,
    state,
    dispatch,
    listField
}: IStandardFieldValueProps): JSX.Element {
    const {t, i18n} = useSharedTranslation();
    const {token} = theme.useToken();
    const {lang: availableLangs} = useLang();

    const actionsWrapperRef = useRef<HTMLDivElement>();
    const inputRef = useRef<InputRefPossibleTypes>();

    const {state: editRecordState, dispatch: editRecordDispatch} = useEditRecordReducer();

    const attribute = state.formElement.attribute as RecordFormAttributeStandardAttributeFragment;

    const isValuesListEnabled = !!attribute?.values_list?.enable;
    const isValuesListOpen = !!attribute?.values_list?.allowFreeEntry;

    // Scroll to input when editing field
    useEffect(() => {
        if (fieldValue.isEditing) {
            actionsWrapperRef?.current?.scrollIntoView({block: 'nearest'});
        }
    }, [fieldValue.isEditing]);

    useEffect(() => {
        if (fieldValue.isEditing) {
            editRecordDispatch({
                type: EditRecordReducerActionsTypes.SET_EDITING_VALUE,
                value: fieldValue.editingValue
            });
        }
    }, [fieldValue.isEditing, fieldValue.editingValue]);

    const _handleSubmit = async (valueToSave: StandardValueTypes) => {
        const convertedValue =
            valueToSave === null ? null : typeof valueToSave === 'object' ? JSON.stringify(valueToSave) : valueToSave;

        await onSubmit(fieldValue.idValue, convertedValue, listField?.name);
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

        await onDelete(fieldValue.idValue);
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
        if (
            !fieldValue.isEditing &&
            attribute.format !== AttributeFormat.boolean && // TODO: should be clean due to support with DS?
            attribute.format !== AttributeFormat.rich_text // TODO: should be clean due to support with DS?
        ) {
            let displayedValue = String(fieldValue.displayValue);
            if (
                attribute.format === AttributeFormat.color &&
                (fieldValue.value === null || fieldValue.value.payload === null)
            ) {
                fieldValue.value = null;
            }
            const hasValue = fieldValue.value !== null;

            let inputStyle: CSSProperties = {};
            let prefixValue: ReactNode;
            if (hasValue) {
                switch (attribute.format) {
                    case AttributeFormat.encrypted:
                        displayedValue = '•••••••••';
                        break;
                    case AttributeFormat.date:
                        if (!isNaN(fieldValue.displayValue as number)) {
                            displayedValue = new Intl.DateTimeFormat(i18n.language).format(
                                new Date(Number(displayedValue) * 1000)
                            );
                        }
                        break;
                    case AttributeFormat.color:
                        prefixValue = _getColorDisplay();
                        displayedValue = '#' + displayedValue;
                        inputStyle = {
                            paddingLeft: '39px'
                        };
                }
            }
            return (
                <>
                    {prefixValue}
                    <Input
                        data-testid={dataTestId}
                        key="display"
                        style={inputStyle}
                        className={hasValue ? 'has-value' : ''}
                        value={displayedValue}
                        onFocus={_handleFocus}
                        disabled={state.isReadOnly}
                    />
                </>
            );
        }

        const InputComponent = inputComponentByFormat[attribute.format];

        // This should never happen, unless we have some bad settings in DB
        if (!InputComponent) {
            return <div>{t('record_edition.invalid_format')}</div>;
        }

        return (
            <InputComponent
                data-testid={dataTestId}
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

    const _getColorDisplay = (): JSX.Element => {
        const colorValue = '#' + String(fieldValue.displayValue);
        const colorPickerStyle: React.CSSProperties = {
            width: '16px',
            height: '16px',
            borderRadius: '2px',
            backgroundColor: colorValue,
            marginTop: fieldValue.index ? '15px' : '25px',
            marginLeft: '5px'
        };

        return <label style={colorPickerStyle} />;
    };

    const _getFilteredValuesList = (): IValueOfValuesList[] => {
        let values: Array<Pick<IValueOfValuesList, 'value' | 'rawValue'>> = [];

        if (isValuesListEnabled) {
            if (attribute.format === AttributeFormat.date_range) {
                const valuesList = (attribute?.values_list as IDateRangeValuesListConf)?.dateRangeValues ?? [];

                values = valuesList
                    .filter(val => fieldValue.state === StandardFieldValueState.PRISTINE || !fieldValue.editingValue)
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
                    .filter(
                        val =>
                            fieldValue.state === StandardFieldValueState.PRISTINE ||
                            !fieldValue.editingValue ||
                            attribute.format === AttributeFormat.date ||
                            val.match(new RegExp(String(fieldValue.editingValue), 'i'))
                    )
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
        ${fieldValue?.value?.payload ? 'has-value' : ''}
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
            [VersionFieldScope.CURRENT]: state.values[VersionFieldScope.CURRENT]?.version ?? null,
            [VersionFieldScope.INHERITED]: state.values[VersionFieldScope.INHERITED]?.version ?? null
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

    const attributeFormatsWithDS: Array<Exclude<AttributeFormat, typeof AttributeFormat.extended>> = [
        AttributeFormat.text,
        AttributeFormat.date_range,
        AttributeFormat.numeric,
        AttributeFormat.encrypted,
        AttributeFormat.date,
        AttributeFormat.boolean,
        AttributeFormat.rich_text,
        AttributeFormat.color
    ];

    const attributeFormatsWithoutDS: AttributeFormat[] = [AttributeFormat.extended];

    let ValueContent: FunctionComponent<IStandFieldValueContentProps<any>>;
    if (isValuesListEnabled) {
        ValueContent = MonoValueSelect;
    } else {
        const InputWrapperByFormat: Record<
            Exclude<AttributeFormat, typeof AttributeFormat.extended>,
            FunctionComponent<IStandFieldValueContentProps<any>>
        > = {
            [AttributeFormat.text]: DSInputWrapper,
            [AttributeFormat.date]: DSDatePickerWrapper,
            [AttributeFormat.date_range]: DSRangePickerWrapper,
            [AttributeFormat.numeric]: DSInputNumberWrapper,
            [AttributeFormat.encrypted]: DSInputEncryptedWrapper,
            [AttributeFormat.boolean]: DSBooleanWrapper,
            [AttributeFormat.rich_text]: DSRichTextWrapper,
            [AttributeFormat.color]: DSColorPickerWrapper
        };
        ValueContent = InputWrapperByFormat[attribute.format];
    }

    return (
        <>
            {attributeFormatsWithDS.includes(attribute.format) && (
                <Form.Item
                    name={attribute.id}
                    {...listField}
                    rules={
                        // TODO: Remove this rule when required is implemented in the backend
                        !attribute.multiple_values
                            ? [
                                  {
                                      required: state.formElement.settings.required,
                                      message: t('errors.standard_field_required')
                                  }
                              ]
                            : undefined
                    }
                    noStyle
                >
                    <ValueContent
                        data-testid={dataTestId}
                        state={state}
                        handleSubmit={_handleSubmit}
                        presentationValue={presentationValue}
                    />
                </Form.Item>
            )}

            {attributeFormatsWithoutDS.includes(attribute.format) && (
                <>
                    {fieldValue.isEditing && <Dimmer onClick={_handleCancel} />}
                    <FormWrapper
                        $isEditing={fieldValue.isEditing}
                        className={fieldValue.index === 0 ? 'first-value' : ''}
                    >
                        <Popover placement="topLeft" open={isErrorVisible} content={errorContent}>
                            <InputWrapper
                                $isEditing={fieldValue.isEditing}
                                className={wrapperClasses}
                                data-testid="input-wrapper"
                            >
                                <ValuesVersionIndicator
                                    activeScope={state.activeScope}
                                    style={valuesVersionIndicatorStyle}
                                />
                                {!fieldValue.index && (
                                    <label className="attribute-label" onClick={_handleFocus}>
                                        {localizedTranslation(state.formElement.settings.label, availableLangs)}
                                        {editRecordState.externalUpdate.updatedValues[attribute?.id] && (
                                            <UpdatedFieldIcon />
                                        )}
                                        {state.activeScope === VersionFieldScope.INHERITED && (
                                            <InheritedFieldLabel
                                                version={state.values[VersionFieldScope.INHERITED].version}
                                            />
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
                    </FormWrapper>
                </>
            )}
        </>
    );
}

export default StandardFieldValue;
