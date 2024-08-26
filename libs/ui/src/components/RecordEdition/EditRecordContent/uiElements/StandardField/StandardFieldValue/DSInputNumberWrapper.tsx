// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitInputNumber} from 'aristid-ds';
import {ComponentPropsWithRef, FocusEvent, FunctionComponent, useState} from 'react';
import {
    IStandardFieldReducerState,
    IStandardFieldValue
} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import {Form, InputNumberProps} from 'antd';
import {IProvidedByAntFormItem} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import styled from 'styled-components';
import {useValueDetailsButton} from '_ui/components/RecordEdition/EditRecordContent/shared/ValueDetailsBtn/useValueDetailsButton';
import {RecordFormAttributeFragment} from '_ui/_gqlTypes';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '_ui/hooks';

interface IDSInputWrapperProps extends IProvidedByAntFormItem<InputNumberProps> {
    state: IStandardFieldReducerState;
    attribute: RecordFormAttributeFragment;
    fieldValue: IStandardFieldValue;
    shouldShowValueDetailsButton?: boolean;
    handleSubmit: (value: string, id?: string) => void;
}

const KitInputNumberStyled = styled(KitInputNumber)<{$shouldHighlightColor: boolean}>`
    .ant-input-number-input-wrap .ant-input-number-input {
        color: ${({$shouldHighlightColor}) =>
            $shouldHighlightColor ? 'var(--general-colors-primary-400)' : 'initial'};
    }

    .kit-input-wrapper-helper {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }
`;

export const DSInputNumberWrapper: FunctionComponent<IDSInputWrapperProps> = ({
    value,
    onChange,
    state,
    attribute,
    fieldValue,
    shouldShowValueDetailsButton = false,
    handleSubmit
}) => {
    if (!onChange) {
        throw Error('DSInputNumberWrapper should be used inside a antd Form.Item');
    }

    const {t} = useSharedTranslation();
    const {lang} = useLang();
    const {errors} = Form.Item.useStatus();
    const {onValueDetailsButtonClick, infoIconWithTooltip} = useValueDetailsButton({
        value: fieldValue?.value,
        attribute
    });

    const [hasChanged, setHasChanged] = useState(false);

    const _resetToInheritedValue = () => {
        setHasChanged(false);
        onChange(state.inheritedValue.raw_value);
        handleSubmit('', state.attribute.id);
    };

    const _handleOnBlur = (event: FocusEvent<HTMLInputElement>) => {
        const valueToSubmit = event.target.value;
        if (valueToSubmit === '' && state.isInheritedValue) {
            _resetToInheritedValue();
            return;
        }
        if (hasChanged || !state.isInheritedValue) {
            handleSubmit(valueToSubmit, state.attribute.id);
        }
        onChange(valueToSubmit);
    };

    const _handleOnChange: ComponentPropsWithRef<typeof KitInputNumberStyled>['onChange'] = inputValue => {
        setHasChanged(true);
        onChange(inputValue);
    };

    const label = localizedTranslation(state.formElement.settings.label, lang);

    return (
        <KitInputNumberStyled
            label={label}
            required={state.formElement.settings.required}
            status={errors.length > 0 ? 'error' : ''}
            helper={
                state.isInheritedOverrideValue
                    ? t('record_edition.inherited_input_helper', {
                          inheritedValue: state.inheritedValue.raw_value
                      })
                    : undefined
            }
            infoIcon={shouldShowValueDetailsButton ? infoIconWithTooltip : null}
            onInfoClick={shouldShowValueDetailsButton ? onValueDetailsButtonClick : null}
            value={value}
            onChange={_handleOnChange}
            disabled={state.isReadOnly}
            onBlur={_handleOnBlur}
            $shouldHighlightColor={!hasChanged && state.isInheritedNotOverrideValue}
        />
    );
};
