import {screen, render} from '_ui/_tests/testUtils';
import {useGetSubmitButtons} from './useGetSubmitButtons';

describe('useGetSubmitButtons', () => {
    test('Return 2 buttons', async () => {
        const TestComp = () => {
            const buttons = useGetSubmitButtons('both', true, jest.fn());
            return <div>{buttons}</div>;
        };

        render(<TestComp />);
        expect(screen.getByRole('button', {name: /create$/})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /create_and_edit$/})).toBeInTheDocument();
    });

    test('Return "create" only', async () => {
        const TestComp = () => {
            const buttons = useGetSubmitButtons('create', true, jest.fn());
            return <div>{buttons}</div>;
        };

        render(<TestComp />);

        expect(screen.getByRole('button', {name: /create$/})).toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /create_and_edit$/})).not.toBeInTheDocument();
    });

    test('Return "createAndEdit" only', async () => {
        const TestComp = () => {
            const buttons = useGetSubmitButtons('createAndEdit', true, jest.fn());
            return <div>{buttons}</div>;
        };

        render(<TestComp />);

        expect(screen.queryByRole('button', {name: /create$/})).not.toBeInTheDocument();
        expect(screen.getByRole('button', {name: /create_and_edit$/})).toBeInTheDocument();
    });

    test('If not in create mode, return nothing', async () => {
        const TestComp = () => {
            const buttons = useGetSubmitButtons('createAndEdit', false, jest.fn());
            return <div>{buttons}</div>;
        };

        render(<TestComp />);

        expect(screen.queryByRole('button', {name: /create$/})).not.toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /create_and_edit$/})).not.toBeInTheDocument();
    });
});
