// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {APPS_ENDPOINT} from '@leav/ui';

const XSTREAM_ENDPOINT = window.location.pathname.split('/').filter(e => e.length > 0)[1]; // Get endpoint app current from url /APPS_ENDPOINT/:XSTREAM_ENDPOINT

export const BASENAME = import.meta.env.PROD ? `/${APPS_ENDPOINT}/${XSTREAM_ENDPOINT}` : '';
