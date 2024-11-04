// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {AttributeFormat} from '_ui/_gqlTypes';
import {IStandardFieldValue} from '_ui/components/RecordEdition/EditRecordContent/reducers/standardFieldReducer/standardFieldReducer';
import {useStandardFieldReducer} from '_ui/components/RecordEdition/EditRecordContent/reducers/standardFieldReducer/useStandardFieldReducer';
import {useValueDetailsButton} from '_ui/components/RecordEdition/EditRecordContent/shared/ValueDetailsBtn/useValueDetailsButton';
import {useEditRecordReducer} from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {RecordFormElementsValueStandardValue} from '_ui/hooks/useGetRecordForm';
import useLang from '_ui/hooks/useLang';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitInputWrapper, KitTypography} from 'aristid-ds';
import {FunctionComponent, SyntheticEvent} from 'react';
import styled from 'styled-components';
import DOMPurify from 'dompurify';
import {ColorPickerBlock} from './ColorPickerBlock';

interface IStandardFieldValueReadProps {
    fieldValue: IStandardFieldValue;
    onClick: (e: SyntheticEvent) => void;
    className?: string;
}

const _isDateRangeValue = (value: any): value is {from: string; to: string} =>
    !!value && typeof value === 'object' && 'from' in value && 'to' in value;

const KitInputWrapperStyled = styled(KitInputWrapper)<{$width: string; $isColorAttribute: boolean}>`
    &.bordered > .kit-input-wrapper-content {
        width: ${({$width}) => $width};

        ${({$isColorAttribute}) => $isColorAttribute && 'padding: 3px;'}
    }
`;

const ValueWrapper = styled(KitTypography.Paragraph)<{$highlighted: boolean; $isColorAttribute: boolean}>`
    min-height: calc(var(--general-typography-fontSize6) * var(--general-typography-lineHeight6) * 1px);
    color: ${({$highlighted}) =>
        $highlighted ? 'var(--general-colors-primary-400)' : 'var(--general-utilities-text-primary)'};
    font-size: calc(var(--general-typography-fontSize5) * 1px);
    line-height: calc(var(--general-typography-fontSize5) * 1px);
    display: flex;
    flex-direction: row;
    align-items: center;

    ${({$isColorAttribute}) =>
        $isColorAttribute &&
        `span {
            margin-inline-start: 8px;
            margin-inline-end: 5px;
        }
    `}
`;

const defaultColorValue = '#00000000';

export const StandardFieldValueRead: FunctionComponent<IStandardFieldValueReadProps> = ({
    fieldValue,
    onClick,
    className
}) => {
    const {state} = useStandardFieldReducer();
    const {state: editRecordState} = useEditRecordReducer();
    const {lang: availableLang} = useLang();
    const {t} = useSharedTranslation();

    const shouldShowValueDetailsButton = editRecordState.withInfoButton;

    const {onValueDetailsButtonClick} = useValueDetailsButton({
        value: fieldValue?.value,
        attribute: state.attribute
    });

    const label = localizedTranslation(state.formElement.settings.label, availableLang);

    const _getInheritedValueForHelper = (inheritedValue: RecordFormElementsValueStandardValue) => {
        switch (state.attribute.format) {
            case AttributeFormat.date_range:
                return t('record_edition.date_range_from_to', {
                    from: inheritedValue.value.from,
                    to: inheritedValue.value.to
                });
            case AttributeFormat.encrypted:
                return inheritedValue.value ? '●●●●●●●' : '';
            case AttributeFormat.color:
                return '#' + inheritedValue.value;
            default:
                return inheritedValue.value;
        }
    };

    const _getCalculatedValueForHelper = (calculatedValue: RecordFormElementsValueStandardValue) => {
        switch (state.attribute.format) {
            case AttributeFormat.date_range:
                return t('record_edition.date_range_from_to', {
                    from: calculatedValue.value.from,
                    to: calculatedValue.value.to
                });
            case AttributeFormat.encrypted:
                return calculatedValue.value ? '●●●●●●●' : '';
            case AttributeFormat.color:
                return '#' + calculatedValue.value;
            default:
                return calculatedValue.value;
        }
    };

    const _handleFocus = (e: SyntheticEvent) => {
        if (state.isReadOnly) {
            return;
        }
        onClick(e);
    };

    let displayValue = String(fieldValue.value?.payload ?? fieldValue.displayValue ?? '');

    let width = '100%';
    switch (state.attribute.format) {
        case AttributeFormat.date_range:
            if (!_isDateRangeValue(fieldValue.value?.payload)) {
                displayValue = '';
            } else {
                const {from, to} = fieldValue.value?.payload;
                displayValue = t('record_edition.date_range_value', {from, to});
            }
            break;
        case AttributeFormat.encrypted:
            displayValue = fieldValue.value?.payload ? '●●●●●●●' : '';
            break;
        case AttributeFormat.numeric:
            width = '90px';
            break;
        case AttributeFormat.color:
            if (!displayValue) {
                displayValue = defaultColorValue;
            } else {
                displayValue = '#' + displayValue;
            }
            width = 'fit-content';
            break;
        case AttributeFormat.date:
            width = '185px';
            break;
    }

    const _getHelper = () => {
        if (state.isInheritedOverrideValue) {
            return t('record_edition.inherited_input_helper', {
                inheritedValue: _getInheritedValueForHelper(state.inheritedValue)
            });
        } else if (state.isCalculatedOverrideValue) {
            return t('record_edition.calculated_input_helper', {
                calculatedValue: _getCalculatedValueForHelper(state.calculatedValue)
            });
        }
        return;
    };

    const isValueHighlighted = state.isInheritedNotOverrideValue || state.isCalculatedNotOverrideValue;
    const isColorAttribute = state.attribute.format === AttributeFormat.color;
    const isValueDefaultColor = displayValue === defaultColorValue;

    return (
        <KitInputWrapperStyled
            label={label}
            bordered
            hoverable
            required={state.formElement.settings.required}
            onInfoClick={shouldShowValueDetailsButton ? onValueDetailsButtonClick : null}
            helper={_getHelper()}
            onFocus={_handleFocus}
            className={className}
            $width={width}
            $isColorAttribute={isColorAttribute}
        >
            <ValueWrapper
                data-testid={state.attribute.id}
                disabled={state.isReadOnly}
                onClick={onClick}
                weight="medium"
                $highlighted={isValueHighlighted}
                $isColorAttribute={isColorAttribute}
            >
                {isColorAttribute && (
                    <ColorPickerBlock isValueDefaultColor={isValueDefaultColor} color={displayValue} />
                )}
                <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(displayValue)}} />
            </ValueWrapper>
        </KitInputWrapperStyled>
    );
};
