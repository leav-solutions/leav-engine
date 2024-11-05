// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
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
