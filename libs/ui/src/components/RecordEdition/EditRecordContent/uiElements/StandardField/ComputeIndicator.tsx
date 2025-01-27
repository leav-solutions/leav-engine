// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {CalculatedFlags, InheritedFlags} from './calculatedInheritedFlags';
import {KitTooltip} from 'aristid-ds';
import {FaLayerGroup, FaSquareRootAlt} from 'react-icons/fa';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {TOOLTIP_DEFAULT_DELAY_IN_SECONDS} from '_ui/constants';

const ComputeIndicatorWrapper = styled.div`
    font-size: calc(var(--general-typography-fontSize7) * 1px);
`;

export const ComputeIndicator: FunctionComponent<{
    calculatedFlags: CalculatedFlags;
    inheritedFlags: InheritedFlags;
}> = ({calculatedFlags, inheritedFlags}) => {
    const {t} = useSharedTranslation();

    const shouldDisplayComputedIcon =
        calculatedFlags.isCalculatedNotOverrideValue || inheritedFlags.isInheritedNotOverrideValue;
    const shouldDisplayOverridedIcon =
        calculatedFlags.isCalculatedOverrideValue || inheritedFlags.isInheritedOverrideValue;

    return (
        <ComputeIndicatorWrapper>
            {shouldDisplayComputedIcon && (
                <KitTooltip
                    title={
                        calculatedFlags.isCalculatedValue
                            ? t('record_edition.calculated_value')
                            : t('record_edition.inherited_value')
                    }
                    mouseEnterDelay={TOOLTIP_DEFAULT_DELAY_IN_SECONDS}
                >
                    <FaSquareRootAlt />
                </KitTooltip>
            )}
            {shouldDisplayOverridedIcon && (
                <KitTooltip
                    title={t('record_edition.overrided_value')}
                    mouseEnterDelay={TOOLTIP_DEFAULT_DELAY_IN_SECONDS}
                >
                    <FaLayerGroup />
                </KitTooltip>
            )}
        </ComputeIndicatorWrapper>
    );
};
