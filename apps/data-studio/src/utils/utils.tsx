// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {objectToNameValueArray} from '@leav/utils';
import {gql} from 'graphql-tag';
import {i18n, TFunction} from 'i18next';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import {getFiltersFromRequest} from 'utils/getFiltersFromRequest';
import {ADD_VIEW_saveView} from '_gqlTypes/ADD_VIEW';
import {GET_APPLICATION_BY_ID_applications_list} from '_gqlTypes/GET_APPLICATION_BY_ID';
import {GET_VIEW_view, GET_VIEW_view_display, GET_VIEW_view_sort} from '_gqlTypes/GET_VIEW';
import {AttributeFormat, AttributeType, ValueVersionInput, ViewSizes} from '_gqlTypes/globalTypes';
import {RecordIdentity} from '_gqlTypes/RecordIdentity';
import {RECORD_FORM_recordForm_elements_values_Value_version} from '_gqlTypes/RECORD_FORM';
import {defaultLinkAttributeFilterFormat, infosCol} from '../constants/constants';
import {GET_ATTRIBUTES_BY_LIB_attributes_list} from '../_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {
    AttributeConditionFilter,
    AttributeConditionType,
    AvailableLanguage,
    ExtendFormat,
    IApplicationSettings,
    IAttribute,
    IDateRangeValue,
    IInfo,
    InfoPriority,
    IQueryFilter,
    ISelectedAttribute,
    IValueVersion,
    IView,
    PreviewAttributes,
    PreviewSize
} from '../_types/types';

export function getRecordIdentityCacheKey(libId: string, recordId: string): string {
    return `recordIdentity/${libId}/${recordId}`;
}

export function getFileUrl(filepath: string) {
    // Assets are served from the same origin as the application. Just return the filepath but keep this function
    // in case it becomes more complicated
    return filepath;
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
    for (let i = 0; i < (str ?? '').length; i++) {
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

export const getSysTranslationQueryLanguage = (i18next: i18n, defaultLang?: AvailableLanguage): AvailableLanguage[] => {
    const userLang = i18next.language
        ? i18next.language.split('-')[0]
        : AvailableLanguage[defaultLang] ?? AvailableLanguage.en;
    const fallbackLang = i18next.options?.fallbackLng ? (i18next as any).options.fallbackLng[0] : '';

    return [userLang, fallbackLang];
};

export const checkTypeIsLink = (type: AttributeType) => {
    return type === AttributeType.simple_link || type === AttributeType.advanced_link;
};

export const isTypeStandard = (type: AttributeType) => {
    return type === AttributeType.simple || type === AttributeType.advanced;
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

export const sortInfoByPriority = (a: IInfo, b: IInfo) => {
    switch (a.priority) {
        case InfoPriority.low:
            switch (b.priority) {
                case InfoPriority.low:
                    return 0;
                case InfoPriority.medium:
                    return 1;
                case InfoPriority.high:
                default:
                    return 1;
            }
        case InfoPriority.medium:
            switch (b.priority) {
                case InfoPriority.low:
                    return -1;
                case InfoPriority.medium:
                    return 0;
                case InfoPriority.high:
                default:
                    return 1;
            }
        case InfoPriority.high:
            switch (b.priority) {
                case InfoPriority.low:
                    return -1;
                case InfoPriority.medium:
                    return -1;
                case InfoPriority.high:
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

export const isLibraryInApp = (app: GET_APPLICATION_BY_ID_applications_list, libraryId: string): boolean => {
    const settings: IApplicationSettings = app?.settings ?? {};
    if (settings.libraries === 'none') {
        return false;
    }

    if (settings.libraries === 'all') {
        return true;
    }

    const appLibraries = settings.libraries ?? [];
    return !!appLibraries.find(appLib => appLib === libraryId);
};

export const isTreeInApp = (app: GET_APPLICATION_BY_ID_applications_list, treeId: string): boolean => {
    if (app?.settings?.trees === null) {
        return false;
    }

    const appTrees = app?.settings?.trees ?? [];
    return !appTrees.length || !!appTrees.find(appTree => appTree === treeId);
};

export const stopEvent = (e: React.SyntheticEvent<any>) => {
    e.preventDefault();
    e.stopPropagation();
};

export const getPreviewSize = (size?: PreviewSize, simplistic: boolean = false) => {
    if (simplistic) {
        return '1.2rem';
    }

    switch (size) {
        case PreviewSize.medium:
            return '3.5rem';
        case PreviewSize.big:
            return '6rem';
        case PreviewSize.small:
            return '2.5rem';
        case PreviewSize.tiny:
            return '1.7rem';
        default:
            return '2rem';
    }
};

export const getInitials = (label: string, length: number = 2) => {
    if (typeof label !== 'string') {
        return '?';
    }

    const words = label.split(' ').slice(0, length);
    const letters = words.length >= length ? words.map(word => word[0]).join('') : words[0].slice(0, length);

    return letters.toUpperCase();
};

/**
 * Prepare view coming from the server to be used in the app
 */
export const prepareView = (
    view: GET_VIEW_view | ADD_VIEW_saveView,
    attributes: IAttribute[],
    libraryId: string,
    userId: string
): IView => {
    const viewFilters: IQueryFilter[] = (view?.filters ?? []).map(filter => ({
        ...filter,
        treeId: filter.tree?.id
    }));

    const viewValuesVersions = (view?.valuesVersions ?? []).map(version => ({
        ...version,
        treeNode: {
            ...version.treeNode,
            title: version.treeNode.record.whoAmI.label
        }
    }));

    return {
        ...(omit(view, ['created_by', '__typename']) as GET_VIEW_view),
        owner: view.created_by.id === userId,
        filters: getFiltersFromRequest(viewFilters, libraryId, attributes),
        sort: view.sort && (omit(view.sort, ['__typename']) as GET_VIEW_view_sort),
        display: omit(view.display, ['__typename']) as GET_VIEW_view_display,
        valuesVersions: viewValuesVersions.reduce((versions: IValueVersion, version): IValueVersion => {
            versions[version.treeId] = {
                id: version.treeNode.id,
                label: version.treeNode.record.whoAmI.label
            };

            return versions;
        }, {}),
        settings: view.settings?.map(s => omit(s, '__typename'))
    };
};

export const getValueVersionLabel = (version: IValueVersion) => {
    return Object.values(version ?? {})
        .map(v => v.label)
        .join(' / ');
};

export const arrayValueVersionToObject = (
    version: RECORD_FORM_recordForm_elements_values_Value_version[]
): IValueVersion => {
    return version?.reduce((acc: IValueVersion, value) => {
        acc[value.treeId] = {
            id: value.treeNode.id,
            label: value.treeNode.record.whoAmI.label
        };

        return acc;
    }, {});
};

export const objectValueVersionToArray = (version: IValueVersion): ValueVersionInput[] => {
    return version
        ? objectToNameValueArray(version).map(v => ({
              treeId: v.name,
              treeNodeId: v?.value?.id ?? null
          }))
        : null;
};
