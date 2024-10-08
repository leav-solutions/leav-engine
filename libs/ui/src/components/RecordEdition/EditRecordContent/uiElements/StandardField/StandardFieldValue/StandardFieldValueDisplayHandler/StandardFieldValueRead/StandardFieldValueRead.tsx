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
import {FunctionComponent} from 'react';
import styled from 'styled-components';

interface IStandardFieldValueReadProps {
    fieldValue: IStandardFieldValue;
    onClick: () => void;
    className?: string;
}

const _isDateRangeValue = (value: any): value is {from: string; to: string} =>
    !!value && typeof value === 'object' && 'from' in value && 'to' in value;

const KitInputWrapperStyled = styled(KitInputWrapper)<{$width: string}>`
    > .kit-input-wrapper-content {
        width: ${({$width}) => $width};
    }
`;

const ValueWrapper = styled(KitTypography.Paragraph)<{$highlighted: boolean}>`
    min-height: calc(var(--general-typography-fontSize6) * var(--general-typography-lineHeight6) * 1px);
    color: ${({$highlighted}) => ($highlighted ? 'var(--general-colors-primary-400)' : 'initial')};
    font-size: calc(var(--general-typography-fontSize5) * 1px);
`;

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
            default:
                return inheritedValue.value;
        }
    };

    const _handleClick = () => {
        if (state.isReadOnly) {
            return;
        }
        onClick();
    };

    let displayValue = String(fieldValue.value?.payload ?? '');
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
        case AttributeFormat.date:
            width = '185px';
            break;
    }

    const isValueHighlighted = state.isInheritedNotOverrideValue;
    return (
        <KitInputWrapperStyled
            label={label}
            bordered
            hoverable
            htmlFor={fieldValue.idValue}
            required={state.formElement.settings.required}
            onInfoClick={shouldShowValueDetailsButton ? onValueDetailsButtonClick : null}
            helper={
                state.isInheritedOverrideValue && state.inheritedValue
                    ? t('record_edition.inherited_input_helper', {
                          inheritedValue: _getInheritedValueForHelper(state.inheritedValue)
                      })
                    : undefined
            }
            onFocus={_handleClick}
            className={className}
            $width={width}
        >
            <ValueWrapper
                disabled={state.isReadOnly}
                onClick={onClick}
                weight="medium"
                $highlighted={isValueHighlighted}
            >
                {displayValue}
            </ValueWrapper>
        </KitInputWrapperStyled>
    );
};
