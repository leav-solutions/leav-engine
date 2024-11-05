// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Kind, ObjectValueNode, print, ValueNode} from 'graphql';

const _parseObject = (typeName: string, ast: ObjectValueNode, variables?: {[key: string]: any}) => {
    const value = Object.create(null);
    ast.fields.forEach(field => {
        value[field.name.value] = parseLiteral(typeName, field.value, variables);
    });

    return value;
};

const parseLiteral = (typeName: string, ast: ValueNode, variables?: {[key: string]: unknown}): unknown => {
    switch (ast.kind) {
        case Kind.STRING:
        case Kind.BOOLEAN:
            return ast.value;
        case Kind.INT:
        case Kind.FLOAT:
            return parseFloat(ast.value);
        case Kind.OBJECT:
            return _parseObject(typeName, ast, variables);
        case Kind.LIST:
            return ast.values.map(n => parseLiteral(typeName, n, variables));
        case Kind.NULL:
            return null;
        case Kind.VARIABLE:
            return variables ? variables[ast.name.value] : undefined;
        default:
            throw new TypeError(`${typeName} cannot represent value: ${print(ast)}`);
    }
};

export default parseLiteral;
