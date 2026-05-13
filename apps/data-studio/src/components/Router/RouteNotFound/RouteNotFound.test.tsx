import {MemoryRouter} from 'react-router-dom';
import {render, screen} from '../../../_tests/testUtils';
import RouteNotFound from './RouteNotFound';

describe('RouteNotFound', () => {
    test('should render 404 message in header', async () => {
        render(
            <MemoryRouter>
                <RouteNotFound />
            </MemoryRouter>,
        );

        expect(screen.getByText(/page_not_found/i)).toBeInTheDocument();
    });
});
