import {type IFormBuilderState, defaultDepValue} from '../formBuilderReducer';

export default function getKeyFromDepValue(depValue: IFormBuilderState['activeDependency']['value'] | null): string {
    return !!depValue ? depValue.id : defaultDepValue;
}
