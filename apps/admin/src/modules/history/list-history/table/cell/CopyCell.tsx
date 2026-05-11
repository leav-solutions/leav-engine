// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitSpace} from 'aristid-ds';
import {copyCellIcon} from './copyCell.module.css';
import {CopyButton} from '../../../../ui/button/CopyButton';

type CopyCellProps = {
    cellName: string;
    value: string;
};

export const CopyCell = ({cellName, value}: CopyCellProps) => (
    <KitSpace direction="horizontal" size="s">
        {value}
        <CopyButton className={copyCellIcon} title={cellName} value={value} />
    </KitSpace>
);
