// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import camelCase from 'lodash/camelCase';
import flow from 'lodash/flow';
import isEmpty from 'lodash/isEmpty';
import partialRight from 'lodash/partialRight';
import trimEnd from 'lodash/trimEnd';
import upperFirst from 'lodash/upperFirst';
import minimatch from 'minimatch';
import * as extensions from './MIMEByExtension.json';
import {FileType} from './types/files';
import {IKeyValue} from './types/helpers';

export const getGraphqlTypeFromLibraryName = (library: string): string => {
    return flow([camelCase, upperFirst, trimEnd, partialRight(trimEnd, 's')])(library);
};

export const getGraphqlQueryNameFromLibraryName = (library: string): string => {
    return flow([camelCase, trimEnd])(library);
};

export const isFileAllowed = (fsPath: string, allowList: string[], ignoreList: string[], filePath: string): boolean => {
    // if allowPatterns is empty it's an implicit allow of all files
    if (!allowList.length) {
        allowList = ['**'];
    }

    const isAllowed = allowList.some(pattern => minimatch(filePath, `${fsPath}/${pattern}`));
    const isIgnored = ignoreList.some(pattern => minimatch(filePath, `${fsPath}/${pattern}`));

    return !isIgnored && isAllowed;
};

export const localizedTranslation = (translations: Record<string, string>, availableLanguages: string[]): string => {
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
export const stringToColor = (str: string | null = '', format = 'hsl', saturation = 30, luminosity = 80): string => {
    let hash = 0;
    for (let i = 0; i < (str ?? '').length; i++) {
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

const _hue2rgb = (p: number, q: number, t: number) => {
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

const _hslToHex = (h: number, s: number, l: number): string => {
    const [r, g, b] = _hslToRgb(h, s, l);
    const _toHex = (x: number) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${_toHex(r)}${_toHex(g)}${_toHex(b)}`;
};

const _hslToRgb = (h: number, s: number, l: number): number[] => {
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
        r = _hue2rgb(p, q, h + 1 / 3);
        g = _hue2rgb(p, q, h);
        b = _hue2rgb(p, q, h - 1 / 3);
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

/**
 * Parse string to extract args.
 * Arg is a string with format:
 * -[argName] argValue
 *
 * eg. "-library product -type link" => {library: product, type: link}
 * @param mapping
 */
export const extractArgsFromString = (mapping: string): {[arg: string]: string} => {
    const args = mapping
        .split('-')
        .slice(1)
        .map(e => e.replace(/\s+/g, ' ').trim().split(' '));
    return args.reduce((acc, value) => ({...acc, [value[0]]: value[1] ?? true}), {});
};

export const objectToNameValueArray = <T>(obj: IKeyValue<T>): Array<{name: string; value: T}> => {
    return Object.keys(obj ?? {}).map(key => ({name: key, value: obj[key]}));
};

export const nameValArrayToObj = (
    arr: Array<{}> = [],
    keyFieldName = 'name',
    valueFieldName = 'value'
): {[key: string]: any} => {
    return Array.isArray(arr) && arr.length
        ? arr.reduce((formattedElem, elem) => {
              formattedElem[elem[keyFieldName]] = elem[valueFieldName];

              return formattedElem;
          }, {})
        : null;
};

export const getLibraryGraphqlNames = (libraryId: string) => {
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

export const getFileType = (fileName: string): FileType => {
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
export const getCallStack = (depth: number = 2): string[] => {
    const callersStartDepth = 3;
    const callers = new Error().stack.split('\n').slice(callersStartDepth, callersStartDepth + depth);

    return callers.map(c => c.trim().split(' ').splice(1).join(' @ '));
};

export const getInitials = (label: string, length: number = 2) => {
    if (typeof label !== 'string' || isEmpty(label.trim()) || length < 1) {
        return '?';
    }

    const words: string[] = label.split(' ');
    /*  Setting up the list of word by using a regex according to the label sent
        if the label contains letters & numbers, filter only on these letters
        if the label contains only numbers, filter only on these numbers
        symbols are ignored by the regex
        if both list filtered by the regex are null, using the basic filter and split the label by space
    */
    const letterRegex = new RegExp(/[A-Za-z]+/g);
    const numberRegex = new RegExp(/[1-9]+/g);
    const wordsRegex = label.match(letterRegex) ? label.match(letterRegex) : label.match(numberRegex);
    return wordsRegex !== null ? _getInitialEngine(wordsRegex, length) : _getInitialEngine(words, length);
};

export const _getInitialEngine = (words: string[], length: number) => {
    let initials: string = '';
    if (words.length === 1) {
        initials = words[0].slice(0, length);
    } else {
        //the number of initial to display cannot exceed the number of words filtered
        if (words.length < length) {
            length = words.length;
        }
        for (let index = 0; index < length; index++) {
            initials = initials + words[index].charAt(0);
        }
    }
    return initials.toUpperCase();
};
/**
 * Format an ID: remove accents, any special characters, replace spaces by underscore and make sure there is no double underscore
 *
 * @param id
 * @returns formatted ID
 */
export const formatId = (id: string): string => {
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

/**
 * Returns a hash code from a string
 * @param  {String} str The string to hash.
 * @return {Number}    A 32bit integer
 */
export const simpleStringHash = (str: string) => {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        const chr = str.charCodeAt(i);
        // eslint-disable-next-line no-bitwise
        hash = (hash << 5) - hash + chr;
        // eslint-disable-next-line no-bitwise
        hash |= 0; // Convert to 32bit integer
    }

    return Math.abs(hash);
};

export const getFlagByLang = (lang: string): string => {
    const flagsByLang = {
        en: '🇬🇧', // English
        es: '🇪🇸', // Spanish
        fr: '🇫🇷', // French
        de: '🇩🇪', // German
        zh: '🇨🇳', // Chinese
        ru: '🇷🇺', // Russian
        pt: '🇵🇹', // Portuguese
        ja: '🇯🇵', // Japanese
        ko: '🇰🇷' // Korean
    };

    return flagsByLang[lang] ?? '';
};

export const getLogsIndexName = (instanceId: string): string => {
    return `logs-${instanceId}`;
};

export const waitFor = async (
    predicate: () => Promise<boolean> | boolean,
    options: {timeout?: number; interval?: number} = {}
): Promise<boolean> => {
    const {timeout = 5000, interval = 250} = options;
    const startTime = Date.now();
    while (!(await predicate())) {
        if (Date.now() - startTime > timeout) {
            throw new Error('Timeout expired');
        }
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    return true;
};
