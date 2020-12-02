// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {ILang} from '../../../_types/types';

export interface IGetLangAll {
    lang: ILang;
    availableLangs: string[];
    defaultLang: string;
}

export const getLangAll = gql`
    query GET_LANG_ALL {
        lang @client
        availableLangs @client
        defaultLang @client
    }
`;

export interface IGetLangAndDefaultLang {
    lang: ILang;
    defaultLang: string;
}

export const getLangAndDefaultLang = gql`
    query GET_LANG_AND_DEFAULT_LANG {
        lang @client
        defaultLang @client
    }
`;

export interface IGetLang {
    lang: ILang;
}

export const getLang = gql`
    query GET_LANG {
        lang @client
    }
`;

export interface IGetDefaultLang {
    defaultLang: string;
}

export const getDefaultLang = gql`
    query GET_DEFAULT_LANG {
        defaultLang @client
    }
`;

export interface IGetAvailableLangs {
    lang: ILang;
    availableLangs: string[];
}

export const getAvailableLangs = gql`
    query GET_AVAILABLE_LANGS {
        availableLangs @client
        lang @client
    }
`;
