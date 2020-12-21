// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
