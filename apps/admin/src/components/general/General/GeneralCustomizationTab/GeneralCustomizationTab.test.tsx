import userEvent from '@testing-library/user-event';
import {render, screen, waitFor} from '../../../../_tests/testUtils';
import GeneralCustomizationTab from './GeneralCustomizationTab';
import {
    ApplicationType,
    GetGlobalSettingsDocument,
    GetApplicationsDocument,
    SaveGlobalSettingsDocument,
} from '../../../../_gqlTypes';

vi.mock('../../../shared/FileSelector', () => ({
    default: function FileSelector() {
        return <div>FileSelector</div>;
    },
}));

// Full Application shape (with id/__typename) so Apollo can normalize each item and does not emit
// "Cache data may be lost" warnings when the list is written to the cache.
const appItem = (endpoint: string) => ({
    id: endpoint,
    label: endpoint,
    type: ApplicationType.internal,
    description: null,
    endpoint,
    color: null,
    icon: null,
    url: `/${endpoint}`,
    system: true,
});

describe('GeneralCustomizationTab', () => {
    test('Render name and file selector', async () => {
        let saveCalled = false;
        const mocks = [
            {
                request: {
                    query: GetGlobalSettingsDocument,
                    variables: {},
                },
                result: {
                    data: {
                        globalSettings: {
                            __typename: 'GlobalSettings',
                            name: 'My App',
                            icon: null,
                            favicon: null,
                            settings: null,
                            defaultApp: 'admin',
                        },
                    },
                },
            },
            {
                request: {
                    query: GetApplicationsDocument,
                    variables: {},
                },
                result: {
                    data: {
                        applications: {
                            __typename: 'ApplicationsList',
                            list: [
                                {__typename: 'Application', ...appItem('admin')},
                                {__typename: 'Application', ...appItem('app-studio')},
                                {__typename: 'Application', ...appItem('portal')},
                            ],
                        },
                    },
                },
            },
            {
                request: {
                    query: SaveGlobalSettingsDocument,
                    variables: {
                        settings: {
                            name: 'My App Modified',
                        },
                    },
                },
                result: () => {
                    saveCalled = true;
                    return {
                        data: {
                            saveGlobalSettings: {
                                __typename: 'GlobalSettings',
                                name: 'My App Modified',
                                icon: null,
                                favicon: null,
                                settings: null,
                                defaultApp: 'admin',
                            },
                        },
                    };
                },
            },
        ];

        render(<GeneralCustomizationTab />, {apolloMocks: mocks});

        expect(await screen.findByRole('textbox', {name: 'name'})).toBeInTheDocument();

        expect(screen.getByRole('textbox', {name: 'name'})).toHaveValue('My App');
        expect(screen.getAllByText('FileSelector')).toHaveLength(2);

        expect(await screen.findAllByRole('option')).toHaveLength(3);

        //Edit name and submit
        userEvent.type(screen.getByRole('textbox', {name: 'name'}), ' Modified{Enter}');

        await waitFor(() => expect(saveCalled).toBe(true));
    });
});
