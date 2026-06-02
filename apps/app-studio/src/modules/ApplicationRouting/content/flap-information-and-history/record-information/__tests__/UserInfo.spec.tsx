import {render, screen} from '_ui/_tests/testUtils';
import {UserInfo} from '../UserInfo';

describe('UserInfo', () => {
    it('should display email with mailto link when email is provided', () => {
        render(<UserInfo email="user@test.com" id="user123" />);

        const link = screen.getByRole('link');
        expect(link).toHaveTextContent('user@test.com');
        expect(link).toHaveAttribute('href', 'mailto:user@test.com');
    });

    it('should display ID without link when only ID is provided', () => {
        render(<UserInfo email={null} id="user123" />);

        const link = screen.getByRole('link');
        expect(link).toHaveTextContent('user123');
        expect(link).not.toHaveAttribute('href');
    });

    it('should display unknown user text when neither email nor ID are provided', () => {
        render(<UserInfo email={null} id={null} />);

        const link = screen.getByRole('link');
        expect(link).toHaveTextContent('information_and_history.unknown_user');
        expect(link).not.toHaveAttribute('href');
    });
});
