import {type FunctionComponent} from 'react';
import {type CalculatedFlags, type InheritedFlags} from './calculatedInheritedFlags';
import {KitTooltip} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faLayerGroup, faSquareRootAlt} from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

const ComputeIndicatorWrapper = styled.div`
    font-size: calc(var(--general-typography-fontSize7) * 1px);
`;

interface IComputeIndicatorProps {
    calculatedFlags: CalculatedFlags;
    inheritedFlags: InheritedFlags;
}

export const ComputeIndicator: FunctionComponent<IComputeIndicatorProps> = ({calculatedFlags, inheritedFlags}) => {
    const {t} = useSharedTranslation();

    const shouldDisplayComputedIcon =
        calculatedFlags.isCalculatedNotOverrideValues || inheritedFlags.isInheritedNotOverrideValues;
    const shouldDisplayOverridedIcon =
        calculatedFlags.isCalculatedOverrideValues || inheritedFlags.isInheritedOverrideValues;

    return (
        <ComputeIndicatorWrapper>
            {shouldDisplayComputedIcon && (
                <KitTooltip title={t('record_edition.calculated_value')}>
                    <FontAwesomeIcon icon={faSquareRootAlt} />
                </KitTooltip>
            )}
            {shouldDisplayOverridedIcon && (
                <KitTooltip title={t('record_edition.overrided_value')}>
                    <FontAwesomeIcon icon={faLayerGroup} />
                </KitTooltip>
            )}
        </ComputeIndicatorWrapper>
    );
};
