// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {act, render, screen} from '_tests/testUtils';
import {mockTreeElement} from '../../../../../__mocks__/common/treeElements';
import Row from './Row';

jest.mock(
    'components/shared/RecordCard',
    () =>
        function RecordCard() {
            return <div>RecordCard</div>;
        }
);

describe('Cell', () => {
    test('should display the label of the record', async () => {
        await act(async () => {
            render(<Row treeElement={mockTreeElement} depth={0} isActive />);
        });

        expect(await screen.findByText('RecordCard')).toBeInTheDocument();
    });

    test('If element is not accessible, display an information', async () => {
        await act(async () => {
            render(
                <Row
                    treeElement={{
                        ...mockTreeElement,
                        permissions: {...mockTreeElement.permissions, access_tree: false}
                    }}
                    depth={0}
                    isActive
                />
            );
        });

        expect(await screen.findByRole('img', {name: 'lock'})).toBeInTheDocument();
    });

    test('If element is inactive, display an information', async () => {
        await act(async () => {
            render(
                <Row
                    treeElement={{...mockTreeElement, record: {...mockTreeElement.record, active: false}}}
                    depth={0}
                    isActive
                />
            );
        });

        expect(await screen.findByRole('img', {name: 'warning'})).toBeInTheDocument();
    });
});
