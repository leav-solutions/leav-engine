import {KitSwitch, KitTypography} from 'aristid-ds';
import {type FunctionComponent, type KeyboardEvent, type MouseEvent} from 'react';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type IKitSwitch} from 'aristid-ds/dist/Kit/DataEntry/Switch/types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCircleXmark} from '@fortawesome/free-solid-svg-icons';
import {type IStandFieldValueContentProps} from './_types';

const KitTypographyTextStyled = styled(KitTypography.Text)`
    vertical-align: middle;
    margin-left: calc(var(--general-spacing-xs) * 1px);
`;

const FontAwesomeIconStyled = styled(FontAwesomeIcon)`
    vertical-align: middle;
    margin-left: calc(var(--general-spacing-xs) * 1px);
    color: var(--general-utilities-text-primary);
    cursor: pointer;
`;

const _getBooleanValueAsStringForTranslation = (value: boolean): string => (value ? 'global.yes' : 'global.no');

export const DSBooleanWrapper: FunctionComponent<IStandFieldValueContentProps<IKitSwitch>> = ({
    value,
    onChange,
    handleSubmit,
    attribute,
    readonly,
    inheritedFlags,
    calculatedFlags,
}) => {
    if (!onChange) {
        throw Error('DSBooleanWrapper should be used inside a antd Form.Item');
    }

    const {t} = useSharedTranslation();

    // TODO: Remove inheritedValues[0] and calculatedValues[0] when we will have a proper way to override multiple values. For now, those attributes are set in readonly mode.
    const _resetToInheritedOrCalculatedValue = () => {
        if (inheritedFlags.isInheritedValues) {
            onChange(inheritedFlags.inheritedValues[0].raw_payload, undefined);
        } else if (calculatedFlags.isCalculatedValues) {
            onChange(calculatedFlags.calculatedValues[0].raw_payload, undefined);
        }
        handleSubmit(null, attribute.id);
    };

    const _handleOnChange: (
        checked: boolean,
        event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>,
    ) => void = (checked, event) => {
        onChange(checked, event);
        handleSubmit(String(checked), attribute.id);
    };

    return (
        <>
            <label>
                <KitSwitch id={attribute.id} checked={value} disabled={readonly} onChange={_handleOnChange} />
                <KitTypographyTextStyled size="fontSize5" weight="medium">
                    {t(_getBooleanValueAsStringForTranslation(value))}
                </KitTypographyTextStyled>
            </label>
            {(inheritedFlags.isInheritedOverrideValues || calculatedFlags.isCalculatedOverrideValues) && (
                <span role="button" onClick={_resetToInheritedOrCalculatedValue}>
                    <FontAwesomeIconStyled aria-label="clear" icon={faCircleXmark} />
                </span>
            )}
        </>
    );
};
