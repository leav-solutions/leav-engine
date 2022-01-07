// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from 'graphql-tag';
import {i18n, TFunction} from 'i18next';
import {pick} from 'lodash';
import {AttributeFormat, AttributeType, ViewSizes} from '_gqlTypes/globalTypes';
import {RecordIdentity} from '_gqlTypes/RecordIdentity';
import {defaultLinkAttributeFilterFormat, infosCol} from '../constants/constants';
import {GET_ATTRIBUTES_BY_LIB_attributes_list} from '../_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {
    AttributeConditionFilter,
    AttributeConditionType,
    AvailableLanguage,
    ExtendFormat,
    IAttribute,
    IDateRangeValue,
    INotification,
    ISelectedAttribute,
    NotificationPriority,
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
    return Object.keys(PreviewAttributes).filter(previewAttribute => !(parseInt(previewAttribute, 10) + 1)) as any;
};

export const localizedTranslation = (translations: any, availableLanguages: AvailableLanguage[] | string[]): string => {
    if (!translations) {
        return '';
    }

    const userLang = availableLanguages[0];
    const fallbackLang = availableLanguages[1] ? availableLanguages[1] : '';

    return translations[userLang] || translations[fallbackLang] || translations[Object.keys(translations)[0]] || '';
};

export const getSysTranslationQueryLanguage = (i18next: i18n): AvailableLanguage[] => {
    const userLang = i18next.language
        ? i18next.language.split('-')[0]
        : AvailableLanguage[process.env.REACT_APP_DEFAULT_LANG as AvailableLanguage] ?? AvailableLanguage.en;
    const fallbackLang = i18next.options?.fallbackLng ? (i18next as any).options.fallbackLng[0] : '';

    return [userLang, fallbackLang];
};

export const checkTypeIsLink = (type: AttributeType) => {
    return type === AttributeType.simple_link || type === AttributeType.advanced_link;
};

export const displayTypeToPreviewSize = (displayType: ViewSizes) => {
    switch (displayType) {
        case ViewSizes.SMALL:
            return PreviewSize.small;
        case ViewSizes.MEDIUM:
            return PreviewSize.medium;
        case ViewSizes.BIG:
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

export const getFieldsKeyFromAttribute = (attribute: ISelectedAttribute) => {
    if (attribute?.format === AttributeFormat.extended && attribute.path) {
        return `${attribute.path}`;
    } else if (attribute.parentAttributeData) {
        return attribute.parentAttributeData.type === AttributeType.tree
            ? `${attribute.parentAttributeData.id}.${attribute.library}.${attribute.id}`
            : `${attribute.parentAttributeData.id}.${attribute.id}`;
    }

    return `${attribute.id}`;
};

export const reorder = (list: any[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result.filter(element => !!element);
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
                default:
                    return 1;
            }
        case NotificationPriority.medium:
            switch (b.priority) {
                case NotificationPriority.low:
                    return -1;
                case NotificationPriority.medium:
                    return 0;
                case NotificationPriority.high:
                default:
                    return 1;
            }
        case NotificationPriority.high:
            switch (b.priority) {
                case NotificationPriority.low:
                    return -1;
                case NotificationPriority.medium:
                    return -1;
                case NotificationPriority.high:
                default:
                    return 0;
            }
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

export const getAttributeFromKey = (key: string, library: string, attributes: IAttribute[]): IAttribute | undefined => {
    const splitKey = key.split('.');

    // Get root attribute by first key part
    const rootAttribute = attributes.find(attr => attr.library === library && attr.id === splitKey[0]);

    if (!rootAttribute) {
        return;
    }

    if (rootAttribute.type === AttributeType.simple || rootAttribute.type === AttributeType.advanced) {
        return rootAttribute;
    }

    if (checkTypeIsLink(rootAttribute.type)) {
        if (splitKey[1]) {
            const linkedAttribute = attributes.find(
                attr => attr.library === rootAttribute?.linkedLibrary?.id && attr.id === splitKey[1]
            );

            return {...linkedAttribute, parentAttribute: {...rootAttribute, format: defaultLinkAttributeFilterFormat}};
        }

        return rootAttribute;
    }

    if (rootAttribute.type === AttributeType.tree) {
        const [, libraryId, linkedTreeAttribute] = splitKey;

        if (!libraryId && !linkedTreeAttribute) {
            // Only root attribute => search on tree
            return {...rootAttribute, format: defaultLinkAttributeFilterFormat};
        } else if (libraryId && !linkedTreeAttribute) {
            return rootAttribute;
        }

        const linkedAttribute = attributes.find(attr => attr.library === splitKey[1] && attr.id === splitKey[2]);

        return linkedAttribute;
    }
};

export const defaultFilterConditionByAttributeFormat = (format: AttributeFormat): AttributeConditionType => {
    switch (format) {
        case AttributeFormat.boolean:
        case AttributeFormat.date:
        case AttributeFormat.numeric:
            return AttributeConditionFilter.EQUAL;
        case AttributeFormat.encrypted:
            return AttributeConditionFilter.IS_EMPTY;
        case AttributeFormat.text:
        case AttributeFormat.date_range:
        case AttributeFormat.extended:
        default:
            return AttributeConditionFilter.CONTAINS;
    }
};

export const defaultFilterValueByAttributeFormat = (format: AttributeFormat): string | boolean | number => {
    switch (format) {
        case AttributeFormat.text:
            return '';
        case AttributeFormat.boolean:
            return true;
        case AttributeFormat.date:
        case AttributeFormat.numeric:
            return 0;
        default:
            return null;
    }
};

export const getTreeRecordKey = (record: RecordIdentity): string => `${record.whoAmI.library.id}/${record.id}`;

export const getLibraryLink = (libId: string) => `/library/${libId}`;
export const getTreeLink = (treeId: string) => `/tree/${treeId}`;

export const stringifyDateRangeValue = (value: IDateRangeValue, t: TFunction): string =>
    t('record_edition.date_range_value', {
        ...value,
        interpolation: {escapeValue: false}
    });
