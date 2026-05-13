export const GLOBAL_BASE_URL = window.__global_base_url__?.replace(/\/$/, '') || '';
export const APP_BASE_URL = window.__dynamic_base__?.replace(/\/$/, '') || '/app/app-studio';

export const APP_ENDPOINT = APP_BASE_URL.split('/').findLast(e => e);
export const API_ENDPOINT = GLOBAL_BASE_URL ? `${GLOBAL_BASE_URL.replace(/^\//g, '')}/graphql` : 'graphql';

export const ORIGIN_URL = window.location.origin;
export const WS_URL = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;

export const ATTRIBUTE_ID = 'id';

export const ACTIVITY_CENTER_TARGET_ID = 'activity-center-target';

export const FLAP_THREAD_PANEL_ID = 'thread';
export const FLAP_INFO_AND_HISTORY_PANEL_ID = 'info-history';

export const BLANK_PANEL_ID = 'blank';

export const WORKSPACE_PANEL_CONTAINER_ID = 'workspace-panel-container';
export const MODAL_EXTRA_RIGHT_PORTAL_ID = 'modal-extra-right-portal';

export const MIN_WORKSPACES_TO_SHOW_SEARCH = 10;
