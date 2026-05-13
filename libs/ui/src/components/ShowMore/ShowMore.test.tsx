import '@testing-library/jest-dom';
import {render, screen} from '../../_tests/testUtils';
import {ShowMore} from './ShowMore';

const fakeUseIntersectionObserver = {
    isIntersecting: false, // component is not visible by default
};

jest.mock('@uidotdev/usehooks', () => ({
    useIntersectionObserver: () => [jest.fn(), fakeUseIntersectionObserver],
}));

describe('ShowMore', () => {
    const fetchMore = jest.fn();

    test('should not display when has no more', async () => {
        render(<ShowMore hasMore={false} fetchMore={fetchMore} />, {});

        expect(screen.queryByTestId('show-more')).toBeNull();
        expect(fetchMore).not.toHaveBeenCalled();
    });

    test('should display when has more', async () => {
        render(<ShowMore hasMore={true} fetchMore={fetchMore} />, {});

        expect(screen.queryByTestId('show-more')).toBeInTheDocument();
        expect(fetchMore).not.toHaveBeenCalled();
    });

    test('should call fetchMore when component visible', async () => {
        fakeUseIntersectionObserver.isIntersecting = true; // component is visible
        render(<ShowMore hasMore={true} fetchMore={fetchMore} />, {});

        expect(screen.queryByTestId('show-more')).toBeInTheDocument();
        expect(fetchMore).toHaveBeenCalled();
    });
});
