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
