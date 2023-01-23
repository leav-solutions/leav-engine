// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import EditApplicationContext from 'context/EditApplicationContext';
import {installApplicationMutation} from 'queries/applications/installApplicationMutation';
import React from 'react';
import * as reactRedux from 'react-redux';
import {ApplicationInstallStatus} from '_gqlTypes/globalTypes';
import {render, screen, waitFor} from '_tests/testUtils';
import {mockEditApplicationContextValue} from '__mocks__/common/applications';
import InstallTab from './InstallTab';

describe('InstallTab', () => {
    const mockDispatch = jest.fn();
    jest.spyOn(reactRedux, 'useDispatch').mockReturnValue(mockDispatch);

    test('Display install infos', async () => {
        render(
            <EditApplicationContext.Provider value={mockEditApplicationContextValue}>
                <InstallTab />
            </EditApplicationContext.Provider>
        );

        expect(screen.getByText(/success/i)).toBeInTheDocument();
        expect(
            screen.getByText(mockEditApplicationContextValue.application.install.lastCallResult)
        ).toBeInTheDocument();
    });

    test('Force reinstall of app', async () => {
        let reinstallCalled = false;
        const mocks = [
            {
                request: {
                    query: installApplicationMutation,
                    variables: {
                        id: 'myapp'
                    }
                },
                result: () => {
                    reinstallCalled = true;
                    return {
                        data: {
                            installApplication: {
                                status: ApplicationInstallStatus.ERROR,
                                lastCallResult: 'reinstall fail'
                            }
                        }
                    };
                }
            }
        ];
        render(
            <EditApplicationContext.Provider value={mockEditApplicationContextValue}>
                <InstallTab />
            </EditApplicationContext.Provider>,
            {apolloMocks: mocks}
        );

        userEvent.click(screen.getByRole('button', {name: /reinstall/i}));

        await waitFor(() => expect(reinstallCalled).toBe(true));
    });
});
