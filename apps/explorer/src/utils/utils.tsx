// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from 'graphql-tag';
import {i18n} from 'i18next';
import {isString, pick} from 'lodash';
import {attributeExtendedKey, infosCol} from '../constants/constants';
import {GET_ATTRIBUTES_BY_LIB_attributes_list} from '../_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {
    AttributeFormat,
    AttributeType,
    AvailableLanguage,
    ConditionFilter,
    DisplaySize,
    ExtendFormat,
    FilterTypes,
    IAttribute,
    IEmbeddedFields,
    IFilter,
    IFilterSeparator,
    INotification,
    IQueryFilter,
    ISelectedAttribute,
    NotificationPriority,
    OperatorFilter,
    PreviewAttributes,
    PreviewSize
} from '../_types/types';

export function getRecordIdentityCacheKey(libId: string, recordId: string): string {
    return `recordIdentity/${libId}/${recordId}`;
}

export function getFileUrl(filepath: string) {
    const url = process.env.REACT_APP_CORE_URL;
    return url + filepath;
}

export const getInvertColor = (color: string): string => {
    const hexColor = color.replace(/#/g, '');
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;

    return yiq >= 128 ? '#000000' : '#FFFFFF';
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

export function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export const getPreviewSizes = (): PreviewAttributes[] => {
    return Object.keys(PreviewAttributes).filter(previewAttribute => !(Number(previewAttribute) + 1)) as any;
};

export const localizedLabel = (labels: any, availableLanguages: AvailableLanguage[] | string[]): string => {
    if (!labels) {
        return '';
    }
    const userLang = availableLanguages[0];
    const fallbackLang = availableLanguages[1] ? availableLanguages[1] : '';

    return labels[userLang] || labels[fallbackLang] || labels[Object.keys(labels)[0]] || '';
};

export const getSysTranslationQueryLanguage = (i18next: i18n): AvailableLanguage[] => {
    const userLang = i18next.language
        ? i18next.language.split('-')[0]
        : AvailableLanguage[process.env.REACT_APP_DEFAULT_LANG as AvailableLanguage] ?? AvailableLanguage.en;
    const fallbackLang = i18next.options?.fallbackLng ? (i18next as any).options.fallbackLng[0] : '';

    return [userLang, fallbackLang];
};

export const allowedTypeOperator = {
    [AttributeFormat.text]: [
        ConditionFilter.contains,
        ConditionFilter.notContains,
        ConditionFilter.equal,
        ConditionFilter.notEqual,
        ConditionFilter.beginWith,
        ConditionFilter.endWith
    ],
    [AttributeFormat.numeric]: [
        ConditionFilter.equal,
        ConditionFilter.notEqual,
        ConditionFilter.greaterThan,
        ConditionFilter.lessThan
    ],
    [AttributeFormat.boolean]: [ConditionFilter.equal, ConditionFilter.notEqual],
    [AttributeFormat.date]: [
        ConditionFilter.equal,
        ConditionFilter.notEqual,
        ConditionFilter.greaterThan,
        ConditionFilter.lessThan
    ]
};

export const checkTypeIsLink = (type: AttributeType) => {
    if (type === AttributeType.simple_link || type === AttributeType.advanced_link) {
        return true;
    } else {
        return false;
    }
};

export const displayTypeToPreviewSize = (displayType: DisplaySize) => {
    switch (displayType) {
        case DisplaySize.small:
            return PreviewSize.small;
        case DisplaySize.medium:
            return PreviewSize.medium;
        case DisplaySize.big:
            return PreviewSize.big;
        default:
            return PreviewSize.small;
    }
};

export const getSortFieldByAttributeType = (attributeId: string, type: AttributeType) => {
    attributeId = infosCol === attributeId ? 'id' : attributeId;

    switch (type) {
        case AttributeType.tree:
        case AttributeType.simple_link:
            const subFieldByDefault = 'id';
            return `${attributeId}.${subFieldByDefault}`;
        case AttributeType.advanced_link:
        default:
            return attributeId;
    }
};

export const getExtendedFormat = (itemContent: any): ExtendFormat[] => {
    return Object.keys(itemContent).map(key =>
        typeof itemContent[key] === 'object' && itemContent[key] !== null
            ? {[key]: getExtendedFormat(itemContent[key])}
            : key
    );
};

export const paginationOptions = [5, 10, 20, 50, 100];

interface ICustomAttribute extends IAttribute {
    path: string;
    embeddedFieldData?: IEmbeddedFields;
}

export const getFieldsKeyFromAttribute = (attribute: ISelectedAttribute | ICustomAttribute) => {
    if (attribute.parentAttributeData) {
        return `${attribute.library}.${attribute.parentAttributeData.id}.${attribute.id}`;
    } else if (attribute?.embeddedFieldData) {
        return `${attributeExtendedKey}.${attribute.library}.${attribute.path}`;
    }
    return `${attribute.library}.${attribute.id}`;
};

export const reorder = (list: any[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

export const flatArray = (arrays: any[]): any[] => {
    return [].concat.apply([], arrays);
};

export const getUniqueId = () => {
    return '_' + Math.random().toString(36).substr(2, 9);
};

export const sortNotificationByPriority = (a: INotification, b: INotification) => {
    switch (a.priority) {
        case NotificationPriority.low:
            switch (b.priority) {
                case NotificationPriority.low:
                    return 0;
                case NotificationPriority.medium:
                    return 1;
                case NotificationPriority.high:
                    return 1;
            }
        // eslint-disable-next-line no-fallthrough
        case NotificationPriority.medium:
            switch (b.priority) {
                case NotificationPriority.low:
                    return -1;
                case NotificationPriority.medium:
                    return 0;
                case NotificationPriority.high:
                    return 1;
            }
        // eslint-disable-next-line no-fallthrough
        case NotificationPriority.high:
            switch (b.priority) {
                case NotificationPriority.low:
                    return -1;
                case NotificationPriority.medium:
                    return -1;
                case NotificationPriority.high:
                    return 0;
            }
    }
};

export const queryFiltersToFilters = (
    queryFilters: IQueryFilter[],
    attributes: IAttribute[]
): [Array<Array<IFilter | IFilterSeparator>>, OperatorFilter] => {
    let groupFilters: Array<Array<IFilter | IFilterSeparator>> = [];
    let currentGroupFilter: Array<IFilter | IFilterSeparator> = [];
    let countFilter = 0;
    let currentIsSeparator = [false, false]; // separator use two level bracket
    let currentUseOperator = false;

    let filterOperatorValue: OperatorFilter | undefined;

    for (const queryFilter of queryFilters) {
        const attribute = attributes.find(attr => attr.id === queryFilter.field);

        if (queryFilter.operator) {
            switch (queryFilter.operator) {
                case OperatorFilter.and:
                case OperatorFilter.or:
                    if (currentIsSeparator[1]) {
                        const separator: IFilterSeparator = {
                            type: FilterTypes.separator,
                            active: true,
                            id: getUniqueId(),
                            key: countFilter++
                        };

                        // filterOperatorValue is the opposite on the separator
                        filterOperatorValue =
                            queryFilter.operator === OperatorFilter.and ? OperatorFilter.or : OperatorFilter.and;

                        currentGroupFilter = [...currentGroupFilter, separator];
                    } else {
                        // set operatorValue
                        if (!filterOperatorValue) {
                            filterOperatorValue = queryFilter.operator;
                        }

                        currentUseOperator = true;
                    }
                    break;

                case OperatorFilter.openParent:
                    if (currentGroupFilter) {
                        groupFilters = [...groupFilters, currentGroupFilter];
                        currentGroupFilter = [];
                    }

                    currentIsSeparator = [false, false];

                    break;

                case OperatorFilter.closeParent:
                    if (currentGroupFilter.length) {
                        // add current group of filters in the result
                        groupFilters = [...groupFilters, currentGroupFilter];
                        // reset current group of filters
                        currentGroupFilter = [];
                    }

                    currentIsSeparator = currentIsSeparator[0] ? [true, true] : [true, false];

                    break;
            }
        } else if (attribute) {
            if (currentGroupFilter.length) {
                const previousFilter = [...currentGroupFilter].pop();

                if (
                    previousFilter &&
                    previousFilter.type === FilterTypes.filter &&
                    previousFilter.attribute.id === queryFilter.field
                ) {
                    previousFilter.value += `\n${queryFilter.value}`; // append new value to previous value
                    currentGroupFilter.splice(-1, 1, previousFilter); // replace in array

                    continue;
                }
            }

            if (queryFilter.condition && queryFilter.field) {
                currentIsSeparator = [false, false]; // if field in current group filter, it's can't be a separator

                const previousFilter = groupFilters.flat(2).pop(); // take the previous filter in a clone of the previous group
                // if there are already filter in the group or the previous filter was of the type filter, use an operator
                const operator =
                    currentUseOperator ||
                    !!currentGroupFilter.length ||
                    (previousFilter && previousFilter.type === FilterTypes.filter);

                const filterAttribute: GET_ATTRIBUTES_BY_LIB_attributes_list = {
                    ...attribute,
                    multiple_values: false,
                    embedded_fields: null,
                    format: attribute.format ?? null
                };

                // create new filter
                const newFilter: IFilter = {
                    key: countFilter,
                    id: getUniqueId(),
                    type: FilterTypes.filter,
                    format: attribute.format,
                    condition: queryFilter.condition,
                    operator,
                    value: queryFilter.value,
                    attribute: filterAttribute,
                    active: true
                };

                currentGroupFilter = [...currentGroupFilter, newFilter];
                currentUseOperator = false;

                countFilter++;
            }
        }
    }

    return [groupFilters, filterOperatorValue ?? OperatorFilter.and];
};

type TextSizeLimit = 'small' | 'medium' | 'big' | number;

export const limitTextSize = (text: string, size: TextSizeLimit) => {
    let numberSize: number;
    if (isString(size)) {
        switch (size) {
            case 'small':
                numberSize = 8;
                break;
            case 'medium':
                numberSize = 16;
                break;
            case 'big':
                numberSize = 32;
                break;
        }
    } else {
        numberSize = size;
    }

    if (text.length > numberSize) {
        return text.slice(0, numberSize) + '...';
    } else {
        return text;
    }
};
export const isAttributeSelected = (path: string, selectedAttributes: ISelectedAttribute[]): boolean =>
    selectedAttributes.findIndex(selectedAttribute => selectedAttribute.path === path) !== -1;

export const attributeToSelectedAttribute = (
    attribute: GET_ATTRIBUTES_BY_LIB_attributes_list,
    otherProps: Pick<ISelectedAttribute, 'path' | 'library' | 'parentAttributeData' | 'embeddedFieldData'>
): ISelectedAttribute => ({
    ...pick(attribute, ['id', 'label', 'format', 'type', 'multiple_values']),
    ...otherProps
});

/**
 * Cloning gql template tag because some apollo tools like query validation and codegen won't be happy if we use
 * interpolation in template strings. With a different tag name, the query won't be parsed by these tools
 * thus they won't complain about it.
 * It works exactly the same at runtime.
 */
export const gqlUnchecked = gql;
