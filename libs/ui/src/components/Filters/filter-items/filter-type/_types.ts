import {type MutableRefObject, type RefObject} from 'react';
import {
    type IUIFilterSmartFilter,
    type IUIFilterLink,
    type IUIFilterStandard,
    type IUIFilterThrough,
    type IUIFilterTree,
} from '../../_types';

export interface IFilterChildrenDropDownProps {
    filter: IUIFilterStandard;
    onFilterChange: (filterData: IUIFilterStandard) => void;
    selectDropDownRef?: RefObject<HTMLDivElement>;
    allowClearCondition?: boolean;
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
    filter: IUIFilterSmartFilter;
    onFilterChange: (filterData: IUIFilterSmartFilter) => void;
    selectDropDownRef?: RefObject<HTMLDivElement>;
}
