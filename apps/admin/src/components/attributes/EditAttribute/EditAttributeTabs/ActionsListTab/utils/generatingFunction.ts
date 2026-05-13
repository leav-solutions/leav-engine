export const generateReserveActionFrom = action => {
    const newAction = {...action};
    if (newAction.params && newAction.params.length) {
        newAction.params = newAction.params.map(param => ({
            ...param,
            value: param.value,
        }));
    } else {
        newAction.params = null;
    }
    return newAction;
};
