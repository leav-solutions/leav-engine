import {type IFormBuilderActionOpenSettings, type IFormBuilderState} from '../../formBuilderReducer';

export default function openSettings(state: IFormBuilderState, action: IFormBuilderActionOpenSettings) {
    return {
        ...state,
        openSettings: true,
        elementInSettings: action.element,
    };
}
