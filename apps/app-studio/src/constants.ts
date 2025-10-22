// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

export const GLOBAL_BASE_URL = window.__global_base_url__?.replace(/\/$/, '') || '';
export const APP_BASE_URL = window.__dynamic_base__?.replace(/\/$/, '') || '/app/app-studio';

export const APP_ENDPOINT = APP_BASE_URL.split('/').findLast(e => e);
export const API_ENDPOINT = GLOBAL_BASE_URL ? `${GLOBAL_BASE_URL.replace(/^\//g, '')}/graphql` : 'graphql';

export const ORIGIN_URL = window.location.origin;
export const WS_URL = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;

export const FLAP_TARGET_ID = 'flap-target';
export const SIDE_PANEL_TARGET_ID = 'side-panel-target';
