import {TreeNode} from '@casolutions/react-sortable-tree';
import {FormikErrors, FormikTouched} from 'formik';
import gql from 'graphql-tag';
import {i18n} from 'i18next';
import get from 'lodash/get';
import {join} from 'path';
import removeAccents from 'remove-accents';
import {
    GET_ATTRIBUTES_attributes_list,
    GET_ATTRIBUTES_attributes_list_LinkAttribute,
    GET_ATTRIBUTES_attributes_list_TreeAttribute
} from '../_gqlTypes/GET_ATTRIBUTES';
import {AttributeType, AvailableLanguage, TreeElementInput} from '../_gqlTypes/globalTypes';
import {IS_ALLOWED_isAllowed} from '../_gqlTypes/IS_ALLOWED';
import {IErrorByField} from '../_types/errors';
import {IGenericValue, ILinkValue, ITreeLinkValue, IValue} from '../_types/records';
import {IKeyValue} from '../_types/shared';

export const localizedLabel = (labels: any, availableLanguages: AvailableLanguage[]): string => {
    if (labels === null) {
        return '';
    }
    const userLang = availableLanguages[0];
    const fallbackLang = availableLanguages[1] ? availableLanguages[1] : '';

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
        // eslint-disable-next-line no-bitwise
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

export function versionObjToGraphql(version: {
    [treeName: string]: TreeElementInput;
}): Array<{name: string; value: TreeElementInput}> {
    const gqlVersions: Array<{name: string; value: TreeElementInput}> = [];
    for (const versionName of Object.keys(version)) {
        gqlVersions.push({name: versionName, value: version[versionName]});
    }

    return gqlVersions;
}

export function isLinkAttribute(
    attribute: GET_ATTRIBUTES_attributes_list,
    strict: boolean = true
): attribute is GET_ATTRIBUTES_attributes_list_LinkAttribute {
    const linkTypes = [AttributeType.advanced_link, AttributeType.simple_link];

    if (!strict) {
        linkTypes.push(AttributeType.tree);
    }

    return linkTypes.includes(attribute.type);
}

export function isTreeAttribute(
    attribute: GET_ATTRIBUTES_attributes_list
): attribute is GET_ATTRIBUTES_attributes_list_TreeAttribute {
    return attribute.type === AttributeType.tree;
}

export const clearCacheQueriesFromRegexp = (cache, regexp) => {
    Object.keys(cache.data.data).forEach(key => key.match(regexp) && cache.data.delete(key));
};

export function getRecordIdentityCacheKey(libId: string, recordId: string): string {
    return `recordIdentity/${libId}/${recordId}`;
}

/*** Values type guards ***/
export const isStandardValue = (value: IGenericValue): value is IValue => {
    return typeof (value as IValue).value !== 'undefined';
};

export const isLinkValue = (value: IGenericValue): value is ILinkValue => {
    return typeof (value as ILinkValue).linkValue !== 'undefined';
};

export const isTreeValue = (value: IGenericValue): value is ITreeLinkValue => {
    return typeof (value as ITreeLinkValue).treeValue !== 'undefined';
};

export const isValueNull = (val: IGenericValue): boolean => {
    return (
        (isStandardValue(val) && val.value === null) ||
        (isLinkValue(val) && val.linkValue === null) ||
        (isTreeValue(val) && val.treeValue === null)
    );
};

export const urlCore = process.env.REACT_APP_CORE_URL || '';

export const getAbsoluteUrlCore = (relativeUrl: string) => {
    return join(urlCore, relativeUrl).replace(':/', '://');
};
/*************/

/** Convert an array to an object, using given field as key **/
export function arrayToObj<T>(arr: T[], keyField: string): IKeyValue<T> {
    return arr.reduce((acc, cur) => {
        acc[cur[keyField]] = cur;

        return acc;
    }, {});
}

/** Delete given keys from object */
export function omit<T extends object, K extends keyof T>(o: T, keysToDelete: K[]): Omit<T, K> {
    const newObj = {...o};
    for (const key of [...keysToDelete]) {
        delete newObj[key];
    }

    return newObj;
}

/**
 * Pick given keys from each array element.
 * If key is an array, return objects otherwise, return values directly  */
export function arrayPick<T extends object, K extends keyof T>(arr: T[], keys: K): Array<T[K]>;
export function arrayPick<T extends object, K extends keyof T>(arr: T[], keys: K[]): Array<Pick<T, K>>;
export function arrayPick<T extends object, K extends keyof T>(arr: T[], keys: K | K[]): Array<T[K] | Pick<T, K>> {
    return arr.map(item => {
        if (typeof keys === 'string') {
            return pick(item, keys as K);
        }

        return pick(item, keys as K[]);
    });
}

/**
 * Pick given key from object.
 * If keys is an array, return an object otherwise return value directly
 *
 * @param obj
 * @param keys
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K): T[K];
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
export function pick<T extends object, K extends keyof T>(obj: T, keys: K | K[]): T[K] | Pick<T, K> {
    if (typeof keys === 'string') {
        return obj[keys];
    }

    const newObj = Object.keys(obj).reduce((acc, cur: string) => {
        if ((keys as string[]).includes(cur)) {
            acc[cur] = obj[cur];
        }

        return acc;
    }, {});

    return newObj as Pick<T, K>;
}

/**
 * Cloning gql template tag because some apollo tools like query validation and codegen won't be happy if we use
 * interpolation in template strings. With a different tag name, the query won't be parsed by these tools
 * thus they won't complain about it.
 * It works exactly the same at runtime.
 */
export const gqlUnchecked = gql;
