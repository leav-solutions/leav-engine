// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {GuardAccess} from '../GuardAccess';
import * as GraphQLClient from '../../../../__generated__';

describe('GuardAccess component', () => {
    it('should display error on permission "access_application" forbidden', async () => {
        jest.spyOn(GraphQLClient, 'useGetApplicationDataByEndpointQuery').mockReturnValue({
            data: {
                applications: {
                    list: [
                        {
                            permissions: {
                                access_application: false
                            }
                        }
                    ]
                }
            }
        } as any);

        render(<GuardAccess />);

        expect(screen.getByText(/access_denied_details/)).toBeVisible();
        expect(screen.getByText(/access_denied$/)).toBeVisible();
    });

    it('should allow access to children on permission "access_application" allowed', async () => {
        jest.spyOn(GraphQLClient, 'useGetApplicationDataByEndpointQuery').mockReturnValue({
            data: {
                applications: {
                    list: [
                        {
                            permissions: {
                                access_application: true
                            }
                        }
                    ]
                }
            }
        } as any);
        const childLabel = 'Child';

        render(<GuardAccess>{childLabel}</GuardAccess>);

        expect(screen.getByText(childLabel)).toBeVisible();
    });
});
