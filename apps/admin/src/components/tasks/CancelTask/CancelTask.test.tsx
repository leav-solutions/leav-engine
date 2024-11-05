// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import CancelTask from './CancelTask';
import {mockTask} from '../../../__mocks__/task';

jest.mock('../../../hooks/useLang');

describe('CancelTask', () => {
    test('Render delete button for tasks', async () => {
        await act(async () => {
            render(<CancelTask task={mockTask} onCancel={() => jest.fn()} />);
        });

        expect(screen.getByRole('button')).toBeEnabled();
    });
});
