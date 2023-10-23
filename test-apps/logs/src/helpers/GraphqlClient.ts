// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import axios from 'axios';

export class GraphqlClient {
    private baseUrl: string;
    private authCookie: string | null = null;
    private gqlEndpoint = '/graphql';

    public constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    public async authenticate(login: string, password: string): Promise<void> {
        try {
            const response = await axios.post(`${this.baseUrl}/auth/authenticate`, {
                login,
                password
            });

            if (response.headers['set-cookie']) {
                // Récupérer le cookie d'authentification
                const cookieHeader = response.headers['set-cookie'][0];

                // Extract actual cookie value
                this.authCookie = cookieHeader.split(';')[0];
            } else {
                throw new Error('No auth cookie received');
            }
        } catch (error) {
            throw new Error('Authentication error : ' + error);
        }
    }

    public async makeCall(query: string) {
        if (!this.authCookie) {
            throw new Error('Auth is required');
        }

        try {
            const response = await axios.post(
                `${this.baseUrl}${this.gqlEndpoint}`,
                {query},
                {
                    headers: {
                        Cookie: this.authCookie
                    }
                }
            );

            return response;
        } catch (error) {
            throw new Error(
                `An error occured : ${error}. ${JSON.stringify(error?.response?.data)}. Query was: ${query}`
            );
        }
    }
}
