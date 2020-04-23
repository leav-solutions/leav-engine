const generateReserveParam = param => {
    param.value = param.value ? param.value : param.default_value;
    return param;
};

export const generateReserveActionFrom = action => {
    if (action.params && action.params.length) {
        action.params.map(generateReserveParam);
    } else {
        action.params = null;
    }
    return action;
};