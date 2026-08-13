import {type IFormBuilderState} from '../../formBuilderReducer';

export default function closeSettings(state: IFormBuilderState) {
    return {
        ...state,
        openSettings: false,
        elementInSettings: null,
    };
}
