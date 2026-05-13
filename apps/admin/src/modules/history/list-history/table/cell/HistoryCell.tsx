import {KitTypography} from 'aristid-ds';
import {historyCellContainer} from './historyCell.module.css';

export const HistoryCell = ({value}: {value: string | null | undefined}) => (
    <KitTypography.Text className={historyCellContainer} ellipsis>
        {value ?? ''}
    </KitTypography.Text>
);
