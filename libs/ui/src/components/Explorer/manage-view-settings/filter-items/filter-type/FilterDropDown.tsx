// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IFilterDropDownProps} from '_ui/components/Explorer/_types';
import {AttributeFormat} from '_ui/_gqlTypes';
import {FunctionComponent} from 'react';
import {SimpleFilterDropdown} from './SimpleFilterDropDown';
import {TextAttributeDropDown} from './TextAttributeDropDown';
import {NumericAttributeDropDown} from './NumericAttributeDropDown';
import {BooleanAttributeDropDown} from './BooleanAttributeDropdown';
import {DateAttributeDropDown} from './DateAttributeDropDown';

export const FilterDropDown: FunctionComponent<IFilterDropDownProps> = ({filter}) => {
    switch (filter.attribute.format) {
        case AttributeFormat.numeric:
            return <NumericAttributeDropDown filter={filter} />;
        case AttributeFormat.date:
            return <DateAttributeDropDown filter={filter} />;
        case AttributeFormat.text:
        case AttributeFormat.rich_text:
            return <TextAttributeDropDown filter={filter} />;
        case AttributeFormat.boolean:
            return <BooleanAttributeDropDown filter={filter} />;
        default:
            return <SimpleFilterDropdown filter={filter} />;
    }
};
