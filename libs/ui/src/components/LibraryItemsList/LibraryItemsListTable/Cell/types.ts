import {ValueDetailsLinkValueFragment, ValueDetailsTreeValueFragment, ValueDetailsValueFragment} from '_ui/_gqlTypes';
import {ITableCell} from '_ui/types';

export type SimpleCellValue = ValueDetailsValueFragment;
export type SimpleCellValues = SimpleCellValue[];

export type LinkCellValue = ValueDetailsLinkValueFragment;
export type LinkCellValues = LinkCellValue[];

export type TreeCellValue = ValueDetailsTreeValueFragment;
export type TreeCellValues = TreeCellValue[];

export interface ISimpleCellProps {
    cellData: ITableCell;
    values: SimpleCellValues;
}
