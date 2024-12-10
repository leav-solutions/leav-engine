// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SimpleFilterDropdown} from './SimpleFilterDropDown';
import {TextAttributeDropDown} from './TextAttributeDropDown';
import {IFilterDropDownProps} from '_ui/components/Explorer/_types';
import {AttributeFormat} from '_ui/_gqlTypes';
import {FunctionComponent} from 'react';

export const FilterDropDown: FunctionComponent<IFilterDropDownProps> = ({attribute, filter, onDeleteFilter}) => {
    switch (attribute.format) {
        case AttributeFormat.text:
        case AttributeFormat.rich_text:
            return <TextAttributeDropDown filter={filter} attribute={attribute} onDeleteFilter={onDeleteFilter} />;
        default:
            return <SimpleFilterDropdown filter={filter} attribute={attribute} onDeleteFilter={onDeleteFilter} />;
    }
};
