// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type AxiosResponse} from 'axios';

export class E2EGraphQLError extends Error {
    public response: AxiosResponse;

    public constructor(message: string, response: AxiosResponse) {
        super(message);
        this.response = response;
    }
}
