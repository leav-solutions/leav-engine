import userEvent from '@testing-library/user-event';
import {render, screen, waitFor} from '../../../../_tests/testUtils';
import GeneralCustomizationTab from './GeneralCustomizationTab';
import {GetGlobalSettingsDocument, GetApplicationsDocument, SaveGlobalSettingsDocument} from '../../../../_gqlTypes';

vi.mock('../../../shared/FileSelector', () => ({
    default: function FileSelector() {
        return <div>FileSelector</div>;
    },
}));

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
                            name: 'My App',
                            icon: null,
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
                            list: [
                                {
                                    endpoint: 'admin',
                                },
                                {
                                    endpoint: 'app-studio',
                                },
                                {
                                    endpoint: 'portal',
                                },
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
                                name: 'My App Modified',
                                icon: null,
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
