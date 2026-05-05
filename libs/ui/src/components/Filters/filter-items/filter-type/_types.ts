// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type MutableRefObject, type RefObject} from 'react';
import {
    type IUIFilterSmartFiler,
    type IUIFilterLink,
    type IUIFilterStandard,
    type IUIFilterThrough,
    type IUIFilterTree,
} from '../../_types';

export interface IFilterChildrenDropDownProps {
    filter: IUIFilterStandard;
    onFilterChange: (filterData: IUIFilterStandard) => void;
    selectDropDownRef?: RefObject<HTMLDivElement>;
}

export interface IFilterChildrenLinkDropDownProps {
    filter: IUIFilterLink | IUIFilterThrough;
    onFilterChange: (filterData: IUIFilterLink | IUIFilterThrough) => void;
    removeThroughCondition: boolean;
    selectDropDownRef?: RefObject<HTMLDivElement>;
}

export interface IFilterChildrenTreeDropDownProps {
    filter: IUIFilterTree;
    onFilterChange: (filterData: IUIFilterTree) => void;
    selectDropDownRef?: RefObject<HTMLDivElement>;
    toggleHiddenRef?: MutableRefObject<((checked: boolean) => void) | null>;
    onPermissionConfiguredChange?: (isConfigured: boolean) => void;
}

export interface IFilterChildrenSmartFilterDropDownProps {
    filter: IUIFilterSmartFiler;
    onFilterChange: (filterData: IUIFilterSmartFiler) => void;
    selectDropDownRef?: RefObject<HTMLDivElement>;
}
