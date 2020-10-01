import mergeWith from 'lodash/mergeWith';

export default function<T, U>(target: T, src: U): T {
    return mergeWith(target, src, (objVal: unknown, srcVal: unknown): any => {
        if (Array.isArray(objVal)) {
            return objVal.concat(srcVal);
        }
    });
}
