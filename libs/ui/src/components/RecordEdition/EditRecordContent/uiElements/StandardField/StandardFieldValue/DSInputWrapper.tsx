// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitInput} from 'aristid-ds';
import {ChangeEvent, FocusEvent, FunctionComponent, useState} from 'react';
import {Form} from 'antd';
import styled from 'styled-components';
import {IStandFieldValueContentProps} from './_types';
import {IKitInput} from 'aristid-ds/dist/Kit/DataEntry/Input/types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

const KitInputStyled = styled(KitInput)<{$shouldHighlightColor: boolean}>`
    color: ${({$shouldHighlightColor}) => ($shouldHighlightColor ? 'var(--general-colors-primary-400)' : 'initial')};
`;

export const DSInputWrapper: FunctionComponent<IStandFieldValueContentProps<IKitInput>> = ({
    value,
    presentationValue,
    onChange,
    attribute,
    readonly,
    handleSubmit,
    calculatedFlags,
    inheritedFlags
}) => {
    if (!onChange) {
        throw Error('DSInputWrapper should be used inside a antd Form.Item');
    }

    const [hasChanged, setHasChanged] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const {errors} = Form.Item.useStatus();
    const {t} = useSharedTranslation();

    const isErrors = errors.length > 0;
    const valueToDisplay = isFocused || isErrors || !presentationValue ? value : presentationValue;

    const _resetToInheritedOrCalculatedValue = async () => {
        setHasChanged(false);
        if (inheritedFlags.isInheritedValue) {
            onChange(inheritedFlags.inheritedValue.raw_payload);
        } else if (calculatedFlags.isCalculatedValue) {
            onChange(calculatedFlags.calculatedValue.raw_payload);
        }
        await handleSubmit(null, attribute.id);
    };

    const _handleOnBlur = async (event: FocusEvent<HTMLInputElement>) => {
        if (!hasChanged) {
            onChange(event);
            setIsFocused(false);
            return;
        }

        const inputValue = event.target.value;
        if (inputValue === '' && (inheritedFlags.isInheritedValue || calculatedFlags.isCalculatedValue)) {
            _resetToInheritedOrCalculatedValue();
            return;
        }

        onChange(event);
        await handleSubmit(inputValue, attribute.id);
        setIsFocused(false);
    };

    // TODO remove this function to use onClear Prop when ant is updated to 5.20+ (and other inputs too)
    const _handleOnChange = async (event: ChangeEvent<HTMLInputElement>) => {
        setHasChanged(true);

        const inputValue = event.target.value;
        if (
            (inheritedFlags.isInheritedValue || calculatedFlags.isCalculatedValue) &&
            inputValue === '' &&
            event.type === 'click'
        ) {
            _resetToInheritedOrCalculatedValue();
            return;
        }
        onChange(event);
        if (inputValue === '' && event.type === 'click') {
            await handleSubmit(null, attribute.id);
        }
    };

    return (
        <KitInputStyled
            id={attribute.id}
            disabled={readonly}
            helper={isErrors ? String(errors[0]) : undefined}
            status={isErrors ? 'error' : undefined}
            value={valueToDisplay}
            allowClear={!inheritedFlags.isInheritedNotOverrideValue && !calculatedFlags.isCalculatedNotOverrideValue}
            onChange={_handleOnChange}
            onFocus={() => setIsFocused(true)}
            onBlur={_handleOnBlur}
            $shouldHighlightColor={
                !hasChanged &&
                (inheritedFlags.isInheritedNotOverrideValue || calculatedFlags.isCalculatedNotOverrideValue)
            }
            placeholder={t('record_edition.placeholder.enter_a_text')}
        />
    );
};
