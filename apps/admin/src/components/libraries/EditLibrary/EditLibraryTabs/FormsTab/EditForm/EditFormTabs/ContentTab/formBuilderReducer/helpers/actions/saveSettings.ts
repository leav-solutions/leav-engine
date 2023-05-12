// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import cloneDeep from 'lodash/cloneDeep';
import {IFormElement} from '../../../_types';
import {defaultContainerId, IFormBuilderActionSaveSettings, IFormBuilderState} from '../../formBuilderReducer';
import getKeyFromDepValue from '../getKeyFromDepValue';

export default function saveSettings(state: IFormBuilderState, action: IFormBuilderActionSaveSettings) {
    const elementToUpdate = action.element ?? state.elementInSettings;

    if (!elementToUpdate) {
        return state;
    }

    const depAttrKey = state.activeDependency?.attribute || '__default';
    const depValueKey = state.activeDependency?.value ? getKeyFromDepValue(state.activeDependency.value) : '__default';
    const containerId = elementToUpdate.containerId ?? defaultContainerId;

    const indexInFields = state.elements[depAttrKey][depValueKey][containerId].findIndex(
        el => el.id === elementToUpdate.id
    );
    const indexInActiveFields = state.activeElements[containerId].findIndex(el => el.id === elementToUpdate.id);

    if (indexInFields < 0 || indexInActiveFields < 0) {
        return state;
    }
    const newSettings = {...elementToUpdate.settings, ...action.settings};

    const newElement: IFormElement = {
        ...elementToUpdate,
        settings: newSettings
    };

    const newFields = cloneDeep(state.elements);
    newFields[depAttrKey][depValueKey][containerId][indexInFields] = newElement;

    const newActiveFields = {...state.activeElements};
    newActiveFields[containerId][indexInActiveFields] = {
        ...newActiveFields[containerId][indexInActiveFields],
        settings: newSettings
    };

    return {...state, elementInSettings: newElement, elements: newFields, activeElements: newActiveFields};
}
