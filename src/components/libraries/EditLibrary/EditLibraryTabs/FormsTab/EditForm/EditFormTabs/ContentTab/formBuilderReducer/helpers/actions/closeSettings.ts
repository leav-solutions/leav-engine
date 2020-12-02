// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IFormBuilderActionCloseSettings, IFormBuilderState} from '../../formBuilderReducer';

export default (state: IFormBuilderState, action: IFormBuilderActionCloseSettings) => ({
    ...state,
    openSettings: false,
    elementInSettings: null
});
