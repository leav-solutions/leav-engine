import {type FunctionComponent} from 'react';
import {faCheck} from '@fortawesome/free-solid-svg-icons';
import {type IconDefinition} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {KitAvatar, KitSpace, KitTypography} from 'aristid-ds';

interface IDisplayModeItemProps {
    icon: IconDefinition;
    label: string;
    isSelected?: boolean;
}

export const DisplayModeItem: FunctionComponent<IDisplayModeItemProps> = ({icon, label, isSelected = false}) => (
    <KitSpace direction="horizontal" size="xs">
        <KitAvatar
            icon={<FontAwesomeIcon icon={icon} />}
            size="s"
            shape="square"
            color="primary"
            secondaryColorInvert
        />
        <KitTypography.Text size="fontSize7" weight="bold">
            {label}
        </KitTypography.Text>
        {isSelected && <FontAwesomeIcon icon={faCheck} color="var(--general-utilities-text-blue)" />}
    </KitSpace>
);
