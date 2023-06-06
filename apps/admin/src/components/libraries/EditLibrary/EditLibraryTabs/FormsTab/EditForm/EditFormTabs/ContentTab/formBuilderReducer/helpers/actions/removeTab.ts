// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IFormElement} from '../../../_types';
import {ITabSettings} from '../../../uiElements/layout/Tabs/Tabs';
import {
    defaultContainerId,
    defaultDepAttribute,
    defaultDepValue,
    IFormBuilderActionRemoveTab,
    IFormBuilderState
} from '../../formBuilderReducer';
import getKeyFromDepValue from '../getKeyFromDepValue';
import removeElementById from '../removeElementById';

export default function removeTab(state: IFormBuilderState, action: IFormBuilderActionRemoveTab): IFormBuilderState {
    const depAttributeKey = state.activeDependency ? state.activeDependency.attribute : defaultDepAttribute;
    const depValueKey = state.activeDependency ? getKeyFromDepValue(state.activeDependency.value) : defaultDepValue;
    const containerId = action.parentElement.containerId ?? defaultContainerId;
    const tabContainerId = `${action.parentElement.id}/${action.tabId}`;

    // Remove elements linked to tab
    const tmpState = removeElementById(state, tabContainerId, depAttributeKey, depValueKey, containerId);

    // Update tabs element settings
    const indexInElems = tmpState.elements[depAttributeKey][depValueKey][containerId].findIndex(
        el => el.id === action.parentElement.id
    );
    const indexInActiveElems = tmpState.activeElements[containerId].findIndex(el => el.id === action.parentElement.id);

    if (indexInElems >= 0 && indexInActiveElems >= 0) {
        const newSettings = {
            ...action.parentElement.settings,
            tabs: [...(action.parentElement.settings?.tabs as ITabSettings[])].filter(t => t.id !== action.tabId)
        };

        const newElement: IFormElement = {
            ...action.parentElement,
            settings: newSettings
        };

        tmpState.elements[depAttributeKey][depValueKey][containerId][indexInElems] = newElement;
        tmpState.activeElements[containerId][indexInActiveElems] = newElement;
    }

    return tmpState;
}
