// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitDatePicker} from 'aristid-ds';
import {FunctionComponent, useState} from 'react';
import {Form} from 'antd';
import dayjs from 'dayjs';
import styled from 'styled-components';
import {setDateToUTCNoon} from '_ui/_utils';
import {IStandFieldValueContentProps} from './_types';
import {IKitDatePicker} from 'aristid-ds/dist/Kit/DataEntry/DatePicker/types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

const KitDatePickerStyled = styled(KitDatePicker)<{$shouldHighlightColor: boolean}>`
    color: ${({$shouldHighlightColor}) => ($shouldHighlightColor ? 'var(--general-colors-primary-400)' : 'initial')};
`;

export const DSDatePickerWrapper: FunctionComponent<IStandFieldValueContentProps<IKitDatePicker>> = ({
    value,
    presentationValue,
    onChange,
    state,
    attribute,
    handleSubmit
}) => {
    if (!onChange) {
        throw Error('DSDatePickerWrapper should be used inside a antd Form.Item');
    }

    const [isFocused, setIsFocused] = useState(false);
    const {errors} = Form.Item.useStatus();
    const {t} = useSharedTranslation();

    const isErrors = errors.length > 0;

    const _resetToInheritedOrCalculatedValue = async () => {
        if (state.isInheritedValue) {
            onChange(dayjs.unix(Number(state.inheritedValue.raw_value)), state.inheritedValue.raw_value);
        } else if (state.isCalculatedValue) {
            onChange(dayjs.unix(Number(state.calculatedValue.raw_value)), state.calculatedValue.raw_value);
        }

        await handleSubmit('', state.attribute.id);
    };

    const _handleFocus = () => setIsFocused(true);

    const _handleBlur = () => setIsFocused(false);

    const _handleDateChange: (
        datePickerDate: dayjs.Dayjs | null,
        antOnChangeParams: string | string[]
    ) => void = async (datePickerDate, ...antOnChangeParams) => {
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

        let dateToSave = '';
        if (!!datePickerDate) {
            dateToSave = String(datePickerDate.unix());
        }

        await handleSubmit(dateToSave, state.attribute.id);
    };

    return (
        <KitDatePickerStyled
            value={value}
            format={isFocused || isErrors ? undefined : () => presentationValue}
            disabled={state.isReadOnly}
            allowClear={!state.isInheritedNotOverrideValue && !state.isCalculatedNotOverrideValue}
            helper={isErrors ? String(errors[0]) : undefined}
            status={isErrors ? 'error' : undefined}
            onChange={_handleDateChange}
            onFocus={_handleFocus}
            onBlur={_handleBlur}
            $shouldHighlightColor={state.isInheritedNotOverrideValue || state.isCalculatedNotOverrideValue}
            placeholder={t('record_edition.placeholder.enter_a_date')}
        />
    );
};
