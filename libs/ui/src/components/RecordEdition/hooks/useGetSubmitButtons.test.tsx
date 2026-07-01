import {screen, render} from '_ui/_tests/testUtils';
import {useGetSubmitButtons} from './useGetSubmitButtons';

describe('useGetSubmitButtons', () => {
    test('Return 2 buttons', async () => {
        const TestComp = () => {
            const buttons = useGetSubmitButtons(['create', 'createAndEdit'], 'create', true, vi.fn());
            return <div>{buttons}</div>;
        };

        render(<TestComp />);
        expect(screen.getByRole('button', {name: /create$/})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /create_and_edit$/})).toBeInTheDocument();
    });

    test('Return "create" only', async () => {
        const TestComp = () => {
            const buttons = useGetSubmitButtons(['create'], 'create', true, vi.fn());
            return <div>{buttons}</div>;
        };

        render(<TestComp />);

        expect(screen.getByRole('button', {name: /create$/})).toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /create_and_edit$/})).not.toBeInTheDocument();
    });

    test('Return "createAndEdit" only', async () => {
        const TestComp = () => {
            const buttons = useGetSubmitButtons(['createAndEdit'], 'createAndEdit', true, vi.fn());
            return <div>{buttons}</div>;
        };

        render(<TestComp />);

        expect(screen.queryByRole('button', {name: /create$/})).not.toBeInTheDocument();
        expect(screen.getByRole('button', {name: /create_and_edit$/})).toBeInTheDocument();
    });

    test('If not in create mode, return nothing', async () => {
        const TestComp = () => {
            const buttons = useGetSubmitButtons(['createAndEdit'], 'createAndEdit', false, vi.fn());
            return <div>{buttons}</div>;
        };

        render(<TestComp />);

        expect(screen.queryByRole('button', {name: /create$/})).not.toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /create_and_edit$/})).not.toBeInTheDocument();
    });

    test('Return "cancel" button if in create mode', async () => {
        const TestComp = () => {
            const buttons = useGetSubmitButtons(
                ['createAndEdit', 'closeCancel'],
                'createAndEdit',
                true,
                vi.fn(),
                vi.fn(),
            );
            return <div>{buttons}</div>;
        };

        render(<TestComp />);

        expect(screen.queryByRole('button', {name: /create$/})).not.toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /create_and_edit$/})).toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /close$/})).not.toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /cancel$/})).toBeInTheDocument();
    });

    test('Return "close" button if not in create mode', async () => {
        const TestComp = () => {
            const buttons = useGetSubmitButtons(
                ['createAndEdit', 'closeCancel'],
                'createAndEdit',
                false,
                vi.fn(),
                vi.fn(),
            );
            return <div>{buttons}</div>;
        };

        render(<TestComp />);

        expect(screen.queryByRole('button', {name: /create$/})).not.toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /create_and_edit$/})).not.toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /close$/})).not.toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /cancel$/})).not.toBeInTheDocument();
    });
});
