// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import React from 'react';
import {PermissionsActions, PermissionTypes} from '_gqlTypes/globalTypes';
import {act, render, screen} from '_tests/testUtils';
import PermissionsActionsGroupSelector from './PermissionsActionsGroupSelector';

describe('ActionsGroupSelector', () => {
    test('Render test', async () => {
        const onSelect = jest.fn();
        await act(async () => {
            render(
                <PermissionsActionsGroupSelector
                    actions={{
                        firstGroup: [PermissionsActions.access_attribute],
                        secondGroup: [PermissionsActions.access_attribute]
                    }}
                    onSelect={onSelect}
                    selectedGroup={null}
                    type={PermissionTypes.admin}
                />
            );

            expect(screen.getByText(/firstGroup/)).toBeInTheDocument();
            expect(screen.getByText(/secondGroup/)).toBeInTheDocument();

            await act(async () => {
                userEvent.click(screen.getByText(/firstGroup/));
            });

            expect(onSelect).toBeCalled();
        });
    });
});
