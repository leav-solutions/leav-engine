import {type TableColumnsType} from 'antd';
import cn from 'classnames';
import {type FieldSubmitMultipleFunc} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {type useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {NO_ROW_CLICK_CLASSNAME} from '../_constants';
import {type AttributeProperties, type IItemData} from '../_types';
import {type IColumnSplitOption} from './_types';
import {type IOptimisticSplitValues} from './useOptimisticSplitValues';
import {getSelectedKeys} from './getValueKeys';
import {ColumnSplitCell} from './ColumnSplitCell';
import {ColumnSplitHeader} from './ColumnSplitHeader';
import {ColumnSplitValueHeader} from './ColumnSplitValueHeader';
import {
    columnSplitCell,
    columnSplitFirst,
    columnSplitGroupCell,
    columnSplitGroupRightEdge,
    columnSplitLast,
    columnSplitOuterEnd,
} from './columnSplit.module.css';

const SPLIT_COLUMN_WIDTH = '10ch';

interface IBuildSplitColumnGroupParams {
    attribute: AttributeProperties;
    /** Non-empty: `TableView` keeps the plain column when the attribute resolves no option. */
    options: IColumnSplitOption[];
    /** Only the write side of the overlay: the read side travels in the items themselves. */
    optimisticSplitValues: Pick<IOptimisticSplitValues, 'setOptimisticKeys' | 'clearOptimisticKeys'>;
    isEditionDisabled: boolean;
    /** Whether `isEditionDisabled` just flipped — see the `shouldCellUpdate` below. */
    hasEditionDisabledChanged: boolean;
    /** The group is the table's last column: the table's own edge already closes the group there. */
    isLastColumn: boolean;
    /** The next column is another split group: its own left edge already closes this one. */
    isFollowedBySplitColumn: boolean;
    onCollapse: () => void;
    /** Write dependencies of the cells, resolved once in `TableView` (one Apollo mutation instance for
     *  the whole table instead of one per cell) and threaded down to `ColumnSplitCell`. */
    saveValues: FieldSubmitMultipleFunc;
    t: ReturnType<typeof useSharedTranslation>['t'];
}

/**
 * Builds ONE antd column group (`{title, children}`) to insert in place of the plain column of a split
 * attribute.
 *
 * ⚠️ antd flattens leaf columns into plain `<td>`: there is no DOM wrapper around a group in the table
 * body. The group's left/right borders can therefore only be drawn by stamping a className on the FIRST
 * and LAST child columns (a group's own className is NOT inherited by its children — see the cadrage
 * reference, xstream `modules/table/utils.ts`).
 */
export const buildSplitColumnGroup = ({
    attribute,
    options,
    optimisticSplitValues,
    isEditionDisabled,
    hasEditionDisabledChanged,
    isLastColumn,
    isFollowedBySplitColumn,
    onCollapse,
    saveValues,
    t,
}: IBuildSplitColumnGroupParams): TableColumnsType<IItemData>[number] => {
    // Nobody stacks two 1px borders: the group's right edge is skipped whenever something else
    // already draws that line — the table's own edge on the last column, the next group's left edge
    // when two groups are adjacent.
    const drawsRightEdge = !isLastColumn && !isFollowedBySplitColumn;
    // Resolved once for the whole group: a colourless option among coloured ones still reserves the
    // colour bar's slot, so every label of the group starts on the same x (see ColumnSplitValueHeader).
    const hasColoredOption = options.some(option => Boolean(option.color));

    return {
        className: cn(columnSplitGroupCell, {[columnSplitGroupRightEdge]: drawsRightEdge}),
        title: () => <ColumnSplitHeader label={attribute.label} isSplit onToggle={onCollapse} />,
        children: options.map((option, index) => ({
            key: `${attribute.id}__${option.key}`,
            title: () => <ColumnSplitValueHeader option={option} hasColoredOption={hasColoredOption} />,
            width: SPLIT_COLUMN_WIDTH,
            align: 'center' as const,
            className: cn(columnSplitCell, NO_ROW_CLICK_CLASSNAME, {
                [columnSplitFirst]: index === 0,
                [columnSplitLast]: index === options.length - 1 && drawsRightEdge,
                [columnSplitOuterEnd]: isLastColumn && index === options.length - 1,
            }),
            shouldCellUpdate: (record: IItemData, prevRecord: IItemData) =>
                hasEditionDisabledChanged ||
                record.propertiesById[attribute.id] !== prevRecord.propertiesById[attribute.id] ||
                record.optimisticSplitKeys?.[attribute.id] !== prevRecord.optimisticSplitKeys?.[attribute.id],
            render: (_: unknown, item: IItemData) => (
                <ColumnSplitCell
                    item={item}
                    attribute={attribute}
                    option={option}
                    selectedKeys={getSelectedKeys(item, attribute)}
                    disabled={isEditionDisabled || !attribute.permissions.edit_value}
                    setOptimisticKeys={optimisticSplitValues.setOptimisticKeys}
                    clearOptimisticKeys={optimisticSplitValues.clearOptimisticKeys}
                    saveValues={saveValues}
                    t={t}
                />
            ),
        })),
    };
};
