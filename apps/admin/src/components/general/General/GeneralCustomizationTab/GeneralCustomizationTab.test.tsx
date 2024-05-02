// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {getGlobalSettingsQuery} from 'queries/globalSettings/getGlobalSettingsQuery';
import {saveGlobalSettingsQuery} from 'queries/globalSettings/saveGlobalSettingsMutation';
import React from 'react';
import {render, screen, waitFor} from '_tests/testUtils';
import GeneralCustomizationTab from './GeneralCustomizationTab';

jest.mock('components/shared/FileSelector', () => function FileSelector() {
        return <div>FileSelector</div>;
    });

describe('GeneralCustomizationTab', () => {
    test('Render name and file selector', async () => {
        let saveCalled = false;
        const mocks = [
            {
                request: {
                    query: getGlobalSettingsQuery,
                    variables: {}
                },
                result: {
                    data: {
                        globalSettings: {
                            name: 'My App',
                            icon: null
                        }
                    }
                }
            },
            {
                request: {
                    query: saveGlobalSettingsQuery,
                    variables: {
                        settings: {
                            name: 'My App Modified'
                        }
                    }
                },
                result: () => {
                    saveCalled = true;
                    return {
                        data: {
                            saveGlobalSettings: {
                                name: 'My App Modified',
                                icon: null
                            }
                        }
                    };
                }
            }
        ];

        render(<GeneralCustomizationTab />, {apolloMocks: mocks});

        expect(await screen.findByRole('textbox', {name: 'name'})).toBeInTheDocument();

        expect(screen.getByRole('textbox', {name: 'name'})).toHaveValue('My App');
        expect(screen.getByText('FileSelector')).toBeInTheDocument();

        //Edit name and submit
        userEvent.type(screen.getByRole('textbox', {name: 'name'}), ' Modified{Enter}');

        await waitFor(() => expect(saveCalled).toBe(true));
    });
});
