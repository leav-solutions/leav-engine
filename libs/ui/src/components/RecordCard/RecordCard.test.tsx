// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import '@testing-library/jest-dom';
import 'jest-styled-components';
import {PreviewSize} from '../../constants';
import {IRecordIdentityWhoAmI} from '../../types/RecordIdentity';
import {act, render, screen} from '../../_tests/testUtils';
import {mockRecord} from '../../__mocks__/common/record';
import RecordCard from './RecordCard';

jest.mock('../RecordPreview', () => {
    return {
        RecordPreview: () => {
            return <div>RecordPreview</div>;
        }
    };
});

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
        expect(screen.getByText('RecordPreview')).toBeInTheDocument();
    });
});
