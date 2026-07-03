import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createApiKeyValidator, createAuthMiddleware, extractApiKey} from '../../../auth/apiKeyAuth';

const CORE_URL = 'http://core.leav.localhost';
const API_KEY = 'test-api-key';

describe('extractApiKey', () => {
    it('should extract the key from an ApiKey header', () => {
        expect(extractApiKey(`ApiKey ${API_KEY}`)).toBe(API_KEY);
    });

    it('should return undefined when the header is missing', () => {
        expect(extractApiKey(undefined)).toBeUndefined();
    });

    it('should return undefined when the scheme is not ApiKey', () => {
        expect(extractApiKey(`Bearer ${API_KEY}`)).toBeUndefined();
    });

    it('should return undefined when the ApiKey value is empty', () => {
        expect(extractApiKey('ApiKey ')).toBeUndefined();
    });
});

describe('createApiKeyValidator', () => {
    const mockFetch = vi.fn();

    beforeEach(() => {
        vi.stubGlobal('fetch', mockFetch);
    });

    it('should validate the key against core/graphql with key as query param', async () => {
        mockFetch.mockResolvedValue({ok: true});
        const validate = createApiKeyValidator(CORE_URL);

        await validate(API_KEY);

        expect(mockFetch).toHaveBeenCalledWith(
            `${CORE_URL}/graphql?key=${API_KEY}`,
            expect.objectContaining({method: 'POST'}),
        );
    });

    it('should return true when core answers 2xx', async () => {
        mockFetch.mockResolvedValue({ok: true});
        const validate = createApiKeyValidator(CORE_URL);

        await expect(validate(API_KEY)).resolves.toBe(true);
    });

    it('should return false when core answers 401 (invalid/expired key)', async () => {
        mockFetch.mockResolvedValue({ok: false, status: 401});
        const validate = createApiKeyValidator(CORE_URL);

        await expect(validate(API_KEY)).resolves.toBe(false);
    });

    it('should fail closed (return false) when core is unreachable', async () => {
        mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));
        const validate = createApiKeyValidator(CORE_URL);

        await expect(validate(API_KEY)).resolves.toBe(false);
    });
});

describe('createAuthMiddleware', () => {
    const makeRes = () => {
        const res: any = {locals: {}};
        res.status = vi.fn().mockReturnValue(res);
        res.json = vi.fn().mockReturnValue(res);
        return res;
    };
    const makeReq = (authorization?: string) =>
        ({get: (name: string) => (name === 'authorization' ? authorization : undefined)}) as any;

    it('should 401 when the Authorization header is missing', async () => {
        const validate = vi.fn();
        const middleware = createAuthMiddleware(validate);
        const res = makeRes();
        const next = vi.fn();

        await middleware(makeReq(), res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
        expect(validate).not.toHaveBeenCalled();
    });

    it('should 401 when the key is rejected by core', async () => {
        const validate = vi.fn().mockResolvedValue(false);
        const middleware = createAuthMiddleware(validate);
        const res = makeRes();
        const next = vi.fn();

        await middleware(makeReq(`ApiKey ${API_KEY}`), res, next);

        expect(validate).toHaveBeenCalledWith(API_KEY);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next and stash the key on res.locals when valid', async () => {
        const validate = vi.fn().mockResolvedValue(true);
        const middleware = createAuthMiddleware(validate);
        const res = makeRes();
        const next = vi.fn();

        await middleware(makeReq(`ApiKey ${API_KEY}`), res, next);

        expect(res.locals.apiKey).toBe(API_KEY);
        expect(next).toHaveBeenCalledOnce();
        expect(res.status).not.toHaveBeenCalled();
    });
});
