// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/**
 * To convert process.env string to boolean
 */
export function envToBool(value: string, defaultValue = false) {
    const v = value?.trim().toLowerCase();
    if (v === 'true' || v === '1' || v === 'yes') {
        return true;
    }
    if (v === 'false' || v === '0' || v === 'no') {
        return false;
    }
    return defaultValue;
}

/**
 * To convert process.env string to number
 */
export function envToNumber(value: string, defaultValue = 0) {
    if (value?.trim() === '') {
        return defaultValue;
    }
    const v = Number(value);
    return Number.isNaN(v) ? defaultValue : v;
}
