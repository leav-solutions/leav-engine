// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export const LOCAL_STORAGE_LANG_KEY = 'i18nextLng';

export const getLanguageRadical = (language: string) => language?.split('-')[0];

export const userLanguage = getLanguageRadical(localStorage.getItem(LOCAL_STORAGE_LANG_KEY) || navigator.language);
