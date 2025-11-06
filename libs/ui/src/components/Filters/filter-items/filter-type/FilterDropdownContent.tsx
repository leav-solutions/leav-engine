// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormat} from '_ui/_gqlTypes';
import {type FunctionComponent, type RefObject} from 'react';
import {BooleanAttributeDropDown} from './BooleanAttributeDropdown';
import {ColorAttributeDropDown} from './ColorAttributeDropDown';
import {DateAttributeDropDown} from './DateAttributeDropDown';
import {DateRangeAttributeDropDown} from './DateRangeAttributeDropDown';
import {EncryptedAttributeDropDown} from './EncryptedAttributeDropDown';
import {ExtendedAttributeDropDown} from './ExtendedAttributeDropDown';
import {LinkAttributeDropDown} from './LinkAttributeDropdown';
import {NumericAttributeDropDown} from './NumericAttributeDropDown';
import {TextAttributeDropDown} from './TextAttributeDropDown';
import {TreeAttributeDropDown} from './TreeAttributeDropDown';
import {FilterValueListDropDown} from './FilterValueListDropDown';
import {
    isUIFilterLink,
    isUIFilterStandard,
    isUIFilterThrough,
    isUIFilterTree,
    isUIFilterValueList,
    type UIFilter,
} from '../../_types';

export const FilterDropdownContent: FunctionComponent<{
    filter: UIFilter;
    onFilterChange: (filterData: UIFilter) => void;
    selectDropDownRef?: RefObject<HTMLDivElement>;
    removeThroughCondition?: boolean;
}> = ({filter, onFilterChange, selectDropDownRef, removeThroughCondition = false}) => {
    if (isUIFilterValueList(filter)) {
        return (
            <FilterValueListDropDown
                filter={filter}
                onFilterChange={onFilterChange}
                selectDropDownRef={selectDropDownRef}
            />
        );
    }

    if (isUIFilterStandard(filter)) {
        const commonDropDownProps = {
            filter,
            onFilterChange,
            selectDropDownRef,
        };
        const standardFormatDropdown: Record<AttributeFormat, JSX.Element> = {
            [AttributeFormat.text]: <TextAttributeDropDown {...commonDropDownProps} />,
            [AttributeFormat.rich_text]: <TextAttributeDropDown {...commonDropDownProps} />,
            [AttributeFormat.numeric]: <NumericAttributeDropDown {...commonDropDownProps} />,
            [AttributeFormat.date]: <DateAttributeDropDown {...commonDropDownProps} />,
            [AttributeFormat.boolean]: <BooleanAttributeDropDown {...commonDropDownProps} />,
            [AttributeFormat.encrypted]: <EncryptedAttributeDropDown {...commonDropDownProps} />,
            [AttributeFormat.extended]: <ExtendedAttributeDropDown {...commonDropDownProps} />,
            [AttributeFormat.color]: <ColorAttributeDropDown {...commonDropDownProps} />,
            [AttributeFormat.date_range]: <DateRangeAttributeDropDown {...commonDropDownProps} />,
        };
        return standardFormatDropdown[filter.attribute.format ?? AttributeFormat.text];
    }

    if (isUIFilterTree(filter)) {
        return (
            <TreeAttributeDropDown
                filter={filter}
                onFilterChange={onFilterChange}
                selectDropDownRef={selectDropDownRef}
            />
        );
    }

    if (isUIFilterLink(filter) || isUIFilterThrough(filter)) {
        return (
            <LinkAttributeDropDown
                filter={filter}
                onFilterChange={onFilterChange}
                removeThroughCondition={removeThroughCondition}
                selectDropDownRef={selectDropDownRef}
            />
        );
    }

    return <></>;
};
