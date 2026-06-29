import {act, render, screen} from '../../../../../_tests/testUtils';
import {mockTree} from '../../../../../__mocks__/trees';
import InfosTab from './InfosTab';

vi.mock('../../../../../hooks/useLang');

vi.mock('./InfosForm', () => ({
    default: function TreeInfosForm() {
        return <div>TreeInfosForm</div>;
    },
}));

describe('InfosTab', () => {
    test('Snapshot test', async () => {
        await act(async () => {
            render(<InfosTab tree={mockTree} readonly={false} />);
        });

        expect(screen.getByText('TreeInfosForm')).toBeInTheDocument();
    });
});
