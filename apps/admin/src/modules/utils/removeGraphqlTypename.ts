export const removeGraphqlTypename = <T>(value: T): T => {
    if (Array.isArray(value)) {
        return value.map(removeGraphqlTypename) as T;
    }

    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value)
                .filter(([key]) => key !== '__typename')
                .map(([key, val]) => [key, removeGraphqlTypename(val)]),
        ) as T;
    }

    return value;
};
