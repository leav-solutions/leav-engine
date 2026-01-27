// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import axios, {type AxiosResponse} from 'axios';
import config from '../config';
import {E2EGraphQLError} from './E2EGraphQLError';

export class GenericClient {
    protected async makeGraphqlCall<T>(query: string, variables?: any): Promise<AxiosResponse<T>> {
        try {
            const res = await axios.post(
                `${config.baseUrl}/graphql`,
                {
                    query,
                    variables,
                },
                {
                    params: {
                        key: config.testApiKey,
                    },
                    responseType: 'json',
                },
            );

            if (res.status === 200 && res.data.errors?.length) {
                throw new E2EGraphQLError(
                    `${res.data.errors[0].message} - ${JSON.stringify(
                        res.data.errors[0]?.extensions?.fields,
                    )} - Code ${res.data.errors[0]?.extensions?.code} - Query was: ${query}`,
                    res,
                );
            } else if (res.status !== 200) {
                throw new E2EGraphQLError(`HTTP error ${res.status} - Query was: ${query}`, res);
            }
            return res;
        } catch (error) {
            if (!(error instanceof E2EGraphQLError)) {
                console.error(
                    'GraphQL query error:',
                    error.message,
                    '\n',
                    error.response?.data ?? '',
                    `- Query was: ${query}`,
                );
            }
            throw error;
        }
    }
}
