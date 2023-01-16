// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {themeVars} from '@leav/ui';
import {IFormDateFieldSettings} from '@leav/utils';
import {DatePicker, Input} from 'antd';
import {IStandardInputProps} from 'components/RecordEdition/EditRecord/_types';
import dayjs from 'dayjs';
import {useTranslation} from 'react-i18next';
import {RECORD_FORM_recordForm_elements_attribute_StandardAttribute} from '_gqlTypes/RECORD_FORM';

function DateInput({state, fieldValue, onFocus, onSubmit, settings}: IStandardInputProps): JSX.Element {
    const {editingValue} = fieldValue;
    const {i18n} = useTranslation();

    const attribute = state.formElement.attribute as RECORD_FORM_recordForm_elements_attribute_StandardAttribute;
    const isValuesListEnabled = !!attribute?.values_list?.enable;
    const isValuesListOpen = !!attribute?.values_list?.allowFreeEntry;

    const _handleDateChange = (selectedDate: dayjs.Dayjs) => {
        const dateToSave = selectedDate ? String(selectedDate.unix()) : null;
        onSubmit(dateToSave);
    };

    const dateValue = editingValue ? dayjs(Number(editingValue) * 1000) : null;

    // If we have a values list, picker must be on top to keep list readable
    const pickerPosition = isValuesListEnabled ? {points: ['bl', 'tl'], offset: [0, -1]} : null;

    return !isValuesListEnabled || isValuesListOpen ? (
        <DatePicker
            className="field-wrapper"
            data-testid="datepicker"
            disabled={state.isReadOnly}
            picker="date"
            onChange={_handleDateChange}
            value={dateValue}
            autoFocus
            defaultOpen
            showTime={!!(settings as IFormDateFieldSettings).withTime}
            onOk={_handleDateChange}
            popupStyle={{background: themeVars.defaultBg}}
            style={{background: themeVars.defaultBg, width: '100%'}}
            allowClear={false}
            dropdownAlign={pickerPosition}
        />
    ) : (
        <Input
            key="editing"
            className={`field-wrapper ${editingValue ? 'has-value' : ''}`}
            value={
                editingValue ? new Intl.DateTimeFormat(i18n.language).format(new Date(Number(editingValue) * 1000)) : ''
            }
            onFocus={onFocus}
            disabled={true}
            allowClear
            autoFocus
        />
    );
}

export default DateInput;
