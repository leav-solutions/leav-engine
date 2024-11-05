// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
