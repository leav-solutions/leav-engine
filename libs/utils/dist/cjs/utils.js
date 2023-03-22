"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatId = exports.getInitials = exports.getCallStack = exports.getFileType = exports.getLibraryGraphqlNames = exports.nameValArrayToObj = exports.objectToNameValueArray = exports.extractArgsFromString = exports.getInvertColor = exports.stringToColor = exports.localizedTranslation = exports.isFileAllowed = exports.getGraphqlQueryNameFromLibraryName = exports.getGraphqlTypeFromLibraryName = void 0;
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
const camelCase_1 = __importDefault(require("lodash/camelCase"));
const flow_1 = __importDefault(require("lodash/flow"));
const partialRight_1 = __importDefault(require("lodash/partialRight"));
const trimEnd_1 = __importDefault(require("lodash/trimEnd"));
const upperFirst_1 = __importDefault(require("lodash/upperFirst"));
const minimatch_1 = __importDefault(require("minimatch"));
const extensions = __importStar(require("./MIMEByExtension.json"));
const files_1 = require("./types/files");
const getGraphqlTypeFromLibraryName = (library) => {
    return (0, flow_1.default)([camelCase_1.default, upperFirst_1.default, trimEnd_1.default, (0, partialRight_1.default)(trimEnd_1.default, 's')])(library);
};
exports.getGraphqlTypeFromLibraryName = getGraphqlTypeFromLibraryName;
const getGraphqlQueryNameFromLibraryName = (library) => {
    return (0, flow_1.default)([camelCase_1.default, trimEnd_1.default])(library);
};
exports.getGraphqlQueryNameFromLibraryName = getGraphqlQueryNameFromLibraryName;
const isFileAllowed = (fsPath, allowList, ignoreList, filePath) => {
    // if allowPatterns is empty it's an implicit allow of all files
    if (!allowList.length) {
        allowList = ['**'];
    }
    const isAllowed = allowList.some(pattern => (0, minimatch_1.default)(filePath, `${fsPath}/${pattern}`));
    const isIgnored = ignoreList.some(pattern => (0, minimatch_1.default)(filePath, `${fsPath}/${pattern}`));
    return !isIgnored && isAllowed;
};
exports.isFileAllowed = isFileAllowed;
const localizedTranslation = (translations, availableLanguages) => {
    if (!translations) {
        return '';
    }
    const userLang = availableLanguages[0];
    const fallbackLang = availableLanguages[1] ? availableLanguages[1] : '';
    return translations[userLang] || translations[fallbackLang] || translations[Object.keys(translations)[0]] || '';
};
exports.localizedTranslation = localizedTranslation;
/**
 *
 * @param str
 * @param format 'hsl' || 'rgb' || 'hex'
 * @param saturation in percent, default to 30
 * @param luminosity in percent, default to 80
 */
const stringToColor = (str = '', format = 'hsl', saturation = 30, luminosity = 80) => {
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
exports.stringToColor = stringToColor;
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
const getInvertColor = (color) => {
    const hexcolor = color.replace(/#/g, '');
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#000000' : '#FFFFFF';
};
exports.getInvertColor = getInvertColor;
/**
 * Parse string to extract args.
 * Arg is a string with format:
 * -[argName] argValue
 *
 * eg. "-library product -type link" => {library: product, type: link}
 * @param mapping
 */
const extractArgsFromString = (mapping) => {
    const args = mapping
        .split('-')
        .slice(1)
        .map(e => e.replace(/\s+/g, ' ').trim().split(' '));
    return args.reduce((acc, value) => { var _a; return (Object.assign(Object.assign({}, acc), { [value[0]]: (_a = value[1]) !== null && _a !== void 0 ? _a : true })); }, {});
};
exports.extractArgsFromString = extractArgsFromString;
const objectToNameValueArray = (obj) => {
    return Object.keys(obj !== null && obj !== void 0 ? obj : {}).map(key => ({ name: key, value: obj[key] }));
};
exports.objectToNameValueArray = objectToNameValueArray;
const nameValArrayToObj = (arr = [], keyFieldName = 'name', valueFieldName = 'value') => {
    return Array.isArray(arr) && arr.length
        ? arr.reduce((formattedElem, elem) => {
            formattedElem[elem[keyFieldName]] = elem[valueFieldName];
            return formattedElem;
        }, {})
        : null;
};
exports.nameValArrayToObj = nameValArrayToObj;
const getLibraryGraphqlNames = (libraryId) => {
    const libQueryName = (0, exports.getGraphqlQueryNameFromLibraryName)(libraryId);
    const libTypeName = (0, exports.getGraphqlTypeFromLibraryName)(libraryId);
    return {
        query: libQueryName,
        type: libTypeName,
        list: libTypeName + 'List',
        searchableFields: libTypeName + 'SearchableFields',
        filter: libTypeName + 'Filter'
    };
};
exports.getLibraryGraphqlNames = getLibraryGraphqlNames;
const getFileType = (fileName) => {
    const extension = fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase();
    if (!extensions[extension]) {
        return files_1.FileType.OTHER;
    }
    const type = extensions[extension].type;
    return type;
};
exports.getFileType = getFileType;
/**
 * Return a simplified call stack (for the function who called this function, not this one, obviously)
 *
 * @param depth Number of calls to return
 */
const getCallStack = (depth = 2) => {
    const callersStartDepth = 3;
    const callers = new Error().stack.split('\n').slice(callersStartDepth, callersStartDepth + depth);
    return callers.map(c => c.trim().split(' ').splice(1).join(' @ '));
};
exports.getCallStack = getCallStack;
const getInitials = (label, length = 2) => {
    if (typeof label !== 'string') {
        return '?';
    }
    const words = label.split(' ').slice(0, length);
    const letters = words.length >= length ? words.map(word => word[0]).join('') : words[0].slice(0, length);
    return letters.toUpperCase();
};
exports.getInitials = getInitials;
/**
 * Format an ID: remove accents, any special characters, replace spaces by underscore and make sure there is no double underscore
 *
 * @param id
 * @returns formatted ID
 */
const formatId = (id) => {
    return id
        .normalize('NFD') // Decompose the string in the base and the accents
        .toLowerCase() // Lowercase the string
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-zA-Z0-9\s]/g, '_') // Transform any special character into an underscore
        .trim() // Remove spaces at the beginning and the end
        .replace(/\s/g, '_') // Replace spaces by underscore
        .replace(/__+/g, '_') // Remove double underscores
        .replace(/_$/g, '') // Remove underscore at the end
        .replace(/^_/g, ''); // Remove underscore at the beginning
};
exports.formatId = formatId;
//# sourceMappingURL=utils.js.map