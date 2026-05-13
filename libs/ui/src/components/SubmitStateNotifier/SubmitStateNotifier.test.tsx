import {render, screen} from '../../_tests/testUtils';
import SubmitStateNotifier from './SubmitStateNotifier';

describe('SubmitStateNotifier', () => {
    test('Render test', async () => {
        render(<SubmitStateNotifier state="processing" />);

        expect(screen.getByRole('img')).toBeInTheDocument();
    });
});
