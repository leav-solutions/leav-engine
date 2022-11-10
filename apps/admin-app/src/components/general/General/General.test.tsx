// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import React from 'react';
import {MemoryRouter} from 'react-router';
import {act, render, screen} from '_tests/testUtils';
import General from './General';

jest.mock('./GeneralInfosTab', () => {
    return function GeneralInfosTab() {
        return <div>GeneralInfosTab</div>;
    };
});

jest.mock('./GeneralAdminPermissionsTab', () => {
    return function GeneralAdminPermissionsTab() {
        return <div>GeneralAdminPermissionsTab</div>;
    };
});

jest.mock('./GeneralApiKeysTab', () => {
    return function GeneralApiKeysTab() {
        return <div>GeneralApiKeysTab</div>;
    };
});

describe('General', () => {
    test('Render test', async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <General />
                </MemoryRouter>
            );
        });

        expect(screen.getByText('GeneralInfosTab')).toBeInTheDocument();

        const adminTabLink = screen.getByText(/admin_permissions/);
        const apiKeysTabLink = screen.getByText(/api_keys/);

        await act(async () => {
            userEvent.click(adminTabLink);
        });

        expect(screen.getByText('GeneralAdminPermissionsTab')).toBeInTheDocument();

        await act(async () => {
            userEvent.click(apiKeysTabLink);
        });

        expect(screen.getByText('GeneralApiKeysTab')).toBeInTheDocument();
    });
});
