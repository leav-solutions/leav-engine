import {IValue} from '_types/value';
import {AttributeTypes, IAttribute} from '../../../_types/attribute';

export default (value: IValue, attributeProps: IAttribute): boolean =>
    !!(value.id_value && attributeProps.type !== AttributeTypes.SIMPLE);
