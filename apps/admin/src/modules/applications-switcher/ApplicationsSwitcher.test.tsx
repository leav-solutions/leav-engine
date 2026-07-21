import {render, screen} from '../../_tests/testUtils';
import {mockApplication} from '../../__mocks__/common/applications';
import {GetApplicationsDocument} from '../../_gqlTypes';
import {ApplicationsSwitcher} from './ApplicationsSwitcher';

describe('ApplicationsSwitcher', () => {
    test('Display list of available apps, filtering out the current app', async () => {
        const mocks = [
            {
                request: {
                    query: GetApplicationsDocument,
                    variables: {},
                },
                result: {
                    data: {
                        applications: {
                            list: [
                                {
                                    ...mockApplication,
                                    label: {en: 'My first app'},
                                    description: {en: 'My first description'},
                                },
                                {
                                    ...mockApplication,
                                    id: 'my-other-app',
                                    label: {en: 'My second app'},
                                    description: {en: 'My second description'},
                                },
                            ],
                        },
                    },
                },
            },
        ];
        render(<ApplicationsSwitcher />, {apolloMocks: mocks});

        await screen.findByText('My second app');

        // Only the second app is displayed: the first one is the current app (filtered out)
        expect(screen.getByText('My second app')).toBeInTheDocument();
        expect(screen.getByText('My second description')).toBeInTheDocument();
        expect(screen.queryByText('My first app')).not.toBeInTheDocument();
    });
});
