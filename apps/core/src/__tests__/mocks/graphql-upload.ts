import {GraphQLScalarType} from 'graphql';

const GraphQLUpload = new GraphQLScalarType({
    name: 'Upload',
    description: 'Mock for file upload scalar',
    parseValue: value => value,
    parseLiteral: () => null,
    serialize: value => value,
});

export default GraphQLUpload;
