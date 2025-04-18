// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from 'graphql-tag';
import {AvailableLanguage} from '../_types/types';
import {APPS_ENDPOINT} from '@leav/ui';

const XSTREAM_ENDPOINT = window.location.pathname.split('/').filter(e => e.length > 0)[1]; // Get endpoint app current from url /APPS_ENDPOINT/:XSTREAM_ENDPOINT

const BASENAME = import.meta.env.PROD ? `/${APPS_ENDPOINT}/${XSTREAM_ENDPOINT}` : `/${APPS_ENDPOINT}/${XSTREAM_ENDPOINT}`;

export const localizedTranslation = (translations: any, availableLanguages: AvailableLanguage[] | string[]): string => {
    if (!translations) {
        return '';
    }

    const userLang = availableLanguages[0];
    const fallbackLang = availableLanguages[1] ?? '';

    return translations[userLang] || translations[fallbackLang] || translations[Object.keys(translations)[0]] || '';
};

/**
 * Cloning gql template tag because some apollo tools like query validation and codegen won't be happy if we use
 * interpolation in template strings. With a different tag name, the query won't be parsed by these tools
 * thus they won't complain about it.
 * It works exactly the same at runtime.
 */
export const gqlUnchecked = gql;

export const getAssetPath = (path: string) => `${BASENAME}/${path}`;
