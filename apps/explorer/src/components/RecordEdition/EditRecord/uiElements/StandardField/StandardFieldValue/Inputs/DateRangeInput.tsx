// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IFormDateFieldSettings} from '@leav/utils';
import {DatePicker, Input} from 'antd';
import {IStandardInputProps} from 'components/RecordEdition/EditRecord/_types';
import moment from 'moment';
import React from 'react';
import {useTranslation} from 'react-i18next';
import themingVar from 'themingVar';
import {stringifyDateRangeValue} from 'utils';
import {RECORD_FORM_recordForm_elements_attribute_StandardAttribute} from '_gqlTypes/RECORD_FORM';
import {IDateRangeValue} from '_types/types';

function DateRangeInput({state, fieldValue, onFocus, onSubmit, settings}: IStandardInputProps): JSX.Element {
    const {editingValue, displayValue} = fieldValue;
    const {t} = useTranslation();

    const attribute = state.formElement.attribute as RECORD_FORM_recordForm_elements_attribute_StandardAttribute;
    const isValuesListEnabled = !!attribute?.values_list?.enable;
    const isValuesListOpen = !!attribute?.values_list?.allowFreeEntry;

    const _handleDateChange = (selectedDates: [moment.Moment, moment.Moment]) => {
        const [dateFrom, dateTo] = selectedDates;
        const dateToSave = selectedDates ? {from: String(dateFrom.unix()), to: String(dateTo.unix())} : null;
        onSubmit(dateToSave);
    };

    const editingRangeValue = editingValue as IDateRangeValue;
    const rangeValue: [moment.Moment, moment.Moment] = editingRangeValue
        ? [moment(Number(editingRangeValue.from) * 1000), moment(Number(editingRangeValue.to) * 1000)]
        : null;

    // If we have a values list, picker must be on top to keep list readable
    const pickerPosition = isValuesListEnabled ? {points: ['bl', 'tl'], offset: [0, -1]} : null;

    const rangeDisplayValue = displayValue as IDateRangeValue;

    return !isValuesListEnabled || isValuesListOpen ? (
        <DatePicker.RangePicker
            className="field-wrapper"
            data-testid="datepicker"
            disabled={state.isReadOnly}
            picker="date"
            onChange={_handleDateChange}
            value={rangeValue}
            autoFocus
            defaultOpen
            showTime={!!(settings as IFormDateFieldSettings).withTime}
            onOk={_handleDateChange}
            popupStyle={{background: themingVar['@default-bg']}}
            style={{background: themingVar['@default-bg'], width: '100%'}}
            allowClear={false}
            dropdownAlign={pickerPosition}
        />
    ) : (
        <Input
            key="editing"
            className={`field-wrapper ${editingValue ? 'has-value' : ''}`}
            value={rangeDisplayValue.from && rangeDisplayValue.to ? stringifyDateRangeValue(rangeDisplayValue, t) : ''}
            onFocus={onFocus}
            disabled={true}
            allowClear
            autoFocus
        />
    );
}

export default DateRangeInput;
