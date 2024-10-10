// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useEffect, useRef, useState} from 'react';
import {
    IStandardFieldReducerState,
    IStandardFieldValue
} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import {Form, InputProps} from 'antd';
import {IProvidedByAntFormItem} from '_ui/components/RecordEdition/EditRecordContent/_types';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useValueDetailsButton} from '_ui/components/RecordEdition/EditRecordContent/shared/ValueDetailsBtn/useValueDetailsButton';
import {RecordFormAttributeFragment} from '_ui/_gqlTypes';
import {useLang} from '_ui/hooks';
import {localizedTranslation} from '@leav/utils';
import {KitRichText} from 'aristid-ds';

interface IDSRichTextWrapperProps extends IProvidedByAntFormItem<InputProps> {
    state: IStandardFieldReducerState;
    attribute: RecordFormAttributeFragment;
    fieldValue: IStandardFieldValue;
    handleSubmit: (value: string, id?: string) => void;
    shouldShowValueDetailsButton?: boolean;
}

const KitRichTextStyled = styled(KitRichText)<{$shouldHighlightColor: boolean}>`
    color: ${({$shouldHighlightColor}) => ($shouldHighlightColor ? 'var(--general-colors-primary-400)' : 'initial')};
`;

const isEmptyValue = value => !value || value === '' || value === '<p></p>';

export const DSRichTextWrapper: FunctionComponent<IDSRichTextWrapperProps> = ({
    value,
    onChange,
    state,
    attribute,
    fieldValue,
    handleSubmit,
    shouldShowValueDetailsButton = false
}) => {
    const {t} = useSharedTranslation();
    const {errors} = Form.Item.useStatus();
    const {onValueDetailsButtonClick} = useValueDetailsButton({
        value: fieldValue?.value,
        attribute
    });
    const [hasChanged, setHasChanged] = useState(false);
    const {lang: availableLang} = useLang();

    const _resetToInheritedValue = () => {
        setHasChanged(false);
        onChange(state.inheritedValue.raw_value);
        handleSubmit('', state.attribute.id);
    };

    const _handleOnBlur = inputValue => {
        const valueToSubmit = isEmptyValue(inputValue) ? '' : inputValue;

        if (valueToSubmit === '' && state.isInheritedValue) {
            _resetToInheritedValue();
            return;
        }
        if (hasChanged || !state.isInheritedValue) {
            handleSubmit(valueToSubmit, state.attribute.id);
        }
        onChange(valueToSubmit);
        return;
    };

    const _handleOnChange = inputValue => {
        setHasChanged(true);
        if (state.isInheritedValue && isEmptyValue(inputValue)) {
            _resetToInheritedValue();
            return;
        }
        onChange(inputValue);
    };

    const label = localizedTranslation(state.formElement.settings.label, availableLang);

    return (
        <KitRichTextStyled
            required={state.formElement.settings.required}
            label={label}
            onInfoClick={shouldShowValueDetailsButton ? onValueDetailsButtonClick : null}
            status={errors.length > 0 ? 'error' : undefined}
            helper={
                state.isInheritedOverrideValue
                    ? t('record_edition.inherited_input_helper', {
                          inheritedValue: state.inheritedValue.raw_value
                      })
                    : undefined
            }
            value={value as string}
            disabled={state.isReadOnly}
            onChange={_handleOnChange}
            onBlur={_handleOnBlur}
            $shouldHighlightColor={!hasChanged && state.isInheritedNotOverrideValue}
        />
    );
};
