interface IAuthenticationErrorOptions {
    retryAuthenticationFlow?: boolean;
}

export default class AuthenticationError extends Error {
    public readonly retryAuthenticationFlow: boolean;
    public constructor(message = 'Unauthorized', options: IAuthenticationErrorOptions = {}) {
        super(message);
        this.retryAuthenticationFlow = options.retryAuthenticationFlow ?? false;
    }
}
