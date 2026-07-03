import {type NextFunction, type Request, type Response} from 'express';
import {logger} from '@leav/logger';
import {buildCoreGraphqlUrl} from '../coreClient';

// Custom auth scheme rather than `Bearer`: a LEAV apiKey is not an OAuth 2.0 access token, and the
// MCP spec reserves `Authorization: Bearer` for a future OAuth flow. `ApiKey` keeps the credential
// in the Authorization header without colliding with that reserved slot.
const API_KEY_SCHEME = 'ApiKey ';

// Minimal query used to validate a key: it hits core's auth layer (which resolves the current
// user) without fetching anything expensive. core returns 401 for an invalid/expired key, 200 otherwise.
const VALIDATION_QUERY = '{ me { id } }';

// Extracts the LEAV apiKey from the Authorization header (`ApiKey <key>` scheme).
// Returns undefined when the header is missing or malformed.
export const extractApiKey = (authorizationHeader?: string): string | undefined => {
    if (!authorizationHeader?.startsWith(API_KEY_SCHEME)) {
        return undefined;
    }
    const apiKey = authorizationHeader.slice(API_KEY_SCHEME.length).trim();
    return apiKey.length > 0 ? apiKey : undefined;
};

// Validates an apiKey by reusing core's own auth: a minimal `me` query scoped to the key.
// This keeps a single source of truth for what a valid key is — no auth logic duplicated here.
export type ApiKeyValidator = (apiKey: string) => Promise<boolean>;

export const createApiKeyValidator =
    (coreUrl: string): ApiKeyValidator =>
    async apiKey => {
        try {
            const response = await fetch(buildCoreGraphqlUrl(coreUrl, apiKey), {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({query: VALIDATION_QUERY}),
            });
            // core answers 401 (AuthenticationError) for an invalid/expired key, 200 for a valid one.
            return response.ok;
        } catch (err) {
            // Network / core failure: fail closed — deny rather than let a request through unauthenticated.
            logger.warn(`apiKey validation failed to reach core: ${err instanceof Error ? err.message : err}`);
            return false;
        }
    };

// Express middleware that authenticates every MCP request via the `Authorization: ApiKey <apiKey>` header.
// On success the validated key is stashed on res.locals so the per-request tool handlers
// can forward it to core without the agent having to pass it as a tool input.
export const createAuthMiddleware =
    (validateApiKey: ApiKeyValidator) => async (req: Request, res: Response, next: NextFunction) => {
        const apiKey = extractApiKey(req.get('authorization'));
        if (!apiKey) {
            res.status(401).json({error: 'Missing or malformed Authorization header (expected: ApiKey <apiKey>)'});
            return;
        }

        if (!(await validateApiKey(apiKey))) {
            res.status(401).json({error: 'Invalid or expired apiKey'});
            return;
        }

        res.locals.apiKey = apiKey;
        next();
    };
