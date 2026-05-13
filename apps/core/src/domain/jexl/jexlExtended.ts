import jexl from 'jexl-extended';

// Override jexl-extended function to use async version !
// Need override all function that use expr.evalSync
const arrayMap = (input: unknown[], expression: string) => {
    if (!Array.isArray(input)) {
        return undefined;
    }
    const expr = jexl.compile(expression);
    return Promise.all(input.map((value, index, array) => expr.eval({value, index, array})));
};

jexl.addFunction('map', arrayMap);
jexl.addFunction('$map', arrayMap);
jexl.addTransform('map', arrayMap);

const arrayFilter = async (input: unknown[], expression: string): Promise<unknown[]> => {
    if (!Array.isArray(input)) {
        return [];
    }
    const expr = jexl.compile(expression);
    const results = await Promise.all(input.map((value, index, array) => expr.eval({value, index, array})));
    return input.filter((_, index) => results[index]);
};

jexl.addFunction('filter', arrayFilter);
jexl.addFunction('$filter', arrayFilter);
jexl.addTransform('filter', arrayFilter);

const arraySort = async (input: unknown[], expression?: string, descending?: boolean): Promise<unknown[]> => {
    if (!Array.isArray(input)) {
        return [];
    }
    if (!expression) {
        return [...input].sort();
    }
    const expr = jexl.compile(expression);
    // Pre-compute sort keys in parallel — Array.sort comparator must be synchronous
    const keys = await Promise.all(input.map(value => expr.eval(value as object)));
    return [...input]
        .map((value, index) => ({value, key: keys[index]}))
        .sort((a, b) => {
            if (a.key < b.key) {
                return descending ? 1 : -1;
            }
            if (a.key > b.key) {
                return descending ? -1 : 1;
            }
            return 0;
        })
        .map(({value}) => value);
};

jexl.addFunction('sort', arraySort);
jexl.addFunction('$sort', arraySort);
jexl.addTransform('sort', arraySort);
jexl.addFunction('order', arraySort);
jexl.addFunction('$order', arraySort);
jexl.addTransform('order', arraySort);

const arrayAny = async (input: unknown[], expression: string): Promise<boolean> => {
    if (!Array.isArray(input)) {
        return false;
    }
    const expr = jexl.compile(expression);
    const results = await Promise.all(input.map((value, index, array) => expr.eval({value, index, array})));
    return results.some(Boolean);
};

jexl.addFunction('any', arrayAny);
jexl.addFunction('$any', arrayAny);
jexl.addTransform('any', arrayAny);
jexl.addFunction('some', arrayAny);
jexl.addFunction('$some', arrayAny);
jexl.addTransform('some', arrayAny);

const arrayEvery = async (input: unknown[], expression: string): Promise<boolean> => {
    if (!Array.isArray(input)) {
        return false;
    }
    const expr = jexl.compile(expression);
    const results = await Promise.all(input.map((value, index, array) => expr.eval({value, index, array})));
    return results.every(Boolean);
};

jexl.addFunction('all', arrayEvery);
jexl.addFunction('$all', arrayEvery);
jexl.addTransform('all', arrayEvery);
jexl.addFunction('every', arrayEvery);
jexl.addFunction('$every', arrayEvery);
jexl.addTransform('every', arrayEvery);

const arrayFind = async (input: unknown[], expression: string): Promise<unknown> => {
    if (!Array.isArray(input)) {
        return undefined;
    }
    const expr = jexl.compile(expression);
    const results = await Promise.all(input.map((value, index, array) => expr.eval({value, index, array})));
    const foundIndex = results.findIndex(Boolean);
    return foundIndex !== -1 ? input[foundIndex] : undefined;
};

jexl.addFunction('find', arrayFind);
jexl.addFunction('$find', arrayFind);
jexl.addTransform('find', arrayFind);

const arrayFindIndex = async (input: unknown[], expression: string): Promise<number | undefined> => {
    if (!Array.isArray(input)) {
        return undefined;
    }
    const expr = jexl.compile(expression);
    const results = await Promise.all(input.map((value, index, array) => expr.eval({value, index, array})));
    return results.findIndex(Boolean);
};

jexl.addFunction('findIndex', arrayFindIndex);
jexl.addFunction('$findIndex', arrayFindIndex);
jexl.addTransform('findIndex', arrayFindIndex);

const arrayReduce = async (input: unknown[], expression: string, initialValue: unknown): Promise<unknown> => {
    if (!Array.isArray(input)) {
        return undefined;
    }
    const expr = jexl.compile(expression);
    let accumulator = initialValue;
    for (let index = 0; index < input.length; index++) {
        const value = input[index];
        accumulator = await expr.eval({accumulator, value, index, array: input});
    }
    return accumulator;
};

jexl.addFunction('reduce', arrayReduce);
jexl.addFunction('$reduce', arrayReduce);
jexl.addTransform('reduce', arrayReduce);

// Add more custom generic functions
const arrayFirst = (array: unknown[]) => {
    if (!Array.isArray(array)) {
        return null;
    }
    return array[0] ?? null;
};

jexl.addFunction('first', arrayFirst);
jexl.addFunction('$first', arrayFirst);
jexl.addTransform('first', arrayFirst);

const arrayLast = (array: unknown[]) => {
    if (!Array.isArray(array)) {
        return null;
    }
    return array[array.length - 1] ?? null;
};

jexl.addFunction('last', arrayLast);
jexl.addFunction('$last', arrayLast);
jexl.addTransform('last', arrayLast);

const arrayFlatten = (array: unknown[]) => {
    if (!Array.isArray(array)) {
        return [];
    }
    return array.reduce(
        (acc: unknown[], val) => acc.concat(Array.isArray(val) ? arrayFlatten(val) : val),
        [] as unknown[],
    );
};

jexl.addFunction('flatten', arrayFlatten);
jexl.addFunction('$flatten', arrayFlatten);
jexl.addTransform('flatten', arrayFlatten);

export default jexl;
