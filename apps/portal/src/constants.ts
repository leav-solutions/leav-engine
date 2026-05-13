export const GLOBAL_BASE_URL = window.__global_base_url__?.replace(/\/$/, '') || '';
export const APP_BASE_URL = window.__dynamic_base__?.replace(/\/$/, '') || '/app/portal';

export const APP_ENDPOINT = APP_BASE_URL.split('/').findLast(e => e);
export const API_ENDPOINT = GLOBAL_BASE_URL ? `${GLOBAL_BASE_URL.replace(/^\//g, '')}/graphql` : 'graphql';

export const ORIGIN_URL = window.location.origin;
export const WS_URL = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;

export const UNAUTHENTICATED = 'UNAUTHENTICATED';
