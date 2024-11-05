// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IFormBuilderActionOpenSettings, IFormBuilderState} from '../../formBuilderReducer';

export default function openSettings(state: IFormBuilderState, action: IFormBuilderActionOpenSettings) {
    return {
        ...state,
        openSettings: true,
        elementInSettings: action.element
    };
}
