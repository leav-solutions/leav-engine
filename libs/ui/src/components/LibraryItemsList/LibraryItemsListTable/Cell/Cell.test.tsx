// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {ITableCell} from '_ui/types/search';
import {AttributeFormat, AttributeType} from '_ui/_gqlTypes';
import {render, screen} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import Cell from './Cell';

describe('Cell', () => {
    test('Display standard value', async () => {
        const mockData = {
            id: 'id',
            value: 'value',
            type: AttributeType.simple,
            format: AttributeFormat.text
        };

        render(<Cell columnName="test" data={(mockData as unknown) as ITableCell} />);

        expect(screen.getByText(mockData.value)).toBeInTheDocument();
    });

    test('Display multiple standard values', async () => {
        const mockData = {
            id: 'id',
            value: ['valueA', 'valueB'],
            type: AttributeType.advanced,
            format: AttributeFormat.text
        };

        render(<Cell columnName="test" data={(mockData as unknown) as ITableCell} />);

        expect(screen.getByText(/valueA(.*)valueB/)).toBeInTheDocument();
    });

    test('Display link value', async () => {
        const mockData = {
            id: 'id',
            value: {id: mockRecord.id, whoAmI: mockRecord},
            type: AttributeType.simple_link,
            format: AttributeFormat.text
        };

        render(<Cell columnName="test" data={(mockData as unknown) as ITableCell} />);

        expect(screen.getByText(mockRecord.label)).toBeInTheDocument();
    });

    test('Display multiple link values', async () => {
        const mockData = {
            id: 'id',
            value: [
                {id: mockRecord.id, whoAmI: mockRecord},
                {id: 'record2', whoAmI: {...mockRecord, id: 'record2', label: 'record2'}},
                {id: 'record3', whoAmI: {...mockRecord, id: 'record3', label: 'record3'}}
            ],
            type: AttributeType.simple_link,
            format: AttributeFormat.text
        };

        render(<Cell columnName="test" data={(mockData as unknown) as ITableCell} />);

        expect(screen.getByText(mockRecord.label)).toBeInTheDocument();
        expect(screen.queryByText('record2')).not.toBeInTheDocument();
        expect(screen.queryByText('record3')).not.toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();

        await userEvent.hover(screen.getByText('3'));

        expect(await screen.findByText('record2')).toBeInTheDocument();
        expect(screen.getByText('record3')).toBeInTheDocument();
    });
});
