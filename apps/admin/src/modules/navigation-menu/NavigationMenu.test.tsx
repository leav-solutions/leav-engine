import userEvent from '@testing-library/user-event';
import {act, render, screen} from '../../_tests/testUtils';
import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {NavigationMenu} from './NavigationMenu';

const NavigateOnMount = ({to}: {to: string}) => {
    const navigate = useNavigate();
    useEffect(() => {
        navigate(to);
    }, []);
    return null;
};

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('NavigationMenu', () => {
    beforeEach(() => jest.clearAllMocks());

    test('Should render menu', async () => {
        await act(async () => {
            render(<NavigationMenu isOpen={true} onOpenChanged={jest.fn()} />);
        });

        expect(screen.getByText(/libraries/)).toBeInTheDocument();
        expect(screen.getByText(/attributes/)).toBeInTheDocument();
        expect(screen.getByText(/trees/)).toBeInTheDocument();
    });

    test('Should set active menu item when current route matches', async () => {
        await act(async () => {
            render(<NavigationMenu isOpen={true} onOpenChanged={jest.fn()} />, {
                routerProps: {initialEntries: ['/libraries']},
            });
        });

        const librariesItem = screen.getByText(/libraries/).closest('[data-role="menuitem"]');
        expect(librariesItem).toHaveClass('active');
    });

    test('Should navigate to the item route when clicking on it', async () => {
        await act(async () => {
            render(<NavigationMenu isOpen={true} onOpenChanged={jest.fn()} />);
        });

        await userEvent.click(screen.getByText(/libraries/));

        expect(mockNavigate).toHaveBeenCalledWith('/libraries');
    });

    test('Should have no active menu item when current route does not match', async () => {
        await act(async () => {
            render(<NavigationMenu isOpen={true} onOpenChanged={jest.fn()} />, {
                routerProps: {initialEntries: ['/']},
            });
        });

        const menuItems = document.querySelectorAll('[data-role="menuitem"]');
        menuItems.forEach(item => {
            expect(item).not.toHaveClass('active');
        });
    });

    test('Should keep last valid active menu item when current route is not-found', async () => {
        await act(async () => {
            render(
                <>
                    <NavigationMenu isOpen={true} onOpenChanged={jest.fn()} />
                    <NavigateOnMount to="/not-found" />
                </>,
                {routerProps: {initialEntries: ['/libraries']}},
            );
        });

        const librariesItem = screen.getByText(/libraries/).closest('[data-role="menuitem"]');
        expect(librariesItem).toHaveClass('active');
    });
});
