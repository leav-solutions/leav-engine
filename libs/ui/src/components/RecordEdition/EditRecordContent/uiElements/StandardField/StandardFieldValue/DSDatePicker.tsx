import {KitDatePicker} from 'aristid-ds';
import {FunctionComponent} from 'react';
import {
    IStandardFieldReducerState,
    IStandardFieldValue
} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import {Form} from 'antd';
import dayjs from 'dayjs';
import styled from 'styled-components';
import {IProvidedByAntFormItem, StandardValueTypes} from '../../../_types';
import {DatePickerProps} from 'antd/lib/date-picker';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {RecordFormAttributeFragment} from '_ui/_gqlTypes';
import {useValueDetailsButton} from '_ui/components/RecordEdition/EditRecordContent/shared/ValueDetailsBtn/useValueDetailsButton';
import {useLang} from '_ui/hooks';
import {localizedTranslation} from '@leav/utils';

interface IDSDatePickerProps extends IProvidedByAntFormItem<DatePickerProps> {
    state: IStandardFieldReducerState;
    attribute: RecordFormAttributeFragment;
    fieldValue: IStandardFieldValue;
    handleSubmit: (value: StandardValueTypes, id?: string) => void;
}

const KitDatePickerStyled = styled(KitDatePicker)<{$shouldHighlightColor: boolean}>`
    color: ${({$shouldHighlightColor}) => ($shouldHighlightColor ? 'var(--general-colors-primary-400)' : 'initial')};
`;

export const DSDatePicker: FunctionComponent<IDSDatePickerProps> = ({
    value,
    onChange,
    state,
    attribute,
    fieldValue,
    handleSubmit
}) => {
    const {t} = useSharedTranslation();
    const {lang: availableLangs} = useLang();
    const {errors} = Form.Item.useStatus();
    const {onValueDetailsButtonClick} = useValueDetailsButton({
        value: fieldValue?.value,
        attribute
    });

    const _handleDateChange: (datePickerDate: dayjs.Dayjs | null, antOnChangeParams: string | string[]) => void = (
        datePickerDate,
        ...antOnChangeParams
    ) => {
        if (state.isInheritedValue && datePickerDate === null) {
            onChange(dayjs.unix(Number(state.inheritedValue.raw_value)), state.inheritedValue.raw_value);
            handleSubmit('', state.attribute.id);
            return;
        }

        onChange(datePickerDate, ...antOnChangeParams);

        // TODO : validate form with await form.validateFields(state.attribute.id)
        if (state.formElement.settings.required && datePickerDate === null) {
            return;
        }

        let dateToSave = null;
        if (datePickerDate !== null) {
            dateToSave = String(datePickerDate.unix());
        }

        handleSubmit(dateToSave, state.attribute.id);
    };

    const label = localizedTranslation(state.formElement.settings.label, availableLangs);

    return (
        <KitDatePickerStyled
            value={value}
            onChange={_handleDateChange}
            label={label}
            required={state.formElement.settings.required}
            disabled={state.isReadOnly}
            allowClear={!state.isInheritedNotOverrideValue}
            status={errors.length > 0 ? 'error' : undefined}
            onInfoClick={onValueDetailsButtonClick}
            helper={
                state.isInheritedOverrideValue
                    ? t('record_edition.inherited_input_helper', {
                          inheritedValue: state.inheritedValue.value
                      })
                    : undefined
            }
            $shouldHighlightColor={state.isInheritedNotOverrideValue}
        />
    );
};
