// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitTooltip} from 'aristid-ds';
import {useRef, useState} from 'react';
import {historyCellContainer} from './historyCell.module.css';
import {TOOLTIP_DEFAULT_DELAY_IN_SECONDS} from '@leav/ui';

type HistoryCellProps = {
    value: string;
};

export const HistoryCell = ({value}: HistoryCellProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isTruncated, setIsTruncated] = useState(false);

    const handleMouseEnter = () => {
        if (ref.current) {
            setIsTruncated(ref.current.scrollWidth > ref.current.clientWidth);
        }
    };

    return (
        <KitTooltip title={isTruncated ? value : null} mouseEnterDelay={TOOLTIP_DEFAULT_DELAY_IN_SECONDS}>
            <div ref={ref} className={historyCellContainer} onMouseEnter={handleMouseEnter}>
                {value}
            </div>
        </KitTooltip>
    );
};
