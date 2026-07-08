import {type FunctionComponent} from 'react';
import {render, screen} from '_ui/_tests/testUtils';
import {useUser} from '@leav/ui';
import * as graphqlClient from '../../../__generated__';
import {InitUser} from '../InitUser';

describe('InitUser component', () => {
    const spyOnUseGetUserIdentityQuery = vi.spyOn(graphqlClient, 'useGetUserIdentityQuery');
    const mockUsageOfUserContext = vi.fn();

    const FakeComponentLabel = 'FakeComponent';
    const FakeComponent: FunctionComponent = () => {
        const userIdentity = useUser();

        mockUsageOfUserContext(userIdentity);

        return <span>{FakeComponentLabel}</span>;
    };

    beforeEach(() => {
        spyOnUseGetUserIdentityQuery.mockClear();
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it('should provider null object when userIdentity is empty', async () => {
        spyOnUseGetUserIdentityQuery.mockReturnValue({data: null} as any);

        render(
            <InitUser>
                <FakeComponent />
            </InitUser>,
        );

        expect(spyOnUseGetUserIdentityQuery).toHaveBeenCalledTimes(1);
        expect(screen.getByText(FakeComponentLabel)).toBeVisible();
        expect(mockUsageOfUserContext).toHaveBeenCalledWith({
            userData: null,
        });
    });

    it('should provider userData object when userIdentity is full', async () => {
        spyOnUseGetUserIdentityQuery.mockReturnValue({
            data: {
                me: {
                    id: '1234567890',
                    whoAmI: {
                        id: '1234567890',
                        library: {
                            id: 'libraryId',
                        },
                    },
                },
            },
        } as any);

        render(
            <InitUser>
                <FakeComponent />
            </InitUser>,
        );

        expect(spyOnUseGetUserIdentityQuery).toHaveBeenCalledTimes(1);
        expect(screen.getByText(FakeComponentLabel)).toBeVisible();
        expect(mockUsageOfUserContext).toHaveBeenCalledWith({
            userData: {
                userId: '1234567890',
                userWhoAmI: {
                    id: '1234567890',
                    library: {
                        id: 'libraryId',
                    },
                },
            },
        });
    });

    it('should raise error if call is in error state', async () => {
        spyOnUseGetUserIdentityQuery.mockReturnValue({error: 'network error'} as any);
        vi.spyOn(console, 'error').mockImplementation(() => vi.fn());

        expect(() => render(<InitUser />)).toThrow('network error');
    });
});
