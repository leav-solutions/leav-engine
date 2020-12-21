// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    defaultContainerId,
    defaultDepAttribute,
    defaultDepValue,
    IFormBuilderActionRemoveElement,
    IFormBuilderState
} from '../../formBuilderReducer';
import getKeyFromDepValue from '../getKeyFromDepValue';
import removeElementById from '../removeElementById';

export default (state: IFormBuilderState, action: IFormBuilderActionRemoveElement) => {
    const depAttributeKey = state.activeDependency ? state.activeDependency.attribute : defaultDepAttribute;
    const depValueKey = state.activeDependency ? getKeyFromDepValue(state.activeDependency.value) : defaultDepValue;
    const containerId = action.element.containerId ?? defaultContainerId;

    return removeElementById(state, action.element.id, depAttributeKey, depValueKey, containerId);
};
