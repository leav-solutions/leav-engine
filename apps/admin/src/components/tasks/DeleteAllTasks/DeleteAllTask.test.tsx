import React from 'react';
import {act, render, screen} from '../../../_tests/testUtils';
import DeleteAllTask from './DeleteAllTask';

jest.mock('../../../hooks/useLang');

describe('DeleteTasks', () => {
    test('Render delete button for tasks', async () => {
        await act(async () => {
            render(<DeleteAllTask label="" confirmMessage="" onDeleteAll={() => jest.fn()} />);
        });

        expect(screen.getByRole('button')).toBeEnabled();
    });
});
