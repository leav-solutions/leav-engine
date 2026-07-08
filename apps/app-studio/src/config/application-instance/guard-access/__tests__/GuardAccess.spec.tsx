import {render, screen} from '_ui/_tests/testUtils';
import {GuardAccess} from '../GuardAccess';
import * as GraphQLClient from '../../../../__generated__';

describe('GuardAccess component', () => {
    it('should display error on permission "access_application" forbidden', async () => {
        vi.spyOn(GraphQLClient, 'useGetApplicationDataByEndpointQuery').mockReturnValue({
            data: {
                applications: {
                    list: [
                        {
                            permissions: {
                                access_application: false,
                            },
                        },
                    ],
                },
            },
        } as any);

        render(<GuardAccess />);

        expect(screen.getByText(/access_denied_details/)).toBeVisible();
        expect(screen.getByText(/access_denied$/)).toBeVisible();
    });

    it('should allow access to children on permission "access_application" allowed', async () => {
        vi.spyOn(GraphQLClient, 'useGetApplicationDataByEndpointQuery').mockReturnValue({
            data: {
                applications: {
                    list: [
                        {
                            permissions: {
                                access_application: true,
                            },
                        },
                    ],
                },
            },
        } as any);
        const childLabel = 'Child';

        render(<GuardAccess>{childLabel}</GuardAccess>);

        expect(screen.getByText(childLabel)).toBeVisible();
    });
});
