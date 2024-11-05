// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {render, screen} from '_ui/_tests/testUtils';
import MockSearchContextProvider from '_ui/__mocks__/common/mockSearchContextProvider';
import ActionsMenu from './ActionsMenu';

jest.mock('_ui/components/ExportModal', () => function ExportModal() {
        return <div>ExportModal</div>;
    });

describe('ActionsMenu', () => {
    test('Render menu', async () => {
        render(
            <MockSearchContextProvider>
                <ActionsMenu />
            </MockSearchContextProvider>
        );

        expect(screen.getByRole('button')).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button'));

        expect(await screen.findByText(/export/)).toBeInTheDocument();
    });
});
