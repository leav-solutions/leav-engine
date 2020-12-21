// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GraphQLScalarType, Kind, ValueNode} from 'graphql';
import {IUtils} from 'utils/utils';

interface IDeps {
    'core.utils'?: IUtils;
}

export default function ({'core.utils': utils = null}: IDeps): GraphQLScalarType {
    return new GraphQLScalarType({
        name: 'DateTime',
        description: `The DateTime scalar type represents time data,
            represented as an ISO-8601 encoded UTC date string.`,
        parseValue(value: string | number): Date {
            // value from the client in a variable
            if (typeof value !== 'string' && typeof value !== 'number') {
                throw new Error(`Value must be a string or a number, received ${value}`);
            }

            return new Date(Number(value) * 1000);
        },
        serialize(value: Date | number | string): string {
            if (!(value instanceof Date) && typeof value !== 'string' && typeof value !== 'number') {
                throw new Error(`Invalid date ${value}`);
            }

            const dateValue = value instanceof Date ? value : utils.timestampToDate(value);

            return dateValue.toISOString(); // value sent to the client
        },
        parseLiteral(ast: ValueNode) {
            // Value from the client directly in the query (no variable)
            if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
                return new Date(Number(ast.value) * 1000);
            }

            throw new Error('Value must be string or a number');
        }
    });
}
