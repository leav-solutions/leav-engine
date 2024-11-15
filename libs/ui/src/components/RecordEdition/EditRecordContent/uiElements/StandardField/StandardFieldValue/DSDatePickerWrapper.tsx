// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitDatePicker} from 'aristid-ds';
import {FunctionComponent, useEffect, useRef} from 'react';
import {
    IStandardFieldReducerState,
    IStandardFieldValue
} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import {Form, type GetRef} from 'antd';
import dayjs from 'dayjs';
import styled from 'styled-components';
import {IProvidedByAntFormItem, StandardValueTypes} from '../../../_types';
import {DatePickerProps} from 'antd/lib/date-picker';
import {RecordFormAttributeFragment} from '_ui/_gqlTypes';
import {setDateToUTCNoon} from '_ui/_utils';
interface IDSDatePickerWrapperProps extends IProvidedByAntFormItem<DatePickerProps> {
    state: IStandardFieldReducerState;
    attribute: RecordFormAttributeFragment;
    fieldValue: IStandardFieldValue;
    handleSubmit: (value: StandardValueTypes, id?: string) => void;
    handleBlur: () => void;
    shouldShowValueDetailsButton?: boolean;
}

const KitDatePickerStyled = styled(KitDatePicker)<{$shouldHighlightColor: boolean}>`
    color: ${({$shouldHighlightColor}) => ($shouldHighlightColor ? 'var(--general-colors-primary-400)' : 'initial')};
`;

export const DSDatePickerWrapper: FunctionComponent<IDSDatePickerWrapperProps> = ({
    value,
    onChange,
    handleBlur,
    state,
    attribute,
    fieldValue,
    handleSubmit,
    shouldShowValueDetailsButton = false
}) => {
    if (!onChange) {
        throw Error('DSDatePickerWrapper should be used inside a antd Form.Item');
    }

    const {errors} = Form.Item.useStatus();

    const inputRef = useRef<GetRef<typeof KitDatePickerStyled>>(null);

    useEffect(() => {
        if (fieldValue.isEditing && inputRef.current) {
            inputRef.current.nativeElement.click(); // To automatically open the date picker
        }
    }, [fieldValue.isEditing]);

    const _resetToInheritedOrCalculatedValue = () => {
        if (state.isInheritedValue) {
            onChange(dayjs.unix(Number(state.inheritedValue.raw_value)), state.inheritedValue.raw_value);
        } else if (state.isCalculatedValue) {
            onChange(dayjs.unix(Number(state.calculatedValue.raw_value)), state.calculatedValue.raw_value);
        }

        handleSubmit('', state.attribute.id);
    };

    const _handleDateChange: (datePickerDate: dayjs.Dayjs | null, antOnChangeParams: string | string[]) => void = (
        datePickerDate,
        ...antOnChangeParams
    ) => {
        if ((state.isInheritedValue || state.isCalculatedValue) && datePickerDate === null) {
            _resetToInheritedOrCalculatedValue();
            return;
        }

        if (!!datePickerDate) {
            datePickerDate = setDateToUTCNoon(datePickerDate);
        }

        onChange(datePickerDate, ...antOnChangeParams);

        // TODO : validate form with await form.validateFields(state.attribute.id)
        if (state.formElement.settings.required && datePickerDate === null) {
            return;
        }

        let dateToSave = null;
        if (!!datePickerDate) {
            dateToSave = String(datePickerDate.unix());
        }

        handleSubmit(dateToSave, state.attribute.id);
    };

    return (
        <KitDatePickerStyled
            ref={inputRef}
            value={value}
            onChange={_handleDateChange}
            disabled={state.isReadOnly}
            allowClear={!state.isInheritedNotOverrideValue && !state.isCalculatedNotOverrideValue}
            status={errors.length > 0 ? 'error' : undefined}
            onBlur={handleBlur}
            $shouldHighlightColor={state.isInheritedNotOverrideValue || state.isCalculatedNotOverrideValue}
        />
    );
};
