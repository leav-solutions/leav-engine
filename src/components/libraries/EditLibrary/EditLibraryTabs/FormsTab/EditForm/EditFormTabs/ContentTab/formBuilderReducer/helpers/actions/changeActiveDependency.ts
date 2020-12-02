// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import cloneDeep from 'lodash/cloneDeep';
import {RecordIdentity_whoAmI} from '../../../../../../../../../../../_gqlTypes/RecordIdentity';
import {
    defaultDepAttribute,
    defaultDepValue,
    IFormBuilderActionChangeActiveDependency,
    IFormBuilderState
} from '../../formBuilderReducer';
import getKeyFromDepValue from '../getKeyFromDepValue';
import mergeConcat from '../mergeConcat';

export default (state: IFormBuilderState, action: IFormBuilderActionChangeActiveDependency) => {
    const {attribute = '', value = {}, ancestors = []} = action.activeDependency ?? {};

    // Retrieve active fields.
    // Always take default fields, set it as herited if we have an active dependency
    let activeFields = cloneDeep(state.elements[defaultDepAttribute][defaultDepValue]);
    for (const containerId of Object.keys(activeFields)) {
        activeFields[containerId] = activeFields[containerId].map(f => ({
            ...f,
            herited: attribute && (value as RecordIdentity_whoAmI)?.id ? true : false
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
        const currentDepKey = getKeyFromDepValue(value as RecordIdentity_whoAmI);
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
};
