// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import * as GraphQLClient from '../../../../__generated__';
import {InitDocumentTitle} from '../InitDocumentTitle';

describe('InitDocumentTitle component', () => {
    beforeEach(() => {
        jest.spyOn(GraphQLClient, 'useGetApplicationDataByEndpointQuery').mockReturnValue({
            data: {
                applications: {
                    list: [
                        {
                            label: {
                                fr: 'Mon application',
                                en: 'My application'
                            }
                        }
                    ]
                }
            }
        } as any);
    });

    it('should has no effect on children', async () => {
        const children = 'myApplication';

        render(<InitDocumentTitle>{children}</InitDocumentTitle>);

        expect(screen.getByText(children)).toBeVisible();
    });

    it('should has no effect on children', async () => {
        render(<InitDocumentTitle />);

        expect(document.title).toBe('Mon application');
    });
});
