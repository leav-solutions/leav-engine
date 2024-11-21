// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useState} from 'react';
import {Form} from 'antd';
import styled from 'styled-components';
import {KitRichText} from 'aristid-ds';
import {IStandFieldValueContentProps} from './_types';
import {KitRichTextProps} from 'aristid-ds/dist/Kit/DataEntry/RichText/types';

const KitRichTextStyled = styled(KitRichText)<{$shouldHighlightColor: boolean}>`
    .tiptap.ProseMirror {
        color: ${({$shouldHighlightColor}) =>
            $shouldHighlightColor ? 'var(--general-colors-primary-400)' : 'initial'};
    }
`;

const isEmptyValue = value => !value || value === '<p></p>';

export const DSRichTextWrapper: FunctionComponent<IStandFieldValueContentProps<KitRichTextProps>> = ({
    value,
    presentationValue,
    onChange,
    state,
    attribute,
    handleSubmit
}) => {
    if (!onChange) {
        throw Error('DSRichTextWrapper should be used inside a antd Form.Item');
    }

    const [hasChanged, setHasChanged] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const {errors} = Form.Item.useStatus();

    const isErrors = errors.length > 0;
    const valueToDisplay = isFocused || isErrors ? value : presentationValue;

    const _resetToInheritedOrCalculatedValue = async () => {
        setHasChanged(false);
        if (state.isInheritedValue) {
            onChange(state.inheritedValue.raw_payload);
        } else if (state.isCalculatedValue) {
            onChange(state.calculatedValue.raw_payload);
        }
        await handleSubmit('', state.attribute.id);
    };

    const _handleFocus = () => setIsFocused(true);

    const _handleOnBlur = async inputValue => {
        const valueToSubmit = isEmptyValue(inputValue) ? '' : inputValue;

        if (!hasChanged) {
            onChange(valueToSubmit);
            setIsFocused(false);
            return;
        }

        if (valueToSubmit === '' && (state.isInheritedValue || state.isCalculatedValue)) {
            _resetToInheritedOrCalculatedValue();
            return;
        }

        onChange(valueToSubmit);
        setIsFocused(false);
        await handleSubmit(valueToSubmit, state.attribute.id);
    };

    const _handleOnChange = inputValue => {
        setHasChanged(true);
        if (state.isInheritedValue && isEmptyValue(inputValue)) {
            _resetToInheritedOrCalculatedValue();
            return;
        }
        onChange(inputValue);
    };

    return (
        <KitRichTextStyled
            helper={isErrors ? String(errors[0]) : undefined}
            status={isErrors ? 'error' : undefined}
            value={valueToDisplay}
            disabled={state.isReadOnly}
            onChange={_handleOnChange}
            onFocus={_handleFocus}
            onBlur={_handleOnBlur}
            $shouldHighlightColor={
                !hasChanged && (state.isInheritedNotOverrideValue || state.isCalculatedNotOverrideValue)
            }
            placeholder="TODO"
        />
    );
};
