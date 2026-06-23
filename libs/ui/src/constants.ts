import {type IconDefinition} from '@fortawesome/fontawesome-svg-core';
import {faArrowDownWideShort, faBookmark, faFilter, faTable} from '@fortawesome/free-solid-svg-icons';
import type * as z from 'zod/v4';
import {AttributeFormat, AttributeType} from './_gqlTypes';
import {type ViewSettingsTabSchema} from './hooks/usePanelMessenger/schema';

export enum PreviewSize {
    TINY = 'tiny',
    SMALL = 'small',
    MEDIUM = 'medium',
    BIG = 'big',
}

export const ACTIVE_ATTRIBUTE_ID = 'active';

export const tagColorByAttributeType: {[key in AttributeType]: [border: string, background: string]} = {
    [AttributeType.simple]: ['purple', '#ffe5ff'],
    [AttributeType.simple_link]: ['blue', '#e5e5ff'],
    [AttributeType.advanced]: ['orange', '#fff6e5'],
    [AttributeType.advanced_link]: ['#d4380d', '#fde4dd'],
    [AttributeType.tree]: ['green', '#e5ffe5'],
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
    [AttributeFormat.rich_text]: ['#d4380d', '#fde4dd'],
};

export enum ErrorDisplayTypes {
    ERROR = 'error',
    PERMISSION_ERROR = 'permission_error',
    PAGE_NOT_FOUND = 'page_not_found_error',
}

declare global {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Window {
        __dynamic_base__?: string;
        __global_base_url__?: string;
        __bugsnag_api_key__?: string;
        __bugsnag_app_version__?: string;
        __bugsnag_release_stage__?: string;
    }
}

export const defaultPaginationPageSize = 20;

export const GLOBAL_BASE_URL = window.__global_base_url__ || '';

/**
 * Canonical, order-sensitive list of the view-settings tabs/shortcuts, shared between
 * app-studio's settings panel (sidebar tab order) and ExplorerV2's shortcut buttons
 * (canonical button order). Each consumer adds its own label (the i18n namespaces differ).
 */
export const VIEW_SETTINGS_TABS = [
    {key: 'catalog', icon: faBookmark},
    {key: 'display', icon: faTable},
    {key: 'filters', icon: faFilter},
    {key: 'sorts', icon: faArrowDownWideShort},
] as const satisfies ReadonlyArray<{key: z.infer<typeof ViewSettingsTabSchema>; icon: IconDefinition}>;

export const PREFIX_USER_VIEWS_ORDER_KEY = 'user_views_order_';
export const PREFIX_SHARED_VIEWS_ORDER_KEY = 'shared_views_order_';

export const INFO_NOTIFICATION_DURATION = 5_000;
export const ERROR_NOTIFICATION_DURATION = 5_000;
export const SUCCESS_NOTIFICATION_DURATION = 5_000;
export const SUBSCRIPTION_NOTIFICATION_DURATION = 10_000;

export const SUCCESS_ALERT_DURATION = 3_000;
export const ERROR_ALERT_DURATION = 5_000;

export const EDIT_RECORD_SIDEBAR_ID = 'edit_record_sidebar';

export const STANDARD_FIELD_ID_PREFIX = 'standardfield-';

export const LINK_FIELD_ID_PREFIX = 'linkfield-';

export const TREE_FIELD_ID_PREFIX = 'treefield-';

export const SUBMIT_BUTTONS_PORTAL = 'submit_buttons_portal';
export const NEW_RECORD_ID = 'newRecord';

export const BREAK_TWO_LINES = '\n\n';

export const NOTIFICATION_POPUP_TRACKING_SOURCE = 'Source : Notification pop up';
export const NOTIFICATION_CENTER_TRACKING_SOURCE = 'Source : Centre de notifications';
