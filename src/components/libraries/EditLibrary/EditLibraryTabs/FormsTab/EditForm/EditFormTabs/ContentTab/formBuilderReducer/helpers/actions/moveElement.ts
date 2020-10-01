import cloneDeep from 'lodash/cloneDeep';
import {
    defaultDepAttribute,
    defaultDepValue,
    IFormBuilderActionMoveElement,
    IFormBuilderState
} from '../../formBuilderReducer';
import getKeyFromDepValue from '../getKeyFromDepValue';
import mergeConcat from '../mergeConcat';
import sortByOrder from '../sortByOrder';

export default (state: IFormBuilderState, action: IFormBuilderActionMoveElement) => {
    let newFieldsByDeps = cloneDeep(state.elements);
    let newActiveFields = cloneDeep(state.activeElements);

    const depAttributeKey = state.activeDependency ? state.activeDependency.attribute : defaultDepAttribute;
    const depValueKey = state.activeDependency ? getKeyFromDepValue(state.activeDependency.value) : defaultDepValue;

    // Same container ID => just re order
    if (action.to.containerId === action.from.containerId) {
        const moveDirection = action.from.order > action.to.order ? 'down' : 'up';
        const _updateOrder = origId => el => {
            const newEl = {...el};

            if (el.id === origId) {
                newEl.order = action.to.order;
                return newEl;
            }

            if (moveDirection === 'down' && el.order >= action.to.order && el.order < action.from.order) {
                newEl.order++;
            } else if (moveDirection === 'up' && el.order > action.from.order && el.order <= action.to.order) {
                newEl.order--;
            }

            return newEl;
        };

        // Update fields
        newFieldsByDeps[depAttributeKey][depValueKey][action.from.containerId] = newFieldsByDeps[depAttributeKey][
            depValueKey
        ][action.from.containerId]
            .map(_updateOrder(action.elementId))
            .sort(sortByOrder);

        // Update active fields
        newActiveFields[action.to.containerId] = newActiveFields[action.to.containerId]
            .map(_updateOrder(action.elementId))
            .sort(sortByOrder);
    } else {
        const indexInActiveFields = state.activeElements[action.from.containerId].findIndex(
            el => el.id === action.elementId
        );

        if (indexInActiveFields === -1) {
            return state;
        }

        const newElement = {
            ...state.activeElements[action.from.containerId][indexInActiveFields],
            ...action.to
        };

        // Remove from source container
        if (typeof newFieldsByDeps[depAttributeKey][depValueKey][action.from.containerId] !== 'undefined') {
            newFieldsByDeps[depAttributeKey][depValueKey][action.from.containerId] = newFieldsByDeps[depAttributeKey][
                depValueKey
            ][action.from.containerId]
                .filter(el => el.id !== action.elementId)
                .map(el => ({...el, order: el.order > action.from.order ? el.order - 1 : el.order}))
                .sort(sortByOrder);
        }

        // Add to destination
        const elementToMerge = {
            [depAttributeKey]: {
                [depValueKey]: {
                    [action.to.containerId]: [newElement]
                }
            }
        };
        newFieldsByDeps = mergeConcat(newFieldsByDeps, elementToMerge);
        newFieldsByDeps[depAttributeKey][depValueKey][action.to.containerId] = newFieldsByDeps[depAttributeKey][
            depValueKey
        ][action.to.containerId]
            .map(el => ({
                ...el,
                order: el.order >= action.to.order && el.id !== action.elementId ? el.order + 1 : el.order
            }))
            .sort(sortByOrder);

        // Remove from source container
        if (typeof newActiveFields[action.from.containerId] !== 'undefined') {
            newActiveFields[action.from.containerId] = newActiveFields[action.from.containerId]
                .filter(el => el.id !== action.elementId)
                .map(el => ({...el, order: el.order > action.from.order ? el.order - 1 : el.order}))
                .sort(sortByOrder);
        }

        // Add to destination
        const elemToMerge = {
            [action.to.containerId]: [newElement]
        };
        newActiveFields = mergeConcat(newActiveFields, elemToMerge);
        newActiveFields[action.to.containerId] = newActiveFields[action.to.containerId]
            .map(el => ({
                ...el,
                order: el.order >= action.to.order && el.id !== action.elementId ? el.order + 1 : el.order
            }))
            .sort(sortByOrder);
    }

    return {...state, elements: newFieldsByDeps, activeElements: newActiveFields};
};
