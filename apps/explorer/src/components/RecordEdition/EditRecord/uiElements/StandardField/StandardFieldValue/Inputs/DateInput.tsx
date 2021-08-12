// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IFormDateFieldSettings} from '@leav/utils';
import {DatePicker} from 'antd';
import {IStandardInputProps} from 'components/RecordEdition/EditRecord/_types';
import moment from 'moment';
import React from 'react';
import themingVar from 'themingVar';

function DateInput({state, fieldValue, onFocus, onSubmit, settings}: IStandardInputProps): JSX.Element {
    const {editingValue} = fieldValue;
    const _handleDateChange = (selectedDate: moment.Moment) => {
        const dateToSave = selectedDate ? String(selectedDate.unix()) : null;
        onSubmit(dateToSave);
    };

    const dateValue = editingValue ? moment(Number(editingValue) * 1000) : null;

    return (
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
            popupStyle={{background: themingVar['@default-bg']}}
            style={{background: themingVar['@default-bg']}}
            allowClear={false}
        />
    );
}

export default DateInput;
