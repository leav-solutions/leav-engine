// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import mergeWith from 'lodash/mergeWith';

export default function mergeConcat<T, U>(target: T, src: U): T {
    return mergeWith(target, src, (objVal: unknown, srcVal: unknown): any => {
        if (Array.isArray(objVal)) {
            return objVal.concat(srcVal);
        }
    });
}
