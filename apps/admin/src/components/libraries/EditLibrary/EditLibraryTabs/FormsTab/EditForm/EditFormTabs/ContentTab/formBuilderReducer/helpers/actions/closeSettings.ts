import {type IFormBuilderActionCloseSettings, type IFormBuilderState} from '../../formBuilderReducer';

export default function closeSettings(state: IFormBuilderState, action: IFormBuilderActionCloseSettings) {
    return {
        ...state,
        openSettings: false,
        elementInSettings: null,
    };
}
