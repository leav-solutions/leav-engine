// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3

import {TagProps} from 'antd';
import {KitTag} from 'aristid-ds';
import {ComponentProps} from 'react';
import {AttributeFormat, AttributeType} from './_gqlTypes';

// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export enum PreviewSize {
    tiny = 'tiny',
    small = 'small',
    medium = 'medium',
    big = 'big'
}

export const tagColorByAttributeType: {[key in AttributeType]: ComponentProps<typeof KitTag>['color']} = {
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
    [AttributeFormat.text]: 'green',
    [AttributeFormat.color]: 'purple',
    [AttributeFormat.rich_text]: 'volcano'
};

export enum ErrorDisplayTypes {
    ERROR = 'error',
    PERMISSION_ERROR = 'permission_error',
    PAGE_NOT_FOUND = 'page_not_found_error'
}

export const defaultPaginationPageSize = 20;

export const APPS_ENDPOINT = 'app';
export const APP_ENDPOINT = window.location.pathname.split('/').filter(e => e)[1]; // Get endpoint app current from url /APPS_ENDPOINT/:endpoint
