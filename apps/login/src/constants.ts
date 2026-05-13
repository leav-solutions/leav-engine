export const GLOBAL_BASE_URL = window.__global_base_url__?.replace(/\/$/, '') || '';
export const APP_BASE_URL = window.__dynamic_base__?.replace(/\/$/, '') || '/app/login';

export const AUTH_URL = GLOBAL_BASE_URL + '/auth/authenticate';
export const RESET_PASSWORD_URL = GLOBAL_BASE_URL + '/auth/reset-password';
export const FORGOT_PASSWORD_URL = GLOBAL_BASE_URL + '/auth/forgot-password';
