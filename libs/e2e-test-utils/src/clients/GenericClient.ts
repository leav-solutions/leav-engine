import {type TypedDocumentNode} from '@graphql-typed-document-node/core';
import {ClientError, GraphQLClient, type GraphQLResponse} from 'graphql-request';
import {getSdk} from '../_gqlTypes';
import {baseConfig} from '../baseConfig';

export class GenericClient {
    protected url = `${baseConfig.baseUrl}/graphql?key=${baseConfig.testApiKey}`;

    protected baseSdk = getSdk(new GraphQLClient(this.url, {}));

    protected async graphqlRequestWithFiles<TResult, TVariables extends object = object>(
        mutation: TypedDocumentNode<TResult, TVariables>,
        files: Array<{variableName: string; file: File}>,
        variables?: TVariables,
    ): Promise<TResult> {
        const form = new FormData();
        const query = mutation.loc?.source.body;
        if (!query) {
            throw new Error('Mutation document has no source body');
        }

        form.append('operations', JSON.stringify({query, variables}));

        // build and set map before appending files
        const map: Record<string, string[]> = {};
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            map[i.toString()] = [`variables.${file.variableName}`];
        }
        form.append('map', JSON.stringify(map));

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            form.append(i.toString(), file.file);
        }

        const response = await fetch(this.url, {
            method: 'POST',
            headers: {
                'x-apollo-operation-name': mutation.loc?.source.name || 'UnnamedMutation',
            },
            body: form,
        });

        const res: GraphQLResponse<TResult> = await response.json();
        if (res.errors) {
            throw new ClientError(res, {
                query,
                variables,
            });
        }
        return res.data as TResult;
    }
}
