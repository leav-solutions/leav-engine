export const doArrayIntersect = (includingArr, includedArr) => {
    let response = false
    includedArr.forEach(elm => {
        if (includingArr.includes(elm)) response = true;
    })
    return response;
}