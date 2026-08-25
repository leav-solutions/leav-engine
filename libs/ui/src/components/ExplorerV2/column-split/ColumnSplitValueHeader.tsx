import {memo} from 'react';
import {KitIdCard} from 'aristid-ds';
import {type IColumnSplitOption} from './_types';
import {columnSplitValueCard, columnSplitValueHeader} from './columnSplit.module.css';

/**
 * Keeps the labels of a group aligned when only SOME of its options carry a color: the DS reserves the
 * colour column of the grid only when `color` is set, so a colourless option among coloured ones gets a
 * transparent bar rather than none. Same trick as `cells/IdCard.tsx`.
 */
const NO_COLOR = 'transparent';

interface IColumnSplitValueHeaderProps {
    option: IColumnSplitOption;
    /** Whether ANY option of the group carries a colour — see `NO_COLOR`. */
    hasColoredOption: boolean;
}

/**
 * One split sub-column's header. `KitIdCard` gives the DS's own thin colour bar (3 px pill) and, through
 * `description` rather than `title`, the 12 px regular typography this row calls for (`title` is bold and
 * one size up — that is the group header's level). Ellipsis and tooltip-on-overflow come with it.
 */
export const ColumnSplitValueHeader = memo(({option, hasColoredOption}: IColumnSplitValueHeaderProps) => (
    <span className={columnSplitValueHeader}>
        <KitIdCard
            className={columnSplitValueCard}
            color={option.color ?? (hasColoredOption ? NO_COLOR : undefined)}
            description={option.label}
        />
    </span>
));
