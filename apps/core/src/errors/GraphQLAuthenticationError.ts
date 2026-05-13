import {type ASTNode, GraphQLError, type GraphQLErrorExtensions, type Source} from 'graphql';
import {type Maybe} from 'graphql/jsutils/Maybe';

export default class GraphQLAuthenticationError extends GraphQLError {
    public constructor(
        message = 'Unauthorized',
        nodes?: Maybe<readonly ASTNode[] | ASTNode>,
        source?: Maybe<Source>,
        positions?: Maybe<readonly number[]>,
        path?: Maybe<ReadonlyArray<string | number>>,
        originalError?: Maybe<Error>,
        extensions?: Maybe<GraphQLErrorExtensions>,
    ) {
        super(message, nodes, source, positions, path, originalError, {
            ...extensions,
            code: 'UNAUTHENTICATED',
        });
    }
}
