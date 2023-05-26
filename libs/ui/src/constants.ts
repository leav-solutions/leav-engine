// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3

import {TagProps} from 'antd';
import {AttributeFormat, AttributeType} from './_gqlTypes';

// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export enum PreviewSize {
    tiny = 'tiny',
    small = 'small',
    medium = 'medium',
    big = 'big'
}

export const tagColorByAttributeType: {[key in AttributeType]: TagProps['color']} = {
    [AttributeType.simple]: 'purple',
    [AttributeType.simple_link]: 'blue',
    [AttributeType.advanced]: 'orange',
    [AttributeType.advanced_link]: 'volcano',
    [AttributeType.tree]: 'green'
};

export const tagColorByAttributeFormat: {[key in AttributeFormat]: TagProps['color']} = {
    [AttributeFormat.boolean]: 'gold',
    [AttributeFormat.date]: 'blue',
    [AttributeFormat.date_range]: 'geekblue',
    [AttributeFormat.encrypted]: 'red',
    [AttributeFormat.extended]: 'magenta',
    [AttributeFormat.numeric]: 'orange',
    [AttributeFormat.text]: 'green'
};
