
import {APPS_ENDPOINT} from '@leav/ui';

const XSTREAM_ENDPOINT = window.location.pathname.split('/').filter(e => e.length > 0)[1]; // Get endpoint app current from url /APPS_ENDPOINT/:XSTREAM_ENDPOINT

export const BASENAME = import.meta.env.PROD ? `/${APPS_ENDPOINT}/${XSTREAM_ENDPOINT}` : '';