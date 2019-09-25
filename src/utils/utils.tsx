import {FormikErrors, FormikTouched} from 'formik';
import {i18n} from 'i18next';
import {get} from 'lodash';
import {TreeNode} from 'react-sortable-tree';
import removeAccents from 'remove-accents';
import {AvailableLanguage} from '../_gqlTypes/globalTypes';
import {IS_ALLOWED_isAllowed} from '../_gqlTypes/IS_ALLOWED';
import {IErrorByField} from '../_types/errors';

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

export const getSysTranslationQueryLanguage = (i18next: i18n): AvailableLanguage[] => {
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
/**
 *
 * @param str
 * @param format 'hsl' || 'rgb' || 'hex'
 * @param saturation in percent, default to 30
 * @param luminosity in percent, default to 80
 */
export const stringToColor = (str = '', format = 'hsl', saturation = 30, luminosity = 80): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        // tslint:disable-next-line: no-bitwise
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = hash % 360;
    switch (format) {
        case 'hex':
            return hslToHex(hue, saturation, luminosity);
        case 'rgb':
            const [r, g, b] = hslToRgb(hue, saturation, luminosity);
            return `rgb(${r},${g},${b})`;
        case 'hsl':
            return `hsl(${hue}, ${saturation}%, ${luminosity}%)`;
        default:
            return `hsl(${hue}, ${saturation}%, ${luminosity}%)`;
    }
};

const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) {
        t += 1;
    }
    if (t > 1) {
        t -= 1;
    }
    if (t < 1 / 6) {
        return p + (q - p) * 6 * t;
    }
    if (t < 1 / 2) {
        return q;
    }
    if (t < 2 / 3) {
        return p + (q - p) * (2 / 3 - t) * 6;
    }
    return p;
};

const hslToHex = (h: number, s: number, l: number): string => {
    const [r, g, b] = hslToRgb(h, s, l);
    const toHex = (x: number) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const hslToRgb = (h: number, s: number, l: number): number[] => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r: number;
    let g: number;
    let b: number;
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

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

export const permsArrayToObject = (perms: IS_ALLOWED_isAllowed[]): {[name: string]: boolean} => {
    return perms.reduce((allPerms, perm) => {
        allPerms[perm.name] = perm.allowed;

        return allPerms;
    }, {});
};

export function getFieldError<T>(
    fieldName: string,
    touchedFields: FormikTouched<T>,
    serverErrors: IErrorByField,
    inputErrors: FormikErrors<T>
): string {
    let inputFieldError = '';
    let serverFieldError = '';
    if (get(touchedFields, fieldName)) {
        inputFieldError = get(inputErrors, fieldName, '');
    }

    if (!!serverErrors) {
        serverFieldError = get(serverErrors, fieldName, '');
    }

    return inputFieldError || serverFieldError;
}
