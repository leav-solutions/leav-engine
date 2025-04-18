// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MemoryRouter} from 'react-router-dom';
import {render, screen} from '../../../tests/testUtils';
import {NotFoundPage} from './NotFoundPage';

describe('NotFoundPage', () => {
    test('should render 404 message in header', async () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/page_not_found/i)).toBeInTheDocument();
    });
});
