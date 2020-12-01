import {GraphQLScalarType, ValueNode} from 'graphql';
import {IKeyValue} from '_types/shared';
import parseLiteral from '../helpers/parseLiteral';

export default function(): GraphQLScalarType {
    return new GraphQLScalarType({
        name: 'Any',
        description: 'Can be anything',
        serialize: val => val,
        parseValue: val => val,
        parseLiteral: (ast: ValueNode, variables: IKeyValue<unknown>): unknown => parseLiteral('Any', ast, variables)
    });
}
