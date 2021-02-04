// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {i18n} from 'i18next';
import {infosCol} from '../constants/constants';
import {
    AttributeFormat,
    AttributeType,
    AvailableLanguage,
    ConditionFilter,
    DisplayListItemTypes,
    ExtendFormat,
    IAttribute,
    IAttributesChecked,
    IExtendedData,
    IItemsColumn,
    INotification,
    IOriginAttributeData,
    ITreeData,
    NotificationPriority,
    PreviewAttributes,
    PreviewSize
} from '../_types/types';

export function getRecordIdentityCacheKey(libId: string, recordId: string): string {
    return `recordIdentity/${libId}/${recordId}`;
}

export function getPreviewUrl(preview: string) {
    const url = process.env.REACT_APP_CORE_URL;
    return url + preview;
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

export const displayTypeToPreviewSize = (displayType: DisplayListItemTypes) => {
    switch (displayType) {
        case DisplayListItemTypes.listSmall:
            return PreviewSize.small;
        case DisplayListItemTypes.listMedium:
            return PreviewSize.medium;
        case DisplayListItemTypes.listBig:
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

interface IAttributeUpdateSelectionParams {
    attribute: IAttribute;
    attributesChecked: IAttributesChecked[];
    useCheckbox: boolean;
    depth: number;
    originAttributeData?: IOriginAttributeData;
    extendedData?: IExtendedData;
    treeData?: ITreeData;
}

export const attributeUpdateSelection = ({
    attribute,
    attributesChecked,
    useCheckbox,
    depth,
    originAttributeData,
    extendedData,
    treeData
}: IAttributeUpdateSelectionParams): IAttributesChecked[] => {
    if (useCheckbox) {
        let newAttributesChecked: IAttributesChecked[];

        const checkCurrentAttribute = (attributeChecked: IAttributesChecked) =>
            attributeChecked.id === attribute.id && attributeChecked.library === attribute.library;

        const hasCurrentAttribute = attributesChecked.some(attributeChecked =>
            extendedData?.path
                ? checkCurrentAttribute(attributeChecked) && attributeChecked.extendedData?.path === extendedData?.path
                : checkCurrentAttribute(attributeChecked)
        );

        if (hasCurrentAttribute) {
            newAttributesChecked = attributesChecked.reduce((acc, attributeChecked) => {
                if (checkCurrentAttribute(attributeChecked)) {
                    const newChecked = attributeChecked?.checked ? false : true;
                    if (extendedData?.path) {
                        if (attributeChecked.extendedData?.path === extendedData?.path) {
                            return [...acc, {...attributeChecked, checked: newChecked, extendedData}];
                        } else {
                            return [...acc, attributeChecked];
                        }
                    } else {
                        return [...acc, {...attributeChecked, checked: newChecked}];
                    }
                }
                return [...acc, attributeChecked];
            }, [] as IAttributesChecked[]);
        } else {
            newAttributesChecked = [
                ...attributesChecked,
                {
                    id: attribute.id,
                    library: attribute.library ?? originAttributeData?.id,
                    label: attribute.label,
                    type: attribute.type,
                    checked: true,
                    originAttributeData,
                    extendedData,
                    treeData,
                    depth: extendedData?.path?.match(/,/g)?.length || 0
                }
            ];
        }

        return newAttributesChecked;
    } else {
        const newAttributesChecked: IAttributesChecked[] = [
            ...attributesChecked.filter(ac => ac.id !== attribute.id),
            {
                id: attribute.id,
                library: attribute.library,
                label: attribute.label,
                type: attribute.type,
                depth,
                checked: true,
                extendedData,
                treeData
            }
        ];

        return newAttributesChecked;
    }
};

export const paginationOptions = [5, 10, 20, 50, 100];

export const getItemKeyFromColumn = (column: IItemsColumn) => {
    return `${column.library}_${column.id}`;
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
        case NotificationPriority.medium:
            switch (b.priority) {
                case NotificationPriority.low:
                    return -1;
                case NotificationPriority.medium:
                    return 0;
                case NotificationPriority.high:
                    return 1;
            }
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
