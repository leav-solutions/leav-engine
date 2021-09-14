// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export interface IUseAuthToken {
    getToken: () => string;
    saveToken: (token: string) => void;
    deleteToken: () => void;
}

const STORAGE_TOKEN_KEY = 'accessToken';

export default function (): IUseAuthToken {
    const storage = window.sessionStorage;
    return {
        getToken(): string {
            return storage.getItem(STORAGE_TOKEN_KEY) ?? '';
        },
        saveToken(token: string) {
            storage.setItem(STORAGE_TOKEN_KEY, token);
        },
        deleteToken() {
            storage.removeItem(STORAGE_TOKEN_KEY);
        }
    };
}
