// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitTypography} from 'aristid-ds';
import {type ReactNode} from 'react';
import {hoverActionWrapper, container, text} from './automationCell.module.css';

type AutomationCellProps = {
    children: ReactNode;
    hoverAction?: ReactNode;
};

export const AutomationCell = ({children, hoverAction}: AutomationCellProps) => (
    <div className={container}>
        <KitTypography.Text ellipsis className={text}>
            {children}
        </KitTypography.Text>
        {hoverAction && <div className={hoverActionWrapper}>{hoverAction}</div>}
    </div>
);
