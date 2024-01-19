// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IFormDateFieldSettings} from '@leav/utils';
import {DatePicker, Input} from 'antd';
import dayjs from 'dayjs';
import {themeVars} from '_ui/antdTheme';
import {IStandardInputProps} from '_ui/components/RecordEdition/EditRecord/_types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {RecordFormAttributeStandardAttributeFragment} from '_ui/_gqlTypes';

function DateInput({state, fieldValue, onFocus, onSubmit, settings}: IStandardInputProps): JSX.Element {
    const {editingValue} = fieldValue;
    const {i18n} = useSharedTranslation();

    const attribute = state.formElement.attribute as RecordFormAttributeStandardAttributeFragment;
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
