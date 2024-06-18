// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

export const API_ENDPOINT = 'graphql';

export const ORIGIN_URL = window.location.origin;
export const WS_URL = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;
export const APP_ENDPOINT = window.location.pathname.split('/').filter(e => e)[1]; // Get endpoint app current from url /APPS_ENDPOINT/:endpoint

export const UNAUTHENTICATED = 'UNAUTHENTICATED';
