// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

export const generateReserveActionFrom = action => {
    const newAction = {...action};
    if (newAction.params && newAction.params.length) {
        newAction.params = newAction.params.map(param => ({
            ...param,
            value: param.value
        }));
    } else {
        newAction.params = null;
    }
    return newAction;
};
