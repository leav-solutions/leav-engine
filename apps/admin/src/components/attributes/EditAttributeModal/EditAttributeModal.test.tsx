import React from 'react';
import {act, render, screen} from '../../../_tests/testUtils';
import EditAttributeModal from './EditAttributeModal';

jest.mock(
    '../EditAttribute',
    () =>
        function EditAttribute() {
            return <div>EditAttribute</div>;
        },
);

describe('EditAttributeModal', () => {
    test('Render test', async () => {
        const _handleClose = jest.fn();
        await act(async () => {
            render(<EditAttributeModal attribute="test_attribute" open onClose={_handleClose} />);
        });

        expect(screen.getByText('EditAttribute')).toBeInTheDocument();
    });
});
