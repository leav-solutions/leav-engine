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
