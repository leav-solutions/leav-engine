import {IFormElement} from '../../_types';

const addElementAtPos = (element: IFormElement, elements: IFormElement[], index: number) => {
    let newElements = [...elements];

    if (index === 0) {
        newElements = [element, ...newElements];
    } else if (index === newElements.length) {
        newElements = [...newElements, element];
    } else {
        newElements = [...newElements.slice(0, index), element, ...newElements.slice(index)];
    }

    return newElements;
};

export default addElementAtPos;
