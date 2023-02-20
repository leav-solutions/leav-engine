// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// import {camelCase, flow, partialRight, trimEnd, upperFirst} from 'lodash';
import camelCase from 'lodash/camelCase';
import flow from 'lodash/flow';
import partialRight from 'lodash/partialRight';
import trimEnd from 'lodash/trimEnd';
import upperFirst from 'lodash/upperFirst';
import minimatch from 'minimatch';
import * as extensions from './MIMEByExtension.json';
import { FileType } from './types/files';
export const getGraphqlTypeFromLibraryName = (library) => {
    return flow([camelCase, upperFirst, trimEnd, partialRight(trimEnd, 's')])(library);
};
export const getGraphqlQueryNameFromLibraryName = (library) => {
    return flow([camelCase, trimEnd])(library);
};
export const isFileAllowed = (fsPath, allowList, ignoreList, filePath) => {
    // if allowPatterns is empty it's an implicit allow of all files
    if (!allowList.length) {
        allowList = ['**'];
    }
    const isAllowed = allowList.some(pattern => minimatch(filePath, `${fsPath}/${pattern}`));
    const isIgnored = ignoreList.some(pattern => minimatch(filePath, `${fsPath}/${pattern}`));
    return !isIgnored && isAllowed;
};
export const localizedTranslation = (translations, availableLanguages) => {
    if (!translations) {
        return '';
    }
    const userLang = availableLanguages[0];
    const fallbackLang = availableLanguages[1] ? availableLanguages[1] : '';
    return translations[userLang] || translations[fallbackLang] || translations[Object.keys(translations)[0]] || '';
};
/**
 *
 * @param str
 * @param format 'hsl' || 'rgb' || 'hex'
 * @param saturation in percent, default to 30
 * @param luminosity in percent, default to 80
 */
export const stringToColor = (str = '', format = 'hsl', saturation = 30, luminosity = 80) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        // eslint-disable-next-line no-bitwise
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    switch (format) {
        case 'hex':
            return _hslToHex(hue, saturation, luminosity);
        case 'rgb':
            const [r, g, b] = _hslToRgb(hue, saturation, luminosity);
            return `rgb(${r},${g},${b})`;
        case 'hsl':
            return `hsl(${hue}, ${saturation}%, ${luminosity}%)`;
        default:
            return `hsl(${hue}, ${saturation}%, ${luminosity}%)`;
    }
};
const _hue2rgb = (p, q, t) => {
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
const _hslToHex = (h, s, l) => {
    const [r, g, b] = _hslToRgb(h, s, l);
    const _toHex = (x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${_toHex(r)}${_toHex(g)}${_toHex(b)}`;
};
const _hslToRgb = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r;
    let g;
    let b;
    if (s === 0) {
        r = g = b = l; // achromatic
    }
    else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = _hue2rgb(p, q, h + 1 / 3);
        g = _hue2rgb(p, q, h);
        b = _hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};
export const getInvertColor = (color) => {
    const hexcolor = color.replace(/#/g, '');
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#000000' : '#FFFFFF';
};
/**
 * Parse string to extract args.
 * Arg is a string with format:
 * -[argName] argValue
 *
 * eg. "-library product -type link" => {library: product, type: link}
 * @param mapping
 */
export const extractArgsFromString = (mapping) => {
    const args = mapping
        .split('-')
        .slice(1)
        .map(e => e.replace(/\s+/g, ' ').trim().split(' '));
    return args.reduce((acc, value) => { var _a; return (Object.assign(Object.assign({}, acc), { [value[0]]: (_a = value[1]) !== null && _a !== void 0 ? _a : true })); }, {});
};
export const objectToNameValueArray = (obj) => {
    return Object.keys(obj !== null && obj !== void 0 ? obj : {}).map(key => ({ name: key, value: obj[key] }));
};
export const nameValArrayToObj = (arr = [], keyFieldName = 'name', valueFieldName = 'value') => {
    return Array.isArray(arr) && arr.length
        ? arr.reduce((formattedElem, elem) => {
            formattedElem[elem[keyFieldName]] = elem[valueFieldName];
            return formattedElem;
        }, {})
        : null;
};
export const getLibraryGraphqlNames = (libraryId) => {
    const libQueryName = getGraphqlQueryNameFromLibraryName(libraryId);
    const libTypeName = getGraphqlTypeFromLibraryName(libraryId);
    return {
        query: libQueryName,
        type: libTypeName,
        list: libTypeName + 'List',
        searchableFields: libTypeName + 'SearchableFields',
        filter: libTypeName + 'Filter'
    };
};
export const getFileType = (fileName) => {
    const extension = fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase();
    if (!extensions[extension]) {
        return FileType.OTHER;
    }
    const type = extensions[extension].type;
    return type;
};
/**
 * Return a simplified call stack (for the function who called this function, not this one, obviously)
 *
 * @param depth Number of calls to return
 */
export const getCallStack = (depth = 2) => {
    const callersStartDepth = 3;
    const callers = new Error().stack.split('\n').slice(callersStartDepth, callersStartDepth + depth);
    return callers.map(c => c.trim().split(' ').splice(1).join(' @ '));
};
export const getInitials = (label, length = 2) => {
    if (typeof label !== 'string') {
        return '?';
    }
    const words = label.split(' ').slice(0, length);
    const letters = words.length >= length ? words.map(word => word[0]).join('') : words[0].slice(0, length);
    return letters.toUpperCase();
};
//# sourceMappingURL=utils.js.map