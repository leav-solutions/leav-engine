import {IFormBuilderActionCloseSettings, IFormBuilderState} from '../../formBuilderReducer';

export default (state: IFormBuilderState, action: IFormBuilderActionCloseSettings) => ({
    ...state,
    openSettings: false,
    elementInSettings: null
});
