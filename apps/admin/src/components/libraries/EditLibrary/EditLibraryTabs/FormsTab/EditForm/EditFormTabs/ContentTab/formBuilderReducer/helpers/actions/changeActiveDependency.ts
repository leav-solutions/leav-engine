// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import cloneDeep from 'lodash/cloneDeep';
import {
    defaultDepAttribute,
    defaultDepValue,
    IFormBuilderActionChangeActiveDependency,
    IFormBuilderState
} from '../../formBuilderReducer';
import getKeyFromDepValue from '../getKeyFromDepValue';
import mergeConcat from '../mergeConcat';

export default function changeActiveDependency(
    state: IFormBuilderState,
    action: IFormBuilderActionChangeActiveDependency
) {
    const {attribute, value, ancestors} = action.activeDependency ?? {};

    // Retrieve active fields.
    // Always take default fields, set it as inherited if we have an active dependency
    let activeFields = cloneDeep(state.elements[defaultDepAttribute][defaultDepValue]);
    for (const containerId of Object.keys(activeFields)) {
        activeFields[containerId] = activeFields[containerId].map(f => ({
            ...f,
            herited: attribute && value?.id ? true : false
        }));
    }

    // We have an active dependency
    if (attribute) {
        // Retrieve ancestors (herited) fields
        for (const parent of ancestors) {
            const depKey = getKeyFromDepValue(parent);
            const depFields = state.elements?.[attribute]?.[depKey] ?? {};

            for (const containerId of Object.keys(depFields)) {
                depFields[containerId] = depFields[containerId].map(f => ({
                    ...f,
                    herited: true
                }));
            }

            activeFields = mergeConcat(activeFields, depFields);
        }

        // Retrieve fields for this dependency value
        const currentDepKey = getKeyFromDepValue(value as IFormBuilderState['activeDependency']['value']);
        const currentDepFields = state.elements?.[attribute]?.[currentDepKey] ?? {};

        for (const containerId of Object.keys(currentDepFields)) {
            currentDepFields[containerId] = currentDepFields[containerId].map(f => ({
                ...f,
                herited: false
            }));
        }

        activeFields = mergeConcat(activeFields, currentDepFields);
    }

    return {
        ...state,
        activeElements: activeFields,
        activeDependency: action.activeDependency ? {...action.activeDependency} : null
    };
}
