// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitTypography} from 'aristid-ds';
import {historyCellContainer} from './historyCell.module.css';

export const HistoryCell = ({value}: {value: string | null | undefined}) => (
    <KitTypography.Text className={historyCellContainer} ellipsis>
        {value ?? ''}
    </KitTypography.Text>
);
