import {createTRPCClient, httpBatchLink, TRPCClientError, httpSubscriptionLink, splitLink} from '@trpc/client';

import {getConfig} from '../../../../config';
import {type FakePluginRouter} from '../_fixtures/fakeplugin';
import {e2eAdminUser} from '../e2eUtils';
import {ACCESS_TOKEN_COOKIE_NAME} from '../../../../_types/auth';
import {EventSource} from 'eventsource';

describe('tRPC router', () => {
    let trpcUrl: string;

    beforeAll(async () => {
        const conf = await getConfig();
        trpcUrl = `http://${conf.server.host}:${conf.server.port}/trpc`;
    });

    const createClient = async () => {
        const user = e2eAdminUser();
        const token = await user.getAuthToken();
        const headers = {Cookie: `${ACCESS_TOKEN_COOKIE_NAME}=${token}`};

        return createTRPCClient<FakePluginRouter>({
            links: [
                splitLink({
                    condition: op => op.type === 'subscription',
                    true: httpSubscriptionLink({
                        url: trpcUrl,
                        EventSource,
                        eventSourceOptions: {
                            fetch: (url, options) =>
                                fetch(url, {...options, headers: {...options.headers, ...headers}}),
                        },
                    }),
                    false: httpBatchLink({
                        url: trpcUrl,
                        fetch: (url, options) => fetch(url, {...options, headers: {...options.headers, ...headers}}),
                    }),
                }),
            ],
        });
    };

    describe('getStatus (query)', () => {
        test('returns input echoed back', async () => {
            const client = await createClient();
            const result = await client.getStatus.query('c1');
            expect(result).toMatchObject({input: 'c1'});
        });
    });

    describe('updateStatus (mutation)', () => {
        test('throws BAD_REQUEST with invalid status', async () => {
            const client = await createClient();
            await expect(
                // @ts-expect-error — intentionally testing an invalid status
                client.updateStatus.mutate({campaignId: 'c1', status: 'invalid'}),
            ).rejects.toMatchObject({data: {code: 'BAD_REQUEST'}});
        });

        test('throws BAD_REQUEST when campaignId is missing', async () => {
            const client = await createClient();
            // @ts-expect-error — intentionally testing missing campaignId
            await expect(client.updateStatus.mutate({status: 'pending'})).rejects.toMatchObject({
                data: {code: 'BAD_REQUEST'},
            });
        });

        test.each([['pending'], ['in_progress'], ['done']] as const)(
            'returns updated data for status "%s"',
            async status => {
                const client = await createClient();
                const result = await client.updateStatus.mutate({campaignId: 'c1', status});

                expect(result).toMatchObject({
                    campaignId: 'c1',
                    status,
                    updatedAt: expect.any(String),
                });
            },
        );
    });

    describe('onStatusChange (subscription)', () => {
        test('receives updates when status changes', async () => {
            const client = await createClient();
            let subscription;

            const promise = new Promise<void>(async (resolve, reject) => {
                subscription = client.onStatusChange.subscribe(undefined, {onData: resolve, onError: reject});
            }).finally(() => subscription.unsubscribe());

            // Trigger a status update
            client.updateStatus.mutate({campaignId: 'c1', status: 'in_progress'});

            expect(await promise).toMatchObject({
                campaignId: 'c1',
                status: 'in_progress',
                updatedAt: expect.any(String),
            });
        });
    });

    test('network errors surface as TRPCClientError', async () => {
        const client = createTRPCClient<FakePluginRouter>({
            links: [httpBatchLink({url: 'http://127.0.0.1:1/trpc'})],
        });
        await expect(client.getStatus.query('c1')).rejects.toThrow(TRPCClientError);
    });
});
