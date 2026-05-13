import {KitInput} from 'aristid-ds';
import {type ChangeEvent, type FocusEvent, type FunctionComponent, useState} from 'react';
import {Form} from 'antd';
import {type IStandFieldValueContentProps} from './_types';
import {type IKitInput} from 'aristid-ds/dist/Kit/DataEntry/Input/types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {EMPTY_INITIAL_VALUE_STRING} from '../../../antdUtils';

export const DSInputWrapper: FunctionComponent<IStandFieldValueContentProps<IKitInput>> = ({
    value,
    presentationValue,
    isLastValueOfMultivalues,
    removeLastValueOfMultivalues,
    onChange,
    attribute,
    readonly,
    handleSubmit,
    calculatedFlags,
    inheritedFlags,
}) => {
    if (!onChange) {
        throw Error('DSInputWrapper should be used inside a antd Form.Item');
    }

    const isNewValueOfMultivalues = isLastValueOfMultivalues && value === EMPTY_INITIAL_VALUE_STRING;
    const focusedDefaultValue = attribute.multiple_values ? isNewValueOfMultivalues : false;

    const [hasChanged, setHasChanged] = useState(false);
    const [isFocused, setIsFocused] = useState(focusedDefaultValue);
    const {errors} = Form.Item.useStatus();
    const {t} = useSharedTranslation();

    const isErrors = errors.length > 0;
    const valueToDisplay = isFocused || isErrors || !presentationValue ? value : presentationValue;

    // TODO: Remove inheritedValues[0] and calculatedValues[0] when we will have a proper way to override multiple values. For now, those attributes are set in readonly mode.
    const _resetToInheritedOrCalculatedValue = async () => {
        if (inheritedFlags.isInheritedValues) {
            onChange(inheritedFlags.inheritedValues[0].raw_payload);
        } else if (calculatedFlags.isCalculatedValues) {
            onChange(calculatedFlags.calculatedValues[0].raw_payload);
        }
        await handleSubmit(null, attribute.id);
    };

    const _handleOnFocus = () => {
        setIsFocused(true);
    };

    const _handleOnBlur = async (event: FocusEvent<HTMLInputElement>) => {
        setHasChanged(false);
        if (!hasChanged) {
            onChange(event);
            setIsFocused(false);

            if (isNewValueOfMultivalues) {
                removeLastValueOfMultivalues();
            }
            return;
        }

        const inputValue = event.target.value;
        if (inputValue === '' && (inheritedFlags.isInheritedValues || calculatedFlags.isCalculatedValues)) {
            _resetToInheritedOrCalculatedValue();
            return;
        }

        onChange(event);
        await handleSubmit(inputValue, attribute.id);
        setIsFocused(false);
    };

    const _handleOnChange = async (event: ChangeEvent<HTMLInputElement>) => {
        setHasChanged(true);
        onChange(event);
    };

    return (
        <KitInput
            id={attribute.id}
            autoFocus={isFocused}
            readonly={readonly}
            helper={isErrors ? String(errors[0]) : undefined}
            status={isErrors ? 'error' : undefined}
            value={valueToDisplay}
            allowClear={!!value && !attribute.multiple_values}
            onChange={_handleOnChange}
            onFocus={_handleOnFocus}
            onBlur={_handleOnBlur}
            placeholder={t('record_edition.placeholder.enter_a_text')}
            maxLength={attribute.character_limit ?? undefined}
            showCount
        />
    );
};
