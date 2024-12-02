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
    'data-testid': dataTestId,
    presentationValue,
    value,
    onChange,
    state,
    handleSubmit
}) => {
    if (!onChange) {
        throw Error('DSRangePickerWrapper should be used inside a antd Form.Item');
    }

    const [isFocused, setIsFocused] = useState(false);
    const {errors} = Form.Item.useStatus();
    const {t} = useSharedTranslation();

    const isErrors = errors.length > 0;

    const _resetToInheritedOrCalculatedValue = async () => {
        if (state.isInheritedValue) {
            onChange(
                [
                    dayjs.unix(Number(state.inheritedValue.raw_value.from)),
                    dayjs.unix(Number(state.inheritedValue.raw_value.to))
                ],
                state.inheritedValue.raw_value
            );
        } else if (state.isCalculatedValue) {
            onChange(
                [
                    dayjs.unix(Number(state.calculatedValue.raw_value.from)),
                    dayjs.unix(Number(state.calculatedValue.raw_value.to))
                ],
                state.calculatedValue.raw_value
            );
        }
        await handleSubmit(null, state.attribute.id);
    };

    const _handleFocus = () => setIsFocused(true);

    const _handleDateChange: (
        rangePickerDates: [from: dayjs.Dayjs, to: dayjs.Dayjs] | null,
        antOnChangeParams: [from: string, to: string] | null
    ) => void = async (rangePickerDates, ...antOnChangeParams) => {
        if ((state.isInheritedValue || state.isCalculatedValue) && rangePickerDates === null) {
            _resetToInheritedOrCalculatedValue();
            return;
        }

        if (rangePickerDates) {
            rangePickerDates = [setDateToUTCNoon(rangePickerDates[0]), setDateToUTCNoon(rangePickerDates[1])];
        }

        onChange(rangePickerDates, ...antOnChangeParams);

        // TODO : validate form with await form.validateFields(state.attribute.id)
        if (state.formElement.settings.required && rangePickerDates === null) {
            return;
        }

        let datesToSave: StandardValueTypes = '';

        if (rangePickerDates !== null) {
            const [dateFrom, dateTo] = rangePickerDates;
            datesToSave = {from: String(dateFrom.unix()), to: String(dateTo.unix())};
        }

        await handleSubmit(datesToSave, state.attribute.id);
    };

    const _handleOpenChange = (open: boolean) => {
        if (!open) {
            setIsFocused(false);
        }
    };

    // TOTO remove this function to use onClear Prop when ant is updated to 5.20+
    const _handleClear = async (event: ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;

        if ((state.isInheritedValue || state.isCalculatedValue) && inputValue === '' && event.type === 'click') {
            _resetToInheritedOrCalculatedValue();
            return;
        }
        onChange(null, null);
        if (inputValue === '' && event.type === 'click') {
            await handleSubmit('', state.attribute.id);
        }
    };

    return (
        <>
            {
                !isFocused && !isErrors && (
                    <KitInputStyled
                        data-testid={dataTestId}
                        prefix={<FaCalendar />}
                        helper={isErrors ? String(errors[0]) : undefined}
                        status={isErrors ? 'error' : undefined}
                        value={presentationValue}
                        onFocus={_handleFocus}
                        onChange={_handleClear}
                        $shouldHighlightColor={state.isInheritedNotOverrideValue || state.isCalculatedNotOverrideValue}
                        placeholder={t('record_edition.placeholder.enter_a_period')}
                    />
                )
                //TODO: Léger décalage car l'icon n'est pas exactement le même que celui du DS (MAJ React-icons ?)
            }
            {(isFocused || isErrors) && (
                <KitDatePickerRangePickerStyled
                    data-testid={dataTestId}
                    open
                    autoFocus
                    value={value}
                    disabled={state.isReadOnly}
                    allowClear={!state.isInheritedNotOverrideValue && !state.isCalculatedNotOverrideValue}
                    helper={isErrors ? String(errors[0]) : undefined}
                    status={isErrors ? 'error' : undefined}
                    onChange={_handleDateChange}
                    onOpenChange={_handleOpenChange}
                    $shouldHighlightColor={state.isInheritedNotOverrideValue || state.isCalculatedNotOverrideValue}
                    placeholder={[t('record_edition.placeholder.start_date'), t('record_edition.placeholder.end_date')]}
                />
            )}
        </>
    );
};
