import { LeavServerError } from './LeavServerError';

export const getLeavFallbackLanguage = (): Promise<string> | never =>
    fetch('/global-lang', { method: 'GET' }).then(response => {
        if (response.ok) {
            return response.text();
        }
        throw new LeavServerError();
    });
