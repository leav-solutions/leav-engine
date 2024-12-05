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
    width: 100%;
    color: ${({$shouldHighlightColor}) => ($shouldHighlightColor ? 'var(--general-colors-primary-400)' : 'initial')};
`;

export const DSDatePickerWrapper: FunctionComponent<IStandFieldValueContentProps<IKitDatePicker>> = ({
    value,
    presentationValue,
    onChange,
    attribute,
    handleSubmit,
    readonly,
    calculatedFlags,
    inheritedFlags
}) => {
    if (!onChange) {
        throw Error('DSDatePickerWrapper should be used inside a antd Form.Item');
    }

    const {errors} = Form.Item.useStatus();
    const {t} = useSharedTranslation();

    const [isFocused, setIsFocused] = useState(false);
    const isErrors = errors.length > 0;

    const _resetToInheritedOrCalculatedValue = async () => {
        if (inheritedFlags.isInheritedValue) {
            onChange(
                dayjs.unix(Number(inheritedFlags.inheritedValue.raw_payload)),
                inheritedFlags.inheritedValue.raw_payload
            );
        } else if (calculatedFlags.isCalculatedValue) {
            onChange(
                dayjs.unix(Number(calculatedFlags.calculatedValue.raw_payload)),
                calculatedFlags.calculatedValue.raw_payload
            );
        }

        await handleSubmit(null, attribute.id);
    };

    const _handleDateChange: (
        datePickerDate: dayjs.Dayjs | null,
        antOnChangeParams: string | string[]
    ) => void = async (datePickerDate, ...antOnChangeParams) => {
        if ((inheritedFlags.isInheritedValue || calculatedFlags.isCalculatedValue) && datePickerDate === null) {
            _resetToInheritedOrCalculatedValue();
            return;
        }

        if (!!datePickerDate) {
            datePickerDate = setDateToUTCNoon(datePickerDate);
        }

        onChange(datePickerDate, ...antOnChangeParams);

        // TODO : validate form with await form.validateFields(attribute.id)

        let dateToSave = '';
        if (!!datePickerDate) {
            dateToSave = String(datePickerDate.unix());
        }

        await handleSubmit(dateToSave, attribute.id);
    };

    return (
        <KitDatePickerStyled
            id={attribute.id}
            value={value}
            format={isFocused || isErrors || !presentationValue ? undefined : () => presentationValue}
            disabled={readonly}
            allowClear={!inheritedFlags.isInheritedNotOverrideValue && !calculatedFlags.isCalculatedNotOverrideValue}
            helper={isErrors ? String(errors[0]) : undefined}
            status={isErrors ? 'error' : undefined}
            onChange={_handleDateChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            $shouldHighlightColor={
                inheritedFlags.isInheritedNotOverrideValue || calculatedFlags.isCalculatedNotOverrideValue
            }
            placeholder={t('record_edition.placeholder.enter_a_date')}
        />
    );
};
