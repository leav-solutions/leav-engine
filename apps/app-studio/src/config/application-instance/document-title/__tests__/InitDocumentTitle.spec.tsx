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
                                en: 'My application',
                            },
                        },
                    ],
                },
            },
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
