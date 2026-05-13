import {
    defaultContainerId,
    defaultDepAttribute,
    defaultDepValue,
    type IFormBuilderActionRemoveElement,
    type IFormBuilderState,
} from '../../formBuilderReducer';
import getKeyFromDepValue from '../getKeyFromDepValue';
import removeElementById from '../removeElementById';

export default function removeElement(state: IFormBuilderState, action: IFormBuilderActionRemoveElement) {
    const depAttributeKey = state.activeDependency ? state.activeDependency.attribute : defaultDepAttribute;
    const depValueKey = state.activeDependency ? getKeyFromDepValue(state.activeDependency.value) : defaultDepValue;
    const containerId = action.element.containerId ?? defaultContainerId;

    return removeElementById(state, action.element.id, depAttributeKey, depValueKey, containerId);
}
