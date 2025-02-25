// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormat} from '_ui/_gqlTypes';
import {FunctionComponent, RefObject} from 'react';
import {BooleanAttributeDropDown} from './BooleanAttributeDropdown';
import {ColorAttributeDropDown} from './ColorAttributeDropDown';
import {DateAttributeDropDown} from './DateAttributeDropDown';
import {DateRangeAttributeDropDown} from './DateRangeAttributeDropDown';
import {EncryptedAttributeDropDown} from './EncryptedAttributeDropDown';
import {ExtendedAttributeDropDown} from './ExtendedAttributeDropDown';
import {LinkAttributeDropDown} from './LinkAttributeDropdown';
import {NumericAttributeDropDown} from './NumericAttributeDropDown';
import {TextAttributeDropDown} from './TextAttributeDropDown';
import {ExplorerFilter, isExplorerFilterLink, isExplorerFilterThrough, isExplorerFilterStandard} from '../../../_types';

export const FilterDropdownContent: FunctionComponent<{
    filter: ExplorerFilter;
    onFilterChange: (filterData: ExplorerFilter) => void;
    selectDropDownRef?: RefObject<HTMLDivElement>;
    removeThroughCondition?: boolean;
}> = ({filter, onFilterChange, selectDropDownRef, removeThroughCondition = false}) => {
    if (isExplorerFilterStandard(filter)) {
        const commonDropDownProps = {
            filter,
            onFilterChange,
            selectDropDownRef
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
            [AttributeFormat.date_range]: <DateRangeAttributeDropDown {...commonDropDownProps} />
        };
        return standardFormatDropdown[filter.attribute.format ?? AttributeFormat.text];
    }

    if (isExplorerFilterLink(filter) || isExplorerFilterThrough(filter)) {
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
