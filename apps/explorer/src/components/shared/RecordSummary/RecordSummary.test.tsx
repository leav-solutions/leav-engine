// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import {mockRecord} from '__mocks__/common/record';
import RecordSummary from './RecordSummary';

describe('RecordSummary', () => {
    test('Display summary', async () => {
        await act(async () => {
            render(<RecordSummary record={mockRecord} />);
        });

        expect(screen.getByRole('img', {name: 'record preview'})).toBeInTheDocument();
        expect(screen.getByText(mockRecord.id)).toBeInTheDocument();
        expect(screen.getByText(mockRecord.label)).toBeInTheDocument();
    });
});
