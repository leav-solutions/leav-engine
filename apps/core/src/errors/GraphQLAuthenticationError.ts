// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {ASTNode, GraphQLError, GraphQLErrorExtensions, Source} from 'graphql';
import {Maybe} from 'graphql/jsutils/Maybe';

export default class GraphQLAuthenticationError extends GraphQLError {
    public constructor(
        message = 'Unauthorized',
        nodes?: Maybe<readonly ASTNode[] | ASTNode>,
        source?: Maybe<Source>,
        positions?: Maybe<readonly number[]>,
        path?: Maybe<ReadonlyArray<string | number>>,
        originalError?: Maybe<Error>,
        extensions?: Maybe<GraphQLErrorExtensions>
    ) {
        super(message, nodes, source, positions, path, originalError, {
            ...extensions,
            code: 'UNAUTHENTICATED'
        });
    }
}
