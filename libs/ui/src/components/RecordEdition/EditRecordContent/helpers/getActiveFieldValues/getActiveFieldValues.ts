// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ICommonFieldsReducerState} from '../../_types';

export default <ValuesType = any>(state: ICommonFieldsReducerState<ValuesType>) =>
    state.values[state.activeScope].values;
