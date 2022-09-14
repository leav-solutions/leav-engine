// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import 'jest-styled-components';
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import {IRecordIdentityWhoAmI, PreviewSize} from '../../../_types/types';
import RecordCard from './RecordCard';

jest.mock('../RecordPreview', () => {
    return function RecordPreview() {
        return <div>RecordPreview</div>;
    };
});

describe('RecordCard', () => {
    const mockRecord: IRecordIdentityWhoAmI = {
        ...mockRecordWhoAmI,
        id: '12345',
        library: {
            ...mockRecordWhoAmI.library,
            id: 'test_lib',
            label: {fr: 'Test Lib', en: 'test lib'}
        },
        label: 'Test Record'
    };

    test('should display label', async () => {
        await act(async () => {
            render(<RecordCard record={mockRecord} size={PreviewSize.small} />);
        });

        expect(screen.getByText(mockRecord.label)).toBeInTheDocument();
        expect(screen.getByText('RecordPreview')).toBeInTheDocument();
    });
});
