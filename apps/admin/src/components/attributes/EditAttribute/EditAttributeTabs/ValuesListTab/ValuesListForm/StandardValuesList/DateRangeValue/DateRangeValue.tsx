// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import dayjs from 'dayjs';
import React, {ChangeEvent, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Input} from 'semantic-ui-react';
import styled from 'styled-components';
import {IDateRangeValue} from '_types/attributes';

interface IDateRangeValueProps {
    value: IDateRangeValue;
    onChange: (value: IDateRangeValue) => void;
    onDelete: () => void;
}

const InputsWrapper = styled.div`
    display: flex;

    & > * {
        flex-grow: 1;
        margin-right: 0.25em;
    }

    &&& input {
        width: auto;
    }
`;

function DateRangeValue({value, onChange, onDelete}: IDateRangeValueProps): JSX.Element {
    const [dates, setDates] = useState<IDateRangeValue>(value ?? {from: '', to: ''});
    const {t} = useTranslation();

    const _handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = dayjs(e.target.value).unix();

        const newDates = {...dates, [e.target.name]: newValue};

        if (newDates.from > newDates.to) {
            newDates.to = newDates.from;
        }

        setDates(newDates);

        if (newDates.from && newDates.to) {
            onChange(newDates);
        }
    };

    const inputValueFrom = isNaN(Number(dates.from)) ? '' : dayjs(Number(dates.from) * 1000).format('YYYY-MM-DD');
    const inputValueTo = isNaN(Number(dates.to)) ? '' : dayjs(Number(dates.to) * 1000).format('YYYY-MM-DD');
    const _handleDelete = () => {
        onDelete();
    };

    return (
        <InputsWrapper>
            <Input
                value={inputValueFrom}
                name="from"
                aria-label="date-from"
                label={{basic: true, content: t('attributes.date_range_from')}}
                size="small"
                type="date"
                onChange={_handleChange}
                onBlur={_handleChange}
                transparent={false}
                role="textbox"
            />
            <Input
                value={inputValueTo}
                name="to"
                aria-label="date-to"
                label={{basic: true, content: t('attributes.date_range_to')}}
                size="small"
                type="date"
                onChange={_handleChange}
                onBlur={_handleChange}
                min={inputValueFrom}
                role="textbox"
            />
            <Button icon="trash" style={{flexGrow: 0}} onClick={_handleDelete} />
        </InputsWrapper>
    );
}

export default DateRangeValue;
