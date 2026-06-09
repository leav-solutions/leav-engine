import userEvent from '@testing-library/user-event';
import EditApplicationContext from '../../../../../context/EditApplicationContext';
import {
    ApplicationType,
    GetApplicationByIdDocument,
    GetApplicationModulesDocument,
    SaveApplicationDocument,
} from '../../../../../_gqlTypes';
import {act, fireEvent, render, screen, waitFor, within} from '../../../../../_tests/testUtils';
import {mockApplicationDetails, mockApplicationsModules} from '../../../../../__mocks__/common/applications';
import InfosTab from './InfosTab';

vi.mock('../../../../shared/FileSelector', () => ({
    default: function FileSelector() {
        return <div>FileSelector</div>;
    },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual<object>('react-router-dom')),
    useNavigate: () => mockNavigate,
}));

describe('InfosTab', () => {
    test('Display form, edit value and submit on blur', async () => {
        let saveCalled = false;

        const mocks = [
            {
                request: {
                    query: GetApplicationModulesDocument,
                    variables: {},
                },
                result: {
                    data: {
                        applicationsModules: mockApplicationsModules,
                    },
                },
            },
            {
                request: {
                    query: SaveApplicationDocument,
                    variables: {
                        // If this test fails, check the mock variables here
                        application: {
                            id: 'myapp',
                            label: {fr: 'My App', en: 'My App'},
                            description: {en: 'My description'},
                            module: 'admin',
                            endpoint: 'my-app',
                            icon: null,
                        },
                    },
                },
                result: () => {
                    saveCalled = true;

                    return {
                        data: {
                            saveApplication: mockApplicationDetails,
                        },
                    };
                },
            },
        ];

        await act(async () => {
            render(
                <EditApplicationContext.Provider value={{application: mockApplicationDetails, readonly: false}}>
                    <InfosTab />
                </EditApplicationContext.Provider>,
                {apolloMocks: mocks},
            );
        });

        expect(screen.getByRole('textbox', {name: /id/})).toBeInTheDocument();
        expect(screen.getByRole('textbox', {name: /id/})).toHaveValue(mockApplicationDetails.id);
        expect(screen.getByRole('textbox', {name: /id/})).toBeDisabled();
        expect(screen.getAllByRole('textbox', {name: /label/})).toHaveLength(2);
        expect(screen.getAllByRole('textbox', {name: /description/})).toHaveLength(2);

        // Select a module - wait for modules to load (Apollo mock is async)
        const moduleSelector = screen.getByRole('combobox', {name: /module/});
        expect(moduleSelector).toBeInTheDocument();

        await waitFor(() => {
            expect(moduleSelector).not.toHaveAttribute('aria-busy', 'true');
        });

        await userEvent.click(moduleSelector);
        const adminOption = await within(moduleSelector).findByText(/admin/);
        await userEvent.click(adminOption);

        await waitFor(() => expect(saveCalled).toBe(true));
    });

    test('Display form with disabled field if readonly', async () => {
        const mocks = [
            {
                request: {
                    query: GetApplicationModulesDocument,
                    variables: {},
                },
                result: {
                    data: {
                        applicationsModules: mockApplicationsModules,
                    },
                },
            },
        ];

        await act(async () => {
            render(
                <EditApplicationContext.Provider value={{application: mockApplicationDetails, readonly: true}}>
                    <InfosTab />
                </EditApplicationContext.Provider>,
                {apolloMocks: mocks},
            );
        });

        screen.getAllByRole('textbox', {name: /id|label|description|endpoint|module|trees|libraries/}).forEach(elem => {
            expect(elem).toBeDisabled();
        });
    });

    test('Display form for a new app, edit value and submit', async () => {
        let saveCalled = false;
        const checkIdUnicityMock = {
            request: {
                query: GetApplicationByIdDocument,
                variables: {
                    id: 'myapp',
                },
            },
            result: {
                data: {
                    applications: {
                        list: [],
                    },
                },
            },
        };

        const mocks = [
            checkIdUnicityMock, // Will be called once per letter of the 'myapp' id
            checkIdUnicityMock,
            checkIdUnicityMock,
            checkIdUnicityMock,
            checkIdUnicityMock,
            {
                request: {
                    query: GetApplicationModulesDocument,
                    variables: {},
                },
                result: {
                    data: {
                        applicationsModules: mockApplicationsModules,
                    },
                },
            },
            {
                request: {
                    query: SaveApplicationDocument,
                    variables: {
                        // If this test fails, check the mock variables here
                        application: {
                            id: 'myapp',
                            label: {fr: 'MyApp', en: ''},
                            description: {fr: '', en: ''},
                            module: 'admin',
                            endpoint: 'my-app',
                            icon: null,
                        },
                    },
                },
                result: () => {
                    saveCalled = true;

                    return {
                        data: {
                            saveApplication: mockApplicationDetails,
                        },
                    };
                },
            },
        ];

        await act(async () => {
            render(
                <EditApplicationContext.Provider value={{application: null, readonly: false}}>
                    <InfosTab />
                </EditApplicationContext.Provider>,
                {apolloMocks: mocks},
            );
        });

        const labelFrInput = screen.getByRole('textbox', {name: /label\.fr/});
        const endpointInput = screen.getByRole('textbox', {name: /endpoint/});

        fireEvent.change(labelFrInput, {target: {value: 'MyApp'}});
        fireEvent.change(endpointInput, {target: {value: 'my-app'}});

        // Select a module - wait for modules to load
        const moduleSelector = screen.getByRole('combobox', {name: /module/});
        await waitFor(() => {
            expect(moduleSelector).not.toHaveAttribute('aria-busy', 'true');
        });

        await userEvent.click(moduleSelector);
        const adminOption = await screen.findByText(mockApplicationsModules[0].description);
        await userEvent.click(adminOption);

        await userEvent.click(screen.getByRole('button', {name: /submit/}));

        await waitFor(() => expect(saveCalled).toBe(true));
    });

    test('If external app, do not display some fields', async () => {
        await act(async () => {
            render(
                <EditApplicationContext.Provider
                    value={{application: {...mockApplicationDetails, type: ApplicationType.external}, readonly: false}}
                >
                    <InfosTab />
                </EditApplicationContext.Provider>,
            );
        });

        expect(screen.getByRole('textbox', {name: /id/})).toBeInTheDocument();
        expect(screen.getAllByRole('textbox', {name: /label/})).toHaveLength(2);
        expect(screen.getAllByRole('textbox', {name: /description/})).toHaveLength(2);
        expect(screen.getByRole('textbox', {name: /endpoint/})).toBeInTheDocument();
        expect(screen.queryByRole('combobox', {name: /module/})).not.toBeInTheDocument();
        expect(screen.queryByRole('combobox', {name: /libraries/})).not.toBeInTheDocument();
        expect(screen.queryByRole('combobox', {name: /trees/})).not.toBeInTheDocument();
    });
});
