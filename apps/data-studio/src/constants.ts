// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

export const API_ENDPOINT = 'graphql';
export const ORIGIN_URL = window.location.origin;
export const WS_URL = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;

export const UNAUTHENTICATED = 'UNAUTHENTICATED';

export const FAVORITE_LIBRARIES_KEY = 'favorites_libraries_ids';
export const FAVORITE_TREES_KEY = 'favorites_trees_ids';
