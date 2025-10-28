// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
