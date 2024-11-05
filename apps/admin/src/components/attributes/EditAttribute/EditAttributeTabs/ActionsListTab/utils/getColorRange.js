// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export const getColorsRangeFrom = nbr => {
    let sliceStart = 0;
    if (nbr < 5) {
        sliceStart = 5 - nbr;
        nbr = 5;
    }

    const currentColor = [255, 0, 0];
    const returnArr = [];
    const step = Math.floor((255 * 5) / nbr);
    let direction = 1; // change each time from 1 to -1 (* -1)
    let rank = 1; // change everytime with -1 if (< 0) => = 2

    const changeDirectionAndRank = () => {
        direction = direction * -1;
        rank = rank - 1;
        if (rank < 0) {
            rank = 2;
        }
    };

    while (returnArr.length < nbr) {
        currentColor[rank] += step * direction;
        if (direction === 1 ? currentColor[rank] > 255 : currentColor[rank] < 0) {
            changeDirectionAndRank();
        } else {
            returnArr.push([...currentColor]);
        }
    }
    return returnArr.slice(sliceStart);
};
