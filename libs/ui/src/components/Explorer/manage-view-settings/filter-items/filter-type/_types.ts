// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IExplorerFilterStandard, IExplorerFilterLink, IExplorerFilterThrough} from '../../../_types';

export interface IFilterChildrenDropDownProps {
    filter: IExplorerFilterStandard;
    onFilterChange: (filterData: IExplorerFilterStandard) => void;
}

export interface IFilterChildrenLinkDropDownProps {
    filter: IExplorerFilterLink | IExplorerFilterThrough;
    onFilterChange: (filterData: IExplorerFilterLink | IExplorerFilterThrough) => void;
    removeThroughCondition: boolean;
}
