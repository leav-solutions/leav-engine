// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {GetApplicationByIdDocument, SaveApplicationDocument} from '../../_gqlTypes';
import {render, screen, waitFor} from '../../_tests/testUtils';
import {mockApplication} from '../../__mocks__/common/application';
import EditApplication from './EditApplication';

window.matchMedia = query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
});

describe('EditApplication', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('Create new app', () => {
        test('Display creation form', async () => {
            render(<EditApplication appsBaseUrl="/app" />);

            await userEvent.type(screen.getByRole('textbox', {name: 'label_fr'}), 'Test app fr');
            await userEvent.type(screen.getByRole('textbox', {name: 'label_en'}), 'Test app en');
            await userEvent.type(screen.getByRole('textbox', {name: 'description_fr'}), 'Test app description fr');
            await userEvent.type(screen.getByRole('textbox', {name: 'description_en'}), 'Test app description en');

            const idField = screen.getByRole('textbox', {name: /id/});
            expect(screen.getByRole('textbox', {name: /id/})).toHaveValue('test_app_fr');

            //Hide some fields based on type
            expect(screen.getByRole('combobox', {name: /module/})).toBeInTheDocument();

            //Change type
            userEvent.click(screen.getByText(/internal/)); // Open "type" dropdown
            userEvent.click(await screen.findByText('applications.type_external')); // Select "external"
            await waitFor(() => expect(screen.queryByRole('combobox', {name: /module/})).not.toBeInTheDocument());
        });

        test('Do not generate id if user has modified it', async () => {
            render(<EditApplication appsBaseUrl="/app" />);

            await userEvent.type(screen.getByRole('textbox', {name: 'label_fr'}), 'Test app fr');

            expect(screen.getByRole('textbox', {name: /id/})).toHaveValue('test_app_fr');

            await userEvent.type(screen.getByRole('textbox', {name: /id/}), '_edited');
            await userEvent.type(screen.getByRole('textbox', {name: /label_fr/}), 'Test app fr updated');

            expect(screen.getByRole('textbox', {name: /id/})).toHaveValue('test_app_fr_edited');
        });
    });

    describe('Edit existing app', () => {
        const mocks = [
            {
                request: {
                    query: GetApplicationByIdDocument,
                    variables: {
                        id: mockApplication.id
                    }
                },
                result: {
                    data: {
                        applications: {
                            __typename: 'ApplicationsList',
                            list: [{...mockApplication}]
                        }
                    }
                }
            }
        ];

        test('Display tabs', async () => {
            render(<EditApplication appsBaseUrl="/app" applicationId={mockApplication.id} />, {mocks});

            await waitFor(() => expect(screen.getByRole('tablist')).toBeInTheDocument());

            expect(screen.getByRole('tab', {name: /info/})).toHaveAttribute('aria-selected', 'true');
            expect(screen.getByRole('tab', {name: /install/})).toBeInTheDocument();
        });

        test('Can select default active tab', async () => {
            render(<EditApplication appsBaseUrl="/app" applicationId={mockApplication.id} activeTab="install" />, {
                mocks
            });

            await waitFor(() => expect(screen.getByRole('tablist')).toBeInTheDocument());

            expect(screen.getByRole('tab', {name: /info/})).toBeInTheDocument();
            expect(screen.getByRole('tab', {name: /install/})).toHaveAttribute('aria-selected', 'true');
        });

        describe('Info form tab', () => {
            test('Can edit application', async () => {
                let saveCalled = false;
                const mockSave = [
                    {
                        request: {
                            query: SaveApplicationDocument,
                            variables: {
                                application: {
                                    id: mockApplication.id,
                                    label: {
                                        ...mockApplication.label,
                                        fr: mockApplication.label.fr + 'updated'
                                    }
                                }
                            }
                        },
                        result: () => {
                            saveCalled = true;
                            return {
                                data: {
                                    saveApplication: {
                                        ...mockApplication,
                                        label: {
                                            ...mockApplication.label,
                                            fr: mockApplication.label.fr + 'updated'
                                        }
                                    }
                                }
                            };
                        }
                    }
                ];

                render(<EditApplication appsBaseUrl="/app" applicationId={mockApplication.id} />, {
                    mocks: [...mocks, ...mockSave]
                });

                await waitFor(() => expect(screen.getByRole('form')).toBeInTheDocument());

                // Get all fields at once for performance reasons
                screen.getAllByRole('textbox', {name: /label|description|endpoint/}).forEach(field => {
                    expect(field).not.toBeDisabled();
                });

                expect(screen.getByRole('textbox', {name: /id/})).toBeDisabled();

                screen.getAllByRole('combobox', {name: /type|module/}).forEach(field => {
                    expect(field).toBeDisabled();
                });

                // Update and submit field
                await userEvent.type(screen.getByRole('textbox', {name: 'label_fr'}), 'updated{Enter}');
                await waitFor(() => expect(saveCalled).toBe(true));
            });

            test('If app administration is not allowed, cannot edit anything', async () => {
                const mocksNotAllowed = [
                    {
                        request: {
                            query: GetApplicationByIdDocument,
                            variables: {
                                id: mockApplication.id
                            }
                        },
                        result: {
                            data: {
                                applications: {
                                    __typename: 'ApplicationsList',
                                    list: [
                                        {
                                            ...mockApplication,
                                            permissions: {
                                                ...mockApplication.permissions,
                                                admin_application: false
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                ];

                render(<EditApplication appsBaseUrl="/app" applicationId={mockApplication.id} />, {
                    mocks: mocksNotAllowed
                });

                await waitFor(() => expect(screen.getByRole('form')).toBeInTheDocument());

                screen.getAllByRole('textbox').forEach(field => {
                    expect(field).toBeDisabled();
                });

                screen.getAllByRole('combobox').forEach(field => {
                    expect(field).toBeDisabled();
                });
            });
        });

        describe('Install tab', () => {
            test('Display install status and details', async () => {
                render(<EditApplication appsBaseUrl="/app" applicationId={mockApplication.id} activeTab="install" />, {
                    mocks
                });

                await waitFor(() => expect(screen.getByRole('tablist')).toBeInTheDocument());

                expect(screen.getByText(/install_success/)).toBeInTheDocument();
                expect(screen.getByText(mockApplication.install.lastCallResult)).toBeInTheDocument();
            });
        });
    });
});
