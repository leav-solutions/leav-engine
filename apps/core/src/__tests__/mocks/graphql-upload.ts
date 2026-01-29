// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GraphQLScalarType} from 'graphql';

const GraphQLUpload = new GraphQLScalarType({
    name: 'Upload',
    description: 'Mock for file upload scalar',
    parseValue: value => value,
    parseLiteral: () => null,
    serialize: value => value,
});

export default GraphQLUpload;
