import {i18n} from 'i18next';
import {TreeNode} from 'react-sortable-tree';
import removeAccents from 'remove-accents';

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
    const userLang = i18next.language.split('-')[0];
    const fallbackLang = i18next.options.fallbackLng ? i18next.options.fallbackLng[0] : '';

    return [userLang, fallbackLang];
};

export const formatIDString = (s: string): string => {
    return removeAccents(s)
        .toLowerCase()
        .replace(/\W/g, ' ') // Convert any non-word character to space (anything not a letter, a _ or a number)
        .trim() // Trim spaces
        .replace(/ /g, '_') // Convert spaces to _
        .replace(/(_){2,}/g, '_'); // Remove any __, ___, ....
};

/**
 * Add wildcards (%) around filter values. By default process only label and id
 */
export const addWildcardToFilters = (filters, keysToProcess = ['label', 'id']) => {
    return Object.keys(filters).reduce((allFilters, k) => {
        const val = keysToProcess.indexOf(k) !== -1 ? '%' + filters[k] + '%' : filters[k];

        allFilters[k] = val;

        return allFilters;
    }, {});
};

export const getRandomColor = (): string =>
    '#' +
    Math.random()
        .toString(16)
        .substr(-6);

export const getInvertColor = (color: string): string => {
    const hexcolor = color.replace(/#/g, '');
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;

    return yiq >= 128 ? '#000000' : '#FFFFFF';
};

export const getTreeNodeKey = (nodeData: TreeNode | null) =>
    nodeData ? nodeData.node.library.id + '/' + nodeData.node.id : '';
