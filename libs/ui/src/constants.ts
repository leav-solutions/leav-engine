// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
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

export const tagColorByAttributeType: {[key in AttributeType]: [border: string, background: string]} = {
    [AttributeType.simple]: ['purple', '#ffe5ff'],
    [AttributeType.simple_link]: ['blue', '#e5e5ff'],
    [AttributeType.advanced]: ['orange', '#fff6e5'],
    [AttributeType.advanced_link]: ['#d4380d', '#fde4dd'],
    [AttributeType.tree]: ['green', '#e5ffe5']
};

export const tagColorByAttributeFormat: {[key in AttributeFormat]: [border: string, background: string]} = {
    [AttributeFormat.boolean]: ['gold', '#fff099'],
    [AttributeFormat.date]: ['blue', '#e5e5ff'],
    [AttributeFormat.date_range]: ['#1d39c4', '#e9ecfc'],
    [AttributeFormat.encrypted]: ['red', '#ffe5e5'],
    [AttributeFormat.extended]: ['magenta', '#ffe5e5'],
    [AttributeFormat.numeric]: ['orange', '#fff6e5'],
    [AttributeFormat.text]: ['green', '#e5ffe5'],
    [AttributeFormat.color]: ['purple', '#ffe5ff'],
    [AttributeFormat.rich_text]: ['#d4380d', '#fde4dd']
};

export enum ErrorDisplayTypes {
    ERROR = 'error',
    PERMISSION_ERROR = 'permission_error',
    PAGE_NOT_FOUND = 'page_not_found_error'
}

export const defaultPaginationPageSize = 20;

export const APPS_ENDPOINT = 'app';
export const APP_ENDPOINT = window.location.pathname.split('/').filter(e => e)[1]; // Get endpoint app current from url /APPS_ENDPOINT/:endpoint

export const PREFIX_USER_VIEWS_ORDER_KEY = 'user_views_order_';
export const PREFIX_SHARED_VIEWS_ORDER_KEY = 'shared_views_order_';
