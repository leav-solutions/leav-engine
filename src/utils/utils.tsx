import {i18n} from 'i18next';

/**
 * Return label matching user language (or default language) from an object containing all languages labels
 *
 * @param labels
 * @param i18next
 */
export const localizedLabel = (labels: any, i18next: i18n): string => {
    if (labels === null) {
        return '';
    }

    const userLang = i18next.language;
    const fallbackLang = i18next.options.fallbackLng ? i18next.options.fallbackLng[0] : '';

    return labels[userLang] || labels[fallbackLang] || labels[Object.keys(labels)[0]] || '';
};

export const getSysTranslationQueryLanguage = (i18next: i18n) => {
    const userLang = i18next.language;
    const fallbackLang = i18next.options.fallbackLng ? i18next.options.fallbackLng[0] : '';

    return [userLang, fallbackLang];
};
