import {Kind, ObjectValueNode, print, ValueNode} from 'graphql';

const _parseObject = (typeName: string, ast: ObjectValueNode, variables?: {[key: string]: any}) => {
    const value = Object.create(null);
    ast.fields.forEach(field => {
        value[field.name.value] = graphqlParseLiteral(typeName, field.value, variables);
    });

    return value;
};

export const graphqlParseLiteral = (typeName: string, ast: ValueNode, variables?: {[key: string]: any}): any => {
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
            return ast.values.map(n => graphqlParseLiteral(typeName, n, variables));
        case Kind.NULL:
            return null;
        case Kind.VARIABLE:
            return variables ? variables[ast.name.value] : undefined;
        default:
            throw new TypeError(`${typeName} cannot represent value: ${print(ast)}`);
    }
};
