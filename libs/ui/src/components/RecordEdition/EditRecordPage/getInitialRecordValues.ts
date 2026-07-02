export const INITIAL_VALUES_QUERY_PARAMS = 'formInitialValues';

const removeFromQueryParams = (paramToRemove: string) => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get(paramToRemove)) {
        searchParams.delete(paramToRemove);
        const queryParams = searchParams.size > 0 ? `?${searchParams.toString()}` : '';
        history.replaceState({}, '', `${location.pathname}${queryParams}`);
    }
};

export const getInitialRecordValues = () => {
    const searchParams = new URLSearchParams(location.search);
    const decodedParams = decodeURIComponent(searchParams.get(INITIAL_VALUES_QUERY_PARAMS) ?? '{}');
    let initialValues = null;
    try {
        initialValues = JSON.parse(decodedParams);
        removeFromQueryParams(INITIAL_VALUES_QUERY_PARAMS);
    } catch {
        return [];
    }

    if (!initialValues || Object.keys(initialValues).length === 0) {
        return [];
    }

    const values = [];
    Object.keys(initialValues).forEach(attributeId => {
        initialValues[attributeId].forEach(val => {
            values.push({attribute: attributeId, payload: val});
        });
    });

    return values;
};
