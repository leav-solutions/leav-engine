// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IDateRangeValue, IFormDateFieldSettings} from '@leav/utils';
import {DatePicker, Input} from 'antd';
import dayjs from 'dayjs';
import {ComponentProps} from 'react';
import {themeVars} from '_ui/antdTheme';
import {IStandardInputProps} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {RecordFormAttributeStandardAttributeFragment} from '_ui/_gqlTypes';
import {stringifyDateRangeValue} from '_ui/_utils';

function DateRangeInput({state, fieldValue, onFocus, onSubmit, settings}: IStandardInputProps): JSX.Element {
    const {editingValue, displayValue} = fieldValue;
    const {t} = useSharedTranslation();

    const attribute = state.formElement.attribute as RecordFormAttributeStandardAttributeFragment;
    const isValuesListEnabled = !!attribute?.values_list?.enable;
    const isValuesListOpen = !!attribute?.values_list?.allowFreeEntry;

    const _handleDateChange: (dates: [dayjs.Dayjs, dayjs.Dayjs]) => void = selectedDates => {
        const [dateFrom, dateTo] = selectedDates;
        const dateToSave = selectedDates ? {from: String(dateFrom.unix()), to: String(dateTo.unix())} : null;
        onSubmit(dateToSave);
    };

    const isParsable = typeof editingValue === 'string' && editingValue.length > 0;
    const editingRangeValue = isParsable ? JSON.parse(editingValue) : (editingValue as IDateRangeValue);
    const rangeValue: [dayjs.Dayjs, dayjs.Dayjs] = editingRangeValue
        ? [dayjs(Number(editingRangeValue.from) * 1000), dayjs(Number(editingRangeValue.to) * 1000)]
        : null;

    // If we have a values list, picker must be on top to keep list readable
    const pickerPosition = isValuesListEnabled ? 'topLeft' : null;

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
            onOk={_handleDateChange as ComponentProps<typeof DatePicker.RangePicker>['onOk']}
            popupStyle={{background: themeVars.defaultBg}}
            style={{background: themeVars.defaultBg, width: '100%'}}
            allowClear={false}
            placement={pickerPosition}
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
