// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GraphQLScalarType, ValueNode} from 'graphql';
import {IKeyValue} from '_types/shared';
import parseLiteral from '../helpers/parseLiteral';

export default function (): GraphQLScalarType {
    return new GraphQLScalarType({
        name: 'Any',
        description: 'Can be anything',
        serialize: val => val,
        parseValue: val => val,
        parseLiteral: (ast: ValueNode, variables: IKeyValue<unknown>): unknown => parseLiteral('Any', ast, variables)
    });
}
