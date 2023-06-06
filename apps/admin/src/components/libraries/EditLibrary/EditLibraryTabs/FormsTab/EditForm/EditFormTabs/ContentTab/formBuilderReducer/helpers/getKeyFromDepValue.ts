// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IFormBuilderState, defaultDepValue} from '../formBuilderReducer';

export default function getKeyFromDepValue(depValue: IFormBuilderState['activeDependency']['value'] | null): string {
    return !!depValue ? depValue.id : defaultDepValue;
}
