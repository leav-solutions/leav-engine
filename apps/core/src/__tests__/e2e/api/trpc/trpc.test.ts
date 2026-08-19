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
            const result = await client.getStatus.query('query_c1');
            expect(result).toMatchObject({input: 'query_c1'});
        });
    });

    describe('updateStatus (mutation)', () => {
        test('throws BAD_REQUEST with invalid status', async () => {
            const client = await createClient();
            await expect(
                // @ts-expect-error — intentionally testing an invalid status
                client.updateStatus.mutate({campaignId: 'update_c2', status: 'invalid'}),
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
                const result = await client.updateStatus.mutate({campaignId: `update_c3_${status}`, status});

                expect(result).toMatchObject({
                    campaignId: `update_c3_${status}`,
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

            const promise = new Promise<void>((resolve, reject) => {
                subscription = client.onStatusChange.subscribe(undefined, {
                    onData: data => {
                        if (data.campaignId === 'subscribe_c4') {
                            resolve(data);
                        }
                    },
                    onError: reject,
                });
            }).finally(() => subscription.unsubscribe());

            // Trigger a status update
            client.updateStatus.mutate({campaignId: 'subscribe_c4', status: 'in_progress'});

            expect(await promise).toMatchObject({
                campaignId: 'subscribe_c4',
                status: 'in_progress',
                updatedAt: expect.any(String),
            });
        });
    });

    test('network errors surface as TRPCClientError', async () => {
        const client = createTRPCClient<FakePluginRouter>({
            links: [httpBatchLink({url: 'http://127.0.0.1:1/trpc'})],
        });
        await expect(client.getStatus.query('error_c5')).rejects.toThrow(TRPCClientError);
    });
});
