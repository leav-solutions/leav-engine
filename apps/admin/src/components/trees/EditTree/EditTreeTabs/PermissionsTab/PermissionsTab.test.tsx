import React from 'react';
import {act, render, screen} from '../../../../../_tests/testUtils';
import {mockTree} from '../../../../../__mocks__/trees';
import PermissionsTab from './PermissionsTab';

jest.mock(
    './PermissionsContent',
    () =>
        function PermissionsContent() {
            return <div>PermissionsContent</div>;
        },
);

describe('PermissionsTab', () => {
    test('Snapshot test', async () => {
        await act(async () => {
            render(<PermissionsTab tree={{...mockTree}} readonly={false} />);
        });

        expect(screen.getByText('PermissionsContent')).toBeInTheDocument();
    });
});
