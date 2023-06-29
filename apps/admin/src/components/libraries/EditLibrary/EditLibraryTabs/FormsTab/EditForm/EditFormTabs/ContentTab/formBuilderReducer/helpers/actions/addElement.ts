// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {cloneDeep} from 'lodash';
import {IFormElement} from '../../../_types';
import {
    defaultContainerId,
    defaultDepAttribute,
    defaultDepValue,
    IFormBuilderActionAddElement,
    IFormBuilderState
} from '../../formBuilderReducer';
import getKeyFromDepValue from '../getKeyFromDepValue';
import mergeConcat from '../mergeConcat';
import sortByOrder from '../sortByOrder';

export default function addElement(state: IFormBuilderState, action: IFormBuilderActionAddElement) {
    const _updateOrder = (origId: string) => (el: IFormElement) => {
        const newEl = {...el};

        if (el.id === origId) {
            newEl.order = action.position.order;
            return newEl;
        }

        if (el.order >= action.position.order) {
            newEl.order++;
        }

        return newEl;
    };

    const elementToAdd: IFormElement = {
        ...action.element,
        order: action.position.order,
        containerId: action.position.containerId
    };

    // Add field
    let newElementsByDeps = cloneDeep(state.elements);
    const containerId = elementToAdd.containerId ?? defaultContainerId;

    const depAttributeKey =
        state.activeDependency && state.activeDependency.value ? state.activeDependency.attribute : defaultDepAttribute;
    const depValueKey =
        state.activeDependency && state.activeDependency.value
            ? getKeyFromDepValue(state.activeDependency.value)
            : defaultDepValue;

    const elementToMerge = {
        [depAttributeKey]: {
            [depValueKey]: {
                [containerId]: [elementToAdd]
            }
        }
    };
    newElementsByDeps = mergeConcat(newElementsByDeps, elementToMerge);

    newElementsByDeps[depAttributeKey][depValueKey][containerId] = newElementsByDeps[depAttributeKey][depValueKey][
        containerId
    ]
        .map(_updateOrder(elementToAdd.id))
        .sort(sortByOrder);

    const elementToMergeToActiveFields = {
        [containerId]: [{...elementToAdd, herited: false}]
    };
    const newActiveFields = mergeConcat(cloneDeep(state.activeElements), elementToMergeToActiveFields);

    newActiveFields[containerId] = newActiveFields[containerId].map(_updateOrder(elementToAdd.id)).sort(sortByOrder);

    return {
        ...state,
        elements: newElementsByDeps,
        activeElements: newActiveFields
    };
}
