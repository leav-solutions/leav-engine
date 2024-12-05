// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitSwitch, KitTypography} from 'aristid-ds';
import {FunctionComponent, MouseEvent} from 'react';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IKitSwitch} from 'aristid-ds/dist/Kit/DataEntry/Switch/types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCircleXmark} from '@fortawesome/free-solid-svg-icons';
import {IStandFieldValueContentProps} from './_types';

const KitTypographyTextStyled = styled(KitTypography.Text)<{$shouldHighlightColor: boolean}>`
    vertical-align: middle;
    margin-left: calc(var(--general-spacing-xs) * 1px);
    color: ${({$shouldHighlightColor}) => ($shouldHighlightColor ? 'var(--general-colors-primary-400)' : 'initial')};
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
    calculatedFlags
}) => {
    if (!onChange) {
        throw Error('DSBooleanWrapper should be used inside a antd Form.Item');
    }

    const {t} = useSharedTranslation();

    const _resetToInheritedOrCalculatedValue = () => {
        if (inheritedFlags.isInheritedValue) {
            onChange(inheritedFlags.inheritedValue.raw_payload, undefined);
        } else if (calculatedFlags.isCalculatedValue) {
            onChange(calculatedFlags.calculatedValue.raw_payload, undefined);
        }
        handleSubmit(null, attribute.id);
    };

    const _handleOnChange: (checked: boolean, event: MouseEvent<HTMLButtonElement>) => void = (checked, event) => {
        onChange(checked, event);
        handleSubmit(String(checked), attribute.id);
    };

    return (
        <>
            <label>
                <KitSwitch id={attribute.id} checked={value} disabled={readonly} onChange={_handleOnChange} />
                <KitTypographyTextStyled
                    size="fontSize5"
                    weight="medium"
                    $shouldHighlightColor={
                        inheritedFlags.isInheritedNotOverrideValue || calculatedFlags.isCalculatedNotOverrideValue
                    }
                >
                    {t(_getBooleanValueAsStringForTranslation(value))}
                </KitTypographyTextStyled>
            </label>
            {(inheritedFlags.isInheritedOverrideValue || calculatedFlags.isCalculatedOverrideValue) && (
                <span role="button" onClick={_resetToInheritedOrCalculatedValue}>
                    <FontAwesomeIconStyled aria-label="clear" icon={faCircleXmark} />
                </span>
            )}
        </>
    );
};
