// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

export default class AuthenticationError extends Error {
    public constructor(message: string = 'Unauthorized') {
        super();
        this.message = message;
    }
}
