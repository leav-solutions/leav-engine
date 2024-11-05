// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

export const ORIGIN_URL = window.location.origin;
export const APPS_ENDPOINT = 'app';
export const APP_ENDPOINT = window.location.pathname.split('/').filter(e => e)[1]; // Get endpoint app current from url /app/:endpoint

export const AUTH_URL = '/auth/authenticate';
export const RESET_PASSWORD_URL = '/auth/reset-password';
export const FORGOT_PASSWORD_URL = '/auth/forgot-password';
