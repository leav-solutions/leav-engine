export const LOCAL_STORAGE_LANG_KEY = 'i18nextLng';

export const getLanguageRadical = (language: string) => language?.split('-')[0];

export const userLanguage = getLanguageRadical(localStorage.getItem(LOCAL_STORAGE_LANG_KEY) || navigator.language);
