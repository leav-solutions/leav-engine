// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import '@testing-library/jest-dom';
import 'jest-styled-components';
import {mockRecord} from '_ui/__mocks__/common/record';
import {PreviewSize} from '../../constants';
import {IRecordIdentityWhoAmI} from '../../types/records';
import {act, render, screen} from '../../_tests/testUtils';
import RecordCard from './RecordCard';

jest.mock('../EntityPreview', () => ({
        EntityPreview: () => <div>EntityPreview</div>
    }));

describe('RecordCard', () => {
    const mock: IRecordIdentityWhoAmI = {
        ...mockRecord,
        id: '12345',
        library: {
            ...mockRecord.library,
            id: 'test_lib',
            label: {fr: 'Test Lib', en: 'test lib'}
        },
        label: 'Test Record'
    };

    test('should display label', async () => {
        await act(async () => {
            render(<RecordCard record={mock} size={PreviewSize.small} />);
        });

        expect(screen.getByText(mock.label)).toBeInTheDocument();
        expect(screen.getByText('EntityPreview')).toBeInTheDocument();
    });
});
