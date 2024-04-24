// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitDatePicker, KitInputWrapper} from 'aristid-ds';
import {FunctionComponent, ReactNode} from 'react';
import {IStandardFieldReducerState} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import {Form} from 'antd';
import dayjs from 'dayjs';
import {IProvidedByAntFormItem, StandardValueTypes} from '../../../_types';
import {RangePickerProps} from 'antd/lib/date-picker';

interface IDSRangePickerWrapperProps extends IProvidedByAntFormItem<RangePickerProps> {
    state: IStandardFieldReducerState;
    infoButton: ReactNode;
    handleSubmit: (value: StandardValueTypes, id?: string) => void;
}

export const DSRangePickerWrapper: FunctionComponent<IDSRangePickerWrapperProps> = ({
    state,
    infoButton,
    value,
    onChange,
    handleSubmit
}) => {
    const {errors} = Form.Item.useStatus();
    const isRequired = state.formElement.settings.required;

    const _handleDateChange: (
        rangePickerDates: [from: dayjs.Dayjs, to: dayjs.Dayjs] | null,
        antOnChangeParams: [from: string, to: string] | null
    ) => void = (rangePickerDates, ...antOnChangeParams) => {
        onChange(rangePickerDates, ...antOnChangeParams);

        if (isRequired && rangePickerDates === null) {
            return;
        }

        const datesToSave = {from: null, to: null};
        if (rangePickerDates !== null) {
            const [dateFrom, dateTo] = rangePickerDates;
            datesToSave.from = String(dateFrom.unix());
            datesToSave.to = String(dateTo.unix());
        }

        handleSubmit(datesToSave, state.attribute.id);
    };

    return (
        <KitInputWrapper
            label={state.formElement.settings.label}
            required={isRequired}
            status={errors.length > 0 ? 'error' : undefined}
            infoIcon={infoButton}
            onInfoClick={Boolean(infoButton) ? () => void 0 : undefined}
        >
            <KitDatePicker.RangePicker value={value} onChange={_handleDateChange} disabled={state.isReadOnly} />
        </KitInputWrapper>
    );
};
