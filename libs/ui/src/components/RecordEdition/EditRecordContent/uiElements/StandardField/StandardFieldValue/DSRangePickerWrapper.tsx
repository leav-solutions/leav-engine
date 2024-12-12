// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitDatePicker, KitInput} from 'aristid-ds';
import {ChangeEvent, FunctionComponent, useState} from 'react';
import {Form} from 'antd';
import dayjs from 'dayjs';
import styled from 'styled-components';
import {StandardValueTypes} from '../../../_types';
import {setDateToUTCNoon} from '_ui/_utils';
import {FaCalendar} from 'react-icons/fa';
import {IStandFieldValueContentProps} from './_types';
import {IKitRangePicker} from 'aristid-ds/dist/Kit/DataEntry/DatePicker/types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

const KitDatePickerRangePickerStyled = styled(KitDatePicker.RangePicker)<{$shouldHighlightColor: boolean}>`
    color: ${({$shouldHighlightColor}) => ($shouldHighlightColor ? 'var(--general-colors-primary-400)' : 'initial')};
`;

const KitInputStyled = styled(KitInput)<{$shouldHighlightColor: boolean}>`
    color: ${({$shouldHighlightColor}) => ($shouldHighlightColor ? 'var(--general-colors-primary-400)' : 'initial')};
`;

export const DSRangePickerWrapper: FunctionComponent<IStandFieldValueContentProps<IKitRangePicker>> = ({
    presentationValue,
    value,
    onChange,
    attribute,
    handleSubmit,
    readonly,
    calculatedFlags,
    inheritedFlags
}) => {
    if (!onChange) {
        throw Error('DSRangePickerWrapper should be used inside a antd Form.Item');
    }

    const [isFocused, setIsFocused] = useState(false);
    const {errors} = Form.Item.useStatus();
    const {t} = useSharedTranslation();

    const isErrors = errors.length > 0;

    const _resetToInheritedOrCalculatedValue = async () => {
        if (inheritedFlags.isInheritedValue) {
            onChange(
                [
                    dayjs.unix(Number(inheritedFlags.inheritedValue.raw_payload.from)),
                    dayjs.unix(Number(inheritedFlags.inheritedValue.raw_payload.to))
                ],
                inheritedFlags.inheritedValue.raw_payload
            );
        } else if (calculatedFlags.isCalculatedValue) {
            onChange(
                [
                    dayjs.unix(Number(calculatedFlags.calculatedValue.raw_payload.from)),
                    dayjs.unix(Number(calculatedFlags.calculatedValue.raw_payload.to))
                ],
                calculatedFlags.calculatedValue.raw_payload
            );
        }
        await handleSubmit(null, attribute.id);
    };

    const _handleFocus = () => setIsFocused(true);

    const _handleDateChange: (
        rangePickerDates: [from: dayjs.Dayjs, to: dayjs.Dayjs] | null,
        antOnChangeParams: [from: string, to: string] | null
    ) => void = async (rangePickerDates, ...antOnChangeParams) => {
        if ((inheritedFlags.isInheritedValue || calculatedFlags.isCalculatedValue) && rangePickerDates === null) {
            _resetToInheritedOrCalculatedValue();
            return;
        }

        if (rangePickerDates) {
            rangePickerDates = [setDateToUTCNoon(rangePickerDates[0]), setDateToUTCNoon(rangePickerDates[1])];
        }

        onChange(rangePickerDates, ...antOnChangeParams);

        // TODO : validate form with await form.validateFields(state.attribute.id)

        let datesToSave: StandardValueTypes = null;

        if (rangePickerDates !== null) {
            const [dateFrom, dateTo] = rangePickerDates;
            datesToSave = JSON.stringify({from: dateFrom.unix(), to: dateTo.unix()});
        }

        await handleSubmit(datesToSave, attribute.id);
    };

    const _handleOpenChange = (open: boolean) => {
        if (!open) {
            setIsFocused(false);
        }
    };

    // TOTO remove this function to use onClear Prop when ant is updated to 5.20+
    const _handleClear = async (event: ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;

        if (
            (inheritedFlags.isInheritedValue || calculatedFlags.isCalculatedValue) &&
            inputValue === '' &&
            event.type === 'click'
        ) {
            _resetToInheritedOrCalculatedValue();
            return;
        }
        onChange(null, null);
        if (inputValue === '' && event.type === 'click') {
            await handleSubmit(null, attribute.id);
        }
    };

    return (
        <>
            {
                !isFocused && !isErrors && (
                    <KitInputStyled
                        id={attribute.id}
                        prefix={<FaCalendar />}
                        disabled={readonly}
                        helper={isErrors ? String(errors[0]) : undefined}
                        status={isErrors ? 'error' : undefined}
                        value={presentationValue}
                        onFocus={_handleFocus}
                        onChange={_handleClear}
                        $shouldHighlightColor={
                            inheritedFlags.isInheritedNotOverrideValue || calculatedFlags.isCalculatedNotOverrideValue
                        }
                        placeholder={t('record_edition.placeholder.enter_a_period')}
                    />
                )
                //TODO: Léger décalage car l'icon n'est pas exactement le même que celui du DS (MAJ React-icons ?)
            }
            {(isFocused || isErrors) && (
                <KitDatePickerRangePickerStyled
                    open
                    autoFocus
                    value={value}
                    disabled={readonly}
                    allowClear={
                        !inheritedFlags.isInheritedNotOverrideValue && !calculatedFlags.isCalculatedNotOverrideValue
                    }
                    helper={isErrors ? String(errors[0]) : undefined}
                    status={isErrors ? 'error' : undefined}
                    onChange={_handleDateChange}
                    onOpenChange={_handleOpenChange}
                    $shouldHighlightColor={
                        inheritedFlags.isInheritedNotOverrideValue || calculatedFlags.isCalculatedNotOverrideValue
                    }
                    placeholder={[t('record_edition.placeholder.start_date'), t('record_edition.placeholder.end_date')]}
                />
            )}
        </>
    );
};
