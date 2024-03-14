// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitDatePicker} from 'aristid-ds';
import {FunctionComponent, ReactNode} from 'react';
import {IStandardFieldReducerState} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import {Form} from 'antd';
import dayjs from 'dayjs';
import {StandardValueTypes} from '../../../_types';
import {styled} from 'styled-components';
import {RangePickerProps} from 'antd/lib/date-picker';

interface IDSRangePickerWrapperProps {
    state: IStandardFieldReducerState;
    infoButton: ReactNode;
    value?: RangePickerProps['value'];
    onChange?: RangePickerProps['onChange'];
    handleSubmit: (value: StandardValueTypes, id?: string) => void;
}

const InputContainer = styled.div`
    position: relative;

    .actions {
        position: absolute;
        top: 53%;
        right: 36px;
        display: none;
        z-index: 1000;
    }

    &:hover .actions {
        display: block;
    }
`;

export const DSRangePickerWrapper: FunctionComponent<IDSRangePickerWrapperProps> = ({
    state,
    infoButton,
    value,
    onChange,
    handleSubmit
}) => {
    const {errors} = Form.Item.useStatus();
    const isRequired = state.formElement.settings.required;

    const _handleDateChange: (daysjsDates: [dayjs.Dayjs, dayjs.Dayjs], dateStrings: [string, string]) => void = (
        daysjsDates,
        dateStrings
    ) => {
        let dateToSave = {from: null, to: null};
        if (daysjsDates) {
            const [dateFrom, dateTo] = daysjsDates;
            dateToSave = {from: String(dateFrom.unix()), to: String(dateTo.unix())};
        }

        onChange(daysjsDates, dateStrings);

        if (isRequired && dateToSave.from === null) {
            return;
        }

        handleSubmit(dateToSave, state.attribute.id);
    };

    return (
        <InputContainer>
            <KitDatePicker.RangePicker
                label={state.formElement.settings.label}
                required={isRequired}
                value={value}
                onChange={_handleDateChange}
                status={errors.length > 0 ? 'error' : undefined}
                disabled={state.isReadOnly}
            />
            {/*TODO : Move actions inside KitRangePicker when DS is updated*/}
            <div className="actions">{infoButton}</div>
        </InputContainer>
    );
};
