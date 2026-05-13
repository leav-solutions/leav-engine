import React from 'react';
import {act, render, screen} from '../../../_tests/testUtils';
import DeleteTask from './DeleteTask';
import {mockTask} from '../../../__mocks__/task';

jest.mock('../../../hooks/useLang');

describe('DeleteTask', () => {
    test('Render delete button for tasks', async () => {
        await act(async () => {
            render(<DeleteTask task={mockTask} onDelete={() => jest.fn()} />);
        });

        expect(screen.getByRole('button')).toBeEnabled();
    });
});
