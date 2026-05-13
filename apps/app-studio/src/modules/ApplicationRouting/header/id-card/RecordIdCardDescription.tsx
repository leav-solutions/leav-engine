import {KitTypography} from 'aristid-ds';
import {type FunctionComponent} from 'react';

import {idCardDescription} from './recordIdCard.module.css';

export const RecordIdCardDescription: FunctionComponent<{
    label?: string;
    sublabel?: string;
}> = ({label, sublabel}) => (
    <div className={idCardDescription}>
        <KitTypography.AdvancedText size="fontSize4" weight="bold" ellipsis>
            {label}
        </KitTypography.AdvancedText>
        {label && sublabel && <KitTypography.Text size="fontSize7">/</KitTypography.Text>}
        {sublabel && (
            <KitTypography.AdvancedText size="fontSize7" ellipsis>
                {sublabel}
            </KitTypography.AdvancedText>
        )}
    </div>
);
