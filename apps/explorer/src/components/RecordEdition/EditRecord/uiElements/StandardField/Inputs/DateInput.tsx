// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IFormDateFieldSettings} from '@leav/types/src';
import {DatePicker, Input} from 'antd';
import {IStandardInputProps} from 'components/RecordEdition/EditRecord/_types';
import moment from 'moment';
import React from 'react';
import themingVar from 'themingVar';

function DateInput({state, value, onFocus, onSubmit, settings}: IStandardInputProps): JSX.Element {
    const _handleDateChange = (selectedDate: moment.Moment) => {
        const dateToSave = selectedDate ? String(selectedDate.unix()) : null;
        onSubmit(dateToSave);
    };

    const dateValue = value ? moment(Number(value) * 1000) : null;
    return state.isEditing ? (
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
    ) : (
        <Input
            className={value ? 'has-value' : ''}
            value={String(value)}
            onFocus={onFocus}
            disabled={state.isReadOnly}
        />
    );
}

export default DateInput;
