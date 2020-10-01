import {GET_FORM_forms_list} from '../../../../../../../../../_gqlTypes/GET_FORM';
import {RecordIdentity_whoAmI} from '../../../../../../../../../_gqlTypes/RecordIdentity';
import {IKeyValue} from '../../../../../../../../../_types/shared';
import {IFormElement, IFormElementPos} from '../_types';
import addElement from './helpers/actions/addElement';
import changeActiveDependency from './helpers/actions/changeActiveDependency';
import closeSettings from './helpers/actions/closeSettings';
import moveElement from './helpers/actions/moveElement';
import openSettings from './helpers/actions/openSettings';
import removeElement from './helpers/actions/removeElement';
import removeTab from './helpers/actions/removeTab';
import saveSettings from './helpers/actions/saveSettings';

export type ElementsByDependencyAttribute = IKeyValue<ElementsByDependencyValue>;

export type ElementsByDependencyValue = IKeyValue<ElementsByContainer>;

export type ElementsByContainer = IKeyValue<IFormElement[]>;

export const defaultDepAttribute = '__default';
export const defaultDepValue = '__default';
export const defaultContainerId = '__root';

export interface IFormBuilderState {
    form: GET_FORM_forms_list;
    library: string;
    openSettings: boolean;
    activeDependency: {
        attribute: string;
        ancestors: RecordIdentity_whoAmI[];
        value: RecordIdentity_whoAmI | null;
    } | null;
    elementInSettings: IFormElement | null;
    elements: ElementsByDependencyAttribute;
    activeElements: ElementsByContainer;
}

export enum FormBuilderActionTypes {
    ADD_ELEMENT = 'ADD_ELEMENT',
    REMOVE_ELEMENT = 'REMOVE_ELEMENT',
    MOVE_ELEMENT = 'MOVE_ELEMENT',
    OPEN_SETTINGS = 'OPEN_SETTINGS',
    CLOSE_SETTINGS = 'CLOSE_SETTINGS',
    SAVE_SETTINGS = 'SAVE_SETTINGS',
    CHANGE_ACTIVE_DEPENDENCY = 'CHANGE_ACTIVE_DEPENDENCY',
    REMOVE_TAB = 'REMOVE_TAB'
}

export interface IFormBuilderActionAddElement {
    type: FormBuilderActionTypes.ADD_ELEMENT;
    element: Omit<IFormElement, 'order' | 'herited'>;
    position: IFormElementPos;
}
export interface IFormBuilderActionRemoveElement {
    type: FormBuilderActionTypes.REMOVE_ELEMENT;
    element: IFormElement;
}
export interface IFormBuilderActionMoveElement {
    type: FormBuilderActionTypes.MOVE_ELEMENT;
    elementId?: string;
    from: IFormElementPos;
    to: IFormElementPos;
}
export interface IFormBuilderActionOpenSettings {
    type: FormBuilderActionTypes.OPEN_SETTINGS;
    element: IFormElement;
}
export interface IFormBuilderActionCloseSettings {
    type: FormBuilderActionTypes.CLOSE_SETTINGS;
}
export interface IFormBuilderActionSaveSettings {
    type: FormBuilderActionTypes.SAVE_SETTINGS;
    settings: IKeyValue<any>;
    element?: IFormElement;
}
export interface IFormBuilderActionChangeActiveDependency {
    type: FormBuilderActionTypes.CHANGE_ACTIVE_DEPENDENCY;
    activeDependency: {
        attribute: string;
        ancestors: RecordIdentity_whoAmI[];
        value: RecordIdentity_whoAmI | null;
    } | null;
}
export interface IFormBuilderActionRemoveTab {
    type: FormBuilderActionTypes.REMOVE_TAB;
    parentElement: IFormElement;
    tabId: string;
}

export type FormBuilderAction =
    | IFormBuilderActionAddElement
    | IFormBuilderActionRemoveElement
    | IFormBuilderActionMoveElement
    | IFormBuilderActionOpenSettings
    | IFormBuilderActionCloseSettings
    | IFormBuilderActionSaveSettings
    | IFormBuilderActionChangeActiveDependency
    | IFormBuilderActionRemoveTab;

export type FormBuilderDispatchFunc = (action: FormBuilderAction) => void;

export interface IFormBuilderStateAndDispatch {
    state: IFormBuilderState;
    dispatch: FormBuilderDispatchFunc;
}

const formBuilderReducer = (state: IFormBuilderState, action: FormBuilderAction): IFormBuilderState => {
    switch (action.type) {
        case FormBuilderActionTypes.ADD_ELEMENT: {
            return addElement(state, action);
        }
        case FormBuilderActionTypes.REMOVE_ELEMENT: {
            return removeElement(state, action);
        }
        case FormBuilderActionTypes.MOVE_ELEMENT: {
            return moveElement(state, action);
        }
        case FormBuilderActionTypes.OPEN_SETTINGS: {
            return openSettings(state, action);
        }
        case FormBuilderActionTypes.CLOSE_SETTINGS: {
            return closeSettings(state, action);
        }
        case FormBuilderActionTypes.SAVE_SETTINGS: {
            return saveSettings(state, action);
        }
        case FormBuilderActionTypes.CHANGE_ACTIVE_DEPENDENCY: {
            return changeActiveDependency(state, action);
        }
        case FormBuilderActionTypes.REMOVE_TAB: {
            return removeTab(state, action);
        }
        default:
            return state;
    }
};

export default formBuilderReducer;
