import {AttributeFormat} from '_ui/_gqlTypes';
import {type FunctionComponent, type MutableRefObject, type RefObject} from 'react';
import {BooleanAttributeDropDown} from './BooleanAttributeDropdown';
import {ColorAttributeDropDown} from './ColorAttributeDropDown';
import {DateAttributeDropDown} from './DateAttributeDropDown';
import {DateRangeAttributeDropDown} from './DateRangeAttributeDropDown';
import {EncryptedAttributeDropDown} from './EncryptedAttributeDropDown';
import {ExtendedAttributeDropDown} from './ExtendedAttributeDropDown';
import {LinkAttributeDropDown} from './LinkAttributeDropdown';
import {NumericAttributeDropDown} from './NumericAttributeDropDown';
import {TextAttributeDropDown} from './TextAttributeDropDown';
import {TreeAttributeDropDown} from './tree/TreeAttributeDropDown';
import {FilterValueListDropDown} from './FilterValueListDropDown';
import {
    isUIFilterLink,
    isUIFilterStandard,
    isUIFilterThrough,
    isUIFilterTree,
    isUIFilterValueList,
    isUIFilterWithSmartFilter,
    type UIFilter,
} from '../../_types';
import {SmartFilterAttributeDropdown} from './smart-filter/SmartFilterAttributeDropdown';

export const FilterDropdownContent: FunctionComponent<{
    filter: UIFilter;
    onFilterChange: (filterData: UIFilter) => void;
    selectDropDownRef?: RefObject<HTMLDivElement>;
    removeThroughCondition?: boolean;
    toggleHiddenRef?: MutableRefObject<((checked: boolean) => void) | null>;
    onPermissionConfiguredChange?: (isConfigured: boolean) => void;
}> = ({
    filter,
    onFilterChange,
    selectDropDownRef,
    removeThroughCondition = false,
    toggleHiddenRef,
    onPermissionConfiguredChange,
}) => {
    if (isUIFilterValueList(filter)) {
        return <FilterValueListDropDown filter={filter} onFilterChange={onFilterChange} />;
    }

    if (isUIFilterWithSmartFilter(filter)) {
        return <SmartFilterAttributeDropdown filter={filter} onFilterChange={onFilterChange} />;
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
                toggleHiddenRef={toggleHiddenRef}
                onPermissionConfiguredChange={onPermissionConfiguredChange}
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
