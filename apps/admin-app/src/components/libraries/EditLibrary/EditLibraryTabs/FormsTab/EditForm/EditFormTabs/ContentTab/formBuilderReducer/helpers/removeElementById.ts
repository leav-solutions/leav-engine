// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import cloneDeep from 'lodash/cloneDeep';
import {IFormElement} from '../../_types';
import {ElementsByContainer, IFormBuilderState} from '../formBuilderReducer';

const _cleanContainerChildren = (
    element: Pick<IFormElement, 'id'>,
    fieldsByContainer: ElementsByContainer
): ElementsByContainer => {
    let fields = cloneDeep(fieldsByContainer);

    if (typeof fields[element.id] !== 'undefined') {
        for (const child of fields[element.id]) {
            fields = _cleanContainerChildren(child, fields);
        }

        delete fields[element.id];
    }

    return fields;
};

export default (
    state: IFormBuilderState,
    elemId: string,
    depAttribute: string,
    depValue: string,
    containerId: string
): IFormBuilderState => {
    const newElemsByDeps = cloneDeep(state.elements);
    const _filterElem = el => el.id !== elemId;

    // Remove elements linked to tab
    newElemsByDeps[depAttribute][depValue][containerId] = newElemsByDeps[depAttribute][depValue][containerId].filter(
        _filterElem
    );
    newElemsByDeps[depAttribute][depValue] = _cleanContainerChildren(
        {
            id: elemId
        },
        newElemsByDeps[depAttribute][depValue]
    );

    let newActiveElems = cloneDeep(state.activeElements);
    newActiveElems[containerId] = state.activeElements[containerId].filter(_filterElem);

    newActiveElems = _cleanContainerChildren(
        {
            id: elemId
        },
        newActiveElems
    );

    return {...state, elements: newElemsByDeps, activeElements: newActiveElems};
};
