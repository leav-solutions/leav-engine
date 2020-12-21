// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export const doArrayIntersect = (includingArr, includedArr) => {
    let response = false;
    includedArr.forEach(elm => {
        if (includingArr.includes(elm)) {
            response = true;
        }
    });
    return response;
};
