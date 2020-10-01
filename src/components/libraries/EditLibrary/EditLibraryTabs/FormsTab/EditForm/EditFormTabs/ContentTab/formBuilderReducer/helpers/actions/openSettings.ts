import {IFormBuilderActionOpenSettings, IFormBuilderState} from '../../formBuilderReducer';

export default (state: IFormBuilderState, action: IFormBuilderActionOpenSettings) => ({
    ...state,
    openSettings: true,
    elementInSettings: action.element
});
